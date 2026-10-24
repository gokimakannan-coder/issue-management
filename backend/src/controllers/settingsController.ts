import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma.js';

export const getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {
      appName: 'IssueFlow Enterprise',
      companyName: 'Acme Corporation',
      issueKeyPrefix: 'ISS',
      allowPublicRegistration: 'true',
      defaultDueDateDays: '7',
      slaCriticalHours: '4',
      slaHighHours: '24',
      slaMediumHours: '72',
      slaLowHours: '168',
      emailNotifications: 'true',
    };

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json(settingsMap);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updates = req.body; // Key-value object

    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};
