# Felicity Event Management System

A full-stack MERN event management platform built for college festivals. This platform supports participant registration, organizer event management, merchandise sales, and event-level collaboration.

## Setup and Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Gmail Account (for ticket emails via Nodemailer)

### Running the Project Locally
The project is divided into two parts: `frontend` and `backend`. You will need to run them simultaneously in two separate terminals.

1. **Clone the repository and install dependencies:**
   ```bash
   # Terminal 1 (Backend)
   cd backend
   npm install

   # Terminal 2 (Frontend)
   cd frontend
   npm install
   ```

2. **Environment Variables:**
   - Create a `.env` file in the `backend` folder with the following:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/felicity
     JWT_SECRET=your_jwt_secret_here
     GMAIL_USER=your_email@gmail.com
     GMAIL_APP_PASSWORD=your_app_password
     ```
   - For `GMAIL_APP_PASSWORD`, enable 2FA on your Google account and generate an App Password under Security > App Passwords.

3. **Create the admin account:**
   ```bash
   node scripts/createAdmin.js
   ```

4. **Start the development servers:**
   ```bash
   # Terminal 1 (Backend)
   node server.js

   # Terminal 2 (Frontend)
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` and the backend on port 5000.

---

## Deployment

- **Frontend:** Deployed on **Vercel** (https://dassasskjkjl.vercel.app).
    *Justification*: Vercel provides zero-configuration deployment for Vite/React applications with automatic HTTPS, global CDN, and continuous deployment from the GitHub main branch.
- **Backend:** Deployed on **Render** (https://dassass.onrender.com).
    *Justification*: Render offers a straightforward PaaS for Node.js backends with automated builds from GitHub, easy environment variable injection, and free-tier hosting suitable for assignment scale.
- **Database:** Hosted on **MongoDB Atlas**, connected via backend environment variables.
    *Justification*: Atlas is the officially managed DBaaS for MongoDB, providing automatic backups and high availability without local infrastructure setup.

---

## Technical Stack & Libraries Used

### Frontend
- **React (`react`, `react-dom`)**: Used for building a component-based, interactive UI with hooks-based state management. Chosen over Angular/Vue for its large ecosystem and simpler learning curve.
- **React Router (`react-router-dom`)**: Used for client-side SPA routing. Provides route guards (`ProtectedRoute`, `OrganizerRoute`, `AdminRoute`) and programmatic navigation for our multi-role authentication flow.
- **Vite (`vite`)**: Chosen as the build tool over Create-React-App for its significantly faster Hot Module Replacement and sub-second cold starts via native ESM.
- **Axios (`axios`)**: Used for all HTTP requests. Preferred over native `fetch()` for cleaner auth header management, automatic JSON parsing, and better error handling with HTTP status codes.
- **Tailwind CSS (`tailwindcss`)**: Used for utility-first styling directly in JSX files. Produces smaller bundles via PurgeCSS compared to Bootstrap or Material-UI. Chosen for rapid prototyping without writing separate CSS files.
- **jsQR (`jsqr`)**: Lightweight client-side QR code decoding library used for the QR Scanner feature. Decodes QR data from canvas frames captured from the device camera, without needing native dependencies.
- **jwt-decode (`jwt-decode`)**: Tiny library (<1KB) used in AuthContext to decode JWT tokens client-side for extracting user role and checking token expiry without a server roundtrip.

### Backend
- **Express.js (`express`)**: Minimalist Node.js web framework chosen for its middleware pattern which cleanly supports our `authenticateUser` → `requireRole` → handler pipeline for role-based access control.
- **Mongoose & MongoDB (`mongoose`, `mongodb`)**: Used as the ODM/Database. Event data is inherently document-shaped — nested custom forms, merchandise variants as arrays, message reactions as subdocuments — making NoSQL a better fit than relational databases. Mongoose provides schema validation, required field enforcement, and population (joins).
- **JSON Web Tokens (`jsonwebtoken`)**: Used for stateless authentication. Tokens encode `userId` and `userType`, eliminating server-side session storage. Separate tokens are issued per role (participant/organizer/admin) to prevent privilege escalation.
- **Bcrypt (`bcrypt`)**: Used for one-way password hashing with automatic salting (10 rounds). Chosen over argon2 for simpler native compilation on Render's build environment.
- **Nodemailer (`nodemailer`)**: Used for sending ticket confirmation emails with inline QR code images via Gmail SMTP. Zero-cost solution (Gmail allows 500 emails/day) without needing third-party email API keys.
- **QR Code (`qrcode`)**: Generates QR codes as Base64 data URLs representing unique ticket IDs. Stored directly in MongoDB, avoiding the need for a separate file storage service like S3.
- **Nanoid (`nanoid`)**: Generates URL-safe, cryptographically secure unique IDs for tickets (e.g., `TKT-V1StGXR8_Z5`). Smaller and faster than UUID v4 with custom alphabet support for readable ticket IDs.
- **Axios (`axios`)**: Used on the backend for sending Discord webhook notifications when events are published.

---

## Advanced Features Implemented

### Tier A Features

**1. Merchandise Payment Approval Workflow**
- **Justification**: Merchandise has limited physical stock. Unrestricted registration would immediately deplete stock without verified payment. Organizers need to verify payment before reserving an item.
- **Design Choices & Implementation**: Participants register by uploading a payment proof screenshot (file upload converts to base64, or they can paste a URL). The registration is created in a `pending` state with no ticket generated and no stock deducted. Organizers review all pending orders from a dedicated Payment Approvals page with the proof image, participant details, and approve/reject buttons.
- **Technical Decisions**: Stock decrement logic is separated from the registration controller and placed entirely in the `approvePayment` controller. Stock is only decremented atomically upon organizer approval, preventing race conditions. QR ticket generation and confirmation email dispatch also happen exclusively on approval. This same approval pipeline handles paid normal events (`regFee > 0`) as well, creating one unified payment queue for organizers.

**2. QR Scanner & Attendance Tracking**
- **Justification**: Manually validating tickets by searching IDs is slow and error-prone. A QR-based system provides instantaneous validity checks and updates attendance records simultaneously.
- **Design Choices & Implementation**: The `qrcode` backend library encodes the Ticket ID into a QR image which is emailed to participants upon approval. The frontend `QRScanner.jsx` uses `jsQR` to capture QR data from the device camera via canvas frames and POSTs the decoded ticket ID to the `validateQR` backend route. Manual ticket ID entry and file upload scanning are available as fallbacks.
- **Technical Decisions**: The validation route strictly enforces single-use attendance — duplicate scans are rejected with a clear error message. Attendance is marked with an `attendedAt` timestamp and a `manualOverride` flag for audit purposes. Attendance stats (scanned vs not-yet-scanned) are served via a separate analytics endpoint.

### Tier B Features

**1. Real-Time Discussion Forum**
- **Justification**: Participants need a way to ask event-specific questions directly to organizers without writing formal emails. A per-event forum centralizes communication.
- **Design Choices & Implementation**: Registered participants and the event organizer can post messages on event detail pages. Messages support threading via a `parentId` field — replies are stored as separate documents referencing their parent and rendered as nested elements. Emoji reactions (👍 ❤️ 🎉 😂) are stored as subdocuments with `userId` for toggle behavior (click to react, click again to remove). Organizers can delete any message and pin important announcements. Organizer messages display a role badge.
- **Technical Decisions**: Implemented using polling (5-second interval) instead of WebSockets. This was chosen for simplicity and because Render's free tier does not reliably support persistent WebSocket connections. The Notification API fires browser notifications for organizer messages containing `@everyone` to alert participants of announcements.

**2. Organizer Password Reset Workflow**
- **Justification**: Since organizer accounts are centrally managed by the admin, organizers should not be able to change their own passwords unilaterally. A supervised reset workflow maintains administrative control and adds accountability.
- **Design Choices & Implementation**: Organizers submit a password reset request with a reason from their profile page. The admin dashboard displays all pending requests with the organizer's club name, submission date, reason, and current status. Admin can approve (the system auto-generates a new random password, hashes it with bcrypt, and displays the plaintext to the admin once) or reject with a comment.
- **Technical Decisions**: The `PasswordResetRequest` model stores `organizerId`, `reason`, `status` (pending/approved/rejected), and `adminComment` as an audit trail. Status transitions are enforced — only pending requests can be approved or rejected. Request history is preserved for transparency.

### Tier C Features

**1. Add to Calendar Integration (.ics, Google, Outlook)**
- **Justification**: Improves event attendance by letting users sync event dates to their personal calendars directly from their dashboard.
- **Design Choices & Implementation**:
  - **.ics Download**: The backend `exportToCalendar` endpoint formats the event's start time, end time, title, description, and venue into standard iCalendar format and returns it as a downloadable `.ics` blob.
  - **Google & Outlook Calendar**: The frontend constructs deep-link URLs dynamically using `toISOString()` date formatting and `URLSearchParams` for one-click browser-based calendar integration without needing external API keys.

---

## Design Decisions

- **Separate tokens per role**: We store `token` (participant), `organizerToken`, and `adminToken` independently in localStorage. This prevents role confusion and allows independent session management — logging out as a participant doesn't affect an active organizer session.
- **Auto-generated organizer credentials**: When the admin creates an organizer, the system generates a slug-based login email (`coding.club@felicity.club`) and a random password. This prevents typos and enforces consistent credential formatting.
- **Preference-based event ordering**: The Browse Events listing sorts events by a relevance score. The score is computed by matching the user's interests against event tags/name and checking if the event's organizer is in the user's followed clubs list. Higher relevance events appear first, with `createdAt` as tiebreaker.
- **Event status auto-computation**: Instead of requiring manual status transitions, event status is auto-computed from `startDate`/`endDate` on every API read (`published` → `ongoing` → `completed`). This prevents stale statuses and reduces organizer burden.
- **Form locking after first registration**: Custom registration form fields are frozen after the first participant registers. This maintains data consistency — all registrants fill out the same version of the form.
- **Payment proof as base64**: Payment screenshots are stored as data URLs directly in MongoDB instead of using a separate file storage service. This avoids S3/Cloudinary dependencies and works well at assignment scale.
- **Discussion forum polling vs WebSockets**: We chose 5-second polling over WebSockets for simplicity and Render free-tier compatibility. Threading uses `parentId` references, and reactions are stored as subdocuments with `userId` for accurate toggle behavior.

---

### Default Admin Credentials
- Email: `admin@felicity.com`
- Password: `admin123`
