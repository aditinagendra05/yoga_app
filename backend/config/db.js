const { MongoClient, ServerApiVersion } = require('mongodb');

let db;
let client;

async function connectDB() {
  if (db) return db;

  const uri = process.env.DB_CLUSTER;
  if (!uri) throw new Error('DB_CLUSTER is not set in environment variables');

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    tls: true,
    tlsAllowInvalidCertificates: false,
    minPoolSize: 0,
  });

  await client.connect();
  db = client.db(process.env.DB_NAME || 'yoga_master');
  await db.command({ ping: 1 });
  console.log('✅ Connected to MongoDB');

  return db;
}

module.exports = { connectDB };