require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not set');
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000
});

async function run() {
  try {
    await client.connect();

    console.log('Successfully connected to MongoDB');

    const adminDb = client.db('admin');

    const hello = await adminDb.command({ hello: 1 });

    console.log('Replica set:', hello.setName);
    console.log('Current primary:', hello.primary);
    console.log('Connected host:', hello.me);

    const result = await adminDb.command({ ping: 1 });

    console.log('Ping result:', result);
  } catch (error) {
    console.error('MongoDB connection failed:');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
