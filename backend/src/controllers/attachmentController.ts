import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { logActivity } from '../services/activityService.js';

export const uploadAttachment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const issueId = req.params.issueId as string;
    const file = req.file;
    const user = req.user!;

    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const issue = await prisma.issue.findFirst({
      where: { OR: [{ id: issueId }, { issueKey: issueId }] },
    });

    if (!issue) {
      res.status(404).json({ message: 'Issue not found' });
      return;
    }

    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        filePath: `/uploads/${file.filename}`,
        issueId: issue.id,
        uploaderId: user.id,
      },
      include: {
        uploader: { select: { id: true, name: true } },
      },
    });

    await logActivity({
      issueId: issue.id,
      userId: user.id,
      action: 'ATTACHMENT_ADDED',
      details: `Uploaded file "${file.originalname}" (${Math.round(file.size / 1024)} KB)`,
    });

    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { issue: true },
    });

    if (!attachment) {
      res.status(404).json({ message: 'Attachment not found' });
      return;
    }

    if (user.role !== 'ADMIN' && attachment.uploaderId !== user.id) {
      res.status(403).json({ message: 'You can only delete files you uploaded' });
      return;
    }

    const fullPath = path.resolve(process.cwd(), 'uploads', attachment.fileName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await prisma.attachment.delete({ where: { id } });

    await logActivity({
      issueId: attachment.issueId,
      userId: user.id,
      action: 'ATTACHMENT_REMOVED',
      details: `Removed attachment "${attachment.originalName}"`,
    });

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
