const EventMessage = require('../models/eventMessage');
const Event = require('../models/event');
const Registration = require('../models/registration');

const postMessage = async (req,res) =>{
    try{
        const {eventId} = req.params;
        const {message,parentId} = req.body;
        const userId = req.userInfo.userId;
        
        if(!message){
            return res.status(400).json({
                success:false,
                message:'Message required'
            });
        }
        
        // Check if user is registered participant OR event organizer
        const event = await Event.findById(eventId);
        const registration = await Registration.findOne({eventId,userId});
        const isOrganizer = event && event.organizerId.toString() === userId;
        
        if(!registration && !isOrganizer){
            return res.status(403).json({
                success:false,
                message:'Must be registered or organizer to post'
            });
        }
        
        const msg = new EventMessage({
            eventId,
            userId,
            message,
            parentId: parentId || null
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

const reactToMessage = async (req,res) =>{
    try{
        const {id} = req.params;
        const {emoji} = req.body;
        const userId = req.userInfo.userId;
        
        if(!emoji){
            return res.status(400).json({
                success:false,
                message:'Emoji required'
            });
        }
        
        const msg = await EventMessage.findById(id);
        if(!msg){
            return res.status(404).json({
                success:false,
                message:'Message not found'
            });
        }
        
        // Toggle reaction: remove if exists, add if not
        const existingIdx = msg.reactions.findIndex(
            r => r.userId.toString() === userId && r.emoji === emoji
        );
        
        if(existingIdx >= 0){
            msg.reactions.splice(existingIdx,1);
        } else {
            msg.reactions.push({userId,emoji});
        }
        
        await msg.save();
        
        res.json({
            success:true,
            message:'Reaction updated',
            reactions:msg.reactions
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

module.exports = {postMessage,getMessages,deleteMessage,pinMessage,reactToMessage};
