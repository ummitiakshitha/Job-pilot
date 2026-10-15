const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobpilot';

  try {
    // Attempt connection to the provided URI with a 4-second server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] Successfully connected to MongoDB at: ${uri}`);
  } catch (error) {
    console.warn(`[Database] Direct connection to '${uri}' failed: ${error.message}`);
    console.log('[Database] Initiating embedded MongoMemoryServer fallback for local execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'jobpilot',
        },
      });
      const memoryUri = memoryServerInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Successfully connected to In-Memory MongoDB at: ${memoryUri}`);
      console.log('[Database] Ready for evaluation, demo, and real CRUD operations!');
    } catch (memError) {
      console.error('[Database] In-memory database initialization failed:', memError.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[Database] MongoDB runtime connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected');
  });
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
  } catch (err) {
    console.error('[Database] Disconnect error:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
