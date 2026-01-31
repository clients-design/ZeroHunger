const express = require('express');
const router = express.Router();
const Centre = require('../models/Centre');
const { protect } = require('../middleware/auth');

// @route   GET /api/centres
// @desc    Get all centres (filter by organization if provided)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.organizationId) {
            filter.organizationId = req.query.organizationId;
        }
        const centres = await Centre.find(filter)
            .populate('organizationId', 'organizationName organizationType')
            .sort({ createdAt: -1 });
        res.json(centres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/centres/:id
// @desc    Get single centre
router.get('/:id', async (req, res) => {
    try {
        const centre = await Centre.findById(req.params.id)
            .populate('organizationId', 'organizationName organizationType');
        if (!centre) {
            return res.status(404).json({ message: 'Centre not found' });
        }
        res.json(centre);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/centres
// @desc    Create centre
router.post('/', async (req, res) => {
    try {
        const centre = await Centre.create(req.body);
        res.status(201).json(centre);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/centres/:id
// @desc    Update centre
router.put('/:id', async (req, res) => {
    try {
        const centre = await Centre.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!centre) {
            return res.status(404).json({ message: 'Centre not found' });
        }
        res.json(centre);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/centres/:id
// @desc    Delete centre
router.delete('/:id', async (req, res) => {
    try {
        const centre = await Centre.findByIdAndDelete(req.params.id);
        if (!centre) {
            return res.status(404).json({ message: 'Centre not found' });
        }
        res.json({ message: 'Centre deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
