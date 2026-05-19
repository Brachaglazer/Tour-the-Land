import express from "express";
import { ObjectId } from "mongodb";
import db from "../conn.mjs";
import jwt from 'jsonwebtoken';

/*
Trips User Routes:
/:id : GET all trip users by tripId
/addTripUser : POST new trip user
/updateTripUser/:id : PATCH existing trip user by tripUserId
/deleteTripUser/:id : DELETE existing trip user by tripUserId
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
    let collection = await db.collection("trip_users");
    let query = { trip_id: new ObjectId(req.params.id) };
    let results = await collection.find(query).toArray();
    const usersCollection = await db.collection("users");

    const enriched = await Promise.all(results.map(async membership => {
        let user = null;
        try {
            const userId = typeof membership.user_id === 'string' ? new ObjectId(membership.user_id) : membership.user_id;
            user = await usersCollection.findOne({ _id: userId });
        } catch (_e) {
            user = null;
        }

        return {
            tripUserId: membership._id?.toString(),
            trip_id: membership.trip_id,
            user_id: String(membership.user_id),
            role: membership.role,
            invited_by: membership.invited_by,
            created_at: membership.created_at,
            email: user?.email || '',
            first_name: user?.first_name || '',
            last_name: user?.last_name || ''
        };
    }));

    res.status(200).json(enriched);
});

router.post('/addTripUser', authenticate, async (req, res) => {
    let collection = await db.collection("trip_users");
    let newTripUser = req.body;
    newTripUser.created_at = new Date().toLocaleDateString();
    let result = await collection.insertOne(newTripUser);
    res.json({ message: 'Trip user added successfully', tripUserId: result.insertedId.toString() });
});

router.patch('/updateTripUser/:id', authenticate, async (req, res) => {
    let collection = await db.collection("trip_users");
    let updateTripUser = req.body;
    let query = { _id: new ObjectId(req.params.id) };
    await collection.updateOne(query, { $set: updateTripUser });
    res.json({ message: 'Trip user updated successfully' });
});

router.delete("/deleteTripUser/:id", authenticate, async (req, res) => {
  const collection = db.collection("trip_users");
  const query = { _id: new ObjectId(req.params.id) };
  let result = await collection.deleteOne(query);
  res.status(200).json(result);
});

export default router;