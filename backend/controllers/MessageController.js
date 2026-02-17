const EventMessage = require('../models/eventMessage');
const Event = require('../models/event');
const Registration = require('../models/registration');

const postMessage = async (req,res) =>{
    try{
        const {eventId} = req.params;
        const {message} = req.body;
        const userId = req.userInfo.userId;
        
        if(!message){
            return res.status(400).json({
                success:false,
                message:'Message required'
            });
        }
        
        const registration = await Registration.findOne({eventId,userId});
        if(!registration){
            return res.status(403).json({
                success:false,
                message:'Must be registered to post'
            });
        }
        
        const msg = new EventMessage({
            eventId,
            userId,
            message
        });
        
        await msg.save();
        
        const populated = await EventMessage.findById(msg._id)
            .populate('userId','firstName lastName');
        
        res.status(201).json({
            success:true,
            message:populated
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const getMessages = async (req,res) =>{
    try{
        const {eventId} = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        
        const messages = await EventMessage.find({eventId})
            .populate('userId','firstName lastName')
            .sort({pinned:-1,createdAt:-1})
            .skip((page-1)*limit)
            .limit(limit);
        
        const total = await EventMessage.countDocuments({eventId});
        
        res.json({
            success:true,
            messages,
            pagination:{
                page,
                limit,
                total,
                pages:Math.ceil(total/limit)
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

const deleteMessage = async (req,res) =>{
    try{
        const {id} = req.params;
        const organizerId = req.userInfo.userId;
        
        const msg = await EventMessage.findById(id).populate('eventId','organizerId');
        if(!msg){
            return res.status(404).json({
                success:false,
                message:'Message not found'
            });
        }
        
        if(msg.eventId.organizerId.toString() !== organizerId){
            return res.status(403).json({
                success:false,
                message:'Not authorized'
            });
        }
        
        await EventMessage.findByIdAndDelete(id);
        
        res.json({
            success:true,
            message:'Message deleted'
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const pinMessage = async (req,res) =>{
    try{
        const {id} = req.params;
        const {pinned} = req.body;
        const organizerId = req.userInfo.userId;
        
        const msg = await EventMessage.findById(id).populate('eventId','organizerId');
        if(!msg){
            return res.status(404).json({
                success:false,
                message:'Message not found'
            });
        }
        
        if(msg.eventId.organizerId.toString() !== organizerId){
            return res.status(403).json({
                success:false,
                message:'Not authorized'
            });
        }
        
        msg.pinned = pinned;
        await msg.save();
        
        res.json({
            success:true,
            message:'Message updated'
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

module.exports = {postMessage,getMessages,deleteMessage,pinMessage};
