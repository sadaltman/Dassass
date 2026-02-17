const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    organizerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Organizer',
        required:true
    },
    reason:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['pending','approved','rejected'],
        default:'pending'
    },
    adminComment:{
        type:String
    },
    newPassword:{
        type:String
    }
},{
    timestamps:true
});

module.exports = mongoose.model('PasswordResetRequest',passwordResetSchema);
