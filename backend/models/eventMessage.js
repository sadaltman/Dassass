const mongoose = require('mongoose');

const eventMessageSchema = new mongoose.Schema({
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
    message:{
        type:String,
        required:true
    },
    pinned:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

eventMessageSchema.index({eventId:1,createdAt:-1});

module.exports = mongoose.model('EventMessage',eventMessageSchema);
