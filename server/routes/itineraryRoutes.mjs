import express from "express";
import db from "../conn.mjs";
import jwt from 'jsonwebtoken';

/*
Itinerary Routes:
/:id : GET all itinerary by tripId
/addItinerary : POST new itinerary
/updateItinerary/:id : PATCH existing itinerary by itineraryId
/deleteItinerary/:id : DELETE existing itinerary by itineraryId
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
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        let collection = await db.collection("itinerary");
        let query = { trip_id: ObjectId(req.params.id) };
        let results = await collection.find({ query })
        .toArray();
        if (!results) res.send("Itinerary not found for trip").status(404);
        else res.send(results).status(200);
    } catch (error) {
        return res.status(403).json({ message: 'Failed to authenticate token.' });
    }
});

router.post('/addItinerary', authenticate, async (req, res) => {
    let collection = await db.collection("itinerary");
    let newItinerary = req.body;
    newItinerary.created_at = new Date().toLocaleDateString();
    let result = await collection.insertOne(newItinerary);
    res.json({ message: 'Itinerary added successfully', itineraryId: result._id})
});

router.patch('/updateItinerary/:id', authenticate, async (req, res) => {
    let collection = await db.collection("itinerary");
    let updateItinerary = req.body;
    let query = { _id: ObjectId(req.params.id) };
    let result = await collection.UpdateOne(query, updateItinerary);
    res.json({ message: 'Itinerary updated successfully' })
});

router.delete("/deleteItinerary/:id", authenticate, async (req, res) => {
  const collection = db.collection("itinerary");
  const query = { _id: ObjectId(req.params.id) };
  let result = await collection.deleteOne(query);
  res.send(result).status(200);
});

export default router;