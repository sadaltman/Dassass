const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Organiser = require('../models/organiser');

dotenv.config();

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.log('Connection failed:', error.message);
        process.exit(1);
    }
}

const createOrganizer = async () => {
    try {
        await connectdb();
        
        const organizerEmail = 'organizer@felicity.com';
        const organizerPass = 'organizer123';
        const organizerName = 'Test Organizer';
        
        const exists = await Organiser.findOne({ loginEmail: organizerEmail });
        if (exists) {
            console.log('Organizer already exists!');
            console.log('Email:', organizerEmail);
            console.log('Password:', organizerPass);
            process.exit(0);
        }
        
        const hashed = await bcrypt.hash(organizerPass, 10);
        
        const newOrganizer = new Organiser({
            name: organizerName,
            loginEmail: organizerEmail,
            hashedPassword: hashed,
            description: 'Test organizer account',
            category: 'Technical',
            contactEmail: organizerEmail,
            active: true
        });
        
        await newOrganizer.save();
        
        console.log('Organizer created successfully!');
        console.log('Email:', organizerEmail);
        console.log('Password:', organizerPass);
        
        process.exit(0);
    } catch (err) {
        console.log('Error:', err.message);
        process.exit(1);
    }
}

createOrganizer();
