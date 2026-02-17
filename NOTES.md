# 📝 Quick Revision Notes

## Commands Cheatsheet

### Node.js & NPM
```bash
node --version          # Check Node.js version
npm --version           # Check npm version
npm init -y             # Initialize a new Node.js project
npm install <package>   # Install a package
npm start               # Run the start script
```

### File System
```bash
ls                      # List files (like dir in Windows)
cd <folder>             # Change directory
mkdir <folder>          # Create directory
touch <file>            # Create empty file
cat <file>              # Display file contents
pwd                     # Print working directory
```

---

## JavaScript Basics (for C/C++ Programmers)

### Variables
```javascript
// C/C++: int x = 5;
let x = 5;              // Can change
const y = 10;           // Cannot change (like const in C++)
var z = 15;             // Old way (avoid)
```

### Functions
```javascript
// C/C++: int add(int a, int b) { return a + b; }
function add(a, b) {
    return a + b;
}

// Modern way (arrow function)
const add = (a, b) => a + b;
```

### Objects (like structs)
```javascript
// C: struct User { char name[50]; int age; };
const user = {
    name: "Sahaj",
    age: 20
};

// Accessing
console.log(user.name);  // C: printf("%s", user.name);
```

### Arrays
```javascript
// C: int arr[5] = {1,2,3,4,5};
const arr = [1, 2, 3, 4, 5];

// Dynamic size (no need to specify)
arr.push(6);            // Add element
arr.length;             // Get length
```

---

## Key Concepts

### 1. Asynchronous Code
**C/C++:** Code runs line by line, waits for each to finish
```c
int result = calculateSomething();  // Waits here
printf("%d", result);
```

**JavaScript:** Can continue while waiting
```javascript
// Doesn't wait, continues immediately
fetchDataFromDatabase().then(result => {
    console.log(result);
});
console.log("This runs first!");
```

### 2. JSON (JavaScript Object Notation)
**C struct:**
```c
struct User {
    char name[50];
    int age;
    char email[100];
};
```

**JSON (text format):**
```json
{
    "name": "Sahaj",
    "age": 20,
    "email": "sahaj@iiit.ac.in"
}
```

### 3. HTTP Methods
- **GET**: Retrieve data (like reading a file)
- **POST**: Create new data (like writing to file)
- **PUT**: Update existing data
- **DELETE**: Remove data

### 4. REST API
A way for frontend and backend to communicate:
```
GET  /api/events           → Get all events
GET  /api/events/:id       → Get one event
POST /api/events           → Create event
PUT  /api/events/:id       → Update event
DELETE /api/events/:id     → Delete event
```

### 5. Status Codes
- **200**: OK - Success
- **201**: Created - Resource created successfully
- **400**: Bad Request - Invalid data sent
- **401**: Unauthorized - Need to login
- **404**: Not Found - Resource doesn't exist
- **500**: Internal Server Error - Server crashed

---

## MERN Stack Flow

```
┌─────────────────────────────────────────────────┐
│  USER'S BROWSER (Frontend - React)              │
│  - Shows pretty UI                              │
│  - Handles user clicks                          │
│  - Sends HTTP requests                          │
└────────────┬────────────────────────────────────┘
             │ HTTP Request (JSON data)
             ▼
┌─────────────────────────────────────────────────┐
│  SERVER (Backend - Express + Node.js)           │
│  - Receives request                             │
│  - Validates data                               │
│  - Processes logic                              │
│  - Talks to database                            │
└────────────┬────────────────────────────────────┘
             │ Database Query
             ▼
┌─────────────────────────────────────────────────┐
│  DATABASE (MongoDB)                             │
│  - Stores data permanently                      │
│  - Returns requested data                       │
└─────────────────────────────────────────────────┘
```

---

## Project Structure

```
Dass/
├── backend/              # Server code (Express + Node.js)
│   ├── server.js        # Main entry point
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── controllers/     # Business logic
│   ├── middleware/      # Authentication, validation
│   └── package.json     # Dependencies list
│
├── frontend/            # User interface (React)
│   ├── src/            
│   │   ├── App.js      # Main component
│   │   ├── components/ # Reusable UI pieces
│   │   └── pages/      # Different pages
│   └── package.json    # Dependencies list
│
└── README.md           # Project documentation
```

---

## API Endpoints Reference

### Authentication (Participants)
- **POST** `/api/auth/register` - Register new participant
- **POST** `/api/auth/login` - Login participant
- **GET** `/api/auth/profile` - Get my profile (🔒 participant)
- **PUT** `/api/auth/profile` - Update profile (🔒 participant)
- **PUT** `/api/auth/change-password` - Change password (🔒 participant)
- **POST** `/api/auth/follow/:organizerId` - Follow organizer (🔒 participant)
- **DELETE** `/api/auth/follow/:organizerId` - Unfollow organizer (🔒 participant)

### Organizers
- **POST** `/api/organizers/login` - Organizer login
- **GET** `/api/organizers` - List all organizers (public)
- **GET** `/api/organizers/:id` - Get organizer details with events (public)
- **GET** `/api/organizers/profile` - Get my profile (🔒 organizer)
- **PUT** `/api/organizers/profile` - Update profile (🔒 organizer)
- **PUT** `/api/organizers/change-password` - Change password (🔒 organizer)

### Admin
- **POST** `/api/admin/login` - Admin login
- **GET** `/api/admin/organizers` - List all organizers (🔒 admin only)
- **POST** `/api/admin/organizers` - Create organizer (🔒 admin only)
- **DELETE** `/api/admin/organizers/:id` - Delete organizer (🔒 admin only)
- **PUT** `/api/admin/organizers/:id/toggle` - Enable/Disable organizer (🔒 admin only)

### Events
- **POST** `/api/events` - Create event (🔒 organizer only)
- **GET** `/api/events` - Browse all events (public, supports filters)
  - Query params: `status`, `eventType`, `search`, `eligibility`, `startDate`, `endDate`, `followedOnly`
- **GET** `/api/events/my-events` - Get my events (🔒 organizer only)
- **GET** `/api/events/:id` - Get event details (public)
- **PUT** `/api/events/:id` - Update event (🔒 organizer only)
- **DELETE** `/api/events/:id` - Delete event (🔒 organizer only)

### Registrations
- **POST** `/api/registrations/events/:eventId` - Register for event (🔒 participant)
- **GET** `/api/registrations/my-registrations` - My registrations with tickets (🔒 participant)
- **GET** `/api/registrations/:id` - Get registration details (🔒 participant)
- **DELETE** `/api/registrations/:id` - Cancel registration (🔒 participant)
- **GET** `/api/registrations/event/:eventId` - Event attendees (🔒 organizer)

🔒 = Requires authentication with Bearer token

---

## Testing Commands

### 1. Create Admin (one-time setup)
```bash
cd backend
node scripts/createAdmin.js
```
**Default credentials:** admin@felicity.com / admin123

### 2. Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@felicity.com","password":"admin123"}'
```

### 3. Create Organizer (use admin token)
```bash
curl -X POST http://localhost:5000/api/admin/organizers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "name":"Music Club",
    "loginEmail":"music@felicity.com",
    "password":"music123",
    "category":"Cultural"
  }'
```

### 4. Organizer Login
```bash
curl -X POST http://localhost:5000/api/organizers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"music@felicity.com","password":"music123"}'
```

### 5. Create Event (use organizer token)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ORGANIZER_TOKEN_HERE" \
  -d '{
    "name":"Music Fest 2026",
    "description":"Annual music competition",
    "eventType":"normal",
    "regDeadline":"2026-03-01",
    "startDate":"2026-03-15",
    "endDate":"2026-03-16",
    "regLimit":100,
    "regFee":500
  }'
```

### 6. Browse Events
```bash
curl http://localhost:5000/api/events
```

### 7. Search Events
```bash
curl "http://localhost:5000/api/events?search=music&status=published"
```

---

## JWT Authentication Flow

### What is JWT?
- **JSON Web Token** - encrypted string containing user info
- Like a movie ticket with your seat info stamped by theater
- Can't be faked because of signature

### JWT Structure:
```
eyJhbGci.eyJ1c2Vy.cHeMQEb
   ↑        ↑        ↑
Header  Payload  Signature
```

### Complete Flow:

**1. Login:**
```javascript
// User sends: email + password
// Server checks password
// Server creates token:
const token = jwt.sign(
    { userId: user._id, email: user.email, userType: 'organizer' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);
// Server sends: token
```

**2. Protected Request:**
```javascript
// User sends: Authorization: Bearer <token>
// Middleware extracts token
// Middleware verifies with JWT_SECRET
// Middleware decodes payload → req.userInfo
// Controller uses req.userInfo.userId
```

**3. Request Flow:**
```
Client → Server
       ↓
    authenticateUser middleware
       ├─ Extract token from header
       ├─ Verify token
       ├─ Set req.userInfo
       └─ next()
       ↓
    requireRole middleware
       ├─ Check req.userInfo.userType
       └─ next()
       ↓
    Controller function
       ├─ Use req.userInfo.userId
       └─ Send response
```

### Bearer Token Format:
```
Authorization: Bearer eyJhbGci...token...
       ↑         ↑          ↑
    Header    Token      Actual
    name      Type       Token
```

**Why "Bearer"?**
- Bearer = "whoever holds this"
- Like cash - if you have it, you can use it
- Most common for API authentication

---

## Mongoose Schemas

### Schema = Blueprint for Data
```javascript
const userSchema = new mongoose.Schema({
    email: {
        type: String,           // Data type
        required: true,         // Must exist
        unique: true           // No duplicates
    },
    role: {
        type: String,
        enum: ['admin', 'user'], // Only these values
        default: 'user'         // Default if not provided
    },
    createdAt: {
        type: Date,
        default: Date.now       // Auto-set current date
    }
}, {
    timestamps: true           // Auto createdAt/updatedAt
});
```

### Model = Class to Use Schema
```javascript
module.exports = mongoose.model('User', userSchema);

// Usage:
const User = require('./models/user');
const newUser = new User({ email: "test@test.com" });
await newUser.save();
```

---

## Middleware Explained

### What is Middleware?
Functions that run **before** your controller
```javascript
router.post('/path', middleware1, middleware2, controller);
                      ↓           ↓            ↓
                   Runs first  Runs second  Runs last
```

### Authentication Middleware:
```javascript
const authenticateUser = (req, res, next) => {
    // Get token from header
    // Verify token
    // Set req.userInfo = decoded data
    next();  // Continue to next function
};
```

### Authorization Middleware:
```javascript
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (allowedRoles.includes(req.userInfo.userType)) {
            next();  // Role allowed
        } else {
            res.status(403).json({message: 'Forbidden'});
        }
    };
};
```

### Usage:
```javascript
// Public route (no middleware)
router.get('/events', getAllEvents);

// Protected route (auth only)
router.post('/events', authenticateUser, createEvent);

// Role-restricted route (auth + role check)
router.post('/admin/users', 
    authenticateUser, 
    requireRole(['admin']), 
    createUser
);
```

---

## Event Status Workflow

```
draft → published → ongoing → completed
           ↓
        closed
```

### Edit Rules by Status:
- **draft:** Can edit everything, can publish
- **published:** Can edit description/deadline/limit, can close
- **ongoing:** Can only mark completed
- **completed:** Cannot edit (final state)
- **closed:** Cannot edit (cancelled state)

---

## Database Models Overview

### User (Participants)
- firstName, lastName, email, password
- participantType: 'iiit' or 'non-iiit'
- interests: array of strings
- followedClubs: array of Organizer IDs

### Organizer
- name, loginEmail, hashedPassword
- category, aboutText
- publicContactEmail, phoneNumber
- webhookUrl (for Discord)
- active: boolean (can be disabled by admin)

### Admin
- emailAddress, hashedPassword
- Simple model - just login credentials

### Event
- name, description, eventType ('normal'/'merchandise')
- organizerId (reference to Organizer)
- eligibility: 'iiit-only' or 'all'
- regDeadline, startDate, endDate
- regLimit, regFee, currentRegistrations
- status: draft/published/ongoing/completed/closed
- customForm: object (dynamic form fields)
- merchDetails: variants, stock, purchaseLimit

---

## Common Patterns

### 1. Import/Export (like #include)
```javascript
// C: #include "myfile.h"

// Export (in myfile.js)
const myFunction = () => { /* ... */ };
module.exports = myFunction;

// Import (in another file)
const myFunction = require('./myfile');

// Modern way (ES6)
export const myFunction = () => { /* ... */ };
import { myFunction } from './myfile';
```

### 2. Promises & Async/Await
```javascript
// Old way
fetchData().then(data => {
    console.log(data);
}).catch(error => {
    console.log(error);
});

// Modern way (easier to read)
async function getData() {
    try {
        const data = await fetchData();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}
```

### 3. Environment Variables
```javascript
// Instead of hardcoding secrets
const password = "mypassword123";  // BAD!

// Use .env file
// .env file:
// DB_PASSWORD=mypassword123

// In code:
const password = process.env.DB_PASSWORD;  // GOOD!
```

---

## Authentication Flow

```
1. User sends email + password
   ↓
2. Server checks if user exists in database
   ↓
3. Server compares hashed password
   ↓
4. If correct: Generate JWT token
   ↓
5. Send token to user
   ↓
6. User stores token (localStorage)
   ↓
7. User includes token in all future requests
   ↓
8. Server verifies token before allowing access
```

---

## Installation Commands (We'll Use)

```bash
# Install backend dependencies
npm install express mongoose bcrypt jsonwebtoken dotenv cors

# Install frontend dependencies  
npx create-react-app frontend
cd frontend
npm install axios react-router-dom

# Run development servers
npm run dev          # Backend (with nodemon)
npm start            # Frontend (React)
```

---

## Debugging Tips

### Console Logging
```javascript
// C: printf("Value: %d\n", x);
console.log("Value:", x);

// Object inspection
console.log({ x, y, z });  // Shows variable names + values

// Error checking
console.error("Error occurred!");
```

### Common Errors
1. **Port already in use**: Another app using same port
2. **CORS error**: Frontend and backend not communicating properly
3. **Cannot find module**: Forgot to install package
4. **Undefined**: Variable doesn't exist or not initialized

---

## Today's Progress

### ✅ Completed - Iteration 1: Setup
- [x] Understood the assignment
- [x] Learned about MERN stack
- [x] Created learning guide
- [x] Verified Node.js v18.20.7 installed
- [x] Created project structure (backend/ and frontend/)
- [x] Initialized backend with npm init
- [x] Installed packages: express, mongoose, dotenv, cors, bcrypt, jsonwebtoken, nodemon
- [x] Created server.js with 2 working routes
- [x] Created .env file for configuration
- [x] Updated package.json scripts

### ✅ Completed - Iteration 2: MongoDB & Models
- [x] Connected to MongoDB Atlas
- [x] Created config/db.js for database connection
- [x] Created folder structure (models, routes, controllers, middleware, scripts)
- [x] Created User model (participant only)
- [x] Created Organizer model (separate from User)
- [x] Created Admin model
- [x] Tested database connection

### ✅ Completed - Iteration 3: User Authentication
- [x] Created AuthController (register + login for participants)
- [x] Implemented password hashing with bcrypt
- [x] Implemented JWT token generation
- [x] Email domain validation (@iiit.ac.in for IIIT students)
- [x] Created auth routes
- [x] Tested participant registration and login

### ✅ Completed - Iteration 4: Middleware & Authorization
- [x] Created authentication middleware (authenticateUser)
- [x] Created role-based authorization (requireRole)
- [x] Understand JWT token flow and Bearer tokens
- [x] Protected routes implementation

### ✅ Completed - Iteration 5: Admin & Organizer System
- [x] Created OrganiserController (login)
- [x] Created AdminController (login, createOrganizer, deleteOrganizer)
- [x] Created organizer and admin routes
- [x] Created createAdmin.js seed script
- [x] Admin can create/delete organizers
- [x] Organizers cannot self-register (admin provision only)
- [x] Tested complete admin → create organizer → organizer login flow

### ✅ Completed - Iteration 6: Events System
- [x] Created Event model (normal + merchandise types)
- [x] Created EventController (CRUD operations)
- [x] Organizers can create/update/delete events
- [x] Event status workflow (draft → published → ongoing → completed)
- [x] Browse/search events functionality
- [x] Filters by status, type, search query
- [x] Tested event creation and listing

### 🔄 Current Task - Iteration 7
- [ ] Registration model (participants register for events)
- [ ] Ticket generation with QR codes
- [ ] Profile management endpoints
- [ ] Email notifications

### 📅 Next Steps
- [ ] Merchandise purchase workflow
- [ ] Browse by followed clubs/interests
- [ ] Advanced features (Tier A/B/C)
- [ ] Start frontend with React
- [ ] Deployment

---

## Current System Status

### 📊 Progress: ~55% Backend Complete

### ✅ Working Features:
1. **User System:**
   - Participant registration (with IIIT email validation)
   - Participant login
   - JWT authentication
   - Password hashing (bcrypt)

2. **Organizer System:**
   - Admin creates organizer accounts
   - Organizer login
   - Organizers can't self-register

3. **Admin System:**
   - Admin login
   - Create organizer accounts
   - Delete organizer accounts
   - First admin via seed script

4. **Event System:**
   - Organizers create events (draft status)
   - Update events (with status-based rules)
   - Delete events
   - Browse all events
   - Search events by name/description
   - Filter by status and type
   - Get event details
   - View organizer's own events

5. **Security:**
   - JWT-based authentication
   - Role-based access control (participant/organizer/admin)
   - Protected routes with middleware
   - Bearer token system

### 📁 Project Structure:
```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── AuthController.js        # Participant auth
│   ├── OrganiserController.js   # Organizer auth
│   ├── Admincontroller.js       # Admin operations
│   └── EventController.js       # Event CRUD
├── middleware/
│   └── auth.js                  # authenticateUser, requireRole
├── models/
│   ├── user.js                  # Participant schema
│   ├── organiser.js             # Organizer schema
│   ├── admin.js                 # Admin schema
│   └── event.js                 # Event schema
├── routes/
│   ├── AuthRoutes.js            # /api/auth
│   ├── OrganiserRoutes.js       # /api/organizers
│   ├── AdminRoutes.js           # /api/admin
│   └── EventRoutes.js           # /api/events
├── scripts/
│   └── createAdmin.js           # Seed first admin
├── .env                         # Environment variables
├── server.js                    # Main server file
└── package.json                 # Dependencies
```

---

## Quick Reference: Package.json

**Think of it as:** A recipe card for your project

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",      // npm start
    "dev": "nodemon server.js"       // npm run dev
  },
  "dependencies": {
    "express": "^4.18.0"             // Packages needed
  }
}
```

**Semantic Versioning:** `^4.18.0`
- **4**: Major version (breaking changes)
- **18**: Minor version (new features)
- **0**: Patch version (bug fixes)
- **^**: Install compatible updates automatically

---

## Remember!

1. **JavaScript is case-sensitive**: `myVariable` ≠ `myvariable`
2. **Use semicolons** (optional but recommended)
3. **Indentation matters** for readability (not syntax like Python)
4. **Arrow functions** `() =>` are modern and common
5. **Read error messages** - they tell you exactly what's wrong!

---

*Last Updated: [Will update as we progress]*
