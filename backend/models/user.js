const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    participantType: {
        type: String,
        enum: ['iiit', 'non-iiit'],
        required: true
    },
    contactNumber: {
        type: String
    },
    collegeName: {
        type: String
    },
    interests: [{
        type: String
    }],
    followedClubs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer'
    }],
    onboardingComplete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);