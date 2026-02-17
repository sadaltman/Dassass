const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    eventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    registrationType:{
        type:String,
        enum:['normal','merchandise'],
        required:true
    },
    status:{
        type:String,
        enum:['pending','confirmed','cancelled','rejected'],
        default:'confirmed'
    },
    formData:{
        type:Object,
        default:{}
    },
    merchVariant:{
        type:String
    },
    paymentStatus:{
        type:String,
        enum:['pending','approved','rejected'],
        default:'pending'
    },
    paymentProof:{
        type:String
    },
    rejectionReason:{
        type:String
    },
    ticketId:{
        type:String,
        unique:true,
        sparse:true
    },
    qrCode:{
        type:String
    },
    attended:{
        type:Boolean,
        default:false
    },
    attendedAt:{
        type:Date
    },
    // Audit fields for manual override
    manualOverride:{
        type:Boolean,
        default:false
    },
    overrideReason:{
        type:String
    },
    overrideBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Organizer'
    }
},{
    timestamps:true
});

registrationSchema.index({eventId:1,userId:1},{unique:true});

module.exports = mongoose.model('Registration',registrationSchema);
