import prisma from '../prisma.js';

export async function generateIssueKey(): Promise<string> {
  // Find highest issueKey starting with ISS-
  const latestIssue = await prisma.issue.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { issueKey: true },
  });

  if (!latestIssue || !latestIssue.issueKey) {
    return 'ISS-1001';
  }

  const match = latestIssue.issueKey.match(/ISS-(\d+)/);
  if (match && match[1]) {
    const nextNumber = parseInt(match[1], 10) + 1;
    return `ISS-${nextNumber}`;
  }

  // Fallback to count
  const count = await prisma.issue.count();
  return `ISS-${1001 + count}`;
}
