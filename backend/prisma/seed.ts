import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Clean existing records
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.issueCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.systemSetting.deleteMany();

  // 2. Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'appName', value: 'IssueFlow Enterprise' },
      { key: 'companyName', value: 'Apex Innovations Corp' },
      { key: 'issueKeyPrefix', value: 'ISS' },
      { key: 'allowPublicRegistration', value: 'true' },
      { key: 'defaultDueDateDays', value: '7' },
      { key: 'slaCriticalHours', value: '4' },
      { key: 'slaHighHours', value: '24' },
      { key: 'slaMediumHours', value: '72' },
      { key: 'slaLowHours', value: '168' },
      { key: 'emailNotifications', value: 'true' },
    ],
  });

  // 3. Password hash
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 4. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@issueflow.com',
      name: 'Alex Morgan',
      password: defaultPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@issueflow.com',
      name: 'Sarah Chen',
      password: defaultPassword,
      role: 'MANAGER',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      email: 'john@issueflow.com',
      name: 'John Doe',
      password: defaultPassword,
      role: 'EMPLOYEE',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'emily@issueflow.com',
      name: 'Emily Davis',
      password: defaultPassword,
      role: 'EMPLOYEE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      email: 'marcus@issueflow.com',
      name: 'Marcus Vance',
      password: defaultPassword,
      role: 'EMPLOYEE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 5. Create Teams
  const teamFrontend = await prisma.team.create({
    data: {
      name: 'Frontend Engineering',
      description: 'Web applications, user interface, client performance and accessibility.',
      managerId: manager.id,
    },
  });

  const teamBackend = await prisma.team.create({
    data: {
      name: 'Backend & Cloud Platform',
      description: 'Distributed microservices, databases, Kubernetes, and API integrations.',
      managerId: manager.id,
    },
  });

  const teamQA = await prisma.team.create({
    data: {
      name: 'QA & Security',
      description: 'End-to-end automated testing, load testing, and penetration security audit.',
      managerId: manager.id,
    },
  });

  // Assign users to teams
  await prisma.user.update({ where: { id: employee1.id }, data: { teamId: teamFrontend.id } });
  await prisma.user.update({ where: { id: employee2.id }, data: { teamId: teamBackend.id } });
  await prisma.user.update({ where: { id: employee3.id }, data: { teamId: teamQA.id } });
  await prisma.user.update({ where: { id: manager.id }, data: { teamId: teamFrontend.id } });

  // 6. Categories
  const catBug = await prisma.issueCategory.create({
    data: { name: 'Bug / Defect', description: 'Functional defects, glitches, and unintended behaviors', color: '#ef4444' },
  });
  const catFeature = await prisma.issueCategory.create({
    data: { name: 'Feature Request', description: 'New capability, business requirement or workflow extension', color: '#3b82f6' },
  });
  const catSecurity = await prisma.issueCategory.create({
    data: { name: 'Security Vulnerability', description: 'Authentication bypass, data leak, or CVE advisory', color: '#dc2626' },
  });
  const catPerformance = await prisma.issueCategory.create({
    data: { name: 'Performance Issue', description: 'High memory usage, slow queries, or rendering bottlenecks', color: '#f59e0b' },
  });
  const catUIUX = await prisma.issueCategory.create({
    data: { name: 'UI/UX Improvement', description: 'Layout glitches, typography, accessibility, mobile responsiveness', color: '#8b5cf6' },
  });
  const catTechDebt = await prisma.issueCategory.create({
    data: { name: 'Technical Debt', description: 'Refactoring, deprecated library upgrades, code cleanup', color: '#64748b' },
  });

  // Dates for mock issues
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const inTenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  // 7. Issues
  // ISS-1001: Critical & Overdue
  const issue1 = await prisma.issue.create({
    data: {
      issueKey: 'ISS-1001',
      title: 'Payment gateway timeout during peak checkout hours',
      description: 'Stripe webhook triggers are occasionally failing with HTTP 504 Gateway Timeout during checkout spikes. Customers report being charged twice or receiving incomplete order confirmations.',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      categoryId: catBug.id,
      reporterId: manager.id,
      assigneeId: employee2.id,
      teamId: teamBackend.id,
      createdAt: sevenDaysAgo,
      dueDate: yesterday, // Overdue!
    },
  });

  // ISS-1002: High Priority Feature
  const issue2 = await prisma.issue.create({
    data: {
      issueKey: 'ISS-1002',
      title: 'Implement Multi-Factor Authentication (MFA) with TOTP',
      description: 'Enterprise clients require two-factor authentication via Authenticator apps (Google Authenticator / Authy) before Q4 compliance audit.',
      priority: 'HIGH',
      status: 'ASSIGNED',
      categoryId: catSecurity.id,
      reporterId: admin.id,
      assigneeId: employee1.id,
      teamId: teamFrontend.id,
      createdAt: fiveDaysAgo(now),
      dueDate: inThreeDays,
    },
  });

  // ISS-1003: UI/UX Open
  const issue3 = await prisma.issue.create({
    data: {
      issueKey: 'ISS-1003',
      title: 'Mobile navigation drawer closes abruptly on tablet landscape',
      description: 'When rotating an iPad Pro in Safari, the hamburger menu collapses and state is lost. Needs CSS media query overhaul.',
      priority: 'MEDIUM',
      status: 'OPEN',
      categoryId: catUIUX.id,
      reporterId: employee3.id,
      teamId: teamFrontend.id,
      createdAt: threeDaysAgo,
      dueDate: inFiveDays,
    },
  });

  // ISS-1004: Resolved Performance Issue
  const issue4 = await prisma.issue.create({
    data: {
      issueKey: 'ISS-1004',
      title: 'Database index missing on customer activity query',
      description: 'Query on customer transaction logs was executing full table scans taking > 3.2s. Added compound index on (customerId, createdAt).',
      priority: 'HIGH',
      status: 'RESOLVED',
      categoryId: catPerformance.id,
      reporterId: employee2.id,
      assigneeId: employee2.id,
      teamId: teamBackend.id,
      createdAt: sevenDaysAgo,
      dueDate: threeDaysAgo,
      resolutionDate: yesterday,
    },
  });

  // ISS-1005: Closed Technical Debt
  const issue5 = await prisma.issue.create({
    data: {
      issueKey: 'ISS-1005',
      title: 'Upgrade Node.js runtime and remove deprecated packages',
      description: 'Upgraded dependencies to latest stable LTS and migrated Jest tests to modern test suite.',
      priority: 'LOW',
      status: 'CLOSED',
      categoryId: catTechDebt.id,
      reporterId: admin.id,
      assigneeId: employee1.id,
      teamId: teamFrontend.id,
      createdAt: tenDaysAgo(now),
      dueDate: fiveDaysAgo(now),
      resolutionDate: fourDaysAgo(now),
    },
  });

  // ISS-1006: On Hold Feature
  const issue6 = await prisma.issue.create({
    data: {
      issueKey: 'ISS-1006',
      title: 'Integration with Slack webhooks for instant notifications',
      description: 'Allow teams to connect a Slack incoming webhook URL to broadcast issue assignments and status alerts into a dedicated Slack channel.',
      priority: 'MEDIUM',
      status: 'ON_HOLD',
      categoryId: catFeature.id,
      reporterId: manager.id,
      assigneeId: employee1.id,
      teamId: teamFrontend.id,
      createdAt: fourDaysAgo(now),
      dueDate: inTenDays,
    },
  });

  // ISS-1007: QA Automated Pipeline
  const issue7 = await prisma.issue.create({
    data: {
      issueKey: 'ISS-1007',
      title: 'Cypress E2E test suite flakiness on Chromium runner',
      description: 'Intermittent failure in checkout flow test due to race condition with modal animation timing.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      categoryId: catBug.id,
      reporterId: employee3.id,
      assigneeId: employee3.id,
      teamId: teamQA.id,
      createdAt: twoDaysAgo(now),
      dueDate: inFiveDays,
    },
  });

  // ISS-1008: Critical Security Issue
  const issue8 = await prisma.issue.create({
    data: {
      issueKey: 'ISS-1008',
      title: 'Content Security Policy header misconfiguration on CDN',
      description: 'CDN edge rules are missing strict-transport-security and CSP script-src directives.',
      priority: 'CRITICAL',
      status: 'OPEN',
      categoryId: catSecurity.id,
      reporterId: employee3.id,
      assigneeId: employee2.id,
      teamId: teamBackend.id,
      createdAt: yesterday,
      dueDate: inThreeDays,
    },
  });

  // 8. Comments
  await prisma.comment.createMany({
    data: [
      {
        issueId: issue1.id,
        authorId: employee2.id,
        content: 'I analyzed the CloudWatch traces. The connection pool gets exhausted during the 3 PM flash sale spikes. Working on bumping pool size and introducing Redis queue buffer.',
        createdAt: fiveDaysAgo(now),
      },
      {
        issueId: issue1.id,
        authorId: manager.id,
        content: 'Thanks Emily. Please deploy the pool adjustment to staging first and run a synthetic load test with 500 concurrent checkouts.',
        createdAt: fourDaysAgo(now),
      },
      {
        issueId: issue1.id,
        authorId: employee2.id,
        content: 'Staging deployment verified! Response time dropped from 4200ms to 240ms under simulated load. Preparing hotfix PR for production.',
        createdAt: yesterday,
      },
      {
        issueId: issue2.id,
        authorId: employee1.id,
        content: 'Started drafting the QR code provisioning interface using otplib and canvas-based rendering.',
        createdAt: threeDaysAgo,
      },
      {
        issueId: issue4.id,
        authorId: employee2.id,
        content: 'Index migration executed in production maintenance window. Query time is now 18ms.',
        createdAt: yesterday,
      },
    ],
  });

  // 9. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        issueId: issue1.id,
        userId: manager.id,
        action: 'CREATED',
        details: 'Created issue ISS-1001 with priority CRITICAL',
        createdAt: sevenDaysAgo,
      },
      {
        issueId: issue1.id,
        userId: manager.id,
        action: 'ASSIGNED',
        details: 'Assigned to Emily Davis',
        createdAt: sixDaysAgo(now),
      },
      {
        issueId: issue1.id,
        userId: employee2.id,
        action: 'STATUS_CHANGED',
        details: 'Changed status from ASSIGNED to IN_PROGRESS',
        createdAt: fiveDaysAgo(now),
      },
      {
        issueId: issue2.id,
        userId: admin.id,
        action: 'CREATED',
        details: 'Created issue ISS-1002 with priority HIGH',
        createdAt: fiveDaysAgo(now),
      },
      {
        issueId: issue2.id,
        userId: admin.id,
        action: 'ASSIGNED',
        details: 'Assigned to John Doe',
        createdAt: fiveDaysAgo(now),
      },
      {
        issueId: issue4.id,
        userId: employee2.id,
        action: 'STATUS_CHANGED',
        details: 'Changed status from IN_PROGRESS to RESOLVED - "Applied database index on transactions table"',
        createdAt: yesterday,
      },
    ],
  });

  // 10. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: employee2.id,
        title: 'Assigned: ISS-1001',
        message: 'Sarah Chen assigned you to "Payment gateway timeout during peak checkout hours"',
        type: 'ASSIGNMENT',
        link: '/issues/ISS-1001',
        read: false,
        createdAt: sixDaysAgo(now),
      },
      {
        userId: employee1.id,
        title: 'Assigned: ISS-1002',
        message: 'Alex Morgan assigned you to "Implement Multi-Factor Authentication (MFA) with TOTP"',
        type: 'ASSIGNMENT',
        link: '/issues/ISS-1002',
        read: false,
        createdAt: fiveDaysAgo(now),
      },
      {
        userId: manager.id,
        title: 'Status Updated: ISS-1004',
        message: 'Status changed to RESOLVED for "Database index missing on customer activity query"',
        type: 'STATUS_CHANGE',
        link: '/issues/ISS-1004',
        read: true,
        createdAt: yesterday,
      },
      {
        userId: employee2.id,
        title: 'Overdue Alert: ISS-1001',
        message: 'Issue ISS-1001 is past its due date and remains In Progress.',
        type: 'OVERDUE',
        link: '/issues/ISS-1001',
        read: false,
        createdAt: yesterday,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Admin Account:    admin@issueflow.com    / password123');
  console.log('Manager Account:  manager@issueflow.com  / password123');
  console.log('Employee Account: john@issueflow.com     / password123');
  console.log('Employee Account: emily@issueflow.com    / password123');
  console.log('Employee Account: marcus@issueflow.com   / password123');
  console.log('----------------------------------------------------');
}

function twoDaysAgo(now: Date) { return new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); }
function fourDaysAgo(now: Date) { return new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); }
function fiveDaysAgo(now: Date) { return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); }
function sixDaysAgo(now: Date) { return new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); }
function tenDaysAgo(now: Date) { return new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); }

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
