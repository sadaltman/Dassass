const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/user');
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
  credentials: true
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

app.get('/api/test',(req,res) =>{
    res.json({
        success:true,
        message: 'Api works'
    });
});
app.get('/api/test-user', async (req, res) => {
    try {
        const testUser = new User({
            firstName: 'Sahaj',
            lastName: 'Test',
            email: 'test@iiit.ac.in',
            password: 'temp123',
            role: 'participant',
            participantType: 'iiit'
        });
        await testUser.save();
        res.json({ success: true, user: testUser });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server runs at ${PORT}`);
});

