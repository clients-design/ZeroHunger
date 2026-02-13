require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

async function checkDatabases() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected successfully!');

        const admin = mongoose.connection.db.admin();
        const result = await admin.listDatabases();

        console.log('\nExisting Databases in this Cluster:');
        console.log('-----------------------------------');
        result.databases.forEach(db => {
            console.log(`- ${db.name} \t(${db.sizeOnDisk ? (db.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB' : 'empty'})`);
        });
        console.log('-----------------------------------');

        const targetDb = 'zerohunger';
        const exists = result.databases.some(db => db.name === targetDb);

        if (exists) {
            console.log(`\n✅ Database "${targetDb}" FOUND and created successfully!`);
        } else {
            console.log(`\n❌ Database "${targetDb}" NOT found.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkDatabases();
