const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin');
dotenv.config();
const connectdb = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('mongodb connect');
    }
    catch (error){
        console.log('failed',error.message);
        process.exit(1);
    }
}

const createAdmin = async () =>{
    try{
        await connectdb();
        
        const adminemail = 'admin1@felicity.com';
        const adminpass = 'admin123';
        
        const exists = await Admin.findOne({emailAddress:adminemail});
        if(exists){
            console.log('Admin already there');
            process.exit(0);
        }
        
        const hashed = await bcrypt.hash(adminpass,10);
        
        const newadmin = new Admin({
            emailAddress:adminemail,
            hashedPassword:hashed
        });
        
        await newadmin.save();
        
        console.log('Admin made successfully!');
        console.log('Email:',adminemail);
        console.log('Password:',adminpass);
        
        process.exit(0);
    }
    catch(err){
        console.log('Error:',err.message);
        process.exit(1);
    }
}

createAdmin();
