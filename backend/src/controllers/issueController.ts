import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { generateIssueKey } from '../utils/idGenerator.js';
import { logActivity, createNotification } from '../services/activityService.js';

const createIssueSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assigneeId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

const updateIssueSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  categoryId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dueDate: z.string().optional().nullable(),
});

const assignIssueSchema = z.object({
  assigneeId: z.string().nullable(),
});

const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED']),
  comment: z.string().optional(),
});

export const listIssues = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search,
      status,
      priority,
      categoryId,
      assigneeId,
      reporterId,
      teamId,
      overdueOnly,
      myIssuesOnly,
      sortBy = 'newest',
      page = '1',
      limit = '10',
    } = req.query;

    const user = req.user!;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * take;

    const where: any = {};

    // Role-based visibility scoping:
    if (myIssuesOnly === 'true' || (user.role === 'EMPLOYEE' && myIssuesOnly !== 'false')) {
      where.OR = [
        { assigneeId: user.id },
        { reporterId: user.id },
      ];
    }

    // Search by key or title
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      const searchConditions = [
        { title: { contains: q } },
        { issueKey: { contains: q } },
        { description: { contains: q } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (priority && typeof priority === 'string' && priority !== 'ALL') {
      where.priority = priority;
    }

    if (categoryId && typeof categoryId === 'string' && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }

    if (assigneeId && typeof assigneeId === 'string' && assigneeId !== 'ALL') {
      where.assigneeId = assigneeId;
    }

    if (reporterId && typeof reporterId === 'string' && reporterId !== 'ALL') {
      where.reporterId = reporterId;
    }

    if (teamId && typeof teamId === 'string' && teamId !== 'ALL') {
      where.teamId = teamId;
    }

    if (overdueOnly === 'true') {
      where.dueDate = { lt: new Date() };
      where.status = { notIn: ['RESOLVED', 'CLOSED'] };
    }

    // Sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'dueDate') {
      orderBy = { dueDate: 'asc' };
    } else if (sortBy === 'priority') {
      orderBy = { priority: 'asc' };
    }

    const [total, issues] = await Promise.all([
      prisma.issue.count({ where }),
      prisma.issue.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          category: { select: { id: true, name: true, color: true } },
          reporter: { select: { id: true, name: true, email: true, avatar: true } },
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
          team: { select: { id: true, name: true } },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
      }),
    ]);

    res.json({
      issues,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getIssueByIdOrKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const issue = await prisma.issue.findFirst({
      where: {
        OR: [{ id }, { issueKey: id }],
      },
      include: {
        category: true,
        reporter: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        team: true,
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, email: true, avatar: true, role: true } },
          },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploader: { select: { id: true, name: true } },
          },
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!issue) {
      res.status(404).json({ message: 'Issue not found' });
      return;
    }

    res.json(issue);
  } catch (error) {
    next(error);
  }
};

export const createIssue = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createIssueSchema.parse(req.body);
    const user = req.user!;

    const issueKey = await generateIssueKey();
    const initialStatus = data.assigneeId ? 'ASSIGNED' : 'OPEN';

    let targetTeamId = data.teamId;
    if (data.assigneeId && !targetTeamId) {
      const assigneeUser = await prisma.user.findUnique({
        where: { id: data.assigneeId },
        select: { teamId: true },
      });
      if (assigneeUser?.teamId) {
        targetTeamId = assigneeUser.teamId;
      }
    }

    const issue = await prisma.issue.create({
      data: {
        issueKey,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        priority: data.priority,
        status: initialStatus,
        reporterId: user.id,
        assigneeId: data.assigneeId || null,
        teamId: targetTeamId || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        category: true,
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true } },
      },
    });

    await logActivity({
      issueId: issue.id,
      userId: user.id,
      action: 'CREATED',
      details: `Created issue ${issue.issueKey} with priority ${issue.priority}`,
    });

    if (issue.assigneeId && issue.assigneeId !== user.id) {
      await createNotification({
        userId: issue.assigneeId,
        title: `Assigned: ${issue.issueKey}`,
        message: `${user.name} assigned you to "${issue.title}"`,
        type: 'ASSIGNMENT',
        link: `/issues/${issue.issueKey}`,
      });
    }

    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = updateIssueSchema.parse(req.body);
    const user = req.user!;

    const existing = await prisma.issue.findFirst({
      where: { OR: [{ id }, { issueKey: id }] },
    });

    if (!existing) {
      res.status(404).json({ message: 'Issue not found' });
      return;
    }

    if (user.role === 'EMPLOYEE' && existing.reporterId !== user.id) {
      res.status(403).json({ message: 'You are not authorized to edit this issue details' });
      return;
    }

    const updateData: any = {};
    const changes: string[] = [];

    if (data.title && data.title !== existing.title) {
      updateData.title = data.title;
      changes.push(`title to "${data.title}"`);
    }
    if (data.description && data.description !== existing.description) {
      updateData.description = data.description;
      changes.push('description');
    }
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      updateData.categoryId = data.categoryId;
      changes.push('category');
    }
    if (data.priority && data.priority !== existing.priority) {
      updateData.priority = data.priority;
      changes.push(`priority to ${data.priority}`);
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
      changes.push(`due date to ${data.dueDate || 'None'}`);
    }

    const updated = await prisma.issue.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        category: true,
        assignee: true,
        reporter: true,
      },
    });

    if (changes.length > 0) {
      await logActivity({
        issueId: existing.id,
        userId: user.id,
        action: 'DETAILS_UPDATED',
        details: `Updated ${changes.join(', ')}`,
      });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const assignIssue = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { assigneeId } = assignIssueSchema.parse(req.body);
    const user = req.user!;

    if (user.role === 'EMPLOYEE' && assigneeId !== user.id) {
      res.status(403).json({ message: 'Employees can only self-assign unassigned issues' });
      return;
    }

    const existing = await prisma.issue.findFirst({
      where: { OR: [{ id }, { issueKey: id }] },
      include: { assignee: true },
    });

    if (!existing) {
      res.status(404).json({ message: 'Issue not found' });
      return;
    }

    let newAssigneeName = 'Unassigned';
    let teamId = existing.teamId;

    if (assigneeId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: assigneeId },
        select: { id: true, name: true, teamId: true },
      });

      if (!targetUser) {
        res.status(400).json({ message: 'Assignee user not found' });
        return;
      }
      newAssigneeName = targetUser.name;
      if (targetUser.teamId) {
        teamId = targetUser.teamId;
      }
    }

    const newStatus = assigneeId
      ? existing.status === 'OPEN'
        ? 'ASSIGNED'
        : existing.status
      : 'OPEN';

    const updated = await prisma.issue.update({
      where: { id: existing.id },
      data: {
        assigneeId: assigneeId || null,
        teamId: teamId || null,
        status: newStatus,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        category: true,
        reporter: true,
      },
    });

    const previousName = existing.assignee?.name || 'Unassigned';
    await logActivity({
      issueId: existing.id,
      userId: user.id,
      action: 'ASSIGNED',
      details: `Reassigned from ${previousName} to ${newAssigneeName}`,
    });

    if (assigneeId && assigneeId !== user.id) {
      await createNotification({
        userId: assigneeId,
        title: `Issue Assigned: ${existing.issueKey}`,
        message: `${user.name} assigned you to "${existing.title}"`,
        type: 'ASSIGNMENT',
        link: `/issues/${existing.issueKey}`,
      });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, comment } = updateStatusSchema.parse(req.body);
    const user = req.user!;

    const existing = await prisma.issue.findFirst({
      where: { OR: [{ id }, { issueKey: id }] },
    });

    if (!existing) {
      res.status(404).json({ message: 'Issue not found' });
      return;
    }

    if (user.role === 'EMPLOYEE') {
      const isAssignee = existing.assigneeId === user.id;
      const isReporter = existing.reporterId === user.id;
      if (!isAssignee && !isReporter) {
        res.status(403).json({ message: 'You are only permitted to update status of issues you reported or are assigned to' });
        return;
      }

      if (status === 'CLOSED' && !isReporter) {
        res.status(403).json({ message: 'Only managers or reporters can mark issues as Closed' });
        return;
      }
    }

    const isResolvedOrClosed = status === 'RESOLVED' || status === 'CLOSED';
    const resolutionDate = isResolvedOrClosed ? existing.resolutionDate || new Date() : null;

    const updated = await prisma.issue.update({
      where: { id: existing.id },
      data: {
        status,
        resolutionDate,
      },
      include: {
        assignee: true,
        reporter: true,
        category: true,
      },
    });

    await logActivity({
      issueId: existing.id,
      userId: user.id,
      action: 'STATUS_CHANGED',
      details: `Changed status from ${existing.status} to ${status}${comment ? ` - "${comment}"` : ''}`,
    });

    if (existing.reporterId !== user.id) {
      await createNotification({
        userId: existing.reporterId,
        title: `Status Updated: ${existing.issueKey}`,
        message: `Status changed to ${status} for "${existing.title}"`,
        type: 'STATUS_CHANGE',
        link: `/issues/${existing.issueKey}`,
      });
    }

    if (existing.assigneeId && existing.assigneeId !== user.id) {
      await createNotification({
        userId: existing.assigneeId,
        title: `Status Updated: ${existing.issueKey}`,
        message: `Status changed to ${status} for "${existing.title}"`,
        type: 'STATUS_CHANGE',
        link: `/issues/${existing.issueKey}`,
      });
    }

    if (comment && comment.trim() !== '') {
      await prisma.comment.create({
        data: {
          issueId: existing.id,
          authorId: user.id,
          content: `*Status changed to ${status}*\n\n${comment}`,
        },
      });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    if (user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only administrators can delete issues' });
      return;
    }

    const existing = await prisma.issue.findFirst({
      where: { OR: [{ id }, { issueKey: id }] },
    });

    if (!existing) {
      res.status(404).json({ message: 'Issue not found' });
      return;
    }

    await prisma.issue.delete({ where: { id: existing.id } });
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    next(error);
  }
};
