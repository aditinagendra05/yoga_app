const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://admin:aditi@cluster0.qnglwro.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db(process.env.DB_NAME || 'yoga_master');
  console.log('Connected to MongoDB');
  return db;
}

module.exports = { connectDB };