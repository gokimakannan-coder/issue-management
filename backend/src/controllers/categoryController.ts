import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color code').default('#3b82f6'),
});

export const listCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.issueCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { issues: true },
        },
      },
    });

    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = categorySchema.parse(req.body);

    const existing = await prisma.issueCategory.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      res.status(400).json({ message: 'Category with this name already exists' });
      return;
    }

    const category = await prisma.issueCategory.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = categorySchema.parse(req.body);

    const existing = await prisma.issueCategory.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    const updated = await prisma.issueCategory.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const issueCount = await prisma.issue.count({
      where: { categoryId: id },
    });

    if (issueCount > 0) {
      res.status(400).json({
        message: `Cannot delete category because ${issueCount} issues are assigned to it. Reassign or delete those issues first.`,
      });
      return;
    }

    await prisma.issueCategory.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
