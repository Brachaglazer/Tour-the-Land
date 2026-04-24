import { MongoClient } from "mongodb";

const uri = "mongodb+srv://tourtheland43_db_user:JUICPnGBsXHzNozW@cluster0.gmd21v4.mongodb.net/?appName=Cluster0&ssl=true";
const connectionString = process.env.ATLAS_URI || uri;

const client = new MongoClient(connectionString);

let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}

let db = conn.db("Tour_the_Land");

export default db;