const organiser = require('../models/organiser');
const Event = require('../models/event');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const registration = require('../models/registration');
const PasswordResetRequest = require('../models/passwordReset');

const login = async (req,res) =>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message : 'Email + password needed'
            })
        }
        const orga = await organiser.findOne({loginEmail: email});
        if(!orga){
            return res.status(401).json({
                success:false,
                message:'Invalid Creds'
            })
        }
        if(!orga.active){
            return res.status(401).json({
                success:false,
                message:'Account disabled Ask permission'
            })
        }
        const match = await bcrypt.compare(password,orga.hashedPassword);
        if(!match){
            return res.status(401).json({
                success:false,
                message:'Invalid Creds'
            })
        }
        
        const token = jwt.sign(
            { userId: orga._id, email: orga.loginEmail, userType: 'organizer' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            organizer: {
                id: orga._id,
                name: orga.name,
                loginEmail: orga.loginEmail,
                category: orga.category
            }
        });
    }
    catch (err){
        return res.status(500).json({
            success:false,
            message: 'Server Error'
        })
    }
}

const getProfile = async (req,res) =>{
    try{
        const org = await organiser.findById(req.userInfo.userId).select('-hashedPassword');
        if(!org){
            return res.status(404).json({
                success:false,
                message:'No organiser'
            });
        }
        res.json({
            success:true,
            organizer:org
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const updateProfile = async (req,res) =>{
    try{
        const org = await organiser.findById(req.userInfo.userId);
        if(!org){
            return res.status(404).json({
                success:false,
                message:'No Organiser'
            });
        }
        
        const {name,category,aboutText,publicContactEmail,phoneNumber,webhookUrl} = req.body;
        
        if(name) org.name = name;
        if(category) org.category = category;
        if(aboutText !== undefined) org.aboutText = aboutText;
        if(publicContactEmail !== undefined) org.publicContactEmail = publicContactEmail;
        if(phoneNumber !== undefined) org.phoneNumber = phoneNumber;
        if(webhookUrl !== undefined) org.webhookUrl = webhookUrl;
        
        await org.save();
        
        res.json({
            success:true,
            message:'Profile updated',
            organizer:{
                id:org._id,
                name:org.name,
                category:org.category,
                aboutText:org.aboutText,
                publicContactEmail:org.publicContactEmail,
                phoneNumber:org.phoneNumber,
                webhookUrl:org.webhookUrl
            }
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Server Error'
        });
    }
};

const getAllOrganizers = async (req,res) =>{
    try{
        const orgs = await organiser.find({active:true}).select('name category aboutText publicContactEmail phoneNumber');
        res.json({
            success:true,
            count:orgs.length,
            organizers:orgs
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Server Error'
        });
    }
};

const getOrganizerById = async (req,res) =>{
    try{
        const org = await organiser.findOne({_id:req.params.id,active:true}).select('name category aboutText publicContactEmail phoneNumber');
        if(!org){
            return res.status(404).json({
                success:false,
                message:'Organizer not found'
            });
        }
        
        const events = await Event.find({organizerId:req.params.id,status:{$in:['published','ongoing','completed']}}).select('name eventType status startDate endDate');
        
        res.json({
            success:true,
            organizer:org,
            events
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Server Error'
        });
    }
};


const getEventCsv = async (req,res) => {
    try{
        const eventId = req.params.eventId;
        const organizerId = req.userInfo.userId;
        const event = await Event.findOne({_id:eventId,organizerId});
        if(!event){
            return res.status(400).json({
                success: false,
                message : "Event not found / not authorised"
            })
        }
        const registrations = await registration.find({eventId}).populate("userId","firstName lastName email contactNumber")
        .sort({createdAt : 1});
        let csv = "Name,Email,Phone,TicketId,Status,RegisteredAt\n";
        registrations.forEach(reg => {
            const user = reg.userId;
            const name = `"${user.firstName} ${user.lastName}"`;
            const email = user.email || "";
            const phone = user.contactNumber || "";
            const ticketId = reg.ticketId || "";
            const status = reg.status || "";
            const registeredAt = reg.createdAt
                ? new Date(reg.createdAt).toISOString()
                : "";

            csv += `${name},${email},${phone},${ticketId},${status},${registeredAt}\n`;
        });
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${event.name}-registrations.csv"`
        );
        res.status(200).send(csv);

    }
    catch (err){
        return res.status(400).json({
            success:false,
            messgae: 'Server error'
        })
    }
}

const getAnalytics = async (req,res) =>{
    try{
        const organizerId = req.userInfo.userId;
        const events = await Event.find({organizerId});
        let revenue = 0;
        let totalRegs = 0;
        let attend = 0;
        for(let evt of events){
            const eventRegs = await registration.find({eventId:evt._id});
            totalRegs += eventRegs.length;
            revenue += eventRegs.filter(r => r.paymentStatus === 'approved').length * evt.regFee;
            attend += eventRegs.filter(r => r.attended).length;
        }
        
        res.json({
            success:true,
            analytics:{
                totalEvents: events.length,
                totalRegistrations: totalRegs,
                totalRevenue: revenue,
                totalAttended: attend,
                events: events.map(e => ({
                    name: e.name,
                    registrations: e.currentRegistrations,
                    revenue: e.currentRegistrations * e.regFee
                }))
            }
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

const requestPasswordReset = async (req,res) =>{
    try{
        const {reason} = req.body;
        const organizerId = req.userInfo.userId;
        
        if(!reason){
            return res.status(400).json({
                success:false,
                message:'Reason required'
            });
        }
        
        const request = new PasswordResetRequest({
            organizerId,
            reason,
            status:'pending'
        });
        
        await request.save();
        
        res.json({
            success:true,
            message:'Password reset request submitted'
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Server error'
        });
    }
};

module.exports = { login,getProfile,updateProfile,getAllOrganizers,getOrganizerById,getEventCsv,getAnalytics,requestPasswordReset };