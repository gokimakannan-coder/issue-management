import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const where: any = {};

    // For employee, scope if requested or keep dashboard personal vs team
    if (user.role === 'EMPLOYEE') {
      where.OR = [
        { assigneeId: user.id },
        { reporterId: user.id },
      ];
    }

    const now = new Date();

    const [
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      criticalIssues,
      overdueIssues,
      recentIssues,
    ] = await Promise.all([
      prisma.issue.count({ where }),
      prisma.issue.count({ where: { ...where, status: { in: ['OPEN', 'ASSIGNED'] } } }),
      prisma.issue.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.issue.count({ where: { ...where, status: 'RESOLVED' } }),
      prisma.issue.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.issue.count({
        where: { ...where, priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } },
      }),
      prisma.issue.count({
        where: {
          ...where,
          dueDate: { lt: now },
          status: { notIn: ['RESOLVED', 'CLOSED'] },
        },
      }),
      prisma.issue.findMany({
        where,
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true, color: true } },
          assignee: { select: { name: true, avatar: true } },
        },
      }),
    ]);

    // Issues by Status
    const statusCounts = await prisma.issue.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });

    const statusMap: Record<string, number> = {
      OPEN: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      ON_HOLD: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };
    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count.id;
    });

    // Issues by Priority
    const priorityCounts = await prisma.issue.groupBy({
      by: ['priority'],
      where,
      _count: { id: true },
    });
    const priorityMap: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };
    priorityCounts.forEach((p) => {
      priorityMap[p.priority] = p._count.id;
    });

    // Issues by Category
    const categoryIssues = await prisma.issueCategory.findMany({
      include: {
        _count: {
          select: {
            issues: {
              where: user.role === 'EMPLOYEE' ? { OR: [{ assigneeId: user.id }, { reporterId: user.id }] } : undefined,
            },
          },
        },
      },
    });

    const categoryData = categoryIssues.map((c) => ({
      name: c.name,
      count: c._count.issues,
      color: c.color,
    }));

    // Issues created and resolved over the last 14 days
    const past14Days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    const allIssues = await prisma.issue.findMany({
      where,
      select: {
        createdAt: true,
        resolutionDate: true,
        status: true,
      },
    });

    const timeTrendData = past14Days.map((dateStr) => {
      const createdCount = allIssues.filter(
        (iss) => iss.createdAt.toISOString().split('T')[0] === dateStr
      ).length;
      const resolvedCount = allIssues.filter(
        (iss) =>
          iss.resolutionDate &&
          iss.resolutionDate.toISOString().split('T')[0] === dateStr
      ).length;

      return {
        date: dateStr.slice(5), // MM-DD
        fullDate: dateStr,
        created: createdCount,
        resolved: resolvedCount,
      };
    });

    // Team Workload & Performance
    const usersWithWorkload = await prisma.user.findMany({
      where: {
        role: { in: ['EMPLOYEE', 'MANAGER'] },
      },
      select: {
        id: true,
        name: true,
        role: true,
        assignedIssues: {
          select: {
            status: true,
          },
        },
      },
      take: 8,
    });

    const workloadData = usersWithWorkload.map((u) => {
      const total = u.assignedIssues.length;
      const resolved = u.assignedIssues.filter(
        (i) => i.status === 'RESOLVED' || i.status === 'CLOSED'
      ).length;
      const active = total - resolved;

      return {
        name: u.name,
        active,
        resolved,
        total,
      };
    });

    res.json({
      summary: {
        total: totalIssues,
        open: openIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues + closedIssues,
        critical: criticalIssues,
        overdue: overdueIssues,
      },
      charts: {
        byStatus: [
          { name: 'Open', value: statusMap.OPEN, color: '#3b82f6' },
          { name: 'Assigned', value: statusMap.ASSIGNED, color: '#6366f1' },
          { name: 'In Progress', value: statusMap.IN_PROGRESS, color: '#f59e0b' },
          { name: 'On Hold', value: statusMap.ON_HOLD, color: '#8b5cf6' },
          { name: 'Resolved', value: statusMap.RESOLVED, color: '#10b981' },
          { name: 'Closed', value: statusMap.CLOSED, color: '#64748b' },
        ],
        byPriority: [
          { name: 'Low', value: priorityMap.LOW, color: '#94a3b8' },
          { name: 'Medium', value: priorityMap.MEDIUM, color: '#3b82f6' },
          { name: 'High', value: priorityMap.HIGH, color: '#f97316' },
          { name: 'Critical', value: priorityMap.CRITICAL, color: '#ef4444' },
        ],
        byCategory: categoryData,
        timeTrends: timeTrendData,
        teamWorkload: workloadData,
      },
      recentIssues,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, teamId, categoryId } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (teamId && teamId !== 'ALL') where.teamId = teamId;
    if (categoryId && categoryId !== 'ALL') where.categoryId = categoryId;

    const issues = await prisma.issue.findMany({
      where,
      include: {
        category: true,
        assignee: true,
        reporter: true,
        team: true,
      },
    });

    const totalIssues = issues.length;
    const resolvedIssues = issues.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED');
    const openIssues = issues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED');
    const now = new Date();
    const overdueIssues = issues.filter(
      (i) => i.dueDate && new Date(i.dueDate) < now && i.status !== 'RESOLVED' && i.status !== 'CLOSED'
    );

    // Calculate Average Resolution Time in hours
    let totalResolutionHours = 0;
    let resolvedWithDatesCount = 0;

    resolvedIssues.forEach((i) => {
      if (i.resolutionDate) {
        const diffMs = new Date(i.resolutionDate).getTime() - new Date(i.createdAt).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours >= 0) {
          totalResolutionHours += diffHours;
          resolvedWithDatesCount++;
        }
      }
    });

    const avgResolutionHours = resolvedWithDatesCount > 0
      ? (totalResolutionHours / resolvedWithDatesCount).toFixed(1)
      : '0';

    // Issues by Category
    const categoryCountMap: Record<string, number> = {};
    issues.forEach((i) => {
      const catName = i.category?.name || 'Uncategorized';
      categoryCountMap[catName] = (categoryCountMap[catName] || 0) + 1;
    });

    // Issues by Priority
    const priorityCountMap: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    issues.forEach((i) => {
      priorityCountMap[i.priority] = (priorityCountMap[i.priority] || 0) + 1;
    });

    // Issues by Employee
    const employeeMap: Record<string, { total: number; resolved: number }> = {};
    issues.forEach((i) => {
      const empName = i.assignee?.name || 'Unassigned';
      if (!employeeMap[empName]) {
        employeeMap[empName] = { total: 0, resolved: 0 };
      }
      employeeMap[empName].total++;
      if (i.status === 'RESOLVED' || i.status === 'CLOSED') {
        employeeMap[empName].resolved++;
      }
    });

    const employeeData = Object.entries(employeeMap).map(([name, data]) => ({
      name,
      total: data.total,
      resolved: data.resolved,
      pending: data.total - data.resolved,
    }));

    res.json({
      summary: {
        total: totalIssues,
        resolved: resolvedIssues.length,
        open: openIssues.length,
        overdue: overdueIssues.length,
        avgResolutionHours,
      },
      byCategory: Object.entries(categoryCountMap).map(([name, count]) => ({ name, count })),
      byPriority: Object.entries(priorityCountMap).map(([name, count]) => ({ name, count })),
      byEmployee: employeeData,
    });
  } catch (error) {
    next(error);
  }
};

export const exportIssuesCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, status, priority } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }
    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;

    const issues = await prisma.issue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        assignee: true,
        reporter: true,
        team: true,
      },
    });

    // Generate CSV string
    const headers = [
      'Issue ID',
      'Title',
      'Category',
      'Priority',
      'Status',
      'Reporter',
      'Assignee',
      'Team',
      'Created Date',
      'Due Date',
      'Resolution Date',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = issues.map((i) => [
      escapeCsv(i.issueKey),
      escapeCsv(i.title),
      escapeCsv(i.category?.name),
      escapeCsv(i.priority),
      escapeCsv(i.status),
      escapeCsv(i.reporter?.name),
      escapeCsv(i.assignee?.name || 'Unassigned'),
      escapeCsv(i.team?.name || 'None'),
      escapeCsv(i.createdAt.toISOString().split('T')[0]),
      escapeCsv(i.dueDate ? i.dueDate.toISOString().split('T')[0] : 'None'),
      escapeCsv(i.resolutionDate ? i.resolutionDate.toISOString().split('T')[0] : 'None'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=issues-export-${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
