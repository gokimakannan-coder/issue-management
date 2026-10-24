# IssueFlow Enterprise - Complete Project Documentation (A to Z)

---

## 📌 1. Project Overview & Objective

**IssueFlow** is an enterprise-grade, full-stack Issue Management System designed for modern engineering and operations organizations. It provides a centralized hub to report, triage, assign, track, prioritize, and resolve technical bugs, security vulnerabilities, feature requests, and operational bottlenecks.

This project was developed strictly as a **working, full-stack web application** with real relational database persistence, role-based access control (RBAC), live metric calculations, automated status workflow enforcement, comments, file attachments, and audit logging.

---

## 🏗️ 2. Architectural Decision Record (ADR) & Technology Stack

| Layer | Technology | Rationale & Implementation Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** with **TypeScript** | Strongly typed component architecture, modular hooks, and robust type safety. |
| **Styling & Design System** | **Tailwind CSS** | Utility-first styling with custom brand palettes, subtle shadows, and responsive grid layouts. |
| **Build Tool** | **Vite 5** | Instant hot-module replacement (HMR), optimized Rollup production bundling, and fast compilation. |
| **Icons** | **Lucide React** | Lightweight, clean, modern stroke icons for project management workflows. |
| **Visual Analytics** | **Recharts** | Interactive SVG-rendered charts: Area velocity trends, Status donuts, Priority bars, and Workload distributions. |
| **Form Validation** | **React Hook Form** + **Zod** | Declarative schema validation with real-time inline error messaging for report and edit forms. |
| **Notifications** | **Sonner** | Modern toast notifications for action confirmation, validation errors, and asynchronous alerts. |
| **Backend Runtime** | **Node.js** with **Express.js** & **TypeScript** | Scalable, non-blocking asynchronous REST API with modular controllers, routes, and middleware. |
| **Database & ORM** | **Prisma ORM** + **SQLite** *(PostgreSQL Ready)* | Out-of-the-box local reliability without database credential dependencies, fully relational with foreign keys and cascade rules. |
| **Authentication & Security** | **JWT** + **bcryptjs** | Stateless JSON Web Tokens, salted password hashing, and server-side role verification middleware. |
| **File Storage** | **Multer** | Multipart form-data parser with disk storage for attachments up to 10MB. |

---

## 📁 3. Workspace Directory Map & File Manifest

```
issue-management/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Database models, relations, indexes & SQLite provider
│   │   ├── seed.ts                    # Comprehensive seed script for demo accounts & tickets
│   │   └── dev.db                     # Generated SQLite database file
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── attachmentController.ts # File upload, download link & deletion
│   │   │   ├── authController.ts       # Login, profile retrieval, password updates & demo accounts
│   │   │   ├── categoryController.ts   # Category CRUD with issue safety guard
│   │   │   ├── commentController.ts    # Threaded issue comments & audit logs
│   │   │   ├── issueController.ts      # Issue CRUD, multi-filter search, assignment, status workflow
│   │   │   ├── notificationController.ts # User notifications & mark-as-read
│   │   │   ├── reportController.ts     # Real-time metrics, analytics & CSV export generator
│   │   │   ├── settingsController.ts   # System-wide settings & SLA thresholds
│   │   │   ├── teamController.ts       # Team rosters, managers & members
│   │   │   └── userController.ts       # User account administration (Admin only)
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts       # Bearer JWT verification & user injection
│   │   │   ├── errorHandler.ts         # Centralized error handler with Zod formatting
│   │   │   ├── roleMiddleware.ts       # Role-based authorization guard (ADMIN, MANAGER, EMPLOYEE)
│   │   │   └── uploadMiddleware.ts     # Multer disk configuration & filename sanitization
│   │   ├── routes/
│   │   │   ├── attachmentRoutes.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── categoryRoutes.ts
│   │   │   ├── commentRoutes.ts
│   │   │   ├── issueRoutes.ts
│   │   │   ├── notificationRoutes.ts
│   │   │   ├── reportRoutes.ts
│   │   │   ├── settingsRoutes.ts
│   │   │   ├── teamRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── services/
│   │   │   └── activityService.ts      # Activity history logging & notification dispatcher
│   │   ├── utils/
│   │   │   ├── idGenerator.ts          # Sequential issue key generator (e.g. ISS-1001)
│   │   │   └── token.ts                # JWT sign & verify helpers
│   │   ├── app.ts                      # Express app setup, CORS, static uploads & route mounts
│   │   ├── prisma.ts                   # Singleton Prisma client instance
│   │   └── server.ts                   # Server entry point on port 5000
│   ├── uploads/                        # Local file uploads directory
│   ├── .env                            # Environment variables (PORT, DATABASE_URL, JWT_SECRET)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ConfirmDialog.tsx   # Destructive action confirmation modal
│   │   │   │   ├── EmptyState.tsx      # Clean visual state for empty lists
│   │   │   │   ├── PageHeader.tsx      # Standard page header with action buttons
│   │   │   │   └── StatCard.tsx        # KPI summary cards with icons and trend badges
│   │   │   ├── issues/
│   │   │   │   ├── IssueActivityTimeline.tsx # Visual audit trail of ticket history
│   │   │   │   ├── IssueAttachments.tsx      # Dropzone & file card manager
│   │   │   │   ├── IssueComments.tsx         # Threaded conversation section
│   │   │   │   ├── IssueFilterBar.tsx        # Multi-criteria search, filters & sort
│   │   │   │   ├── IssuePriorityBadge.tsx    # Low, Medium, High, Critical indicators
│   │   │   │   └── IssueStatusBadge.tsx      # Open, Assigned, In Progress, On Hold, Resolved, Closed
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx       # Main authenticated container with sidebar and header
│   │   │   │   ├── Header.tsx          # Top bar with notifications dropdown & quick action
│   │   │   │   └── Sidebar.tsx         # Responsive navigation sidebar with role gating
│   │   │   └── ui/
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Select.tsx
│   │   │       └── Skeleton.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx         # Authentication state, login, logout & role helpers
│   │   │   └── NotificationContext.tsx # Real-time notification store and polling
│   │   ├── pages/
│   │   │   ├── AllIssuesPage.tsx       # Master issue tracker with search, filters & pagination
│   │   │   ├── CategoriesPrioritiesPage.tsx # Category management & SLA benchmarks
│   │   │   ├── DashboardPage.tsx       # 6 KPIs, 5 Recharts visualizations & recent table
│   │   │   ├── EditIssuePage.tsx       # Metadata edit form with validation
│   │   │   ├── IssueDetailsPage.tsx    # Issue details, status workflow, timeline, comments
│   │   │   ├── LoginPage.tsx           # Authentication card with 1-click demo switcher
│   │   │   ├── MyIssuesPage.tsx        # Personal queue (Assigned to Me vs Reported by Me)
│   │   │   ├── NotFoundPage.tsx        # 404 error page
│   │   │   ├── NotificationsPage.tsx   # Comprehensive notification center
│   │   │   ├── ReportIssuePage.tsx     # New issue creation form with attachments
│   │   │   ├── ReportsAnalyticsPage.tsx# Date-filtered metrics, SLA stats & CSV download
│   │   │   ├── SettingsPage.tsx        # Global enterprise settings & SLA hours
│   │   │   ├── TeamManagementPage.tsx  # Team rosters & appointed managers
│   │   │   ├── UserManagementPage.tsx  # User account administration (Admin only)
│   │   │   └── UserProfilePage.tsx     # Profile, avatar URL & password change form
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios instance with JWT interceptor & 401 handling
│   │   │   ├── authService.ts
│   │   │   ├── categoryService.ts
│   │   │   ├── issueService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── settingsService.ts
│   │   │   ├── teamService.ts
│   │   │   └── userService.ts
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces for all domain entities
│   │   ├── App.tsx                     # Protected routing configuration & role guards
│   │   ├── index.css                   # Tailwind base directives & custom scrollbars
│   │   └── main.tsx                    # React DOM mounting
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── package.json                        # Root npm script orchestrator
├── README.md                           # Quickstart guide & credentials
├── start.bat                           # 1-Click Windows execution script
└── PROJECT_OVERVIEW_A_TO_Z.md          # Comprehensive technical report
```

---

## 🛠️ 4. Chronological Step-by-Step Implementation Record (A to Z)

### Phase 1: Environment Audit & Node.js Engine Setup
1. **Audited Environment**: Inspected the host machine and verified that Node.js / npm were not present in the system `$env:PATH`.
2. **Installed Node.js LTS**: Executed a silent automated installation of Node.js LTS v24.22.1 and npm 11.19.1 using Windows Package Manager (`winget`).
3. **Execution Policy Configuration**: Configured process-level execution policies (`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`) to ensure `npm.cmd`, `npx.cmd`, and `tsx` run seamlessly across Windows PowerShell sessions.

---

### Phase 2: Relational Database Modeling with Prisma ORM
Designed a complete relational schema in [schema.prisma](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/backend/prisma/schema.prisma) supporting strict data integrity:
- **`User`**: Unique emails, bcrypt hashed passwords, roles (`ADMIN`, `MANAGER`, `EMPLOYEE`), avatar URLs, and relations to assigned issues, reported issues, teams, comments, and activity logs.
- **`Team`**: Unique team names, descriptions, relation to manager `User`, and members `User[]`.
- **`IssueCategory`**: Classifications (e.g. Bug, Feature, Security, Performance, UI/UX, Tech Debt) with custom hex colors.
- **`Issue`**:
  - Unique auto-incrementing key (e.g., `ISS-1001`).
  - Title, rich description, and priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - Status lifecycle (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `ON_HOLD`, `RESOLVED`, `CLOSED`).
  - Timestamps: `createdAt`, `updatedAt`, `dueDate`, `resolutionDate`.
  - Relations: `category`, `reporter`, `assignee`, `team`, `comments`, `attachments`, `activityLogs`.
  - Database Indexes: `status`, `priority`, `assigneeId`, `reporterId`.
- **`Comment`**: Threaded comments linked to issues and authors with cascade deletion.
- **`Attachment`**: File metadata including original filename, stored disk filename, file size, MIME type, and uploader relation.
- **`ActivityLog`**: Historical audit record containing action verbs (`CREATED`, `STATUS_CHANGED`, `ASSIGNED`, `COMMENT_ADDED`, etc.), change details, and timestamps.
- **`Notification`**: Targeted user alerts with read states and direct deep links.
- **`SystemSetting`**: Key-value pair configuration for SLA targets and application branding.

Executed `npx prisma db push` to generate the SQLite database and compile the Prisma Client.

---

### Phase 3: Backend RESTful API & Security Layer
Constructed an Express.js TypeScript application with strict separation of concerns:
1. **Authentication Utilities**:
   - [token.ts](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/backend/src/utils/token.ts): JWT token generation and verification with 7-day expiration.
   - [idGenerator.ts](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/backend/src/utils/idGenerator.ts): Database inspection utility to generate sequential ticket identifiers (`ISS-1001`, `ISS-1002`, etc.).
2. **Security & Validation Middleware**:
   - [authMiddleware.ts](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/backend/src/middleware/authMiddleware.ts): Validates `Authorization: Bearer <token>` and injects authenticated user payload.
   - [roleMiddleware.ts](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/backend/src/middleware/roleMiddleware.ts): Enforces role requirements on protected endpoints (e.g. `authorizeRoles('ADMIN')`).
   - [uploadMiddleware.ts](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/backend/src/middleware/uploadMiddleware.ts): Multer file upload handler with 10MB limit and safe timestamped naming.
   - [errorHandler.ts](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/backend/src/middleware/errorHandler.ts): Centralized error middleware handling Zod validation errors and HTTP exceptions.
3. **Core Controllers**:
   - `authController`: Login with bcrypt comparison, user profile retrieval, password update, and demo accounts listing.
   - `issueController`: Advanced filtering (status, priority, category, assignee, reporter, team, overdueOnly, date range), full-text search across keys and titles, pagination, status transition validation, and automated assignee notifications.
   - `reportController`: Live statistical aggregations (summary figures, status breakdown, priority distribution, 14-day velocity trends, team workload calculations) and real-time streaming CSV report generation.
   - `userController`: User listing, creation, modification, and account removal (Admin restricted).
   - `teamController`: Engineering team management and manager assignments.
   - `categoryController`: Issue category management with constraint protection (prevents deletion if issues are linked).
   - `commentController` & `attachmentController`: Interactive collaboration features with automatic activity timeline entries.
   - `notificationController`: In-app alert management with unread badges.
   - `settingsController`: System SLA hours and configuration persistence.

---

### Phase 4: Database Seeding
Created and executed [seed.ts](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/backend/prisma/seed.ts) to populate the database with realistic enterprise data:
- **5 Pre-configured Users**:
  - `admin@issueflow.com` (Alex Morgan - Admin)
  - `manager@issueflow.com` (Sarah Chen - Manager)
  - `john@issueflow.com` (John Doe - Employee)
  - `emily@issueflow.com` (Emily Davis - Employee)
  - `marcus@issueflow.com` (Marcus Vance - Employee)
  - *All configured with password `password123`.*
- **3 Functional Teams**:
  - Frontend Engineering
  - Backend & Cloud Platform
  - QA & Security
- **6 Issue Categories**: Bug / Defect, Feature Request, Security Vulnerability, Performance Issue, UI/UX Improvement, Technical Debt.
- **8 Pre-seeded Issues (`ISS-1001` - `ISS-1008`)**:
  - Spanning all statuses (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `ON_HOLD`, `RESOLVED`, `CLOSED`).
  - Spanning all priorities (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  - Including deliberately overdue tickets (`ISS-1001`) to test SLA alert mechanisms.
  - Realistic comments and complete activity timelines.

---

### Phase 5: Modern Enterprise Frontend Design System
1. **Tailwind CSS Configuration**: Configured custom brand palettes (`indigo`, `slate`, `emerald`, `amber`, `rose`), custom typography styles, and sleek scrollbars.
2. **UI Component Library** (`frontend/src/components/ui/`):
   - `Button`: Primary, secondary, outline, ghost, danger, success variants with loading spinner states.
   - `Badge`: Status and priority chips with colored dots and subtle borders.
   - `Card`: Structured card layout with Header, Title, Description, Content, and Footer.
   - `Input` & `Select`: Form controls with labels, inline validation error text, and left/right icon slots.
   - `Modal`: Accessible dialogs with animated backdrops and keyboard `Escape` dismissal.
   - `Skeleton`: Shimmering placeholder blocks for tables and stat cards during data loading.
3. **Common Reusable Components** (`frontend/src/components/common/`):
   - `PageHeader`: Standard layout header with page title, description, and action button bar.
   - `StatCard`: KPI summary card with icon containers, values, and badges.
   - `EmptyState`: Informative empty-state displays with relevant action triggers.
   - `ConfirmDialog`: Modal for confirming destructive deletions.

---

### Phase 6: State Management & Application Contexts
1. **[AuthContext.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/context/AuthContext.tsx)**:
   - Manages user authentication state, token storage in `localStorage`, and session renewal.
   - Exposes convenient permission booleans: `isAdmin`, `isManager`, `isEmployee`.
2. **[NotificationContext.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/context/NotificationContext.tsx)**:
   - Maintains notification list and unread count.
   - Periodically polls backend for new alerts every 30 seconds.
   - Provides methods to mark individual items or all notifications as read.
3. **[api.ts](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/services/api.ts)**:
   - Axios instance with base URL `/api`.
   - Request interceptor attaching `Bearer <token>`.
   - Response interceptor automatically routing expired sessions (HTTP 401) to `/login`.

---

### Phase 7: Component Library & Layout Infrastructure
1. **[Sidebar.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/components/layout/Sidebar.tsx)**:
   - Fixed navigation sidebar across all authenticated routes.
   - Segmented into *Overview*, *Insights*, and *Management*.
   - Dynamically hides administrative links (`User Management`, `Categories & SLA`, `System Settings`) from non-admin users.
   - Footer card showing current user profile, avatar, role badge, and logout button.
2. **[Header.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/components/layout/Header.tsx)**:
   - Responsive top bar with mobile menu toggle.
   - Quick action `+ Report Issue` button.
   - Interactive notification dropdown bell with unread badge and quick links.
   - Profile avatar icon linking to `/profile`.
3. **[AppLayout.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/components/layout/AppLayout.tsx)**:
   - Responsive container combining desktop sidebar, slide-over mobile drawer, header, and main content view.

---

### Phase 8: Complete Implementation of All 15 Pages

#### 1. [LoginPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/LoginPage.tsx) (`/login`)
- Clean SaaS login card with email and password inputs.
- Show/hide password visibility toggle.
- **Fast Demo Switcher**: One-click buttons to sign in instantly as Admin (`Alex Morgan`), Manager (`Sarah Chen`), or Employee (`John Doe`).

#### 2. [DashboardPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/DashboardPage.tsx) (`/`)
- 6 Live KPI Stat Cards: *Total Issues*, *Open Issues*, *In Progress*, *Resolved*, *Critical (Urgent badge)*, and *Overdue (Action Required badge)*.
- 5 Interactive Recharts Visualizations:
  1. **Velocity Area Chart**: Issues Created vs Resolved over the past 14 days.
  2. **Status Donut Chart**: Proportional pipeline distribution.
  3. **Priority Bar Chart**: Severity breakdown.
  4. **Category Progress Bars**: Volume across functional areas.
  5. **Team Workload Bars**: Active vs resolved issues per engineer.
- Recent Issues table with direct click-through to details.

#### 3. [AllIssuesPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/AllIssuesPage.tsx) (`/issues`)
- Full issue tracker table with key, title, category, priority, status, assignee, due date, and actions.
- Real-time search query across issue keys, titles, and descriptions.
- Filters for Status, Priority, Category, and `⚠️ Overdue Only` toggle.
- Sorting by *Newest*, *Oldest*, *Priority*, and *Due Date*.
- Real database pagination with page controls.
- One-click **Export CSV** button downloading filtered results.

#### 4. [MyIssuesPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/MyIssuesPage.tsx) (`/my-issues`)
- Streamlined queue with tabbed views:
  - **Assigned to Me**: Tickets where the current user is assignee.
  - **Reported by Me**: Tickets opened by the current user.
- Status and priority chips, overdue markers, and quick navigation.

#### 5. [ReportIssuePage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/ReportIssuePage.tsx) (`/issues/new`)
- Form validated with React Hook Form + Zod.
- Inputs for Title, Description, Category, Priority, Assignee (optional), Target Due Date, and file attachment dropzone.
- Automatic generation of sequential ticket keys (e.g. `ISS-1009`).
- Dispatches notifications to assigned employees upon creation.

#### 6. [IssueDetailsPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/IssueDetailsPage.tsx) (`/issues/:id`)
- Dedicated ticket workspace with status & priority badges.
- **Workflow Action Bar**: Interactive status buttons (*Open*, *Assigned*, *In Progress*, *On Hold*, *Resolved*, *Closed*).
- **Assignee Selector**: Instant reassignment dropdown for managers/admins.
- **Comments Thread**: Real-time comment submission and deletion with author role badges.
- **Attachment Section**: File uploader (up to 10MB), formatted file sizes, download links, and deletion.
- **Activity Timeline**: Chronological audit trail showing who changed what and when.
- Edit details and Delete actions (with confirmation modal).

#### 7. [EditIssuePage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/EditIssuePage.tsx) (`/issues/:id/edit`)
- Pre-populated form to modify ticket title, description, category, priority, and due date.

#### 8. [UserManagementPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/UserManagementPage.tsx) (`/users` - Admin only)
- User directory with name, email, avatar, role badge, team, assigned ticket count, and join date.
- Search by name/email and filter by role.
- Add User Modal: Create account with name, email, password, role, and team.
- Edit User Modal: Update account details and permissions.
- Delete User with safety check preventing self-deletion.

#### 9. [TeamManagementPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/TeamManagementPage.tsx) (`/teams` - Admin & Manager)
- Grid of team cards showing mission descriptions, appointed managers, member rosters, and active issue counts.
- Create Team & Edit Team modals.
- Delete team confirmation.

#### 10. [CategoriesPrioritiesPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/CategoriesPrioritiesPage.tsx) (`/categories` - Admin only)
- Issue category management with custom hex color tags and active ticket counters.
- Create / Edit / Delete category modals (with deletion guard against categories containing active tickets).
- SLA Reference Guide outlining organizational response hours:
  - Critical: 4 Hours
  - High: 24 Hours
  - Medium: 72 Hours
  - Low: 7 Days

#### 11. [ReportsAnalyticsPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/ReportsAnalyticsPage.tsx) (`/reports`)
- Date range filtering (Presets: *Last 7d*, *Last 30d*, *Last 90d*, or custom start/end dates).
- Live KPI calculations: Total Reported, Issues Resolved, Open Backlog, Overdue Count, and Average Resolution Time (hours).
- Stacked bar chart: Issues resolved vs pending by engineer.
- Category volume chart and priority distribution donut.
- Downloadable CSV report generator.

#### 12. [NotificationsPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/NotificationsPage.tsx) (`/notifications`)
- Full notification feed with All vs Unread filters.
- Mark individual notification as read, mark all read, or clear all.
- Direct navigation links to relevant tickets.

#### 13. [UserProfilePage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/UserProfilePage.tsx) (`/profile`)
- User summary with avatar, role, email, team, and assigned vs reported ticket counts.
- Profile update form (name, avatar image URL).
- Password change form with current password verification and confirmation checks.

#### 14. [SettingsPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/SettingsPage.tsx) (`/settings` - Admin only)
- Application Name, Organization Name, and Ticket Key Prefix (e.g. `ISS`).
- Default due date in days.
- SLA target hours (Critical, High, Medium, Low).
- Persistence directly to the `SystemSetting` database table.

#### 15. [NotFoundPage.tsx](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/frontend/src/pages/NotFoundPage.tsx) (`*`)
- Friendly 404 illustration with a *Return to Dashboard* button.

---

### Phase 9: Testing, Quality Assurance & Build Verification

1. **Frontend Production Build**:
   - Executed `npm run build` (`tsc && vite build`).
   - Transformed **2,795 modules** and generated minified bundles with **0 errors**.
2. **Backend TypeScript Typecheck**:
   - Executed `npx tsc --noEmit`.
   - Verified 100% strict type safety across all controllers, routes, models, and middleware with **0 errors**.
3. **Automated End-to-End API Integration Suite**:
   Executed a live probe testing all core backend operations against the database:
   ```
   ✓ Test 1: Health Check (HTTP 200 - status: ok)
   ✓ Test 2: Admin Login (JWT token acquired for Alex Morgan, Role: ADMIN)
   ✓ Test 3: Dashboard Stats (Computed 8 total issues, 1 overdue)
   ✓ Test 4: List Issues (Successfully retrieved paginated issues)
   ✓ Test 5: Create New Issue (Generated unique key ISS-1009)
   ✓ Test 6: Update Status (Updated ISS-1009 to IN_PROGRESS with activity log)
   ✓ Test 7: Add Comment (Posted comment to ticket ISS-1009)
   ✓ Test 8: Delete Issue (Successfully cleaned up test ticket ISS-1009)
   RESULT: ALL 8/8 INTEGRATION TESTS PASSED CLEANLY!
   ```

---

### Phase 10: Automation Scripts & Operational Setup
1. Created root [package.json](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/package.json) with convenience scripts:
   - `npm run dev:backend`
   - `npm run dev:frontend`
   - `npm run seed`
   - `npm run build`
2. Created [start.bat](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/start.bat) for one-click startup on Windows.
3. Created comprehensive [README.md](file:///c:/Users/raagu/Downloads/gokul%20projects/issue%20management/README.md) containing credentials, API documentation, and architecture diagrams.

---

## 🔒 5. Role-Based Permissions Matrix

| Feature / Action | Admin | Manager | Employee |
| :--- | :---: | :---: | :---: |
| View Dashboard & Summary KPIs | ✅ | ✅ | ✅ |
| View All Issues | ✅ | ✅ | ✅ |
| Filter & Search Issues | ✅ | ✅ | ✅ |
| Report New Issue | ✅ | ✅ | ✅ |
| Edit Any Issue Details | ✅ | ✅ | ⚠️ *(Reported by self only)* |
| Assign / Reassign Issues | ✅ | ✅ | ❌ |
| Update Status to *In Progress* / *Resolved* | ✅ | ✅ | ✅ *(Assigned or reported only)* |
| Close Issues | ✅ | ✅ | ⚠️ *(Reported by self only)* |
| Delete Issues | ✅ | ❌ | ❌ |
| Add Comments & Attachments | ✅ | ✅ | ✅ |
| User Management (`/users`) | ✅ | ❌ | ❌ |
| Team Management (`/teams`) | ✅ | ✅ | ❌ |
| Categories & SLA (`/categories`) | ✅ | ❌ | ❌ |
| Reports & Analytics (`/reports`) | ✅ | ✅ | ✅ |
| Export Issues CSV | ✅ | ✅ | ✅ |
| System Settings (`/settings`) | ✅ | ❌ | ❌ |

---

## 📡 6. Complete API Endpoints Catalog

### Authentication
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `GET /api/auth/me` - Retrieve authenticated user profile with assigned/reported counts.
- `PUT /api/auth/profile` - Update name, avatar, or change password.
- `GET /api/auth/demo-accounts` - Get available demo accounts for fast testing.

### Issues
- `GET /api/issues` - Paginated issue list with multi-criteria filtering and sorting.
- `GET /api/issues/:id` - Fetch issue details by ID or Key (e.g. `ISS-1001`).
- `POST /api/issues` - Create issue, generate unique key, log activity, and notify assignee.
- `PUT /api/issues/:id` - Update title, description, category, priority, or due date.
- `PATCH /api/issues/:id/assign` - Reassign ticket to another user and log activity.
- `PATCH /api/issues/:id/status` - Transition ticket status and log resolution date.
- `DELETE /api/issues/:id` - Permanently remove an issue (Admin only).

### Collaboration & Attachments
- `POST /api/comments/issue/:issueId` - Add threaded comment to an issue.
- `DELETE /api/comments/:id` - Delete comment (Author or Admin).
- `POST /api/attachments/issue/:issueId` - Upload multipart attachment (up to 10MB).
- `DELETE /api/attachments/:id` - Remove attachment and delete file from disk.

### Analytics & Reports
- `GET /api/reports/dashboard` - Retrieve 6 KPIs, time trends, status/priority distributions, and recent issues.
- `GET /api/reports/analytics` - Date-range filtered SLA report, resolution times, and team performance.
- `GET /api/reports/export/csv` - Stream downloadable CSV export.

### Administration
- `GET /api/users` - List users with role/team filters.
- `POST /api/users` - Create user account (Admin only).
- `PUT /api/users/:id` - Update user account (Admin only).
- `DELETE /api/users/:id` - Delete user account (Admin only).
- `GET /api/teams` - List teams with managers and member rosters.
- `POST /api/teams` - Create engineering team (Admin/Manager).
- `PUT /api/teams/:id` - Update team metadata (Admin/Manager).
- `DELETE /api/teams/:id` - Delete team (Admin/Manager).
- `GET /api/categories` - List categories with active issue counts.
- `POST /api/categories` - Create issue category (Admin only).
- `PUT /api/categories/:id` - Update category (Admin only).
- `DELETE /api/categories/:id` - Delete category (Admin only).
- `GET /api/settings` - Retrieve global system settings.
- `PUT /api/settings` - Update system settings & SLA targets (Admin only).
- `GET /api/notifications` - Get user notifications with unread counts.
- `PATCH /api/notifications/:id/read` - Mark single notification as read.
- `PATCH /api/notifications/read-all` - Mark all notifications as read.
- `DELETE /api/notifications/clear` - Delete all user notifications.

---

## 🚀 7. Running the Project

### One-Click Launch (Windows)
Double-click `start.bat` in the root folder. Both the backend API (port 5000) and frontend Vite server (port 5173) will launch automatically.

### Manual Launch
```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.
Use any of the demo accounts or click the **Fast Demo Switcher** buttons on the login page!
