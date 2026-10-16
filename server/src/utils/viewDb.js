require('dotenv').config();
const mongoose = require('mongoose');

const inspectDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in server/.env');
    process.exit(1);
  }

  try {
    console.log('\n--- 🔍 JOBPILOT MONGODB DATABASE INSPECTOR ---');
    console.log(`Connecting to: ${uri.replace(/:[^:]*@/, ':****@')}`);
    await mongoose.connect(uri);
    console.log('✅ Successfully connected to MongoDB Atlas!\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('No collections found in database.');
    } else {
      console.log('================ STORED COLLECTIONS & COUNTS ================');
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`📁 Collection: ${col.name.padEnd(25)} -> ${count} record(s)`);
      }
      console.log('=============================================================\n');

      // Show sample data for main collections
      const previewCollections = ['users', 'jobapplications', 'resumeanalyses', 'userskills'];
      for (const name of previewCollections) {
        const exists = collections.some((c) => c.name === name);
        if (exists) {
          const sample = await db.collection(name).find().sort({ _id: -1 }).limit(2).toArray();
          if (sample.length > 0) {
            console.log(`📄 Recent document(s) in [${name}]:`);
            sample.forEach((doc, i) => {
              // Hide password hash for privacy
              const sanitized = { ...doc };
              if (sanitized.passwordHash) sanitized.passwordHash = '[HIDDEN BCRYPT HASH]';
              console.log(`  (${i + 1}) ID: ${doc._id}`);
              console.log(`      ${JSON.stringify(sanitized, null, 2).split('\n').slice(1, 8).join('\n      ')} ...`);
            });
            console.log('');
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error inspecting database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed cleanly.\n');
    process.exit(0);
  }
};

inspectDatabase();
