# Complete Frontend Learning Guide - Felicity Event Management

**Created:** February 15, 2026  
**Your Deadline:** February 19, 2026  
**Status:** Core Features Complete (60% done)

---

## 📋 Table of Contents

1. [What We Built](#what-we-built)
2. [How Everything Connects](#how-everything-connects)
3. [File-by-File Explanation](#file-by-file-explanation)
4. [React Concepts Step-by-Step](#react-concepts-step-by-step)
5. [How Data Flows](#how-data-flows)
6. [Testing Guide](#testing-guide)
7. [What's Left To Build](#whats-left-to-build)
8. [Learning Plan](#learning-plan)

---

## 🎯 What We Built

### ✅ Completed Pages (6 pages)
1. **Home** - Landing page
2. **Login** - User authentication
3. **Signup** - New user registration
4. **Events List** - Browse all events
5. **Event Details** - View single event + register
6. **My Registrations** - View your tickets with QR codes

### ✅ Completed Components (1 component)
1. **Navbar** - Navigation bar (shows on every page)

### ✅ Completed Systems
- Authentication (login/signup/logout)
- Event browsing
- Event registration
- QR code display

### ❌ Not Built Yet
- Organizer Dashboard (create events, manage, QR scanner)
- Admin Dashboard
- Payment approval interface
- Discussion forum
- Advanced features

---

## 🔗 How Everything Connects

```
User Opens Browser
      ↓
main.jsx (starts React app)
      ↓
App.jsx (router - decides which page to show)
      ↓
AuthProvider (wraps everything, provides user data)
      ↓
BrowserRouter (enables navigation)
      ↓
Routes (maps URLs to pages)
      ↓
Individual Pages (Home, Login, Events, etc.)
      ↓
Components used by pages (Navbar)
      ↓
API calls to backend (utils/api.js)
      ↓
Backend API (http://localhost:5000)
```

### Example: What Happens When You Login?

```
1. User enters email/password in Login.jsx
   ↓
2. Form submits → handleSubmit() function runs
   ↓
3. Calls loginParticipant() from api.js
   ↓
4. api.js sends POST request to backend
   ↓
5. Backend validates and returns token + user data
   ↓
6. Login.jsx calls login() from AuthContext
   ↓
7. AuthContext saves token to localStorage
   ↓
8. AuthContext updates user state
   ↓
9. All components re-render with new user data
   ↓
10. Navbar now shows "Hello, FirstName" and "Logout"
   ↓
11. User redirected to home page
```

---

## 📂 File-by-File Explanation

### Frontend Structure

```
frontend/
├── src/
│   ├── main.jsx              # START HERE - Entry point
│   ├── App.jsx               # Router - which page to show
│   ├── index.css             # Tailwind imports
│   │
│   ├── pages/                # Full pages
│   │   ├── Home.jsx          # Landing page
│   │   ├── Login.jsx         # Login form
│   │   ├── Signup.jsx        # Registration form
│   │   ├── Events.jsx        # Events list
│   │   ├── EventDetails.jsx  # Single event view
│   │   └── MyRegistrations.jsx # User's tickets
│   │
│   ├── components/           # Reusable pieces
│   │   └── Navbar.jsx        # Navigation bar
│   │
│   ├── context/              # Global state
│   │   └── AuthContext.jsx   # User authentication state
│   │
│   └── utils/                # Helper functions
│       └── api.js            # Backend API calls
```

---

### 1. main.jsx - The Beginning

**Purpose:** Starts your entire React app

```jsx
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
```

**What it does:**
1. Finds `<div id="root">` in your HTML
2. Puts your entire React app inside it
3. Renders `<App />` component

**When you edit it:** Almost never. It's the starting point.

---

### 2. App.jsx - The Traffic Controller

**Purpose:** Decides which page to show based on URL

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
// ... more imports

function App() {
  return (
    <AuthProvider>           {/* Wraps everything with user auth */}
      <BrowserRouter>        {/* Enables routing */}
        <Routes>             {/* Container for all routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          {/* More routes... */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

**How Routes Work:**
- User visits `/` → Shows `<Home />`
- User visits `/login` → Shows `<Login />`
- User visits `/events/123` → Shows `<EventDetails />` with id=123

**Key Concepts:**
- `<Route path="/about" element={<About />} />` - Maps URL to component
- `:id` is a dynamic parameter (can be any value)
- `<AuthProvider>` makes user data available to ALL pages

---

### 3. AuthContext.jsx - Global User State

**Purpose:** Stores user data that ALL components can access

```jsx
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user profile from backend
      getParticipantProfile()
        .then(data => setUser(data))
        .catch(err => {
          localStorage.removeItem('token');
        });
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**What it provides:**
- `user` - Current user object (null if not logged in)
- `loading` - Is authentication check happening?
- `login(token, userData)` - Function to log in
- `logout()` - Function to log out
- `isAuthenticated` - Boolean: true if logged in

**How to use it in any component:**
```jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  
  if (isAuthenticated) {
    return <p>Hello {user.firstName}</p>;
  }
  return <p>Please login</p>;
}
```

**Why it's useful:**
- No need to pass user data through every component as props
- Any component can access user data
- Changes to user state automatically update all components

---

### 4. api.js - Backend Communication

**Purpose:** Centralized place for all API calls

```jsx
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export functions for API calls
export const loginParticipant = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getAllEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};
```

**Key Concepts:**

**1. axios.create()** - Makes a reusable HTTP client
```jsx
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // All requests start with this
  headers: { 'Content-Type': 'application/json' }
});
```

**2. Interceptors** - Modify requests before sending
```jsx
api.interceptors.request.use((config) => {
  // Add token to Authorization header
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
This means every API call automatically includes your token!

**3. Async/Await** - Cleaner way to handle promises
```jsx
// Old way (callbacks)
axios.get('/events').then(response => {
  console.log(response.data);
}).catch(error => {
  console.error(error);
});

// New way (async/await)
async function fetchEvents() {
  try {
    const response = await axios.get('/events');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

**How to add new API calls:**
```jsx
export const newAPIFunction = async (params) => {
  const response = await api.post('/endpoint', { data });
  return response.data;
};
```

---

### 5. Navbar.jsx - Navigation Component

**Purpose:** Shows navigation links at top of every page

```jsx
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);

  return (
    <nav className="border-b-2 border-black bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
        <Link to="/">Felicity Events</Link>
        
        <div className="flex space-x-4">
          <Link to="/events">Events</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/my-registrations">My Registrations</Link>
              <span>Hello, {user?.firstName}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

**Key Concepts:**

**1. useContext Hook**
```jsx
const { user, isAuthenticated } = useContext(AuthContext);
```
Gets data from AuthContext without passing props.

**2. Conditional Rendering**
```jsx
{isAuthenticated ? <LoggedInView /> : <LoggedOutView />}
```
Shows different content based on condition.

**3. Optional Chaining**
```jsx
user?.firstName
```
Safely access nested properties. If `user` is null, returns `undefined` instead of crashing.

**4. Link Component**
```jsx
<Link to="/events">Events</Link>
```
Like `<a href="/events">` but doesn't reload the page.

---

### 6. Login.jsx - Login Page

**Purpose:** User enters email/password to login

```jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginParticipant } from '../utils/api';

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const data = await loginParticipant(email, password);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <form onSubmit={handleSubmit}>
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}
```

**Key Concepts:**

**1. useState Hook**
```jsx
const [email, setEmail] = useState('');
```
- `email` - Current value
- `setEmail` - Function to update value
- `''` - Initial value

**2. Form Handling**
```jsx
<input 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```
- `value={email}` - Input shows current state
- `onChange` - Updates state when user types
- `e.target.value` - The new value

**3. Form Submit**
```jsx
const handleSubmit = async (e) => {
  e.preventDefault(); // Stops page reload
  // Do something with form data
};

<form onSubmit={handleSubmit}>
```

**4. useNavigate Hook**
```jsx
const navigate = useNavigate();
navigate('/'); // Redirect to home page
```

**5. Try-Catch for Error Handling**
```jsx
try {
  const data = await loginParticipant(email, password);
  // Success
} catch (err) {
  // Handle error
  setError(err.response?.data?.message);
}
```

---

### 7. Signup.jsx - Registration Page

**Purpose:** New users create account

**Key Difference from Login:**
Uses a **single object** for multiple form fields:

```jsx
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  participantType: 'non-iiit'
});

const handleChange = (e) => {
  setFormData({
    ...formData,  // Keep existing values
    [e.target.name]: e.target.value  // Update changed field
  });
};

<input 
  name="firstName"
  value={formData.firstName}
  onChange={handleChange}
/>
```

**Why this pattern?**
- Scales better (10 fields = 1 state instead of 10)
- One onChange handler for all inputs
- Cleaner code

**Spread Operator Explained:**
```jsx
const obj = { a: 1, b: 2 };
const newObj = { ...obj, b: 3 };
// newObj = { a: 1, b: 3 }
```

**Computed Property Names:**
```jsx
const field = 'email';
const obj = { [field]: 'test@test.com' };
// obj = { email: 'test@test.com' }
```

---

### 8. Events.jsx - Events List

**Purpose:** Shows all events from backend

```jsx
import { useState, useEffect } from 'react';
import { getAllEvents } from '../utils/api';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEvents()
      .then(data => {
        setEvents(data.events);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []); // Empty array = run once when component loads

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {events.map(event => (
        <Link key={event._id} to={`/events/${event._id}`}>
          <h3>{event.name}</h3>
          <p>{event.description}</p>
        </Link>
      ))}
    </div>
  );
}
```

**Key Concepts:**

**1. useEffect Hook**
```jsx
useEffect(() => {
  // Code to run
}, [dependencies]);
```
- Runs side effects (API calls, subscriptions, etc.)
- `[]` empty array = run once when component mounts
- `[var]` = run when `var` changes
- No array = run after every render

**2. Array.map() for Lists**
```jsx
{events.map(event => (
  <div key={event._id}>
    <h3>{event.name}</h3>
  </div>
))}
```
- Loops through array and returns JSX for each item
- `key` prop is REQUIRED for React to track items
- Use unique ID (like `_id`) as key

**3. Template Literals**
```jsx
to={`/events/${event._id}`}
// If event._id = '123', becomes: /events/123
```

---

### 9. EventDetails.jsx - Single Event View

**Purpose:** Shows one event with registration button

```jsx
import { useParams } from 'react-router-dom';

function EventDetails() {
  const { id } = useParams(); // Gets :id from URL
  const [event, setEvent] = useState(null);

  useEffect(() => {
    getEventById(id)
      .then(data => setEvent(data.event));
  }, [id]);

  const handleRegister = async () => {
    try {
      await registerForEvent(id, {});
      alert('Registration successful!');
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  if (!event) return <p>Loading...</p>;

  return (
    <div>
      <h1>{event.name}</h1>
      <p>{event.description}</p>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
```

**Key Concepts:**

**1. useParams Hook**
```jsx
// URL: /events/123
const { id } = useParams();
// id = '123'
```

**2. Conditional Rendering**
```jsx
if (!event) return <p>Loading...</p>;
// If no event, show loading, otherwise continue
```

---

### 10. MyRegistrations.jsx - User's Tickets

**Purpose:** Shows user's registered events with QR codes

```jsx
function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    getMyRegistrations()
      .then(data => setRegistrations(data.registrations));
  }, []);

  return (
    <div>
      {registrations.map(reg => (
        <div key={reg._id}>
          <h3>{reg.eventId?.name}</h3>
          <p>Ticket: {reg.ticketId}</p>
          {reg.qrCode && <img src={reg.qrCode} alt="QR" />}
        </div>
      ))}
    </div>
  );
}
```

**Key Concept:**

**Optional Chaining with Populated Fields**
```jsx
{reg.eventId?.name}
```
Backend populates `eventId` with full event object. If it fails, this safely returns undefined.

---

## 🔄 How Data Flows

### Example: Viewing Events

```
1. User clicks "Events" in Navbar
   ↓
2. React Router shows Events.jsx component
   ↓
3. Events.jsx runs useEffect on mount
   ↓
4. useEffect calls getAllEvents() from api.js
   ↓
5. api.js sends GET request to backend
   ↓
6. Backend queries MongoDB and returns events array
   ↓
7. getAllEvents() returns data to Events.jsx
   ↓
8. Events.jsx calls setEvents(data.events)
   ↓
9. State updates, component re-renders
   ↓
10. Events.jsx maps through events array
   ↓
11. For each event, creates a Link component
   ↓
12. User sees list of events
```

### Example: Registering for Event

```
1. User clicks "Register" button in EventDetails.jsx
   ↓
2. handleRegister() function runs
   ↓
3. Calls registerForEvent(id, {}) from api.js
   ↓
4. api.js sends POST request to backend
   ↓
5. Interceptor adds JWT token to request headers
   ↓
6. Backend verifies token, creates registration
   ↓
7. Backend generates QR code, sends email
   ↓
8. Backend returns registration object
   ↓
9. EventDetails.jsx shows success message
   ↓
10. Redirects user to /my-registrations
   ↓
11. MyRegistrations.jsx fetches registrations
   ↓
12. User sees their new registration with QR code
```

---

## 🧪 Testing Guide

### 1. Test Authentication Flow

**Signup:**
1. Go to http://localhost:5173/signup
2. Fill form: FirstName, LastName, Email, Password, ConfirmPassword, Type
3. Click "Sign Up"
4. Should redirect to home
5. Navbar should show "Hello, FirstName"

**Logout:**
1. Click "Logout"
2. Navbar should show "Login" and "Sign Up"

**Login:**
1. Go to /login
2. Enter same email/password
3. Should login and show name in navbar

### 2. Test Events Flow

**View Events:**
1. Click "Events" in navbar
2. Should see list of events
3. Each event shows name, description, fee, date

**View Event Details:**
1. Click on any event
2. Should see full details
3. "Register" button should appear (if logged in)

**Register for Event:**
1. Click "Register for Event"
2. Should show success message
3. Redirected to My Registrations

### 3. Test My Registrations

1. Click "My Registrations" in navbar
2. Should see your registered events
3. QR code should display (if payment approved)
4. Shows ticket ID, payment status

### 4. Test Edge Cases

**Not Logged In:**
- Try accessing /my-registrations without login
- Should show empty state or redirect

**Invalid Event:**
- Go to /events/invalid-id
- Should show "Event not found"

**Form Validation:**
- Try submitting empty login form → Error message
- Try signup with mismatched passwords → Error
- Try signup with short password → Error

---

## 🚧 What's Left To Build

### High Priority (Core Features)
1. **Organizer Dashboard**
   - Create event form
   - Manage my events (edit/delete)
   - View registrations
   - QR scanner for attendance
   - Payment approval interface

2. **Admin Dashboard**
   - Manage organizers (create/delete)
   - View all events
   - Password reset approvals

### Medium Priority (Enhanced UX)
3. **Protected Routes**
   - Redirect to login if not authenticated
   - Show 403 if wrong role accesses page

4. **Better Error Handling**
   - Toast notifications instead of alerts
   - Loading skeletons instead of "Loading..."

5. **Search & Filters**
   - Search events by name
   - Filter by type, date, etc.

### Low Priority (Nice to Have)
6. **Discussion Forum**
   - Post messages on event pages
   - Pin/delete messages (organizers)

7. **Profile Page**
   - Edit user info
   - Change password

8. **Email Verification**
   - Verify email on signup

---

## 📚 Learning Plan

### Day 1: Understanding The Basics (4 hours)

**Morning (2 hours): File Structure**
1. Read this document top to bottom (don't code yet)
2. Draw the project structure on paper
3. Trace data flow from button click to backend and back

**Afternoon (2 hours): React Fundamentals**
1. Open `Login.jsx` and understand every line
2. Make small changes:
   - Change button text
   - Add a new input field
   - Change error message styling
3. See how changes reflect in browser

**Exercises:**
- [ ] Change navbar logo text
- [ ] Add a footer component to Home.jsx
- [ ] Change Events page to show events in a different layout
- [ ] Add a counter to Home page that increments on button click

---

### Day 2: Component Deep Dive (4 hours)

**Morning (2 hours): State & Props**
1. Study `Signup.jsx` - understand formData state
2. Study `Navbar.jsx` - understand useContext
3. Study `Events.jsx` - understand useEffect

**Afternoon (2 hours): Build Something**
Create a new component: `EventCard.jsx`
```jsx
function EventCard({ event }) {
  return (
    <div className="border-2 border-black p-4">
      <h3>{event.name}</h3>
      <p>{event.description}</p>
      <p>₹{event.regFee}</p>
    </div>
  );
}
```
Use it in Events.jsx instead of inline JSX.

**Exercises:**
- [ ] Create a Button component that's reusable
- [ ] Create a LoadingSpinner component
- [ ] Create an ErrorMessage component
- [ ] Refactor Events.jsx to use these components

---

### Day 3: API & Data Flow (4 hours)

**Morning (2 hours): Understanding API Calls**
1. Study `api.js` completely
2. Trace a login request from form to backend
3. Use browser DevTools Network tab:
   - Open F12 → Network
   - Login and watch the request
   - See request headers, body, response

**Afternoon (2 hours): Add New API Call**
Add a feature: "View Organizer Profile"
1. Check backend route: `/api/organizers/:id`
2. Add function to api.js:
```jsx
export const getOrganizerById = async (id) => {
  const response = await api.get(`/organizers/${id}`);
  return response.data;
};
```
3. Create page: `OrganizerProfile.jsx`
4. Fetch and display organizer data

**Exercises:**
- [ ] Add search functionality to Events page
- [ ] Add filtering by event type
- [ ] Add "Cancel Registration" button
- [ ] Implement the cancel registration API call

---

### Day 4: Advanced Features (4 hours)

**Morning (2 hours): Protected Routes**
Create `ProtectedRoute.jsx`:
```jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) return <p>Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
}
```

Use it:
```jsx
<Route 
  path="/my-registrations" 
  element={
    <ProtectedRoute>
      <MyRegistrations />
    </ProtectedRoute>
  } 
/>
```

**Afternoon (2 hours): Start Organizer Dashboard**
1. Check backend organizer routes
2. Create `OrganizerDashboard.jsx`
3. Implement "Create Event" form
4. Test creating an event

---

### Key Concepts To Master

#### 1. Hooks (React's Built-in Functions)

**useState** - Component memory
```jsx
const [count, setCount] = useState(0);
setCount(count + 1); // Update state
```

**useEffect** - Side effects (API calls, subscriptions)
```jsx
useEffect(() => {
  // Runs when component mounts or dependencies change
}, [dependencies]);
```

**useContext** - Access global state
```jsx
const { user } = useContext(AuthContext);
```

**useParams** - Get URL parameters
```jsx
const { id } = useParams(); // From /events/:id
```

**useNavigate** - Programmatic navigation
```jsx
const navigate = useNavigate();
navigate('/home'); // Go to /home
```

#### 2. Props (Passing Data to Components)

```jsx
// Parent component
<EventCard event={eventData} onClick={handleClick} />

// Child component
function EventCard({ event, onClick }) {
  return (
    <div onClick={onClick}>
      <h3>{event.name}</h3>
    </div>
  );
}
```

#### 3. Conditional Rendering

```jsx
// If/else
{isLoggedIn ? <Dashboard /> : <Login />}

// Show only if true
{error && <p>{error}</p>}

// Early return
if (loading) return <p>Loading...</p>;
```

#### 4. Lists & Keys

```jsx
{items.map(item => (
  <div key={item.id}>
    {item.name}
  </div>
))}
```

#### 5. Event Handlers

```jsx
// Inline
<button onClick={() => console.log('Clicked')}>Click</button>

// Function reference
<button onClick={handleClick}>Click</button>

// With parameter
<button onClick={() => handleClick(id)}>Click</button>
```

#### 6. Forms

```jsx
const [email, setEmail] = useState('');

<form onSubmit={handleSubmit}>
  <input 
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  <button type="submit">Submit</button>
</form>
```

---

## 🎯 Practice Challenges

### Easy
1. Add a search bar to Events page (just UI, no functionality)
2. Change color scheme from black/white to blue/white
3. Add event date to event cards in Events.jsx
4. Show "No events" message when events array is empty
5. Add a "Refresh" button to Events page

### Medium
6. Implement search functionality (filter events by name)
7. Add "View Details" button to event cards
8. Show loading spinner during API calls (create spinner component)
9. Add form validation to Signup (check email format)
10. Implement "Cancel Registration" feature

### Hard
11. Create Organizer Login page (separate from participant login)
12. Build Create Event form with all fields
13. Implement QR code scanner using device camera
14. Add pagination to Events page (10 events per page)
15. Build admin dashboard with organizer management

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property of undefined"
**Cause:** Accessing nested property that doesn't exist
**Solution:** Use optional chaining `?.`
```jsx
// Bad
<p>{user.profile.name}</p>

// Good
<p>{user?.profile?.name}</p>
```

### Issue: "Each child should have a unique key prop"
**Cause:** Mapping array without key
**Solution:** Add key prop
```jsx
{items.map(item => (
  <div key={item._id}>...</div>
))}
```

### Issue: Page doesn't update after API call
**Cause:** Not updating state
**Solution:** Call setState with new data
```jsx
const data = await api.get('/events');
setEvents(data.events); // This causes re-render
```

### Issue: Infinite loop with useEffect
**Cause:** Missing or wrong dependencies
```jsx
// Bad - runs every render
useEffect(() => {
  fetchData();
});

// Good - runs once
useEffect(() => {
  fetchData();
}, []);

// Good - runs when id changes
useEffect(() => {
  fetchData(id);
}, [id]);
```

### Issue: Form submits and page reloads
**Cause:** Not preventing default behavior
**Solution:** Add e.preventDefault()
```jsx
const handleSubmit = (e) => {
  e.preventDefault(); // Add this!
  // ... form handling
};
```

---

## 🎓 Resources for Learning More

### Official Docs (Best Source)
- React: https://react.dev
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com

### Video Tutorials
- React in 100 Seconds: https://youtu.be/Tn6-PIqc4UM
- React Hooks: https://youtu.be/TNhaISOUy6Q

### Practice
- Build a todo app
- Build a weather app
- Clone existing websites (Twitter, Instagram UI)

---

## 📝 Next Steps After This Project

1. **Add TypeScript** - Type safety for larger projects
2. **State Management** - Redux or Zustand for complex state
3. **Testing** - Jest and React Testing Library
4. **Performance** - React.memo, useMemo, useCallback
5. **Advanced Patterns** - Custom hooks, compound components

---

**Remember:** 
- Don't try to memorize everything
- Google is your friend (React docs are excellent)
- Break problems into small pieces
- Test frequently
- Read error messages carefully
- Use console.log() liberally when debugging

**Good luck! You got this! 🚀**
