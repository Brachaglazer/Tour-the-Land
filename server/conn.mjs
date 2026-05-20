import { MongoClient } from "mongodb";

const connectionString = process.env.ATLAS_URI;
if (!connectionString) {
  process.exit(1);
}

const client = new MongoClient(connectionString);

let db;
try {
  await client.connect();
  db = client.db(process.env.DB_NAME || "Tour_the_Land");
} catch (e) {
  process.exit(1);
}

export default db;