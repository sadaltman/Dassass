const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    emailAddress:  {
        type : String,
        required: true,
        unique: true
    },
    hashedPassword : {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);