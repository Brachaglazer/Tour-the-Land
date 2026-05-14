/*
Itinerary Collection: 
id: objectId - automated, 
trip_id: objectId, 
title: str, 
description: str,
location: str,  
start_time: timestamp, 
end_time: timestamp, 
date: date, 
created_at: date,
created_by: objectId
*/

// TODO: insert objectId below before running

const { MongoClient } = require("mongodb");

async function run() {
const uri = "mongodb+srv://tourtheland43_db_user:tourtheland@cluster0.gmd21v4.mongodb.net/?appName=Cluster0&ssl=true";

  const client = new MongoClient(uri);

  await client.connect();

  const dbName = "Tour_the_Land";
  const collectionName = "itinerary";

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  /*
   *  *** INSERT ITINERARY ***
   */

  const itinerary = [
    {
      trip_id: objectId, 
      title: "Kosel", 
      description: "Kosel tunnels and daven at the wall.",
      location: "The Old City",  
      start_time: new Date().toLocaleTimeString(), 
      end_time: new Date().toLocaleTimeString(), 
      date: new Date().toLocaleDateString(), 
      created_at: new Date().toLocaleDateString(),
      created_by: objectId
    },
    {
      trip_id: objectId, 
      title: "The Art Gallery", 
      description: "Explore the art gallery in the Old City of Tzfas",
      location: "The Old City",  
      start_time: new Date().toLocaleTimeString(), 
      end_time: new Date().toLocaleTimeString(), 
      date: new Date().toLocaleDateString(), 
      created_at: new Date().toLocaleDateString(),
      created_by: objectId
    },
  ];

  try {
    const insertManyResult = await collection.insertMany(itinerary);
    console.log(`${insertManyResult.insertedCount} itinerary successfully inserted.\n`);
  } catch (err) {
    console.error(`Something went wrong trying to insert the new itinerary: ${err}\n`);
  }

  await client.close();
}
run().catch(console.dir);