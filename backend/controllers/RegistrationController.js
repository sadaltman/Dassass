const Registration = require('../models/registration');
const Event = require('../models/event');
const User = require('../models/user');
const QRCode = require('qrcode');
const {sendEmail} = require('../utils/email');

let nanoidFunc;

const getNanoid = async () =>{
    if(!nanoidFunc){
        const nanoidModule = await import('nanoid');
        nanoidFunc = nanoidModule.nanoid;
    }
    return nanoidFunc;
}

const registerForEvent = async (req,res) =>{
    try{
        const {eventId} = req.params;
        const {formData,merchVariant} = req.body || {};
        const userId = req.userInfo.userId;
        
        const event = await Event.findById(eventId);
        if(!event){
            return res.status(404).json({
                success:false,
                message:'Event not found'
            });
        }
        
        if(event.status !== 'published'){
            return res.status(400).json({
                success:false,
                message:'Event not open for registration'
            });
        }
        
        if(new Date() > new Date(event.regDeadline)){
            return res.status(400).json({
                success:false,
                message:'Registration deadline passed'
            });
        }
        
        if(event.regLimit > 0 && event.currentRegistrations >= event.regLimit){
            return res.status(400).json({
                success:false,
                message:'Registration limit reached'
            });
        }
        
        const user = await User.findById(userId);
        if(event.eligibility === 'iiit-only' && user.participantType !== 'iiit'){
            return res.status(403).json({
                success:false,
                message:'Only IIIT students can register'
            });
        }
        
        const existingReg = await Registration.findOne({eventId,userId});
        if(existingReg){
            return res.status(400).json({
                success:false,
                message:'Already registered'
            });
        }
            if(event.eventType === 'merchandise'){
            if(!merchVariant){
            return res.status(400).json({
                    success:false,
                    message : "Merch variant required"
                })
            }
            const variant = event.merchDetails.variants.find(v => v.name === merchVariant);
            if(!variant){
                return res.status(400).json({
                    success:false,
                    message : "Merch variant invalid"
                })
            }
            if(variant.stock <= 0){
                return res.status(400).json({
                    success:false,
                    message : "Out of stock"
                })
            }
        }

        if(event.eventType === 'merchandise'){
            const {paymentProof} = req.body;
            if(!paymentProof){
                return res.status(400).json({
                    success:false,
                    message:'Payment proof required for merchandise'
                });
            }
            
            const registration = new Registration({
                eventId,
                userId,
                registrationType:'merchandise',
                formData:formData || {},
                merchVariant:merchVariant,
                status:'pending',
                paymentStatus:'pending',
                paymentProof
            });
            
            await registration.save();
            
            event.currentRegistrations += 1;
            await event.save();
            
            return res.status(201).json({
                success:true,
                message:'Order placed. Waiting for payment approval.',
                registration:{
                    id:registration._id,
                    status:'pending',
                    paymentStatus:'pending'
                }
            });
        }
        const nanoid = await getNanoid();
        const ticketId = nanoid(12);
        
        const qrData = JSON.stringify({
            ticketId:ticketId,
            eventId:eventId,
            userId:userId,
            eventName:event.name,
            userName:`${user.firstName} ${user.lastName}`
        });
        const qrCodeUrl = await QRCode.toDataURL(qrData);
        const registration = new Registration({
            eventId,
            userId,
            registrationType:'normal',
            formData:formData || {},
            ticketId,
            qrCode:qrCodeUrl,
            status:'confirmed',
            paymentStatus:'approved'
        });
        
        await registration.save();
        
        event.currentRegistrations += 1;
        await event.save();
        
        const populatedReg = await Registration.findById(registration._id)
            .populate('eventId','name startDate endDate')
            .populate('userId','firstName lastName email');
        
        res.status(201).json({
            success:true,
            message:'Registration successful',
            registration:populatedReg,
            ticket:{
                ticketId:ticketId,
                qrCode:qrCodeUrl
            }
        });
        sendEmail(
    user.email,
    `${user.firstName} ${user.lastName}`,
    event.name,
    ticketId,
    qrCodeUrl
);
    }
    catch(err){
        console.log('Registration error:', err);
        res.status(500).json({
            success:false,
            message:'Server error: ' + err.message
        });
    }
};

const getMyRegistrations = async (req,res) =>{
    try{
        const userId = req.userInfo.userId;
        
        const registrations = await Registration.find({userId})
            .populate('eventId','name description startDate endDate status')
            .sort({createdAt:-1});
        
        res.json({
            success:true,
            count:registrations.length,
            registrations
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const getRegistrationById = async (req,res) =>{
    try{
        const {id} = req.params;
        const userId = req.userInfo.userId;
        
        const registration = await Registration.findOne({_id:id,userId})
            .populate('eventId','name description startDate endDate organizerId')
            .populate('userId','firstName lastName email participantType');
        
        if(!registration){
            return res.status(404).json({
                success:false,
                message:'Registration not found'
            });
        }
        
        res.json({
            success:true,
            registration
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const cancelRegistration = async (req,res) =>{
    try{
        const {id} = req.params;
        const userId = req.userInfo.userId;
        
        const registration = await Registration.findOne({_id:id,userId});
        if(!registration){
            return res.status(404).json({
                success:false,
                message:'Registration not found'
            });
        }
        
        if(registration.status === 'cancelled'){
            return res.status(400).json({
                success:false,
                message:'Already cancelled'
            });
        }
        registration.status = 'cancelled';
        await registration.save();
        const event = await Event.findById(registration.eventId);
        if(event){
            if(registration.registrationType === 'merchandise' && registration.merchVariant){
                const variant = event.merchDetails.variants.find(v => v.name === registration.merchVariant);
                if(variant) variant.stock++;
            }
            event.currentRegistrations = Math.max(0,event.currentRegistrations - 1);
            await event.save();
        }
        
        res.json({
            success:true,
            message:'Registration cancelled'
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const getEventRegistrations = async (req,res) =>{
    try{
        const {eventId} = req.params;
        const organizerId = req.userInfo.userId;
        
        const event = await Event.findOne({_id:eventId,organizerId});
        if(!event){
            return res.status(404).json({
                success:false,
                message:'Event not found or not authorized'
            });
        }
        
        const registrations = await Registration.find({eventId})
            .populate('userId','firstName lastName email contactNumber participantType')
            .sort({createdAt:-1});
        
        res.json({
            success:true,
            count:registrations.length,
            registrations
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const validateQR = async (req,res) =>{
    try{
        const {ticketId} = req.body;
        const organizerId = req.userInfo.userId;
        
        if(!ticketId){
            return res.status(400).json({
                success:false,
                message:'Ticket ID required'
            });
        }
        const registration = await Registration.findOne({ticketId})
            .populate('userId','firstName lastName email')
            .populate('eventId','name startDate organizerId');
        if(!registration){
            return res.status(404).json({
                success:false,
                message:'Invalid ticket'
            });
        }
        if(registration.eventId.organizerId.toString() !== organizerId){
            return res.status(403).json({
                success:false,
                message:'Not authorized for this event'
            });
        }
        if(registration.status === 'cancelled'){
            return res.status(400).json({
                success:false,
                message:'Registration was  cancelled'
            });
        }
        res.json({
            success:true,
            valid:true,
            alreadyScanned: registration.attended,
            scannedAt: registration.attendedAt,
            participant:{
                name:`${registration.userId.firstName} ${registration.userId.lastName}`,
                email:registration.userId.email
            },
            event:{
                name:registration.eventId.name,
                date:registration.eventId.startDate
            },
            registrationId:registration._id
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const markAttendance = async (req,res) =>{
    try{
        const {id} = req.params;
        const {manualOverride, reason} = req.body || {};
        const organizerId = req.userInfo.userId;
        const registration = await Registration.findById(id).populate('eventId','organizerId name');
        if(!registration){
            return res.status(404).json({
                success:false,
                message:'Registration not found'
            });
        }
        if(registration.eventId.organizerId.toString() !== organizerId){
            return res.status(403).json({
                success:false,
                message:'Not authorized'
            });
        }
        
        // If already attended and not manual override, reject duplicate
        if(registration.attended && !manualOverride){
            return res.status(400).json({
                success:false,
                message:`Already scanned at ${registration.attendedAt.toLocaleString()}`
            });
        }
        
        registration.attended = true;
        registration.attendedAt = new Date();
        
        // Audit log for manual override
        if(manualOverride){
            registration.manualOverride = true;
            registration.overrideReason = reason || 'Manual check-in by organizer';
            registration.overrideBy = organizerId;
            console.log(`[AUDIT] Manual attendance override for registration ${id} by organizer ${organizerId}. Reason: ${reason || 'Not specified'}`);
        }
        
        await registration.save();
        res.json({
            success:true,
            message: manualOverride ? 'Manual attendance override applied' : 'Attendance marked',
            attendedAt:registration.attendedAt,
            manualOverride: manualOverride || false
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const getAttendanceStats = async (req,res) =>{
    try{
        const {eventId} = req.params;
        const organizerId = req.userInfo.userId;
        const event = await Event.findOne({_id:eventId,organizerId});
        if(!event){
            return res.status(404).json({
                success:false,
                message:'Event not found or not authorized'
            });
        }
        const registrations = await Registration.find({eventId}).populate('userId','firstName lastName email');
        const attended = registrations.filter(r => r.attended);
        const notAttended = registrations.filter(r => !r.attended);
        
        res.json({
            success:true,
            total:registrations.length,
            attendedCount:attended.length,
            notAttendedCount:notAttended.length,
            attendedList:attended.map(r => ({
                name:`${r.userId.firstName} ${r.userId.lastName}`,
                email:r.userId.email,
                ticketId:r.ticketId,
                attendedAt:r.attendedAt
            })),
            pendingList:notAttended.map(r => ({
                name:`${r.userId.firstName} ${r.userId.lastName}`,
                email:r.userId.email,
                ticketId:r.ticketId
            }))
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const manualAttendance = async (req,res) =>{
    try{
        const {id} = req.params;
        const {attended,reason} = req.body;
        const organizerId = req.userInfo.userId;
        const registration = await Registration.findById(id).populate('eventId','organizerId');
        if(!registration){
            return res.status(404).json({
                success:false,
                message:'Registration not found'
            });
        }
        if(registration.eventId.organizerId.toString() !== organizerId){
            return res.status(403).json({
                success:false,
                message:'Not authorized'
            });
        }
        registration.attended = attended;
        if(attended){
            registration.attendedAt = new Date();
        }else{
            registration.attendedAt = null;
        }
        await registration.save();
        console.log(`Manual attendance by organizer ${organizerId}: registration ${id}, attended=${attended}, reason: ${reason}`);
        res.json({
            success:true,
            message:'Attendance updated manually'
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const getPendingPayments = async (req,res) =>{
    try{
        const organizerId = req.userInfo.userId;
        const events = await Event.find({organizerId});
        const eventIds = events.map(e => e._id);
        
        const pendingOrders = await Registration.find({
            eventId:{$in:eventIds},
            registrationType:'merchandise',
            paymentStatus:'pending'
        })
        .populate('userId','firstName lastName email')
        .populate('eventId','name')
        .sort({createdAt:-1});
        
        res.json({
            success:true,
            count:pendingOrders.length,
            orders:pendingOrders.map(o => ({
                id:o._id,
                participant:{
                    name:`${o.userId.firstName} ${o.userId.lastName}`,
                    email:o.userId.email
                },
                event:o.eventId.name,
                variant:o.merchVariant,
                paymentProof:o.paymentProof,
                status:o.paymentStatus,
                createdAt:o.createdAt
            }))
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const approvePayment = async (req,res) =>{
    try{
        const {id} = req.params;
        const organizerId = req.userInfo.userId;
        
        const registration = await Registration.findById(id).populate('eventId')
            .populate('userId');
        if(!registration){
            return res.status(404).json({
                success:false,
                message:'Order not found'
            });
        }
        if(registration.eventId.organizerId.toString() !== organizerId){
            return res.status(403).json({
                success:false,
                message:'Not authorized'
            });
        }
        
        if(registration.paymentStatus !== 'pending'){
            return res.status(400).json({
                success:false,
                message:'Payment already processed'
            });
        }
        
        const event = registration.eventId;
        const variant = event.merchDetails.variants.find(v => v.name === registration.merchVariant);
        
        if(!variant || variant.stock <= 0){
            return res.status(400).json({
                success:false,
                message:'Out of stock'
            });
        }
        
        const nanoid = await getNanoid();
        const ticketId = nanoid(12);
        
        const qrData = JSON.stringify({
            ticketId,
            eventId:event._id,
            userId:registration.userId._id,
            eventName:event.name,
            userName:`${registration.userId.firstName} ${registration.userId.lastName}`
        });
        const qrCodeUrl = await QRCode.toDataURL(qrData);
        
        registration.paymentStatus = 'approved';
        registration.status = 'confirmed';
        registration.ticketId = ticketId;
        registration.qrCode = qrCodeUrl;
        await registration.save();
        
        variant.stock--;
        await event.save();
        sendEmail(
            registration.userId.email,
            `${registration.userId.firstName} ${registration.userId.lastName}`,
            event.name,
            ticketId,
            qrCodeUrl
        );
        
        res.json({
            success:true,
            message:'Payment approved and ticket generated'
        });
    }
    catch(err){
        console.log('Approve payment error:',err);
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const rejectPayment = async (req,res) =>{
    try{
        const {id} = req.params;
        const {reason} = req.body;
        const organizerId = req.userInfo.userId;
        
        const registration = await Registration.findById(id).populate('eventId','organizerId');
        
        if(!registration){
            return res.status(404).json({
                success:false,
                message:'Order not found'
            });
        }
        
        if(registration.eventId.organizerId.toString() !== organizerId){
            return res.status(403).json({
                success:false,
                message:'Not authorized'
            });
        }
        
        if(registration.paymentStatus !== 'pending'){
            return res.status(400).json({
                success:false,
                message:'Payment already processed'
            });
        }
        
        registration.paymentStatus = 'rejected';
        registration.status = 'rejected';
        registration.rejectionReason = reason || 'Payment verification failed';
        await registration.save();
        
        res.json({
            success:true,
            message:'Payment rejected'
        });
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const exportToCalendar = async (req,res) =>{
    try{
        const {id} = req.params;
        const userId = req.userInfo.userId;
        
        const registration = await Registration.findOne({_id:id,userId})
            .populate('eventId','name description startDate endDate');
        
        if(!registration){
            return res.status(404).json({
                success:false,
                message:'Registration not found'
            });
        }
        
        const event = registration.eventId;
        const start = new Date(event.startDate).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        const end = new Date(event.endDate).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        
        const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Felicity//Event//EN
BEGIN:VEVENT
UID:${registration._id}@felicity
DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.name}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`;
        
        res.setHeader('Content-Type','text/calendar');
        res.setHeader('Content-Disposition',`attachment; filename="${event.name}.ics"`);
        res.send(ics);
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

module.exports = {registerForEvent,getMyRegistrations,getRegistrationById,cancelRegistration,getEventRegistrations,validateQR,markAttendance,getAttendanceStats,manualAttendance,getPendingPayments,approvePayment,rejectPayment,exportToCalendar};
