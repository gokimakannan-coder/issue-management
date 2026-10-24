import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
  managerId: z.string().optional().nullable(),
});

export const listTeams = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: {
        manager: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        _count: {
          select: {
            members: true,
            issues: true,
          },
        },
      },
    });

    res.json(teams);
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        manager: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        issues: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            issueKey: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        },
      },
    });

    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = teamSchema.parse(req.body);

    const existing = await prisma.team.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      res.status(400).json({ message: 'Team with this name already exists' });
      return;
    }

    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        managerId: data.managerId || null,
      },
      include: {
        manager: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = teamSchema.parse(req.body);

    const existing = await prisma.team.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    const updated = await prisma.team.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        managerId: data.managerId || null,
      },
      include: {
        manager: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.team.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    await prisma.team.delete({ where: { id } });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};
