/*
Trip Users Collection:
id: objectId - automated,
trip_id: objectId, 
user_id: objectId, 
role (ENUM: owner, editor, viewer)
invited_by: objectId
created_at: date
*/

const { MongoClient } = require("mongodb");

async function run() {
const uri = "mongodb+srv://tourtheland43_db_user:tourtheland@cluster0.gmd21v4.mongodb.net/?appName=Cluster0&ssl=true";

  const client = new MongoClient(uri);

  await client.connect();

  const dbName = "Tour_the_Land";
  const collectionName = "trip_users";

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  const trip_users = [
    {
      trip_id: objectId, 
      user_id: objectId, 
      role: "editor",
      invited_by: objectId,
      created_at: new Date().toLocaleDateString()
    },
    {
      trip_id: objectId, 
      user_id: objectId, 
      role: "viewer",
      invited_by: objectId,
      created_at: new Date().toLocaleDateString()
    },
  ];

  try {
    const insertManyResult = await collection.insertMany(trip_users);
  } catch (err) {
    // Silently fail
  }

  await client.close();
}
run().catch(console.dir);