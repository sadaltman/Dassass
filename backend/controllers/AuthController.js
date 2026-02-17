const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, participantType, contactNumber, collegeName } = req.body;

        if (!firstName || !lastName || !email || !password || !participantType) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (participantType === 'iiit') {
            if (!email.endsWith('@iiit.ac.in')) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'IIIT students must use @iiit.ac.in email' 
                });
            }
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            participantType,
            contactNumber: contactNumber || '',
            collegeName: collegeName || ''
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, userType: 'participant' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, userType: 'participant' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                participantType: user.participantType
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const getProfile = async (req,res) =>{
    try{
        const user = await User.findById(req.userInfo.userId).select('-password');
        if(!user){
            return res.status(404).json({
                success:false,
                message:'User not found'
            });
        }
        res.json({
            success:true,
            user
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const updateProfile = async (req,res) =>{
    try{
        const user = await User.findById(req.userInfo.userId);
        if(!user){
            return res.status(404).json({
                success:false,
                message:'User not found'
            });
        }
        
        const {firstName,lastName,contactNumber,collegeName,interests} = req.body;
        
        if(firstName) user.firstName = firstName;
        if(lastName) user.lastName = lastName;
        if(contactNumber !== undefined) user.contactNumber = contactNumber;
        if(collegeName !== undefined) user.collegeName = collegeName;
        if(interests) user.interests = interests;
        
        await user.save();
        
        res.json({
            success:true,
            message:'Profile updated',
            user:{
                id:user._id,
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                contactNumber:user.contactNumber,
                collegeName:user.collegeName,
                interests:user.interests,
                participantType:user.participantType
            }
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const changePassword = async (req,res) =>{
    try{
        const {currentPassword,newPassword} = req.body;
        
        if(!currentPassword || !newPassword){
            return res.status(400).json({
                success:false,
                message:'Current and new password required'
            });
        }
        
        const user = await User.findById(req.userInfo.userId);
        if(!user){
            return res.status(404).json({
                success:false,
                message:'User not found'
            });
        }
        
        const match = await bcrypt.compare(currentPassword,user.password);
        if(!match){
            return res.status(401).json({
                success:false,
                message:'Current password incorrect'
            });
        }
        
        user.password = await bcrypt.hash(newPassword,10);
        await user.save();
        
        res.json({
            success:true,
            message:'Password changed successfully'
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const followOrganizer = async (req,res) =>{
    try{
        const user = await User.findById(req.userInfo.userId);
        if(!user){
            return res.status(404).json({
                success:false,
                message:'User not found'
            });
        }
        
        const organizerId = req.params.organizerId;
        
        if(user.followedClubs.includes(organizerId)){
            return res.status(400).json({
                success:false,
                message:'Already following'
            });
        }
        
        user.followedClubs.push(organizerId);
        await user.save();
        
        res.json({
            success:true,
            message:'Now following organizer'
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const unfollowOrganizer = async (req,res) =>{
    try{
        const user = await User.findById(req.userInfo.userId);
        if(!user){
            return res.status(404).json({
                success:false,
                message:'User not found'
            });
        }
        
        const organizerId = req.params.organizerId;
        
        user.followedClubs = user.followedClubs.filter(id => id.toString() !== organizerId);
        await user.save();
        
        res.json({
            success:true,
            message:'Unfollowed organizer'
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

module.exports = { register,login,getProfile,updateProfile,changePassword,followOrganizer,unfollowOrganizer };