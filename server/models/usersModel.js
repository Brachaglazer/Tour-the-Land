/*
Seed script for Users collection (ESM).
This script will create sample users with bcrypt-hashed passwords.
*/
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const connectionString = process.env.ATLAS_URI;
if (!connectionString) {
  console.error('Missing ATLAS_URI in environment. Set ATLAS_URI in your .env before running the seed.');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(connectionString);
  await client.connect();

  const db = client.db(process.env.DB_NAME || 'Tour_the_Land');
  const collection = db.collection('users');

  const users = [
    { first_name: 'Devora', last_name: 'Teitelbaum', email: 'dteitelb@student.touro.edu', password: 'devora123' },
    { first_name: 'Bracha', last_name: 'Glazer', email: 'bglazer@student.touro.edu', password: 'bracha123' }
  ];

  try {
    const toInsert = [];
    for (const u of users) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      toInsert.push({
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email.trim().toLowerCase(),
        hashedPassword,
        created_at: new Date().toISOString()
      });
    }

    const insertManyResult = await collection.insertMany(toInsert);
    console.log(`${insertManyResult.insertedCount} users successfully inserted.`);
  } catch (err) {
    console.error('Something went wrong trying to insert the new users:', err);
  } finally {
    await client.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});