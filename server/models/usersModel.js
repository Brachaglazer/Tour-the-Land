/*
Users Collection: 
id: objectId - automated, 
first_name: str, 
last_name: str, 
email: str,
password: str, 
created_at: date
*/

const { MongoClient } = require("mongodb");

async function run() {
const uri = "mongodb+srv://bglazer_db_user:mongodb@cluster0.jcpmbra.mongodb.net/?appName=Cluster0&ssl=true";

  const client = new MongoClient(uri);

  await client.connect();

  const dbName = "Tour_the_Land";
  const collectionName = "users";

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  /*
   *  *** INSERT USERS ***
   */

  const users = [
    {
      first_name: "Devora", 
      last_name: "Teitelbaum", 
      email: "dteitelb@student.touro.edu",
      password: "devora123", 
      created_at: new Date().toLocaleDateString()
    },
    {
      first_name: "Bracha", 
      last_name: "Glazer", 
      email: "bglazer@student.touro.edu",
      password: "bracha123", 
      created_at: new Date().toLocaleDateString()
    },
  ];

  try {
    const insertManyResult = await collection.insertMany(users);
    console.log(`${insertManyResult.insertedCount} users successfully inserted.\n`);
  } catch (err) {
    console.error(`Something went wrong trying to insert the new users: ${err}\n`);
  }

  await client.close();
}
run().catch(console.dir);