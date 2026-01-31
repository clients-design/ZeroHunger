const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/organizations
// @desc    Get all organizations
router.get('/', async (req, res) => {
    try {
        const organizations = await Organization.find().sort({ createdAt: -1 });
        res.json(organizations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/organizations/:id
// @desc    Get single organization
router.get('/:id', async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.json(organization);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/organizations
// @desc    Create organization
router.post('/', async (req, res) => {
    try {
        const organization = await Organization.create(req.body);
        res.status(201).json(organization);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/organizations/:id
// @desc    Update organization
router.put('/:id', async (req, res) => {
    try {
        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.json(organization);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/organizations/:id
// @desc    Delete organization
router.delete('/:id', async (req, res) => {
    try {
        const organization = await Organization.findByIdAndDelete(req.params.id);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
