const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const AuthRoutes = require('./routes/AuthRoutes');
const OrganiserRoutes = require('./routes/OrganiserRoutes');
const AdminRoutes = require('./routes/AdminRoutes');
const EventRoutes = require('./routes/EventRoutes');
const RegistrationRoutes = require('./routes/RegistrationRoutes');
const MessageRoutes = require('./routes/MessageRoutes');

dotenv.config();
const connectdb = require('./config/db');
connectdb();

 
const app = express();
app.use(express.json());

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://dassasskjkjl.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use('/api/auth',AuthRoutes);
app.use('/api/organizers',OrganiserRoutes);
app.use('/api/admin',AdminRoutes);
app.use('/api/events',EventRoutes);
app.use('/api/registrations',RegistrationRoutes);
app.use('/api',MessageRoutes);


app.get('/',(req,res) => {
    res.json({
        message: 'HI',
        status: 'server running'
    });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server runs at ${PORT}`);
});

