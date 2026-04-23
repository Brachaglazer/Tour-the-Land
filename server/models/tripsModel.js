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

// TODO: insert objectId, start_date, and end_date below before running

const { MongoClient } = require("mongodb");

async function run() {
const uri = "mongodb+srv://bglazer_db_user:mongodb@cluster0.jcpmbra.mongodb.net/?appName=Cluster0&ssl=true";

  const client = new MongoClient(uri);

  await client.connect();

  const dbName = "Tour_the_Land";
  const collectionName = "trips";

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  /*
   *  *** INSERT TRIPS ***
   */

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
    console.log(`${insertManyResult.insertedCount} trips successfully inserted.\n`);
  } catch (err) {
    console.error(`Something went wrong trying to insert the new trips: ${err}\n`);
  }

  await client.close();
}
run().catch(console.dir);