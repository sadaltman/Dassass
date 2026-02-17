# Felicity Event Management System

A full-stack event management platform for college fests built with the MERN stack.

## Technology Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for REST APIs
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** - Password hashing
- **qrcode** - QR code generation for tickets
- **nanoid** - Unique ID generation for tickets
- **nodemailer** - Email sending for tickets

## Features Implemented

### Core Features (Part 1)

#### Authentication & Security
- Participant registration with IIIT email validation
- Organizer login (accounts created by admin)
- Admin login (provisioned via backend script)
- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control

#### User Data Models
- Participant: firstName, lastName, email, password, participantType, contactNumber, collegeName, interests, followedClubs
- Organizer: name, loginEmail, hashedPassword, category, aboutText, publicContactEmail, phoneNumber, webhookUrl
- Admin: emailAddress, hashedPassword

#### Event Types
- Normal events (individual registration)
- Merchandise events (with variants, stock tracking, payment approval)

#### Participant Features
- Dashboard with tabs (Upcoming, Normal, Merchandise, Completed, Cancelled)
- Browse events with search, filters (type, eligibility, followed clubs)
- Trending events (top 5 in 24h)
- Event details with registration
- Profile page (edit info, interests, followed clubs, change password)
- Clubs/Organizers listing and detail pages
- QR ticket generation and email delivery
- Add to calendar (.ics export)

#### Organizer Features
- Dashboard with event carousel
- Event creation (draft → publish flow)
- Event management (view registrations, analytics)
- Profile page (edit info, Discord webhook)
- QR Scanner for attendance
- Payment approvals for merchandise
- CSV export of registrations

#### Admin Features
- Dashboard to manage organizers
- Create/delete/toggle organizer accounts
- Password reset request handling

### Advanced Features (Part 2)

#### Tier A (Implemented: 2)
1. **Merchandise Payment Approval Workflow** [8 Marks]
   - Users upload payment proof when ordering merchandise
   - Orders enter "Pending Approval" state
   - Organizers can approve/reject payments
   - QR ticket generated only on approval
   - Stock decremented on approval

2. **QR Scanner & Attendance Tracking** [8 Marks]
   - Ticket validation via QR/ticket ID
   - Attendance marking with timestamp
   - Duplicate scan rejection
   - Manual attendance override
   - Attendance stats dashboard

#### Tier B (Implemented: 2)
1. **Real-Time Discussion Forum** [6 Marks]
   - Registered participants can post messages
   - Organizers can delete/pin messages
   - Message threading (basic)

2. **Organizer Password Reset Workflow** [6 Marks]
   - Organizers request password reset
   - Admin approves/rejects with comments
   - Auto-generates new password on approval

#### Tier C (Implemented: 1)
1. **Add to Calendar Integration** [2 Marks]
   - Downloadable .ics files for registered events
   - Works with Google Calendar, Outlook, etc.

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

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
- POST /api/auth/register - Participant registration
- POST /api/auth/login - Participant login
- GET /api/auth/profile - Get profile
- PUT /api/auth/profile - Update profile
- PUT /api/auth/change-password - Change password
- POST /api/auth/follow/:organizerId - Follow organizer
- DELETE /api/auth/follow/:organizerId - Unfollow organizer

### Organizers
- POST /api/organizers/login - Organizer login
- GET /api/organizers - List all organizers
- GET /api/organizers/:id - Get organizer details
- GET /api/organizers/profile - Get own profile
- PUT /api/organizers/profile - Update profile
- PUT /api/organizers/change-password - Change password
- GET /api/organizers/analytics - Get analytics

### Admin
- POST /api/admin/login - Admin login
- GET /api/admin/organizers - List organizers
- POST /api/admin/organizers - Create organizer
- DELETE /api/admin/organizers/:id - Delete organizer
- PUT /api/admin/organizers/:id/toggle - Toggle status
- GET /api/admin/password-resets - Get reset requests
- PUT /api/admin/password-resets/:id/approve - Approve reset
- PUT /api/admin/password-resets/:id/reject - Reject reset

### Events
- POST /api/events - Create event
- GET /api/events - List events
- GET /api/events/trending - Get trending
- GET /api/events/my-events - Organizer's events
- GET /api/events/:id - Get event
- PUT /api/events/:id - Update event
- DELETE /api/events/:id - Delete event

### Registrations
- POST /api/registrations/events/:eventId - Register
- GET /api/registrations/my-registrations - My registrations
- GET /api/registrations/event/:eventId - Event registrations
- POST /api/registrations/validate-qr - Validate ticket
- POST /api/registrations/:id/attendance - Mark attendance
- GET /api/registrations/pending-payments - Pending payments
- PUT /api/registrations/:id/approve-payment - Approve
- PUT /api/registrations/:id/reject-payment - Reject
- GET /api/registrations/:id/calendar - Export .ics

### Messages
- POST /api/events/:eventId/messages - Post message
- GET /api/events/:eventId/messages - Get messages
- DELETE /api/messages/:id - Delete message
- PUT /api/messages/:id/pin - Pin message

## Project Structure
```
├── backend/
│   ├── config/         # Database config
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── scripts/        # Admin creation script
│   ├── utils/          # Email utility
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── context/    # Auth context
│   │   ├── pages/      # Page components
│   │   ├── utils/      # API helpers
│   │   └── App.jsx     # Router setup
│   └── index.html
└── README.md
```

## Default Credentials

### Admin
- Email: admin@felicity.com
- Password: admin123 (or as set in createAdmin.js)

## Design Choices

1. **Separate tokens for different roles**: Participants use `token`, organizers use `organizerToken`, admins use `adminToken` in localStorage to avoid conflicts.

2. **Payment proof as URL**: For simplicity, payment proof is stored as a URL string. In production, this would be a file upload to cloud storage.

3. **QR codes as base64**: QR codes are stored as base64 data URLs in the database for simplicity.

4. **Real-time discussion**: Currently uses polling. Could be enhanced with WebSockets for true real-time.

5. **Barebones CSS**: Uses Tailwind with simple black/white styling as requested - beginner-friendly.
