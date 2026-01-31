require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organizations');
const centreRoutes = require('./routes/centres');
const inventoryRoutes = require('./routes/inventory');
const demandRoutes = require('./routes/demand');
const distributionRoutes = require('./routes/distribution');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/demand', demandRoutes);
app.use('/api/distribution', distributionRoutes);

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const Inventory = require('./models/Inventory');
        const DistributionRun = require('./models/DistributionRun');
        const DemandLog = require('./models/DemandLog');

        // Get total inventory
        const inventoryStats = await Inventory.aggregate([
            { $group: { _id: null, totalKg: { $sum: '$quantityKg' } } }
        ]);

        // Get active runs
        const activeRuns = await DistributionRun.countDocuments({ status: 'InProgress' });

        // Get wastage projection (items expiring in 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const urgentItems = await Inventory.aggregate([
            { $match: { expiryDate: { $lt: sevenDaysFromNow } } },
            { $group: { _id: null, totalKg: { $sum: '$quantityKg' } } }
        ]);

        // Get demand forecast (average of last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const demandStats = await DemandLog.aggregate([
            { $match: { date: { $gte: sevenDaysAgo } } },
            { $group: { _id: null, avgDemand: { $avg: '$demandKg' } } }
        ]);

        res.json({
            totalInventory: inventoryStats[0]?.totalKg || 0,
            activeRuns: activeRuns,
            wastageProjection: urgentItems[0]?.totalKg || 0,
            demandForecast: Math.round(demandStats[0]?.avgDemand || 0)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 ZeroHunger server running on http://localhost:${PORT}`);
});
