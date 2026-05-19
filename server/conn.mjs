import { MongoClient } from "mongodb";

const connectionString = process.env.ATLAS_URI;
if (!connectionString) {
  console.error("Missing ATLAS_URI environment variable. Set ATLAS_URI in your .env file.");
  process.exit(1);
}

const client = new MongoClient(connectionString);

let db;
try {
  await client.connect();
  db = client.db(process.env.DB_NAME || "Tour_the_Land");
} catch (e) {
  console.error(e);
  process.exit(1);
}

export default db;