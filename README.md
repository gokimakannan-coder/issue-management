# IssueFlow - Enterprise Issue Management System

A complete, modern, professional, and fully functional Issue Management System built with React, TypeScript, Tailwind CSS, Express.js, and Prisma ORM.

![IssueFlow Overview](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80)

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)
- **Admin**:
  - Full system oversight and executive analytics.
  - Create, assign, reassign, update, and delete issues.
  - User Management: Add users, assign roles, appoint team members.
  - Team Management: Create engineering teams and appoint managers.
  - Categories & SLA: Configure categories, colors, and resolution SLA targets.
  - Full system settings and global parameters.
- **Manager**:
  - Review team issues, performance, and workloads.
  - Assign issues to team members.
  - Adjust priorities, deadlines, and statuses.
  - Team workload distribution charts and analytics.
- **Employee**:
  - Report new issues with attachments and metadata.
  - Focus on personal queues via **My Issues** (Assigned vs Reported).
  - Transition statuses (e.g. *In Progress*, *Resolved*, *On Hold*).
  - Add comments and upload files.
  - Receive real-time in-app notifications.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 with TypeScript
  - Tailwind CSS for modern enterprise styling
  - Lucide Icons
  - Recharts (Donut charts, area time-trends, bar breakdowns)
  - React Hook Form + Zod for strict form validation
  - Sonner for notifications and toasts
  - Vite build tool
- **Backend**:
  - Node.js & Express.js
  - TypeScript
  - Prisma ORM
  - SQLite (out-of-the-box local reliability) with 100% PostgreSQL compatibility
  - JSON Web Tokens (JWT) for authentication
  - bcryptjs for password hashing
  - Multer for secure attachment uploads
  - Centralized error handling and RBAC middleware

---

## 💻 Quick Start & Running the Application

### 1. Prerequisites
- Node.js (v18 or newer)
- npm or pnpm

### 2. Option A: One-Click Startup (Windows)
Double-click `start.bat` in the project root directory. It will start both backend (port 5000) and frontend (port 5173) in separate command windows and open the application.

### 3. Option B: Manual Terminal Startup

#### Terminal 1: Backend API
```bash
cd backend
cp .env.example .env        # Windows: copy .env.example .env
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
*Backend runs on `http://localhost:5000`*

#### Terminal 2: Frontend App
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔐 Default Demo Accounts

The database comes pre-seeded with realistic team members across all roles. The login page also features **1-click fast demo login buttons**:

| Role | Email | Password | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@issueflow.com` | `password123` | System Administrator (Alex Morgan) |
| **Manager** | `manager@issueflow.com` | `password123` | Engineering Manager (Sarah Chen) |
| **Employee** | `john@issueflow.com` | `password123` | Senior Frontend Engineer (John Doe) |
| **Employee** | `emily@issueflow.com` | `password123` | Full Stack Developer (Emily Davis) |
| **Employee** | `marcus@issueflow.com` | `password123` | QA Specialist (Marcus Vance) |

---

## 📋 Pages & Navigation

1. **Login Page (`/login`)**:
   - Modern enterprise auth card.
   - 1-click Fast Demo login buttons for instant switching between Admin, Manager, and Employee.
2. **Dashboard (`/`)**:
   - 6 Key Metrics: Total Issues, Open, In Progress, Resolved, Critical, Overdue.
   - Interactive charts: Velocity over time, Issues by Status, Issues by Priority, Issues by Category, and Team Output.
   - Recent Issues table with instant navigation.
3. **All Issues (`/issues`)**:
   - Comprehensive issue tracker with multi-criteria search (ID, title, description).
   - Filtering by Status, Priority, Category, and Overdue toggle.
   - Real pagination and sorting (Newest, Oldest, Priority, Due Date).
   - Export to CSV button.
4. **My Issues (`/my-issues`)**:
   - Focused workspace for the logged-in user.
   - Tab toggles: *Assigned to Me* vs *Reported by Me*.
5. **Report New Issue (`/issues/new`)**:
   - Validated form with title, description, category, priority, assignee, due date, and attachment upload.
   - Generates unique ID format (e.g. `ISS-1001`).
6. **Issue Details (`/issues/:id`)**:
   - Comprehensive ticket workspace.
   - Priority and status badges, reporter/assignee details.
   - Interactive status transition workflow buttons.
   - Comments thread with real author badges.
   - Attachment manager with download and upload capabilities.
   - Detailed activity timeline showing audit history.
7. **Edit Issue (`/issues/:id/edit`)**:
   - Full ticket metadata editing.
8. **User Management (`/users`)** *(Admin only)*:
   - User table, role assignments, team mapping, create/edit/delete modals.
9. **Team Management (`/teams`)** *(Admin & Manager)*:
   - Team cards, managers, and member roster.
10. **Categories & SLA (`/categories`)** *(Admin only)*:
    - CRUD categories with color tags and SLA reference guide.
11. **Reports & Analytics (`/reports`)**:
    - Date-range filtering (7d, 30d, custom).
    - Avg. resolution time calculation.
    - Issues resolved vs pending by engineer.
    - Downloadable CSV reports.
12. **Notifications (`/notifications`)**:
    - Notification feed with unread indicators, mark all read, and clear actions.
13. **User Profile (`/profile`)**:
    - Profile details, avatar link, password change, and personal statistics.
14. **System Settings (`/settings`)** *(Admin only)*:
    - Branding, SLA hour targets, issue ID prefix.
15. **404 Not Found (`*`)**:
    - Graceful page not found fallback with return button.

---

## 🗄️ Database Architecture (Prisma Schema)

- `User`: Accounts with role enum (`ADMIN`, `MANAGER`, `EMPLOYEE`), hashed passwords, avatars, and team relation.
- `Team`: Engineering groups with manager relation and user members.
- `IssueCategory`: Classification categories with custom color hexes.
- `Issue`: Central model with unique key (`ISS-1001`), priorities (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), statuses (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `ON_HOLD`, `RESOLVED`, `CLOSED`), dates, reporter, assignee, and team relations.
- `Comment`: Discussion messages attached to issues.
- `Attachment`: Uploaded files with original name, size, mime type, and disk storage.
- `ActivityLog`: Audit trail of every update, assignment, or transition.
- `Notification`: In-app alerts for assignments, status changes, and overdue warnings.
- `SystemSetting`: Key-value configuration for enterprise customization.

---

## 🛡️ Security Features
- Passwords hashed using `bcryptjs` with salt rounds.
- JWT authentication with 7-day token expiration.
- Strict backend role authorization checks on sensitive routes (Users, Categories, Settings, Delete operations).
- Safe file upload handling with Multer and size caps (10MB).
- Parameterized queries via Prisma ORM preventing SQL injection.
