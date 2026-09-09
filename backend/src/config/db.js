require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not set');
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000
});

async function connectToDatabase() {
  await client.connect();

  const db = client.db('webapp');

  await db.command({ ping: 1 });

  console.log('MongoDB connected successfully');

  return db;
}

function getClient() {
  return client;
}

function getDatabase() {
  return client.db('webapp');
}

module.exports = {
  connectToDatabase,
  getClient,
  getDatabase
};
