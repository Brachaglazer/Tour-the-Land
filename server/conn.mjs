import { MongoClient } from "mongodb";

const uri = "mongodb+srv://bglazer_db_user:mongodb@cluster0.jcpmbra.mongodb.net/?appName=Cluster0&ssl=true";
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