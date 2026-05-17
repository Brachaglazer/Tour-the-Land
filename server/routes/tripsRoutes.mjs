import express from "express";
import { ObjectId } from "mongodb";
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tourtheland-secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Failed to authenticate token.' });
    }
}

router.get("/:id", authenticate, async (req, res) => {
    let collection = await db.collection("trips");
    let query = { user_id: req.params.id };
    let results = await collection.find(query).toArray();
    res.status(200).json(results);
});

router.post('/addTrip', authenticate, async (req, res) => {
    let collection = await db.collection("trips");
    let newTrip = req.body;
    newTrip.created_at = new Date().toLocaleDateString();
    let result = await collection.insertOne(newTrip);

    let userCollection = await db.collection("trip_users");
    let newTripUser = {
        trip_id: result.insertedId,
        user_id: newTrip.user_id,
        role: "owner",
        invited_by: newTrip.user_id,
        created_at: new Date().toLocaleDateString()
    };
    let tripUserResult = await userCollection.insertOne(newTripUser);

    res.json({ message: 'Trip added successfully', tripId: result.insertedId, tripUserId: tripUserResult.insertedId });
});

router.patch('/updateTrip/:id', authenticate, async (req, res) => {
    let collection = await db.collection("trips");
    let updateTrip = req.body;
    let query = { _id: ObjectId(req.params.id) };
    updateTrip.updated_at = new Date().toLocaleDateString();
    await collection.updateOne(query, { $set: updateTrip });
    res.json({ message: 'Trip updated successfully' });
});

router.delete("/deleteTrip/:id", authenticate, async (req, res) => {
    const collection = db.collection("trips");
    const query = { _id: ObjectId(req.params.id) };
    let result = await collection.deleteOne(query);

    const userCollection = db.collection("trip_users");
    const userQuery = { trip_id: ObjectId(req.params.id) };
    await userCollection.deleteMany(userQuery);

    res.status(200).json(result);
});

export default router;