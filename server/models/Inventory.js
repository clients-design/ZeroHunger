const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const inventorySchema = new mongoose.Schema({
    inventoryId: {
        type: String,
        unique: true,
        default: () => `INV-${uuidv4().slice(0, 8).toUpperCase()}`
    },
    itemName: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    category: {
        type: String,
        enum: ['Grains', 'Pulses', 'Vegetables', 'Fruits', 'Dairy', 'Canned', 'Other'],
        default: 'Other'
    },
    quantityKg: {
        type: Number,
        required: true,
        min: 0
    },
    expiryDate: {
        type: Date,
        required: true
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
    status: {
        type: String,
        enum: ['Safe', 'Warning', 'Urgent'],
        default: 'Safe'
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate status based on expiry
inventorySchema.pre('save', function (next) {
    const daysUntilExpiry = Math.ceil((this.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 7) {
        this.status = 'Urgent';
    } else if (daysUntilExpiry < 30) {
        this.status = 'Warning';
    } else {
        this.status = 'Safe';
    }
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
