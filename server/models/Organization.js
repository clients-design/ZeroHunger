const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const organizationSchema = new mongoose.Schema({
    organizationId: {
        type: String,
        unique: true,
        default: () => `ORG-${uuidv4().slice(0, 8).toUpperCase()}`
    },
    organizationName: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true
    },
    organizationType: {
        type: String,
        enum: ['NGO', 'Government', 'Trust'],
        required: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    country: {
        type: String,
        default: 'India'
    },
    state: String,
    city: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Organization', organizationSchema);
