/*
Trips Collection: 
id: objectId - automated, 
title: str, 
description: str, 
user_id: objectId,
start_date: date, 
end_date: date, 
created_at: date, 
updated_at: date
*/


const { MongoClient } = require("mongodb");

async function run() {
const uri = "mongodb+srv://tourtheland43_db_user:tourtheland@cluster0.gmd21v4.mongodb.net/?appName=Cluster0&ssl=true";

  const client = new MongoClient(uri);

  await client.connect();

  const dbName = "Tour_the_Land";
  const collectionName = "trips";

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  const trips = [
    {
      title: "Yerushalayim", 
      description: "Daven at the Kosel.", 
      user_id: objectId,
      start_date: date, 
      end_date: date, 
      created_at: new Date().toLocaleDateString(), 
      updated_at: new Date().toLocaleDateString()
    },
    {
      title: "Tzfas", 
      description: "Explore the Old City.", 
      user_id: objectId,
      start_date: date, 
      end_date: date, 
      created_at: new Date().toLocaleDateString(), 
      updated_at: new Date().toLocaleDateString()
    },
  ];

  try {
    const insertManyResult = await collection.insertMany(trips);
  } catch (err) {
    // Silently fail
  }

  await client.close();
}
run().catch(console.dir);