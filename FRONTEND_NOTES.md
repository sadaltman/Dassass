# Frontend Development Notes - Felicity Event Management

**Last Updated:** February 15, 2026  
**Status:** In Progress (10% Complete)

---

## Table of Contents
1. [Project Setup](#project-setup)
2. [React Basics Explained](#react-basics-explained)
3. [Project Structure](#project-structure)
4. [Pages Built](#pages-built)
5. [Components Built](#components-built)
6. [What Each File Does](#what-each-file-does)
7. [API Integration](#api-integration)
8. [Progress Tracker](#progress-tracker)

---

## Project Setup

### Tech Stack
- **React** - JavaScript library for building user interfaces
- **Vite** - Fast build tool (faster than Create React App)
- **Tailwind CSS** - Utility-first CSS framework (no separate CSS files needed)
- **React Router** - For navigation between pages
- **Axios** - For making API calls to backend

### How to Run
```bash
cd /home/sahaj/Desktop/Dass/frontend
npm run dev
```
Then open: http://localhost:5173/

### Backend API URL
```
http://localhost:4000/api
```

---

## React Basics Explained

### What is a Component?
A component is a reusable piece of UI. Think of it like a function that returns HTML.

**Example:**
```jsx
function MyButton() {
  return <button>Click me</button>
}

// Use it like this:
<MyButton />
```

### JSX Syntax
JSX looks like HTML but it's actually JavaScript. Key differences:
- Use `className` instead of `class`
- Use `onClick` instead of `onclick`
- JavaScript goes inside curly braces `{}`

**Example:**
```jsx
const name = "John";
<h1 className="text-xl">{name}</h1>  // Shows: John
```

### Props (Passing Data to Components)
Props are like function parameters - you pass data into a component.

**Example:**
```jsx
// Component that accepts props
function Greeting({ name, age }) {
  return <h1>Hello {name}, you are {age}</h1>
}

// Using it
<Greeting name="John" age={25} />
```

### State (Component Memory)
State lets a component "remember" things. When state changes, the component re-renders.

**Example:**
```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);  // count starts at 0
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

**Breaking it down:**
- `useState(0)` - Creates state variable starting at 0
- `count` - The current value
- `setCount` - Function to update the value
- When you call `setCount(5)`, React re-renders the component

### useEffect (Side Effects)
useEffect runs code when component loads or when something changes.

**Example:**
```jsx
import { useEffect } from 'react';

useEffect(() => {
  console.log('Component loaded!');
}, []); // Empty array [] = run once when component loads
```

Common uses:
- Fetch data from API when page loads
- Set up event listeners
- Update page title

---

## Project Structure

```
frontend/
├── public/              # Static files (images, icons)
├── src/
│   ├── main.jsx        # Entry point (starts the app)
│   ├── App.jsx         # Main app component (router goes here)
│   ├── index.css       # Global styles (Tailwind imports)
│   │
│   ├── pages/          # Full page components
│   │   ├── Home.jsx           ✅ DONE
│   │   ├── Login.jsx          ⏳ NEXT
│   │   ├── Signup.jsx         ⏳ TODO
│   │   ├── Events.jsx         ⏳ TODO
│   │   ├── EventDetails.jsx   ⏳ TODO
│   │   ├── MyRegistrations.jsx ⏳ TODO
│   │   ├── OrganizerDashboard.jsx ⏳ TODO
│   │   └── AdminDashboard.jsx ⏳ TODO
│   │
│   ├── components/     # Reusable UI pieces
│   │   ├── Navbar.jsx         ⏳ NEXT
│   │   ├── EventCard.jsx      ⏳ TODO
│   │   ├── Button.jsx         ⏳ TODO
│   │   └── ProtectedRoute.jsx ⏳ TODO
│   │
│   ├── context/        # Global state management
│   │   └── AuthContext.jsx    ⏳ TODO
│   │
│   └── utils/          # Helper functions
│       └── api.js             ⏳ TODO
│
├── package.json        # Dependencies list
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite build configuration
```

---

## What Each File Does

### main.jsx (Entry Point)
**Purpose:** Starts your React app
**You rarely touch this file**

```jsx
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
```

**What it does:**
1. Finds the `<div id="root">` in your HTML
2. Puts your React app inside it
3. Renders the `<App />` component

---

### App.jsx (Main Component)
**Purpose:** Controls which page to show based on URL

**Current (Simple):**
```jsx
import Home from './pages/Home'

function App() {
  return <Home />
}
```

**Future (With Router):**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/events" element={<Events />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Router Explanation:**
- `BrowserRouter` - Enables routing in your app
- `Routes` - Container for all routes
- `Route` - Defines a path and what to show
- `path="/"` - URL path (e.g., /login)
- `element={<Login />}` - Component to show

---

### index.css (Global Styles)
**Purpose:** Imports Tailwind CSS

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

These three lines give you all Tailwind classes.

---

### Tailwind CSS Classes Reference

**Common patterns you'll use:**

**Layout:**
- `flex` - Makes container flexible
- `flex-col` - Stack items vertically
- `justify-center` - Center horizontally
- `items-center` - Center vertically
- `space-x-4` - Add horizontal spacing between children
- `gap-4` - Add gap between grid/flex items

**Sizing:**
- `w-full` - Width 100%
- `h-screen` - Height = screen height
- `max-w-4xl` - Max width container
- `p-4` - Padding all sides (4 units = 16px)
- `px-4` - Padding left/right
- `py-4` - Padding top/bottom
- `m-4` - Margin (same pattern as padding)

**Text:**
- `text-xl` - Font size (xs, sm, base, lg, xl, 2xl, 3xl, 4xl...)
- `font-bold` - Bold text
- `text-center` - Center align text
- `text-white` - White text color

**Colors:**
- `bg-white` - White background
- `bg-black` - Black background
- `text-black` - Black text
- `border-black` - Black border

**Borders:**
- `border` - 1px border
- `border-2` - 2px border
- `border-t` - Top border only
- `border-b` - Bottom border only

**Interactivity:**
- `hover:bg-gray-100` - On hover, change background
- `cursor-pointer` - Show pointer cursor

**Grid:**
- `grid` - Enable CSS grid
- `grid-cols-3` - 3 columns
- `gap-4` - Gap between grid items

---

## Pages Built

### 1. Home.jsx ✅ COMPLETE
**URL:** `/`  
**Purpose:** Landing page - first thing users see

**Features:**
- Simple navbar with Login/Signup buttons
- Welcome message
- 3 info boxes explaining the platform

**Key Components:**
```jsx
function Home() {
  return (
    <div>
      {/* Navbar */}
      <nav>...</nav>
      
      {/* Main welcome box */}
      <div className="border-2 border-black">
        <h1>Welcome to Felicity</h1>
        <button>Browse Events</button>
      </div>
      
      {/* Info boxes */}
      <div className="grid grid-cols-3">
        <div>Events info</div>
        <div>Register info</div>
        <div>Profile info</div>
      </div>
    </div>
  )
}
```

**Tailwind Classes Used:**
- `min-h-screen bg-white` - Full height white background
- `border-2 border-black` - Simple black border
- `grid grid-cols-3 gap-4` - 3 column grid layout
- `hover:bg-gray-100` - Hover effect on buttons

---

## Components Built

*None yet - will be added as we build*

---

## API Integration

### Backend Endpoints Available

**Authentication:**
```
POST /api/auth/signup        - Register new participant
POST /api/auth/login         - Login participant
GET  /api/auth/profile       - Get participant profile
PUT  /api/auth/profile       - Update participant profile
```

**Organizers:**
```
POST /api/organizers/login   - Login organizer
GET  /api/organizers/profile - Get organizer profile
```

**Admin:**
```
POST /api/admin/login        - Login admin
GET  /api/admin/organizers   - List all organizers
```

**Events:**
```
GET  /api/events             - Get all events
GET  /api/events/:id         - Get single event
POST /api/events             - Create event (organizer)
PUT  /api/events/:id         - Update event (organizer)
DELETE /api/events/:id       - Delete event (organizer)
```

**Registrations:**
```
POST /api/registrations/events/:eventId  - Register for event
GET  /api/registrations/my-registrations - Get my registrations
DELETE /api/registrations/:id            - Cancel registration
```

### How to Make API Calls

**Example with axios:**
```jsx
import axios from 'axios';

// GET request
axios.get('http://localhost:4000/api/events')
  .then(response => {
    console.log(response.data); // Array of events
  })
  .catch(error => {
    console.error(error);
  });

// POST request
axios.post('http://localhost:4000/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
})
  .then(response => {
    console.log(response.data.token); // JWT token
  });
```

**With async/await (cleaner):**
```jsx
async function fetchEvents() {
  try {
    const response = await axios.get('http://localhost:4000/api/events');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

---

## Progress Tracker

### Phase 1: Basic Setup ✅ COMPLETE
- [x] Install Tailwind CSS
- [x] Create Home page
- [x] Basic layout working

### Phase 2: Navigation & Auth ✅ COMPLETE
- [x] Install React Router
- [x] Create Navbar component
- [x] Create Login page
- [x] Create Signup page
- [x] Connect Login to backend
- [x] Store JWT token
- [x] Create AuthContext (global user state)

### Phase 3: Events System ✅ COMPLETE
- [x] Events list page
- [x] Event card component
- [x] Event details page
- [x] Registration functionality
- [x] My Registrations page
- [x] QR code display

### Phase 4: Organizer Features (TODO)
- [ ] Organizer dashboard
- [ ] Create event form
- [ ] Manage events
- [ ] QR scanner component
- [ ] Attendance tracking
- [ ] Payment approval interface

### Phase 5: Admin Panel (TODO)
- [ ] Admin dashboard
- [ ] Manage organizers
- [ ] Password reset approvals

---

## Common Patterns You'll See

### 1. Fetching Data on Page Load
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch events when component loads
    axios.get('http://localhost:4000/api/events')
      .then(response => {
        setEvents(response.data);
        setLoading(false);
      });
  }, []); // Empty array = run once
  
  if (loading) return <p>Loading...</p>;
  
  return (
    <div>
      {events.map(event => (
        <div key={event._id}>
          <h2>{event.title}</h2>
        </div>
      ))}
    </div>
  )
}
```

### 2. Form Handling
```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    
    // Send to backend
    axios.post('http://localhost:4000/api/auth/login', {
      email,
      password
    })
    .then(response => {
      console.log('Logged in!', response.data);
    });
  }
  
  return (
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
      <button type="submit">Login</button>
    </form>
  )
}
```

### 3. Conditional Rendering
```jsx
function Profile() {
  const [user, setUser] = useState(null);
  
  // Show different things based on state
  if (!user) {
    return <p>Please login</p>
  }
  
  return (
    <div>
      <h1>Welcome {user.name}</h1>
    </div>
  )
}
```

---

## Debugging Tips

### 1. Check Browser Console
Press F12 in browser to see:
- Error messages
- console.log() output
- Network requests

### 2. Common Errors

**"Cannot read property of undefined"**
- Trying to access data that doesn't exist yet
- Solution: Add checks like `{user && user.name}`

**"Each child should have a key prop"**
- When mapping arrays, add `key={item.id}`
- Solution: `{items.map(item => <div key={item.id}>...)}`

**"CORS Error"**
- Backend not allowing frontend requests
- Solution: Add CORS to backend (already done in your case)

### 3. React DevTools
Install React DevTools browser extension to:
- Inspect component props
- View component state
- See component hierarchy

---

## Next Steps

1. ✅ Create this notes document
2. ⏳ Install React Router
3. ⏳ Build Navbar component
4. ⏳ Build Login page
5. ⏳ Connect login to backend

---

## Questions & Answers

**Q: When do I use `const` vs `let` vs `var`?**
A: Always use `const` unless you need to reassign. Never use `var`.

**Q: What's the difference between `{}` and `()`?**
A: 
- `{}` = Object or block of code
- `()` = Function call or grouping

**Q: Why do we use arrow functions `() =>`?**
A: Shorter syntax and they handle `this` keyword better.

**Q: What does `...` (spread operator) do?**
A: Copies an array/object. Example: `[...oldArray, newItem]`

---

**End of Notes - Will be updated as we build more!**
