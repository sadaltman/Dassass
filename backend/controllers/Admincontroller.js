const Admin = require('../models/admin');
const organiser = require('../models/organiser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PasswordResetRequest = require('../models/passwordReset');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password required'
            });
        }
        const admin = await Admin.findOne({ emailAddress: email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const match = await bcrypt.compare(password, admin.hashedPassword);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { userId: admin._id, email: admin.emailAddress, userType: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Admin login successful',
            token,
            admin: {
                id: admin._id,
                email: admin.emailAddress
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const createOrganizer = async (req, res) => {
    try {
        const { name, loginEmail, password, category } = req.body;

        if (!name || !loginEmail || !password || !category) {
            return res.status(400).json({
                success: false,
                message: 'All fields required: name, login email, password, category'
            });
        }

        const existing = await organiser.findOne({ loginEmail });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Organizer with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const neworg = new organiser({
            name,
            loginEmail,
            hashedPassword,
            category,
            active: true
        });

        await neworg.save();

        return res.status(201).json({
            success: true,
            message: 'Organizer created successfully',
            organizer: {
                id: neworg._id,
                name: neworg.name,
                loginEmail: neworg.loginEmail,
                category: neworg.category
            },
            credentials: {
                loginEmail: neworg.loginEmail,
                password: password
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const deleteOrganizer = async (req, res) => {
    try {
        const { id } = req.params;

        const org = await organiser.findById(id);
        if (!org) {
            return res.status(404).json({
                success: false,
                message: 'Organizer not found'
            });
        }

        // Cascade delete: Delete all events by this organizer
        const Event = require('../models/event');
        const Registration = require('../models/registration');
        
        // Get all events by this organizer
        const events = await Event.find({ organizerId: id });
        const eventIds = events.map(e => e._id);
        
        // Delete all registrations for these events
        await Registration.deleteMany({ eventId: { $in: eventIds } });
        
        // Delete all events
        await Event.deleteMany({ organizerId: id });
        
        // Delete password reset requests
        await PasswordResetRequest.deleteMany({ organizerId: id });
        
        // Delete the organizer
        await organiser.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Organizer and all associated data deleted successfully'
        });
    } catch (err) {
        console.error('Delete organizer error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const listOrganizers = async (req, res) => {
    try {
        const orgs = await organiser.find().select('-hashedPassword');
        return res.json({
            success: true,
            count: orgs.length,
            organizers: orgs
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const toggleOrganizerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const org = await organiser.findById(id);
        if (!org) {
            return res.status(404).json({
                success: false,
                message: 'Organizer not found'
            });
        }
        
        org.active = !org.active;
        await org.save();
        
        return res.json({
            success: true,
            message: org.active ? 'Organizer activated' : 'Organizer deactivated',
            organizer: {
                id: org._id,
                name: org.name,
                active: org.active
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getPasswordResets = async (req,res) =>{
    try{
        const requests = await PasswordResetRequest.find()
            .populate('organizerId','name loginEmail')
            .sort({createdAt:-1});
        
        res.json({
            success:true,
            requests:requests.map(r => ({
                id:r._id,
                organizer:{
                    id:r.organizerId._id,
                    name:r.organizerId.name,
                    email:r.organizerId.loginEmail
                },
                reason:r.reason,
                status:r.status,
                adminComment:r.adminComment,
                newPassword:r.newPassword,
                createdAt:r.createdAt
            }))
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const approvePasswordReset = async (req,res) =>{
    try{
        const {id} = req.params;
        const {comment} = req.body;
        
        const request = await PasswordResetRequest.findById(id);
        if(!request){
            return res.status(404).json({
                success:false,
                message:'Request not found'
            });
        }
        
        if(request.status !== 'pending'){
            return res.status(400).json({
                success:false,
                message:'Request already processed'
            });
        }
        
        const newPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(newPassword,10);
        
        const org = await organiser.findById(request.organizerId);
        org.hashedPassword = hashedPassword;
        await org.save();
        
        request.status = 'approved';
        request.adminComment = comment;
        request.newPassword = newPassword;
        await request.save();
        
        res.json({
            success:true,
            message:'Password reset approved',
            newPassword
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const rejectPasswordReset = async (req,res) =>{
    try{
        const {id} = req.params;
        const {comment} = req.body;
        
        const request = await PasswordResetRequest.findById(id);
        if(!request){
            return res.status(404).json({
                success:false,
                message:'Request not found'
            });
        }
        
        if(request.status !== 'pending'){
            return res.status(400).json({
                success:false,
                message:'Request already processed'
            });
        }
        
        request.status = 'rejected';
        request.adminComment = comment || 'Request denied';
        await request.save();
        
        res.json({
            success:true,
            message:'Request rejected'
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

module.exports = { login, createOrganizer, deleteOrganizer, listOrganizers, toggleOrganizerStatus,getPasswordResets,approvePasswordReset,rejectPasswordReset };
