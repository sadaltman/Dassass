# Felicity Event Management System

A full-stack event management platform for college fests built with the MERN stack.

## Live Deployment

- **Frontend**: https://dassasskjkjl.vercel.app
- **Backend**: https://dassass.onrender.com
- **Repository**: https://github.com/sadaltman/Dassass

## Technology Stack & Justifications

### Frontend

| Library | Version | Justification |
|---------|---------|---------------|
| **React 18** | 18.x | Chosen over Angular/Vue for its component-based architecture, large ecosystem, and virtual DOM performance. React's hooks API simplifies state management without needing Redux for our scale. Its unidirectional data flow makes debugging predictable. |
| **React Router DOM** | 6.x | The de-facto routing solution for React SPAs. Provides nested routes, route guards (used for ProtectedRoute/OrganizerRoute/AdminRoute), and programmatic navigation — all needed for our multi-role auth flow. |
| **Axios** | 1.x | Preferred over native `fetch()` because it provides automatic JSON parsing, request/response interceptors, better error handling with HTTP status codes, and simpler syntax for setting auth headers on every request. |
| **Tailwind CSS** | 3.x | Chosen over Bootstrap/Material-UI for utility-first styling that avoids CSS specificity wars and dead CSS. Produces smaller bundle sizes via PurgeCSS. Allows rapid prototyping without leaving JSX files. |
| **Vite** | 5.x | Chosen over Create React App (CRA) because CRA is deprecated and Vite offers near-instant HMR, faster cold starts via native ESM, and smaller production builds. Dev server starts in <1s vs CRA's 10-30s. |
| **jsQR** | 1.x | Lightweight client-side QR decoding library used for the QR Scanner feature. Chosen over heavier alternatives (zxing) because it works purely in-browser via canvas without needing native dependencies. |
| **jwt-decode** | 4.x | Tiny library (< 1KB) to decode JWT tokens client-side for extracting user role/expiry without a server roundtrip. Used in AuthContext to check token validity. |

### Backend

| Library | Version | Justification |
|---------|---------|---------------|
| **Node.js** | 18+ | JavaScript runtime chosen to share language with the frontend (MERN stack requirement). Its event-driven, non-blocking I/O model handles concurrent API requests efficiently. |
| **Express.js** | 5.x | Minimalist, un-opinionated web framework. Chosen over Fastify/Hapi because of massive middleware ecosystem, simpler learning curve, and widespread community support. The middleware pattern fits our auth/role-checking needs cleanly. |
| **MongoDB (Atlas)** | — | NoSQL database chosen because event data is inherently document-shaped (nested custom forms, merchandise variants, reactions arrays). Schema flexibility allows rapid iteration. Atlas provides free-tier cloud hosting with backups. |
| **Mongoose** | 8.x | ODM that provides schema validation, middleware hooks, population (joins), and query building on top of MongoDB. Enforces data consistency (required fields, enums, refs) that raw MongoDB driver lacks. |
| **jsonwebtoken** | 9.x | Industry-standard JWT library for stateless authentication. Tokens encode userId and role, eliminating server-side session storage. Separate tokens per role (participant/organizer/admin) prevent privilege escalation. |
| **bcrypt** | 5.x | Battle-tested password hashing with automatic salting. Uses adaptive cost factor (10 rounds) making brute-force attacks computationally expensive. Chosen over argon2 for simpler native compilation on Render. |
| **qrcode** | 1.x | Generates QR codes as base64 data URLs stored directly in the database. Avoids file system dependencies on serverless/container hosting. Each ticket gets a unique QR encoding its ticketId. |
| **nanoid** | 3.x | Generates URL-safe unique IDs for tickets (e.g., `TKT-V1StGXR8_Z5`). Smaller and faster than UUID v4 while being cryptographically secure. Used with custom alphabet for readable ticket IDs. |
| **nodemailer** | 6.x | Sends ticket confirmation emails with QR code attachments via Gmail SMTP. Chosen for its simplicity and zero-cost (Gmail allows 500 emails/day). Supports HTML templates for professional-looking emails. |

## Features Implemented

### Core Features (Part 1 — 70 Marks)

#### Authentication & Security
- Participant registration with IIIT/non-IIIT distinction
- Organizer login (accounts created by admin with auto-generated email + password)
- Admin login (provisioned via backend script)
- Password hashing with bcrypt
- JWT-based stateless authentication
- Role-based access control with frontend route guards (ProtectedRoute, OrganizerRoute, AdminRoute)

#### User Onboarding & Preferences
- Post-signup onboarding flow: select interests → follow clubs (or skip)
- Preferences stored in database (interests, followedClubs)
- Preferences editable from Profile page
- **Preference-based event ordering**: events matching user interests or followed clubs are ranked higher in the events listing

#### User Data Models
- **Participant**: firstName, lastName, email, password, participantType, contactNumber, collegeName, interests, followedClubs, onboardingComplete
- **Organizer**: name, loginEmail (auto-generated), hashedPassword (auto-generated), category, aboutText, publicContactEmail, phoneNumber, webhookUrl, active, archived
- **Admin**: emailAddress, hashedPassword

#### Event Lifecycle
- Draft → Published → Ongoing → Completed (auto-computed from dates)
- Draft: full editing allowed
- Published: only description, registration deadline, and registration limit editable
- Ongoing/Completed: status transitions only
- Form locking: custom registration form locked after first registration

#### Participant Features
- Dashboard with tabs (Upcoming, Normal, Merchandise, Completed, Cancelled)
- Browse events with search, filters (type, eligibility, followed clubs)
- Trending events (top 5 registrations in 24h)
- Event details with registration
- Profile page (edit info, interests, followed clubs, change password)
- Clubs/Organizers listing and detail pages
- QR ticket generation and email delivery
- Add to calendar (.ics export, Google Calendar, Outlook links)

#### Organizer Features
- Dashboard with aggregate analytics (total events, registrations, revenue, attendance)
- Navbar: Dashboard, Create Event, Ongoing Events, Profile, Logout
- Event creation (draft → publish flow with Discord webhook notification)
- Event management (view registrations, analytics per event)
- Profile page (view auto-generated login email as non-editable, edit other info, Discord webhook)
- Password change removed — must go through admin reset workflow
- QR Scanner for attendance
- Payment approvals for merchandise
- CSV export of registrations
- Custom registration form builder (field types: text, textarea, number, email, dropdown, checkbox, file)

#### Admin Features
- Dashboard to manage organizers
- Create organizer accounts (login email + password both auto-generated, displayed once)
- Delete/toggle/archive organizer accounts
- Navbar: Manage Clubs, Password Resets, Logout
- Password reset request handling (approve/reject with comments)

### Advanced Features (Part 2 — 30 Marks)

#### Tier A: Core Advanced Features [2 selected — 16 Marks]

1. **Merchandise Payment Approval Workflow** [8 Marks]
   - **Why chosen**: Directly exercises the merchandise event type already in our data model. Adds a real-world payment flow (upload proof → pending → approve/reject) that demonstrates state machine logic and role-based actions.
   - Users upload payment proof (image URL/base64) when ordering merchandise
   - Orders enter "Pending Approval" state
   - Organizers can approve/reject payments from a dedicated tab
   - QR ticket generated only on approval; stock decremented atomically
   - Confirmation email sent on approval

2. **QR Scanner & Attendance Tracking** [8 Marks]
   - **Why chosen**: Complements the ticket system already built into registrations. Demonstrates device camera integration, canvas-based image processing (jsQR), and real-time validation logic — all running client-side.
   - Ticket validation via QR code scanning (device camera) or manual ticket ID entry
   - Attendance marking with timestamp
   - Duplicate scan rejection
   - Manual attendance override
   - Attendance stats dashboard (scanned vs not-yet-scanned)

#### Tier B: Real-time & Communication Features [2 selected — 12 Marks]

1. **Real-Time Discussion Forum** [6 Marks]
   - **Why chosen**: Adds collaborative value to event pages without requiring WebSocket infrastructure. Demonstrates threading (parent-child message relationships), emoji reactions with toggle logic, and role-based moderation.
   - Registered participants and organizers can post messages on event pages
   - Organizers can delete and pin messages
   - Message threading with nested replies (parentId-based)
   - Emoji reactions (👍 ❤️ 🎉 😂) with toggle behavior
   - Polling-based updates for near-real-time experience

2. **Organizer Password Reset Workflow** [6 Marks]
   - **Why chosen**: Natural extension of the admin→organizer relationship. Demonstrates a multi-step approval workflow (request → review → approve/reject) with audit trail and auto-generated credentials.
   - Organizers request password reset from admin panel
   - Admin views all requests with club name, date, reason
   - Admin approves (auto-generates new password) or rejects with comments
   - Request status tracking (Pending/Approved/Rejected)

#### Tier C: Integration & Enhancement Features [1 selected — 2 Marks]

1. **Add to Calendar Integration** [2 Marks]
   - **Why chosen**: Low-effort, high-value UX enhancement. Uses standard .ics format and URL schemes — no external API keys required.
   - Downloadable .ics files for registered events
   - Google Calendar direct link integration
   - Outlook Calendar direct link integration

**Bonus**: Fuzzy Search [2 Marks]
   - Character-interleaved regex for typo-tolerant matching on event and organizer names
   - Searches across event name, description, and organizer name

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/felicity
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Create admin account:
```bash
node scripts/createAdmin.js
```

Start server:
```bash
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Auth
- POST /api/auth/register — Participant registration
- POST /api/auth/login — Participant login
- GET /api/auth/profile — Get profile
- PUT /api/auth/profile — Update profile
- PUT /api/auth/change-password — Change password
- POST /api/auth/follow/:organizerId — Follow organizer
- DELETE /api/auth/follow/:organizerId — Unfollow organizer
- POST /api/auth/onboarding — Complete onboarding

### Organizers
- POST /api/organizers/login — Organizer login
- GET /api/organizers — List all organizers
- GET /api/organizers/:id — Get organizer details
- GET /api/organizers/profile — Get own profile
- PUT /api/organizers/profile — Update profile
- POST /api/organizers/request-password-reset — Request password reset
- GET /api/organizers/analytics — Get analytics

### Admin
- POST /api/admin/login — Admin login
- GET /api/admin/organizers — List organizers
- POST /api/admin/organizers — Create organizer
- DELETE /api/admin/organizers/:id — Delete organizer
- PUT /api/admin/organizers/:id/toggle — Toggle status
- PUT /api/admin/organizers/:id/archive — Archive/unarchive organizer
- GET /api/admin/password-resets — Get reset requests
- PUT /api/admin/password-resets/:id/approve — Approve reset
- PUT /api/admin/password-resets/:id/reject — Reject reset

### Events
- POST /api/events — Create event
- GET /api/events — List events (with preference-based ordering)
- GET /api/events/trending — Get trending
- GET /api/events/my-events — Organizer's events
- GET /api/events/:id — Get event
- PUT /api/events/:id — Update event
- DELETE /api/events/:id — Delete event

### Registrations
- POST /api/registrations/events/:eventId — Register
- GET /api/registrations/my-registrations — My registrations
- GET /api/registrations/event/:eventId — Event registrations
- POST /api/registrations/validate-qr — Validate ticket
- POST /api/registrations/:id/attendance — Mark attendance
- GET /api/registrations/pending-payments — Pending payments
- PUT /api/registrations/:id/approve-payment — Approve
- PUT /api/registrations/:id/reject-payment — Reject
- GET /api/registrations/:id/calendar — Export .ics

### Messages
- POST /api/events/:eventId/messages — Post message
- GET /api/events/:eventId/messages — Get messages
- DELETE /api/messages/:id — Delete message
- PUT /api/messages/:id/pin — Pin message
- POST /api/messages/:id/react — React to message

## Project Structure
```
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers (business logic)
│   ├── middleware/      # Auth middleware (JWT verification, role checks)
│   ├── models/         # Mongoose schemas (User, Event, Registration, etc.)
│   ├── routes/         # Express route definitions
│   ├── scripts/        # Admin/organizer creation scripts
│   ├── utils/          # Email utility (nodemailer)
│   └── server.js       # Entry point, CORS, middleware setup
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components (Navbar)
│   │   ├── context/    # AuthContext (token management)
│   │   ├── pages/      # Page components (22 pages)
│   │   ├── utils/      # API base URL config
│   │   └── App.jsx     # Router setup, route guards
│   └── index.html
├── deployment.txt      # Production URLs
└── README.md
```

## Design Decisions

1. **Separate tokens per role**: `token` (participant), `organizerToken`, `adminToken` stored in localStorage. Prevents role confusion and allows independent session management.

2. **Auto-generated organizer credentials**: Admin provides only the club name and category. The system generates a slug-based login email (`clubname@felicity.club`) and a random password. This prevents typos and enforces consistent formatting.

3. **Preference-based event ordering**: Events are sorted by a relevance score computed from the user's interests (matched against event tags/name) and followed clubs (matched against organizerId). Higher relevance events appear first, with `createdAt` as tiebreaker.

4. **Event status auto-computation**: Instead of requiring manual status transitions, event status is auto-computed from `startDate`/`endDate` on every read. This prevents stale statuses and reduces organizer burden.

5. **Form locking after first registration**: Custom registration form fields are frozen once the first participant registers. This maintains data consistency — late registrants see the same fields as early ones.

6. **Payment proof as URL/base64**: Payment proofs are stored as data URLs in MongoDB. Avoids needing a separate file storage service (S3) for this assignment scope.

7. **Discussion forum with polling**: Chose polling over WebSockets for simplicity and Render compatibility. Threading uses `parentId` references. Reactions are stored as subdocuments with userId for toggle behavior.

8. **Organizer password reset via admin**: Organizers cannot change their own passwords. All resets go through admin approval — matching spec Section 4.1.2 and adding accountability.

## Default Credentials

### Admin
- Email: admin@felicity.com
- Password: admin123 (or as set in createAdmin.js)
