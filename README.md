# EduCRM - Mini CRM Platform for Educational Institutes

EduCRM is a modern, production-grade Mini CRM designed specifically for educational institutes, counselor advisors, and sales development representatives. The application provides dynamic lead pipelines, stage management, chronological follow-up timelines, Google Sheets integration simulation, and rich analytics.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router + Turbopack)
- **Styling**: Tailwind CSS v4 (CSS-first variables & custom themes)
- **State Management**: Zustand
- **API Client**: Axios (configured with automated JWT authorization interceptors)
- **Charts & Vis**: Recharts
- **Icons**: Lucide React

### Backend
- **Server Framework**: Node.js + Express (ESM modular structure)
- **ORM**: Prisma 7
- **Database**: PostgreSQL (Neon Cloud Serverless)
- **Driver Adapter**: `@prisma/adapter-pg` (implements Prisma 7's decoupled database driver structure)
- **Security**: JWT & bcryptjs password hashing
- **Mock Seed Generator**: `@faker-js/faker`

---

## 🌟 Key Features

1. **Role-Based Workspaces (RBAC)**:
   - **ADMIN**: Accesses system analytics, registers counselors, assigns student leads to advisors, and manages the entire leads catalog.
   - **COUNSELOR**: Restricted to viewing and updating leads assigned specifically to them, recording follow-up comments, scheduling next-contact alerts, and viewing personal conversion metrics.
   - **Auth Protection**: Centralized routing middleware checks tokens on the client-side, while JWT verify middleware checks headers on the backend.

2. **SaaS KPI Dashboard**:
   - Dynamic counter metrics for **Total Leads**, **New Queries**, **Pending Follow-ups**, **Converted Enrolments**, and **Hot Leads** (overdue/high-priority cases).
   - Recharts visualization: Course distribution Pie Chart and 30-day Lead Creation Trend Line Chart.
   - Live sidebar notifications listing upcoming or overdue student call-backs.
   - Counselor success rates comparison bar charts (Admin view).

3. **Leads Management Pipeline**:
   - Advanced datagrid featuring server-side pagination, keyword search, column sorting, and multi-parameter filters (by stage, course, priority, and counselor).
   - Dynamic priority escalation: Leads are automatically prioritized as **High** if an active lead crosses 3+ days without follow-up, or if a scheduled follow-up is overdue.

4. **Chronological follow-up timeline**:
   - Right-aligned interactive slide-drawer showing student profile details.
   - Dropdown switches to assign counselors (Admin only) or update stages.
   - Log-comments form to quickly record call details and schedule next-contact dates.
   - Dotted vertical timeline listing past call activity.

5. **Google Sheets Sync Simulation**:
   - Sync trigger button in the Navbar.
   - Simulates pulling data from Google Sheets by generating 10 new student queries, appending them into PostgreSQL, popping up success toasts, and automatically updating UI views.

---

## ⚙️ Local Setup Guide

### Prerequisites
- Node.js (v18+)
- NPM or Yarn

### 1. Database Setup
The system is configured to connect to a Neon PostgreSQL database. 
Create a `.env` file inside the `backend` folder and add your connection string (a pre-configured cloud database URL is provided for convenience):
```env
DATABASE_URL="postgresql://neondb_owner:npg_RXBAz9iP6Zac@ep-lucky-brook-ao7okye6-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 2. Backend Initialization
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Push database schema to PostgreSQL:
   ```bash
   npx prisma db push
   ```
4. Seed the database with 1 admin, 5 counselors, and 1,000 leads:
   ```bash
   node src/seed/seed.js
   ```
5. Launch the backend server:
   ```bash
   npm run dev
   ```
   The backend server will run on **`http://localhost:5001`**.

### 3. Frontend Initialization
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
   Open your browser to **`http://localhost:3000`** to access the CRM portal.

---

## 🔑 Demo Seed Accounts

Quick-fill buttons are provided on the login page, but you can log in manually using:

| Role | Email Credentials | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@crm.com` | `password123` |
| **Counselor** | `counselor@crm.com` | `password123` |

---

## 📡 API Reference Map

### Authentication
- `POST /api/auth/login` - Authenticate credentials and generate JWT cookie/body.
- `POST /api/auth/logout` - Clear JWT authentication token.
- `GET /api/auth/me` - Retrieve current active profile details.

### Leads
- `GET /api/leads` - List leads (paginated, sorted, filtered, searched).
- `GET /api/leads/:id` - Fetch single lead profile and activity history.
- `POST /api/leads` - Create new student lead.
- `PUT /api/leads/:id` - Update stage, details, or counselor.
- `DELETE /api/leads/:id` - Delete lead (Admin only).

### Follow-Ups
- `POST /api/followups` - Log callback comments, set status, schedule next-contact.
- `PUT /api/followups/:id` - Mark planned callback completed.

### Users (Admin Only)
- `GET /api/users` - List all counselors and their lead load counts.
- `POST /api/users` - Create new counselor credentials.

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Fetch KPI cards data, charts datasets, and reminders.

### Import Simulation
- `POST /api/import/leads` - Mock Google Sheet sync workflow.
