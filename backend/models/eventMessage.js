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
    parentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'EventMessage',
        default:null
    },
    reactions:[{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        emoji:{
            type:String
        }
    }],
    pinned:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

eventMessageSchema.index({eventId:1,createdAt:-1});

module.exports = mongoose.model('EventMessage',eventMessageSchema);
