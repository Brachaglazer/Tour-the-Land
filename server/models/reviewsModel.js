/*
Reviews Collection: 
id: objectId - automated, 
name: str,
text: str, 
date: date
*/

const { MongoClient } = require("mongodb");

async function run() {
const uri = "mongodb+srv://tourtheland43_db_user:tourtheland@cluster0.gmd21v4.mongodb.net/?appName=Cluster0&ssl=true";

  const client = new MongoClient(uri);

  await client.connect();

  const dbName = "Tour_the_Land";
  const collectionName = "reviews";

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

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
  } catch (err) {
    // Silently fail
  }

  await client.close();
}
run().catch(console.dir);