const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const demandLogSchema = new mongoose.Schema({
    demandId: {
        type: String,
        unique: true,
        default: () => `DEM-${uuidv4().slice(0, 8).toUpperCase()}`
    },
    centerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Centre',
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    demandKg: {
        type: Number,
        required: true,
        min: 0
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('DemandLog', demandLogSchema);
