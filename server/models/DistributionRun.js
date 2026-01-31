const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const distributionRunSchema = new mongoose.Schema({
    runId: {
        type: String,
        unique: true,
        default: () => `RUN-${uuidv4().slice(0, 8).toUpperCase()}`
    },
    runName: {
        type: String,
        required: [true, 'Run name is required'],
        trim: true
    },
    vehicleNumber: {
        type: String,
        required: true,
        trim: true
    },
    driverName: String,
    driverContact: String,
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    sourceCenterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Centre',
        required: true
    },
    targetCenters: [{
        centerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Centre'
        },
        deliveryOrder: Number,
        estimatedArrival: Date,
        allocatedKg: Number
    }],
    totalDistanceKm: Number,
    estimatedDurationMins: Number,
    status: {
        type: String,
        enum: ['Planned', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Planned'
    },
    scheduledDate: {
        type: Date,
        default: Date.now
    },
    completedAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('DistributionRun', distributionRunSchema);
