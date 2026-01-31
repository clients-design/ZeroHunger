const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const centreSchema = new mongoose.Schema({
    centerId: {
        type: String,
        unique: true,
        default: () => `CTR-${uuidv4().slice(0, 8).toUpperCase()}`
    },
    centerName: {
        type: String,
        required: [true, 'Centre name is required'],
        trim: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    country: {
        type: String,
        default: 'India'
    },
    state: String,
    city: String,
    address: String,
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Centre', centreSchema);
