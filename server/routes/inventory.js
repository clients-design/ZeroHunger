const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');

// @route   GET /api/inventory
// @desc    Get all inventory (filter by centre/organization)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.centerId) filter.centerId = req.query.centerId;
        if (req.query.organizationId) filter.organizationId = req.query.organizationId;
        if (req.query.status) filter.status = req.query.status;

        const inventory = await Inventory.find(filter)
            .populate('centerId', 'centerName city')
            .populate('organizationId', 'organizationName')
            .sort({ expiryDate: 1 });

        // Recalculate status based on current date
        const now = new Date();
        const updatedInventory = inventory.map(item => {
            const itemObj = item.toObject();
            const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry < 7) {
                itemObj.status = 'Urgent';
            } else if (daysUntilExpiry < 30) {
                itemObj.status = 'Warning';
            } else {
                itemObj.status = 'Safe';
            }
            return itemObj;
        });

        res.json(updatedInventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/inventory/expiry
// @desc    Get expiry status summary
router.get('/expiry', async (req, res) => {
    try {
        const now = new Date();
        const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const urgent = await Inventory.aggregate([
            { $match: { expiryDate: { $lt: sevenDays } } },
            { $group: { _id: null, count: { $sum: 1 }, totalKg: { $sum: '$quantityKg' } } }
        ]);

        const warning = await Inventory.aggregate([
            { $match: { expiryDate: { $gte: sevenDays, $lt: thirtyDays } } },
            { $group: { _id: null, count: { $sum: 1 }, totalKg: { $sum: '$quantityKg' } } }
        ]);

        const safe = await Inventory.aggregate([
            { $match: { expiryDate: { $gte: thirtyDays } } },
            { $group: { _id: null, count: { $sum: 1 }, totalKg: { $sum: '$quantityKg' } } }
        ]);

        res.json({
            urgent: { count: urgent[0]?.count || 0, totalKg: urgent[0]?.totalKg || 0 },
            warning: { count: warning[0]?.count || 0, totalKg: warning[0]?.totalKg || 0 },
            safe: { count: safe[0]?.count || 0, totalKg: safe[0]?.totalKg || 0 }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
router.get('/:id', async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id)
            .populate('centerId', 'centerName city')
            .populate('organizationId', 'organizationName');
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/inventory
// @desc    Add inventory item
router.post('/', async (req, res) => {
    try {
        const item = await Inventory.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
router.put('/:id', async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        Object.assign(item, req.body);
        await item.save(); // This triggers the pre-save middleware for status calculation

        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
router.delete('/:id', async (req, res) => {
    try {
        const item = await Inventory.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
