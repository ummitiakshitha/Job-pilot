# JobPilot — 3D-Enhanced Job Application Tracker

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node-v20.x-green.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-brightgreen.svg)
![Three.js](https://img.shields.io/badge/Three.js-R3F-purple.svg)

**JobPilot** is a production-grade Full-Stack MERN (MongoDB, Express, React, Node.js) web application engineered for college mini-project evaluation and modern career tracking. It equips job seekers and university students with a centralized, data-driven dashboard to record job applications, advance recruitment pipelines across visual Kanban boards and interactive data tables, schedule interview rounds, and monitor career metrics via real-time MongoDB aggregation pipelines.

---

## 1. Project Overview & Problem Statement

### The Problem
During internship and full-time hiring cycles, candidates typically apply to dozens—often hundreds—of companies simultaneously across diverse job boards, LinkedIn, and referral links. Managing status changes, scheduled technical interview rounds, salary expectations, and referral notes using scattered spreadsheets or manual notes leads to missed deadlines, poor preparation, and zero analytical visibility into what stages of the recruitment funnel require improvement.

### The JobPilot Solution
JobPilot eliminates tracking chaos through:
- **Centralized Application Lifecycle**: Distinct status tracking across `Applied`, `Interview`, `Offer`, and `Rejected`.
- **Dual Visual Workflows**: Seamless toggle between detailed tabular data grids and intuitive Kanban drag-and-click column pipelines.
- **Strict Data Isolation**: Multi-tenant database design where authenticated users only access their personal records.
- **Native MongoDB Aggregations**: Server-side aggregation pipelines computing real conversion rates, status distributions, and monthly velocity charts.
- **3D Interactive Hero Experience**: Integrated React Three Fiber (R3F) floating crystal engine with automatic WebGL detection and graceful 2D vector fallbacks.

---

## 2. Technology Stack

| Layer | Technologies Used | Rationale |
|---|---|---|
| **Frontend Framework** | **React 18** with **Vite 5** | High-performance bundling, rapid HMR, component modularity |
| **Styling & Design System** | **Tailwind CSS** (v3.4) | Curated deep navy palette (`#060913`, `#0B0F1E`), electric violet/indigo accents, glassmorphic blur filters |
| **3D & Visual Motion** | **Three.js**, **@react-three/fiber**, **@react-three/drei**, **Framer Motion** | Lightweight interactive 3D crystal core, micro-animations, slide-over modals, WebGL fallback detection |
| **Data Visualization** | **Recharts** | Interactive SVG status donut charts, monthly activity bar charts, custom dark tooltips |
| **Icons & UI Feedback** | **Lucide React** | Clean, accessible iconography |
| **Routing & Client State** | **React Router DOM v6**, React Context API | Declarative protected/public routing guards, global auth state |
| **HTTP Client** | **Axios** | Configured base URL, automatic JWT Bearer injection interceptors, uniform error normalization |
| **Backend Runtime** | **Node.js** (v20.x), **Express.js** (v4.19) | Scalable asynchronous event-driven REST API server |
| **Database & ODM** | **MongoDB Atlas** / **MongoDB Local** + **Mongoose** (v8.3) | Schema validation, compound indexing, aggregation framework |
| **Dev / Grading Fallback** | **MongoMemoryServer** | Zero-friction local evaluation fallback if a local mongod service is not running |
| **Authentication & Security** | **JSON Web Tokens (JWT)**, **bcryptjs**, **CORS**, **dotenv** | Cryptographic password hashing (salt rounds: 10), Bearer token validation middleware |
| **Testing** | Node.js Test Suite (`tests/api.test.js`) | Automated end-to-end REST API verification |

---

## 3. System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client Browser                            │
│  React 18 + Vite + Tailwind CSS + Framer Motion + R3F Canvas    │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON (Axios Client)
                                 │ Bearer <JWT_TOKEN>
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express REST API Server                    │
│                        (Port 5000)                              │
│  ├─ Middleware: CORS, express.json(20kb), Error Handlers        │
│  ├─ Auth Guard: verifyToken & req.user Hydration                │
│  ├─ /api/auth: register, login, me, profile                     │
│  └─ /api/applications: CRUD, /status PATCH, /stats Aggregations │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Mongoose ODM
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB Database                          │
│  ├─ Users Collection: { name, email (unique), passwordHash }   │
│  └─ JobApplications: { userId, company, role, status, ... }     │
│     * Compound Indexes: { userId: 1, status: 1 }                │
│                         { userId: 1, applicationDate: -1 }      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. MongoDB Data Schemas

### 1. User Schema (`server/src/models/User.js`)
```javascript
{
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```
*Notes: `toJSON` transform automatically strips `passwordHash` and `__v` from all JSON responses.*

### 2. JobApplication Schema (`server/src/models/JobApplication.js`)
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  role: { type: String, required: true, trim: true, maxlength: 120 },
  jobLink: { type: String, trim: true, default: '' },
  salaryExpectation: { type: Number, min: 0, default: null },
  applicationDate: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    enum: ['Applied', 'Interview', 'Offer', 'Rejected'], 
    default: 'Applied', 
    required: true, 
    index: true 
  },
  interviewDate: { type: Date, default: null },
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```
*Compound indexes ensure optimal query performance for user-specific search, filtering, and sorting.*

---

## 5. REST API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT Bearer token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update name or change password |

### Job Application Endpoints (`/api/applications`)
*(All require `Authorization: Bearer <token>` header)*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/applications` | Private | List applications with `search`, `status`, `sortBy`, `order`, `page`, `limit` |
| `POST` | `/api/applications` | Private | Create new job application |
| `GET` | `/api/applications/stats` | Private | Compute MongoDB aggregated metrics & status distributions |
| `GET` | `/api/applications/:id` | Private | Fetch details of a single application |
| `PUT` | `/api/applications/:id` | Private | Update complete application document |
| `PATCH`| `/api/applications/:id/status` | Private | Update only the application status |
| `DELETE`| `/api/applications/:id` | Private | Delete application permanently |

### Standard JSON Response Formats

#### Success (200 / 201)
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "_id": "670c5e31fa02c019d08e82a1",
    "userId": "670c5e29fa02c019d08e829d",
    "company": "Stripe",
    "role": "Senior Full Stack Engineer",
    "status": "Interview",
    "salaryExpectation": 160000,
    "applicationDate": "2026-10-13T00:00:00.000Z",
    "interviewDate": "2026-10-17T00:00:00.000Z",
    "notes": "Passed screen; technical round scheduled.",
    "createdAt": "2026-10-13T18:00:00.000Z",
    "updatedAt": "2026-10-13T18:00:00.000Z"
  }
}
```

#### Error (400 / 401 / 404 / 409)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "company": "Company name is required",
    "status": "Status must be one of: Applied, Interview, Offer, Rejected"
  }
}
```

---

## 6. Five-Day Implementation Plan & Evidence Mapping

| Phase | Planned Deliverables | Actual Implementation & File Evidence | Status |
|---|---|---|---|
| **Day 1: Requirements & Schema** | Feature list, Mongoose schemas, REST contract, project architecture | `server/src/models/User.js`, `server/src/models/JobApplication.js`, contract definitions | **Complete** |
| **Day 2: Backend Development** | Express server, database connection with fallback, JWT auth, CRUD controllers, error middleware | `server/src/server.js`, `server/src/app.js`, `server/src/config/db.js`, `server/src/controllers/*`, `server/src/middleware/*` | **Complete** |
| **Day 3: Frontend Foundation** | React 18, Vite, Tailwind CSS dark theme tokens, Axios client, React Router, Layout, Navigation, Auth pages | `client/src/App.jsx`, `client/src/index.css`, `client/src/api/*`, `client/src/context/AuthContext.jsx`, `client/src/pages/LoginPage.jsx`, `client/src/pages/RegisterPage.jsx` | **Complete** |
| **Day 4: Core Features & Integration**| Dashboard metrics, Recharts charts, Table view, Kanban board, Add/Edit modal, Status PATCH updates, 3D Hero canvas | `client/src/pages/DashboardPage.jsx`, `client/src/pages/ApplicationsPage.jsx`, `client/src/components/applications/*`, `client/src/components/3d/Hero3DCanvas.jsx` | **Complete** |
| **Day 5: Verification & Delivery** | 18 Automated REST API test cases, user isolation testing, demo seed script, complete documentation | `server/tests/api.test.js`, `server/src/utils/seed.js`, `README.md` | **Complete** |

---

## 7. Installation & Execution Guide

### Prerequisites
- **Node.js** v18.x or v20.x
- **npm** v9.x or v10.x
- *(Optional)* Local MongoDB or MongoDB Atlas URI (An embedded MongoMemoryServer automatically boots if no external DB is supplied, allowing instant grading evaluation!)

### Step 1: Clone or Navigate to Project
```bash
cd d:\fullstackmini
```

### Step 2: Configure Environment Variables
Copy the provided `.env.example` files:

**Backend (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jobpilot
JWT_SECRET=jobpilot_super_secret_jwt_key_2026_academic_demo
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Frontend (`client/.env`):**
```env
VITE_API_BASE_URL=/api
```

### Step 3: Start the Backend Server
```bash
cd server
npm install
npm start
```
*Server starts at `http://localhost:5000`.*

### Step 4: Start the Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
*Vite dev server opens at `http://localhost:5173`.*

### Step 5: (Optional) Run Automated REST API Tests
```bash
cd server
npm test
```

---

## 8. Test Execution Results

All 18 automated integration test cases executed and passed with 0 errors:

```text
--- 🧪 STARTING JOBPILOT BACKEND REST API TEST SUITE ---
[Database] Successfully connected to In-Memory MongoDB at: mongodb://127.0.0.1:23233/
[Database] Ready for evaluation, demo, and real CRUD operations!
Test server running on http://127.0.0.1:49670
  ✅ PASS: GET /api/health returns 200 OK
  ✅ PASS: GET /api/applications rejects unauthenticated request (401)
  ✅ PASS: POST /api/auth/register creates user and returns token (201)
  ✅ PASS: POST /api/auth/register prevents duplicate email (409)
  ✅ PASS: POST /api/auth/login succeeds with valid credentials (200)
  ✅ PASS: POST /api/auth/login fails with invalid credentials (401)
  ✅ PASS: GET /api/auth/me retrieves current user profile (200)
  ✅ PASS: POST /api/applications creates application in MongoDB (201)
  ✅ PASS: POST /api/applications rejects missing required fields (400)
  ✅ PASS: GET /api/applications lists authenticated user applications (200)
  ✅ PASS: GET /api/applications?search=Stripe filters correctly (200)
  ✅ PASS: PATCH /api/applications/:id/status changes status to Interview (200)
  ✅ PASS: PUT /api/applications/:id updates application details (200)
  ✅ PASS: GET /api/applications/stats computes aggregation metrics (200)
  ✅ PASS: User 2 cannot access User 1 application (404/Isolated)
  ✅ PASS: User 2 cannot delete User 1 application (404/Isolated)
  ✅ PASS: DELETE /api/applications/:id removes document for owner (200)
  ✅ PASS: Subsequent GET for deleted application returns 404

================ TEST SUMMARY ================
Total Passed: 18
Total Failed: 0
==============================================
```

---

## 9. Faculty Demonstration Script (Step-by-Step)

Follow this sequence for a seamless 5-minute academic presentation:

1. **Introduction & Landing Page (`http://localhost:5173`)**:
   - Showcase the JobPilot design identity (deep navy background `#060913`, electric violet accents, glassmorphic cards).
   - Point out the 3D interactive crystal hero (React Three Fiber) with automatic fallback and reduced-motion compatibility.
   - Explain the core problem: job search chaos and lack of recruitment analytics.

2. **Authentication Flow (`/login` & `/register`)**:
   - Demonstrate client-side validation (empty email, short password, mismatched passwords).
   - Use the **1-Click Faculty Demo Login** button or register a new user (`alex.pilot@jobpilot.io` / `Password123`).
   - Highlight that passwords are encrypted using `bcryptjs` (salt rounds: 10) and session is protected via JWT.

3. **Live Dashboard Overview (`/dashboard`)**:
   - Point out the 4 summary cards: **Total Applications**, **Interviews**, **Offers**, and **Rejections**.
   - Explain how all counts and the Recharts donut/bar chart are computed via native MongoDB aggregation queries rather than mocked values.

4. **Add Application & Database Persistence**:
   - Click **"+ Track Application"**.
   - Submit: Company: `Stripe`, Role: `Senior Full Stack Engineer`, Status: `Interview`, Salary: `$160,000`, Job URL: `https://stripe.com/jobs`.
   - Show how the modal validates required fields and immediately refreshes the application list and summary counts.

5. **Dual Views: Table & Kanban Pipeline (`/applications`)**:
   - **Table View**: Inspect company, role, salary, date applied, and scheduled interview date.
   - **Search & Filter**: Search "Stripe" or filter by status `Interview`.
   - **Kanban Board**: Switch to Kanban view. Advance Stripe from `Interview` to `Offer`. Confirm the `PATCH /api/applications/:id/status` request succeeds and persists to the database.

6. **Details & Deletion**:
   - Click the **View (Eye)** icon to open the full slide-over details modal showing created timestamps, notes, and direct job link.
   - Click **Delete (Trash)** to test the confirmation modal and verify the record is removed from MongoDB.

7. **Multi-User Data Isolation**:
   - Log out and log into a second account. Demonstrate that User 2 cannot see, edit, or delete any records belonging to User 1 (enforced on both client UI and server backend authorization).

---

## 10. Quality & Academic Rubric Alignment

| Rubric Criteria | Implementation Evidence | Verification Status |
|---|---|---|
| **MongoDB Schema & Validation** | `server/src/models/User.js`, `server/src/models/JobApplication.js` | Verified (enums, required, non-negative min, compound indexes) |
| **Express Server & REST APIs** | `server/src/app.js`, `server/src/server.js`, `server/src/routes/*` | Verified (HTTP 200, 201, 400, 401, 404, 409) |
| **Authentication & Authorization** | `server/src/middleware/authMiddleware.js`, `server/src/controllers/authController.js` | Verified (bcryptjs hash, JWT Bearer tokens, protected routes) |
| **Data Isolation** | All queries filter `{ userId: req.user._id }` | Verified (Test Case #15: 404 cross-user access rejection) |
| **Frontend UI/UX & React State** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React | Verified (responsive sidebar, navbar, modals, cards) |
| **Data Visualizations & 3D** | Recharts (donut & monthly bar charts), React Three Fiber crystal | Verified (fallback graphic for non-WebGL environments) |
| **CRUD & Kanban Pipeline** | Full Table & Kanban board, status PATCH endpoint | Verified (persisted status transitions) |
| **Testing & Documentation** | 18 automated integration tests, README | Verified (all tests pass, complete run guide) |

---

## 11. Known Limitations & Future Enhancements

- **Email Verification & Password Reset**: Currently, email uniqueness is verified via database indexes. In production, an SMTP integration (e.g., SendGrid/Nodemailer) could add token-based email activation.
- **Resume File Upload**: Future iterations could integrate AWS S3 or Cloudinary to attach PDF resumes and customized cover letters to each job application document.
- **Browser Push Notifications**: Scheduled interview reminders can be delivered directly to mobile or desktop browsers via Web Push API.

---

## 12. License
This project is licensed under the MIT License — open for academic evaluation, learning, and extension.
