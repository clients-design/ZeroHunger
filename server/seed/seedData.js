require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Organization = require('../models/Organization');
const Centre = require('../models/Centre');
const Inventory = require('../models/Inventory');
const DemandLog = require('../models/DemandLog');
const DistributionRun = require('../models/DistributionRun');
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected for seeding');
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Check for --force flag
        const forceReset = process.argv.includes('--force');

        // Check if data already exists
        const existingOrgs = await Organization.countDocuments();
        const existingUsers = await User.countDocuments();

        if ((existingOrgs > 0 || existingUsers > 0) && !forceReset) {
            console.log('⚠️  Database already has data!');
            console.log(`   Found ${existingOrgs} organizations and ${existingUsers} users`);
            console.log('');
            console.log('🛡️  Skipping seed to protect your existing data.');
            console.log('   If you want to reset, use: npm run seed:force');
            console.log('');
            process.exit(0);
        }

        if (forceReset) {
            console.log('⚠️  FORCE MODE: Resetting all data...');
        }

        // Only clear and seed if database is empty or force mode
        console.log('📂 Seeding database with demo data...');
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            Organization.deleteMany({}),
            Centre.deleteMany({}),
            Inventory.deleteMany({}),
            DemandLog.deleteMany({}),
            DistributionRun.deleteMany({}),
            User.deleteMany({})
        ]);

        // Create Organizations
        console.log('🏢 Creating organizations...');
        const organizations = await Organization.insertMany([
            {
                organizationName: 'Food Bank India',
                organizationType: 'NGO',
                contactPerson: 'Rajesh Kumar',
                contactEmail: 'rajesh@foodbankindia.org',
                country: 'India',
                state: 'Maharashtra',
                city: 'Mumbai'
            },
            {
                organizationName: 'Akshaya Patra Foundation',
                organizationType: 'Trust',
                contactPerson: 'Priya Sharma',
                contactEmail: 'priya@akshayapatra.org',
                country: 'India',
                state: 'Karnataka',
                city: 'Bengaluru'
            },
            {
                organizationName: 'State Food Corporation',
                organizationType: 'Government',
                contactPerson: 'Amit Patel',
                contactEmail: 'amit@statefoodcorp.gov.in',
                country: 'India',
                state: 'Gujarat',
                city: 'Ahmedabad'
            }
        ]);
        console.log(`   ✓ Created ${organizations.length} organizations`);

        // Create Centres
        console.log('📍 Creating distribution centres...');
        const centres = await Centre.insertMany([
            // Food Bank India centres (Mumbai area)
            {
                centerName: 'Mumbai Central Hub',
                organizationId: organizations[0]._id,
                country: 'India',
                state: 'Maharashtra',
                city: 'Mumbai',
                address: 'Near CST Station, Mumbai',
                latitude: 18.9398,
                longitude: 72.8355
            },
            {
                centerName: 'Andheri Distribution Point',
                organizationId: organizations[0]._id,
                country: 'India',
                state: 'Maharashtra',
                city: 'Mumbai',
                address: 'Andheri West, Mumbai',
                latitude: 19.1197,
                longitude: 72.8464
            },
            {
                centerName: 'Thane Food Centre',
                organizationId: organizations[0]._id,
                country: 'India',
                state: 'Maharashtra',
                city: 'Thane',
                address: 'Thane Station Road',
                latitude: 19.1860,
                longitude: 72.9756
            },
            // Akshaya Patra centres (Bengaluru area)
            {
                centerName: 'Bengaluru Main Kitchen',
                organizationId: organizations[1]._id,
                country: 'India',
                state: 'Karnataka',
                city: 'Bengaluru',
                address: 'Koramangala, Bengaluru',
                latitude: 12.9352,
                longitude: 77.6245
            },
            {
                centerName: 'Whitefield Centre',
                organizationId: organizations[1]._id,
                country: 'India',
                state: 'Karnataka',
                city: 'Bengaluru',
                address: 'Whitefield Main Road',
                latitude: 12.9698,
                longitude: 77.7500
            },
            // State Food Corporation centres (Ahmedabad area)
            {
                centerName: 'Ahmedabad Warehouse',
                organizationId: organizations[2]._id,
                country: 'India',
                state: 'Gujarat',
                city: 'Ahmedabad',
                address: 'Navrangpura, Ahmedabad',
                latitude: 23.0375,
                longitude: 72.5612
            }
        ]);
        console.log(`   ✓ Created ${centres.length} centres`);

        // Create Inventory items
        console.log('📦 Creating inventory items...');
        const today = new Date();
        const inventoryItems = await Inventory.insertMany([
            // Mumbai Central Hub inventory
            { itemName: 'Rice', category: 'Grains', quantityKg: 1500, expiryDate: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000), centerId: centres[0]._id, organizationId: organizations[0]._id },
            { itemName: 'Wheat Flour', category: 'Grains', quantityKg: 800, expiryDate: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000), centerId: centres[0]._id, organizationId: organizations[0]._id },
            { itemName: 'Toor Dal', category: 'Pulses', quantityKg: 400, expiryDate: new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000), centerId: centres[0]._id, organizationId: organizations[0]._id },
            { itemName: 'Cooking Oil', category: 'Other', quantityKg: 200, expiryDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000), centerId: centres[0]._id, organizationId: organizations[0]._id },
            { itemName: 'Canned Vegetables', category: 'Canned', quantityKg: 150, expiryDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), centerId: centres[0]._id, organizationId: organizations[0]._id }, // Urgent
            // Andheri inventory
            { itemName: 'Rice', category: 'Grains', quantityKg: 600, expiryDate: new Date(today.getTime() + 150 * 24 * 60 * 60 * 1000), centerId: centres[1]._id, organizationId: organizations[0]._id },
            { itemName: 'Potatoes', category: 'Vegetables', quantityKg: 300, expiryDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), centerId: centres[1]._id, organizationId: organizations[0]._id }, // Warning
            // Bengaluru inventory
            { itemName: 'Rice', category: 'Grains', quantityKg: 2000, expiryDate: new Date(today.getTime() + 200 * 24 * 60 * 60 * 1000), centerId: centres[3]._id, organizationId: organizations[1]._id },
            { itemName: 'Sambar Powder', category: 'Other', quantityKg: 100, expiryDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000), centerId: centres[3]._id, organizationId: organizations[1]._id }, // Warning
            { itemName: 'Milk Powder', category: 'Dairy', quantityKg: 50, expiryDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), centerId: centres[3]._id, organizationId: organizations[1]._id }, // Urgent
            // Ahmedabad inventory
            { itemName: 'Wheat', category: 'Grains', quantityKg: 3000, expiryDate: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000), centerId: centres[5]._id, organizationId: organizations[2]._id },
            { itemName: 'Sugar', category: 'Other', quantityKg: 500, expiryDate: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000), centerId: centres[5]._id, organizationId: organizations[2]._id }
        ]);
        console.log(`   ✓ Created ${inventoryItems.length} inventory items`);

        // Create Demand Logs (last 14 days)
        console.log('📊 Creating demand logs...');
        const demandLogs = [];
        for (let i = 14; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            // Add demand for each centre
            for (const centre of centres) {
                const baseDemand = 150 + Math.random() * 200;
                demandLogs.push({
                    centerId: centre._id,
                    organizationId: centre.organizationId,
                    date: date,
                    demandKg: Math.round(baseDemand)
                });
            }
        }
        await DemandLog.insertMany(demandLogs);
        console.log(`   ✓ Created ${demandLogs.length} demand logs`);

        // Create Distribution Runs
        console.log('🚚 Creating distribution runs...');
        const runs = await DistributionRun.insertMany([
            {
                runName: 'Morning Mumbai Route',
                vehicleNumber: 'MH-01-AB-1234',
                driverName: 'Suresh Patil',
                driverContact: '9876543210',
                organizationId: organizations[0]._id,
                sourceCenterId: centres[0]._id,
                targetCenters: [
                    { centerId: centres[1]._id, deliveryOrder: 1, allocatedKg: 200 },
                    { centerId: centres[2]._id, deliveryOrder: 2, allocatedKg: 150 }
                ],
                totalDistanceKm: 45,
                estimatedDurationMins: 90,
                status: 'InProgress',
                scheduledDate: today
            },
            {
                runName: 'Bengaluru Express Delivery',
                vehicleNumber: 'KA-01-XY-5678',
                driverName: 'Ravi Kumar',
                driverContact: '9988776655',
                organizationId: organizations[1]._id,
                sourceCenterId: centres[3]._id,
                targetCenters: [
                    { centerId: centres[4]._id, deliveryOrder: 1, allocatedKg: 300 }
                ],
                totalDistanceKm: 25,
                estimatedDurationMins: 50,
                status: 'Planned',
                scheduledDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        ]);
        console.log(`   ✓ Created ${runs.length} distribution runs`);

        // Create Users
        console.log('👤 Creating users...');
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@zerohunger.com',
                password: 'admin123',
                role: 'Admin',
                organizationId: organizations[0]._id
            },
            {
                name: 'Operator Mumbai',
                email: 'operator@foodbank.org',
                password: 'operator123',
                role: 'Operator',
                organizationId: organizations[0]._id
            }
        ]);
        console.log(`   ✓ Created ${users.length} users`);

        console.log('\n✅ Seed data created successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   Admin: admin@zerohunger.com / admin123');
        console.log('   Operator: operator@foodbank.org / operator123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedData();
