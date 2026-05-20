/*
Contacts Collection: 
id: objectId - automated,
email: str,
message: str, 
date: date
*/

const { MongoClient } = require("mongodb");

async function run() {
const uri = "mongodb+srv://tourtheland43_db_user:tourtheland@cluster0.gmd21v4.mongodb.net/?appName=Cluster0&ssl=true";

  const client = new MongoClient(uri);

  await client.connect();

  const dbName = "Tour_the_Land";
  const collectionName = "contacts";

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  const contacts = [
    {
      name: "Devorah",
      email: "dteitelb@student.touro.edu",
      message: "founder",
      date: new Date().toLocaleDateString()
    },
    {
      name: "Bracha",
      email: "bglazer@student.touro.edu",
      message: "founder",
      date: new Date().toLocaleDateString()
    },
  ];

  try {
    const insertManyResult = await collection.insertMany(contacts);
  } catch (err) {
    // catch without logging here to avoid info leak
  }

  await client.close();
}
run().catch(console.dir);