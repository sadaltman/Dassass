const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    loginEmail: {
        type: String,
        required: true,
        unique: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    aboutText: {
        type: String,
        default: ''
    },
    publicContactEmail: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    webhookUrl: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    archived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Organizer', organizerSchema);