/*
Reviews Collection: 
id: objectId - automated, 
name: str,
text: str, 
date: date
*/

const { MongoClient } = require("mongodb");

async function run() {
const uri = "mongodb+srv://bglazer_db_user:mongodb@cluster0.jcpmbra.mongodb.net/?appName=Cluster0&ssl=true";

  const client = new MongoClient(uri);

  await client.connect();

  const dbName = "Tour_the_Land";
  const collectionName = "reviews";

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  /*
   *  *** INSERT REVIEWS ***
   */

  const reviews = [
    {
      name: "Bracha",
      text: "From beginning to end, it's all planned! This is the most helpful vacation planning tool!",
      date: new Date().toLocaleDateString()
    },
    {
      name: "Devora",
      email: "Totally recommend, takes all the stress out of vacations!",
      date: new Date().toLocaleDateString()
    },
  ];

  try {
    const insertManyResult = await collection.insertMany(reviews);
    console.log(`${insertManyResult.insertedCount} reviews successfully inserted.\n`);
  } catch (err) {
    console.error(`Something went wrong trying to insert the new reviews: ${err}\n`);
  }

  await client.close();
}
run().catch(console.dir);