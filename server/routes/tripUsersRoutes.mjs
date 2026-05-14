import express from "express";
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Failed to authenticate token.' });
    }
}

router.get("/:id", authenticate, async (req, res) => {
    let collection = await db.collection("trip_users");
    let query = { trip_id: ObjectId(req.params.id) };
    let results = await collection.find({ query })
    .toArray();
    if (!results) res.send("Trip users not found for trip").status(404);
    else res.send(results).status(200);
});

router.post('/addTripUser', authenticate, async (req, res) => {
    let collection = await db.collection("trip_users");
    let newTripUser = req.body;
    newTripUser.created_at = new Date().toLocaleDateString();
    let result = await collection.insertOne(newTripUser);
    res.json({ message: 'Trip user added successfully', tripUserId: result._id})
});

router.patch('/updateTripUser/:id', authenticate, async (req, res) => {
    let collection = await db.collection("trip_user");
    let updateTripUser = req.body;
    let query = { _id: ObjectId(req.params.id) };
    let result = await collection.UpdateOne(query, updateTripUser);
    res.json({ message: 'Trip user updated successfully' })
});

router.delete("/deleteTripUser/:id", authenticate, async (req, res) => {
  const collection = db.collection("trip_user");
  const query = { _id: ObjectId(req.params.id) };
  let result = await collection.deleteOne(query);
  res.send(result).status(200);
});

export default router;