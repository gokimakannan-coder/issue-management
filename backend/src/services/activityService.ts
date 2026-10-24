import prisma from '../prisma.js';

export interface LogActivityParams {
  issueId: string;
  userId: string;
  action: string;
  details: string;
}

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'ASSIGNMENT' | 'STATUS_CHANGE' | 'COMMENT' | 'OVERDUE' | 'SYSTEM';
  link?: string;
}

export async function logActivity({
  issueId,
  userId,
  action,
  details,
}: LogActivityParams) {
  try {
    return await prisma.activityLog.create({
      data: {
        issueId,
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function createNotification({
  userId,
  title,
  message,
  type = 'SYSTEM',
  link,
}: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
