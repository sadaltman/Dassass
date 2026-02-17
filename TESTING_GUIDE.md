# Testing Guide - Felicity Event Management System

## Prerequisites

1. **Create Admin Account** (Run this first!)
```bash
cd /home/sahaj/Desktop/Dass/backend
node scripts/createAdmin.js
```

This creates a hardcoded admin with:
- **Email**: `admin@felicity.com`
- **Password**: `admin123`

2. **Start Backend** (Port 5000)
```bash
cd /home/sahaj/Desktop/Dass/backend
node server.js
```

3. **Start Frontend** (Port 5173)
```bash
cd /home/sahaj/Desktop/Dass/frontend
npm run dev
```

---

## Test Flow

### 1. Participant Flow

**A. Signup**
- Go to: http://localhost:5173/signup
- Fill in:
  - First Name: `John`
  - Last Name: `Doe`
  - Email: `john@test.com`
  - Password: `test123`
  - Confirm Password: `test123`
  - Participant Type: `IIIT Hyderabad Student`
- Click "Sign Up"

**B. Login**
- Go to: http://localhost:5173/login
- Email: `john@test.com`
- Password: `test123`
- Click "Login"

**C. Browse Events**
- Go to: http://localhost:5173/events
- View all published events

**D. Register for Event**
- Click on any event
- Click "Register" button
- If event has merchandise, upload payment proof
- Check "My Registrations" page for QR code

---

### 2. Admin Flow

**A. Login**
- Go to: http://localhost:5173/admin/login
- Email: `admin@felicity.com`
- Password: `admin123`
- Click "Login"

**B. Add Organizer**
- In Admin Dashboard, click "Add New Organizer"
- Fill in:
  - Name: `Event Organizer 1`
  - Email: `organizer@test.com`
  - Password: `org123`
- Click "Add Organizer"

**C. Manage Organizers**
- Activate/Deactivate organizers
- Delete organizers (if needed)

---

### 3. Organizer Flow

**A. Login** (after admin creates organizer)
- Go to: http://localhost:5173/organizer/login
- Email: `organizer@test.com`
- Password: `org123`
- Click "Login"

**B. Create Event**
- In Organizer Dashboard, click "Create Event"
- Fill in all details:
  - Basic Info (name, description, type, eligibility)
  - Date & Time (start/end dates, registration deadline)
  - Venue & Contact
  - Registration Details (max participants, fees)
  - Merchandise (optional - check box if event has merch)
- Click "Create Event"

**C. View My Events**
- Click "My Events" in dashboard
- See list of all your events
- Publish draft events
- Edit/Delete events

**D. Approve Payments** (if event has merchandise)
- Click "Payment Approvals" in dashboard
- See all pending payment proofs
- Approve or Reject each payment
- When approved, participant gets QR code

**E. Scan QR Codes**
- Click "QR Scanner" in dashboard
- Enter registration ID from QR code
- Click "Validate"
- If valid, click "Mark Attendance"

---

## API Endpoints Reference

### Participant
- `POST /api/auth/register` - Signup
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (organizer)
- `POST /api/registrations` - Register for event

### Organizer
- `POST /api/organizers/login` - Organizer login
- `GET /api/events/organizer/my-events` - Get my events
- `GET /api/registrations/pending-payments` - Pending payments
- `PUT /api/registrations/:id/approve-payment` - Approve payment
- `POST /api/registrations/validate-qr` - Validate QR code

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/organizers` - List organizers
- `POST /api/admin/organizers` - Create organizer
- `PUT /api/admin/organizers/:id/activate` - Activate organizer
- `PUT /api/admin/organizers/:id/deactivate` - Deactivate organizer
- `DELETE /api/admin/organizers/:id` - Delete organizer

---

## Common Issues

### 1. "Admin not found"
- Run: `node scripts/createAdmin.js` first

### 2. CORS Error
- Make sure backend server.js has CORS enabled for localhost:5173
- Restart backend server

### 3. "Organizer is inactive"
- Admin needs to activate the organizer in admin dashboard

### 4. Token expired
- Logout and login again
- Check localStorage is storing tokens correctly

---

## Token Storage

Different user types use different token keys:

- **Participant**: `token` (regular auth token)
- **Organizer**: `organizerToken`
- **Admin**: `adminToken`

Check browser console → Application → Local Storage to verify tokens are saved.

---

## Next Steps After Testing

1. Test full event lifecycle:
   - Admin creates organizer
   - Organizer creates event
   - Participant registers
   - Organizer approves payment
   - Organizer scans QR code

2. Test edge cases:
   - Max participants reached
   - Registration deadline passed
   - Invalid QR codes

3. Optional features to add:
   - Edit event page
   - View registrations page
   - Discussion forum
   - Password reset flow
