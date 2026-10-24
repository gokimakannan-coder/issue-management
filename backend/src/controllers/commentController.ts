import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { logActivity, createNotification } from '../services/activityService.js';

const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty'),
});

export const addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const issueId = req.params.issueId as string;
    const { content } = addCommentSchema.parse(req.body);
    const user = req.user!;

    const issue = await prisma.issue.findFirst({
      where: { OR: [{ id: issueId }, { issueKey: issueId }] },
    });

    if (!issue) {
      res.status(404).json({ message: 'Issue not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        issueId: issue.id,
        authorId: user.id,
        content,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
      },
    });

    await logActivity({
      issueId: issue.id,
      userId: user.id,
      action: 'COMMENT_ADDED',
      details: `Added a comment: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`,
    });

    // Notify assignee if someone else commented
    if (issue.assigneeId && issue.assigneeId !== user.id) {
      await createNotification({
        userId: issue.assigneeId,
        title: `New Comment: ${issue.issueKey}`,
        message: `${user.name} commented on "${issue.title}"`,
        type: 'COMMENT',
        link: `/issues/${issue.issueKey}`,
      });
    }

    // Notify reporter if someone else commented
    if (issue.reporterId !== user.id && issue.reporterId !== issue.assigneeId) {
      await createNotification({
        userId: issue.reporterId,
        title: `New Comment: ${issue.issueKey}`,
        message: `${user.name} commented on "${issue.title}"`,
        type: 'COMMENT',
        link: `/issues/${issue.issueKey}`,
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (user.role !== 'ADMIN' && comment.authorId !== user.id) {
      res.status(403).json({ message: 'You can only delete your own comments' });
      return;
    }

    await prisma.comment.delete({ where: { id } });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
