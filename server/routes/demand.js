const express = require('express');
const router = express.Router();
const DemandLog = require('../models/DemandLog');
const Centre = require('../models/Centre');
const { protect } = require('../middleware/auth');

// @route   GET /api/demand
// @desc    Get demand logs (filter by days/centre/organization)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.centerId) filter.centerId = req.query.centerId;
        if (req.query.organizationId) filter.organizationId = req.query.organizationId;

        // Filter by days (default last 7 days)
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        filter.date = { $gte: startDate };

        const logs = await DemandLog.find(filter)
            .populate('centerId', 'centerName city')
            .populate('organizationId', 'organizationName')
            .sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/demand/forecast
// @desc    Get demand forecast based on last 7 days average
router.get('/forecast', async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Get average demand per centre for last 7 days
        const demandByCenter = await DemandLog.aggregate([
            { $match: { date: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: '$centerId',
                    avgDemand: { $avg: '$demandKg' },
                    totalDemand: { $sum: '$demandKg' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get overall stats
        const overallStats = await DemandLog.aggregate([
            { $match: { date: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: null,
                    avgDailyDemand: { $avg: '$demandKg' },
                    totalDemand: { $sum: '$demandKg' }
                }
            }
        ]);

        // Add small variation for forecast (±10%)
        const baseAvg = overallStats[0]?.avgDailyDemand || 0;
        const variation = baseAvg * 0.1 * (Math.random() - 0.5);
        const forecastedDemand = Math.round(baseAvg + variation);

        // Get centre details for demand breakdown
        const centreDetails = await Centre.find({
            _id: { $in: demandByCenter.map(d => d._id) }
        }).select('centerName city');

        const demandByCenterWithDetails = demandByCenter.map(d => {
            const centre = centreDetails.find(c => c._id.toString() === d._id?.toString());
            return {
                centerId: d._id,
                centerName: centre?.centerName || 'Unknown',
                city: centre?.city || 'Unknown',
                avgDemand: Math.round(d.avgDemand),
                forecastedDemand: Math.round(d.avgDemand * (1 + (Math.random() - 0.5) * 0.2))
            };
        });

        res.json({
            forecastDate: new Date().toISOString().split('T')[0],
            overallForecast: forecastedDemand,
            confidence: 78 + Math.round(Math.random() * 10), // Mock confidence score
            demandByCenter: demandByCenterWithDetails,
            historicalAvg: Math.round(baseAvg),
            totalLast7Days: Math.round(overallStats[0]?.totalDemand || 0)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/demand/trends
// @desc    Get demand trends for charts (last 7 or 30 days)
router.get('/trends', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const trends = await DemandLog.aggregate([
            { $match: { date: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    totalDemand: { $sum: '$demandKg' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(trends.map(t => ({
            date: t._id,
            demandKg: t.totalDemand
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/demand
// @desc    Add demand log
router.post('/', async (req, res) => {
    try {
        const log = await DemandLog.create(req.body);
        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/demand/:id
// @desc    Delete demand log
router.delete('/:id', async (req, res) => {
    try {
        const log = await DemandLog.findByIdAndDelete(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Demand log not found' });
        }
        res.json({ message: 'Demand log deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
