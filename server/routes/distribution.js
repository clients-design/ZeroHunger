const express = require('express');
const router = express.Router();
const DistributionRun = require('../models/DistributionRun');
const Centre = require('../models/Centre');
const { protect } = require('../middleware/auth');

// Helper: Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// @route   GET /api/distribution
// @desc    Get all distribution runs
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.organizationId) filter.organizationId = req.query.organizationId;
        if (req.query.status) filter.status = req.query.status;

        const runs = await DistributionRun.find(filter)
            .populate('organizationId', 'organizationName')
            .populate('sourceCenterId', 'centerName city latitude longitude')
            .populate('targetCenters.centerId', 'centerName city latitude longitude')
            .sort({ createdAt: -1 });
        res.json(runs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/distribution/:id
// @desc    Get single distribution run
router.get('/:id', async (req, res) => {
    try {
        const run = await DistributionRun.findById(req.params.id)
            .populate('organizationId', 'organizationName')
            .populate('sourceCenterId', 'centerName city latitude longitude')
            .populate('targetCenters.centerId', 'centerName city latitude longitude');
        if (!run) {
            return res.status(404).json({ message: 'Distribution run not found' });
        }
        res.json(run);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/distribution
// @desc    Create distribution run
router.post('/', async (req, res) => {
    try {
        const run = await DistributionRun.create(req.body);
        res.status(201).json(run);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   POST /api/distribution/:id/optimize
// @desc    Optimize route for a distribution run
router.post('/:id/optimize', async (req, res) => {
    try {
        const run = await DistributionRun.findById(req.params.id)
            .populate('sourceCenterId', 'centerName latitude longitude')
            .populate('targetCenters.centerId', 'centerName latitude longitude');

        if (!run) {
            return res.status(404).json({ message: 'Distribution run not found' });
        }

        const sourceCenter = run.sourceCenterId;
        if (!sourceCenter) {
            return res.status(400).json({ message: 'Source centre not found' });
        }

        // Get all target centers with their coordinates
        const targets = run.targetCenters
            .filter(t => t.centerId)
            .map(t => ({
                centerId: t.centerId._id,
                centerName: t.centerId.centerName,
                lat: t.centerId.latitude,
                lng: t.centerId.longitude,
                allocatedKg: t.allocatedKg || 0
            }));

        if (targets.length === 0) {
            return res.status(400).json({ message: 'No target centres to optimize' });
        }

        // Simple nearest-neighbor optimization
        let currentLat = sourceCenter.latitude;
        let currentLng = sourceCenter.longitude;
        const optimizedRoute = [];
        const remaining = [...targets];
        let totalDistance = 0;

        while (remaining.length > 0) {
            let nearestIdx = 0;
            let nearestDist = Infinity;

            for (let i = 0; i < remaining.length; i++) {
                const dist = calculateDistance(currentLat, currentLng, remaining[i].lat, remaining[i].lng);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestIdx = i;
                }
            }

            const nearest = remaining.splice(nearestIdx, 1)[0];
            totalDistance += nearestDist;
            optimizedRoute.push({
                centerId: nearest.centerId,
                deliveryOrder: optimizedRoute.length + 1,
                allocatedKg: nearest.allocatedKg,
                distanceFromPrevious: Math.round(nearestDist * 10) / 10
            });
            currentLat = nearest.lat;
            currentLng = nearest.lng;
        }

        // Update the run with optimized route
        run.targetCenters = optimizedRoute;
        run.totalDistanceKm = Math.round(totalDistance * 10) / 10;
        run.estimatedDurationMins = Math.round(totalDistance * 2); // Assume 30 km/h average speed
        await run.save();

        res.json({
            message: 'Route optimized successfully',
            totalDistanceKm: run.totalDistanceKm,
            estimatedDurationMins: run.estimatedDurationMins,
            optimizedRoute: optimizedRoute
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/distribution/:id
// @desc    Update distribution run
router.put('/:id', async (req, res) => {
    try {
        const run = await DistributionRun.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!run) {
            return res.status(404).json({ message: 'Distribution run not found' });
        }

        // If status changed to Completed, set completedAt
        if (req.body.status === 'Completed' && !run.completedAt) {
            run.completedAt = new Date();
            await run.save();
        }

        res.json(run);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/distribution/:id
// @desc    Delete distribution run
router.delete('/:id', async (req, res) => {
    try {
        const run = await DistributionRun.findByIdAndDelete(req.params.id);
        if (!run) {
            return res.status(404).json({ message: 'Distribution run not found' });
        }
        res.json({ message: 'Distribution run deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
