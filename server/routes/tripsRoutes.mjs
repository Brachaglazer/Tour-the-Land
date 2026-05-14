import express from "express";
import db from "../conn.mjs";
import jwt from 'jsonwebtoken';

/*
Trips Routes:
/:id : GET all trips by userId
/addTrip : POST new trip
/updateTrip/:id : PATCH existing trip by tripId
/deleteTrip/:id : DELETE existing trip by tripId
*/

const router = express.Router();

async function authenticate(req, res, next) {
    const token = req?.headers?.authorization?.split(' ')[1];
    if (!token) return res?.status(401).json({ message: 'No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Failed to authenticate token.' });
    }
}

router.get("/:id", authenticate, async (req, res) => {
    let collection = await db.collection("trips");
    let query = { user_id: ObjectId(req.params.id) };
    let results = await collection.find({ query })
    .toArray();
    if (!results) res.send("Trips not found for user").status(404);
    else res.send(results).status(200);
});

router.post('/addTrip', authenticate, async (req, res) => {
    // create trip entry
    let collection = await db.collection("trips");
    let newTrip = req.body;
    newTrip.created_at = new Date().toLocaleDateString();
    let result = await collection.insertOne(newTrip);

    // create a trip user entry
    let userCollection = await db.collection("trip_users");
    let newTripUser = {
        trip_id: result._id, 
        user_id: result.user_id, 
        role: "owner",
        invited_by: result.user_id,
        created_at: new Date().toLocaleDateString()}
    let tripUserResult = await userCollection.insertOne(newTripUser);

    res.json({ message: 'Trip added successfully', tripId: result._id, tripUserId: tripUserResult._id})
});

router.patch('/updateTrip/:id', authenticate, async (req, res) => {
    let collection = await db.collection("trips");
    let updateTrip = req.body;
    let query = { _id: ObjectId(req.params.id) };
    updateTrip.updated_at = new Date().toLocaleDateString();
    let result = await collection.UpdateOne(query, updateTrip);
    res.json({ message: 'Trip updated successfully' })
});

router.delete("/deleteTrip/:id", authenticate, async (req, res) => {
  const collection = db.collection("trips");
  const query = { _id: ObjectId(req.params.id) };
  let result = await collection.deleteOne(query);

  // delete all trip user entries with specified trip
  const userCollection = db.collection("trip_user");
  const userQuery = { trip_id: ObjectId(req.params.id) };
  let tripUserResult = await userCollection.deleteMany(userQuery);

  res.send(result).status(200);
});

export default router;