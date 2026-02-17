const Event = require('../models/event');
const User = require('../models/user');
const Registration = require('../models/registration');
const organiser = require('../models/organiser');
const axios = require('axios');

// Helper function to compute event status based on current time
const computeEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    // Don't auto-update draft events
    if (event.status === 'draft') return event.status;
    
    // Auto-compute status based on time
    if (now < startDate) {
        return 'published'; // Upcoming
    } else if (now >= startDate && now <= endDate) {
        return 'ongoing';
    } else if (now > endDate) {
        return 'completed';
    }
    return event.status;
};

// Update event status if needed (mutates and saves)
const autoUpdateEventStatus = async (event) => {
    const computedStatus = computeEventStatus(event);
    if (event.status !== 'draft' && event.status !== computedStatus) {
        event.status = computedStatus;
        await event.save();
    }
    return event;
};

const createEvent = async (req,res) =>{
    try{
        const {name,description,eventType,eligibility,regDeadline,startDate,endDate,regLimit,regFee,tags,customForm,merchDetails} = req.body;
        
        if(!name || !description || !eventType || !regDeadline || !startDate || !endDate){
            return res.status(400).json({
                success:false,
                message:'Required fields missing'
            });
        }
        
        const newEvent = new Event({
            name,
            description,
            eventType,
            organizerId:req.userInfo.userId,
            eligibility:eligibility || 'all',
            regDeadline,
            startDate,
            endDate,
            regLimit:regLimit || 0,
            regFee:regFee || 0,
            tags:tags || [],
            customForm:customForm || {},
            merchDetails:merchDetails || {},
            status:'draft'
        });
        
        await newEvent.save();
        
        res.status(201).json({
            success:true,
            message:'Event created',
            event:newEvent
        });
    }
    catch(err){
        console.error('Event creation error:', err);
        res.status(500).json({
            success:false,
            message:'Server error',
            error: err.message
        });
    }
};

const getAllEvents = async (req,res) =>{
    try{
        const {status,eventType,search,followedOnly,eligibility,startDate,endDate} = req.query;
        
        let filter = {};
        
        if(status) filter.status = status;
        if(eventType) filter.eventType = eventType;
        if(eligibility) filter.eligibility = eligibility;
        if(search){
            filter.$or = [
                {name:{$regex:search,$options:'i'}},
                {description:{$regex:search,$options:'i'}}
            ];
        }
        if(startDate){
            filter.startDate = {$gte:new Date(startDate)};
        }
        if(endDate){
            filter.endDate = {$lte:new Date(endDate)};
        }
        
        if(followedOnly === 'true' && req.userInfo){
            const user = await User.findById(req.userInfo.userId);
            if(user && user.followedClubs && user.followedClubs.length > 0){
                filter.organizerId = {$in:user.followedClubs};
            }
        }
        
        const events = await Event.find(filter).populate('organizerId','name category').sort({createdAt:-1});
        
        // Auto-update status for each event based on current time
        const updatedEvents = await Promise.all(events.map(async (event) => {
            const computedStatus = computeEventStatus(event);
            if (event.status !== 'draft' && event.status !== computedStatus) {
                event.status = computedStatus;
                await event.save();
            }
            return event;
        }));
        
        res.json({
            success:true,
            count:updatedEvents.length,
            events: updatedEvents
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const getEventById = async (req,res) =>{
    try{
        let event = await Event.findById(req.params.id).populate('organizerId','name category aboutText publicContactEmail');
        
        if(!event){
            return res.status(404).json({
                success:false,
                message:'Event not found'
            });
        }
        
        // Auto-update status based on current time
        event = await autoUpdateEventStatus(event);
        
        res.json({
            success:true,
            event
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const updateEvent = async (req,res) =>{
    try{
        const event = await Event.findById(req.params.id);
        
        if(!event){
            return res.status(404).json({
                success:false,
                message:'Event not found'
            });
        }
        
        if(event.organizerId.toString() !== req.userInfo.userId){
            return res.status(403).json({
                success:false,
                message:'Not authorized'
            });
        }
        
        const {status,description,regDeadline,regLimit} = req.body;
        
        if(event.status === 'draft'){
            Object.assign(event,req.body);
        }
        else if(event.status === 'published'){
            if(description) event.description = description;
            if(regDeadline) event.regDeadline = regDeadline;
            if(regLimit) event.regLimit = regLimit;
            // Allow manual override to ongoing, completed, or closed
            if(status === 'ongoing' || status === 'completed' || status === 'closed') event.status = status;
        }
        else if(event.status === 'ongoing'){
            // Allow manual override to completed or closed
            if(status === 'completed' || status === 'closed') event.status = status;
        }
        else if(event.status === 'completed'){
            // Allow manual override to closed only
            if(status === 'closed') event.status = status;
        }
        const oldStatus = event.status;
        await event.save();
                if(req.body.status === 'published' && oldStatus !== 'published'){
            const org = await organiser.findById(event.organizerId);
            if(org && org.webhookUrl){
                try{
                    await axios.post(org.webhookUrl, {
                        content: `${event.name} is now live!\n${event.description}\nRegistration deadline: ${new Date(event.regDeadline).toLocaleDateString()}`
                    });
                }catch(e){
                    console.log('webhook failed',e.message);
                }
            }
        }
        
        res.json({
            success:true,
            message:'Event updated',
            event
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const deleteEvent = async (req,res) =>{
    try{
        const event = await Event.findById(req.params.id);
        
        if(!event){
            return res.status(404).json({
                success:false,
                message:'Event not found'
            });
        }
        
        if(event.organizerId.toString() !== req.userInfo.userId){
            return res.status(403).json({
                success:false,
                message:'Not authorized'
            });
        }
        
        await Event.findByIdAndDelete(req.params.id);
        
        res.json({
            success:true,
            message:'Event deleted'
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const getMyEvents = async (req,res) =>{
    try{
        const events = await Event.find({organizerId:req.userInfo.userId}).sort({createdAt:-1});
        
        res.json({
            success:true,
            count:events.length,
            events
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const getTrendingEvents = async(req,res) =>{
    try{
        const last24 = new Date(Date.now()-24*60*60*1000);
        const trending = await Registration.aggregate([
            {
                $match:{ createdAt:{$gte:last24}}
            },
            {
                $group:{
                    _id:"$eventId",
                    count :{$sum : 1}
                }
            },
            { $sort :{count : -1}},
            {$limit : 5}
        ]);
        const eventIDS = trending.map(e=>e._id);
        const events = await Event.find({_id:{$in:eventIDS}}).select('name startDate endDate');
        res.json({
            success:true,
            events
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message:'server error'
        })
    }
}


module.exports = {createEvent,getAllEvents,getEventById,updateEvent,deleteEvent,getMyEvents,getTrendingEvents};
