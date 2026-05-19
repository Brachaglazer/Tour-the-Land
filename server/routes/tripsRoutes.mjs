import express from "express";
import { ObjectId } from "mongodb";
import db from "../conn.mjs";
import jwt from 'jsonwebtoken';

/*
Trips Routes:
/:id : GET all trips by userId
/addTrip : POST new trip
/addActivity/:id : POST add activity to trip
/updateTrip/:id : PATCH existing trip by tripId
/updateActivity/:tripId/:activityId : PATCH update a trip activity
/deleteActivity/:tripId/:activityId : DELETE remove a trip activity
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
        console.error('JWT verification failed for /trips:', error.message);
        return res.status(403).json({ message: `Failed to authenticate token: ${error.message}` });
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
    let newTrip = {
        title: req.body.title,
        description: req.body.description,
        user_id: req.user.userId,
        start_date: req.body.start_date || '',
        end_date: req.body.end_date || '',
        created_at: new Date().toLocaleDateString(),
        activities: []
    };

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

router.post('/addActivity/:id', authenticate, async (req, res) => {
    const { title, description, time } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Activity title is required.' });
    }

    const tripId = req.params.id;
    const collection = await db.collection("trips");
    const trip = await collection.findOne({ _id: new ObjectId(tripId) });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    const userId = String(req.user.userId);
    const tripOwner = String(trip.user_id);
    if (tripOwner !== userId) {
        return res.status(403).json({ message: 'You are not authorized to add activities to this trip.' });
    }

    const activity = {
        activityId: new ObjectId().toString(),
        title: title.trim(),
        description: description ? description.trim() : '',
        time: time ? time.trim() : '',
        created_at: new Date().toLocaleDateString()
    };

    await collection.updateOne(
        { _id: new ObjectId(tripId) },
        { $push: { activities: activity } }
    );

    res.json({ message: 'Activity added successfully', activity });
});

router.patch('/updateTrip/:id', authenticate, async (req, res) => {
    const collection = await db.collection("trips");
    const tripId = req.params.id;
    const trip = await collection.findOne({ _id: new ObjectId(tripId) });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    if (String(trip.user_id) !== String(req.user.userId)) {
        return res.status(403).json({ message: 'You are not authorized to update this trip.' });
    }

    const updateTrip = {
        title: req.body.title,
        description: req.body.description,
        start_date: req.body.start_date || '',
        end_date: req.body.end_date || '',
        updated_at: new Date().toLocaleDateString()
    };

    await collection.updateOne({ _id: new ObjectId(tripId) }, { $set: updateTrip });
    res.json({ message: 'Trip updated successfully' });
});

router.patch('/updateActivity/:tripId/:activityId', authenticate, async (req, res) => {
    const { tripId, activityId } = req.params;
    const { title, description, time } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Activity title is required.' });
    }

    const collection = await db.collection("trips");
    const trip = await collection.findOne({ _id: new ObjectId(tripId) });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    if (String(trip.user_id) !== String(req.user.userId)) {
        return res.status(403).json({ message: 'You are not authorized to update activities for this trip.' });
    }

    const result = await collection.updateOne(
        { _id: new ObjectId(tripId), 'activities.activityId': activityId },
        {
            $set: {
                'activities.$.title': title.trim(),
                'activities.$.description': description ? description.trim() : '',
                'activities.$.time': time ? time.trim() : ''
            }
        }
    );

    if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Activity not found.' });
    }

    res.json({ message: 'Activity updated successfully' });
});

router.delete('/deleteActivity/:tripId/:activityId', authenticate, async (req, res) => {
    const { tripId, activityId } = req.params;
    const collection = await db.collection("trips");
    const trip = await collection.findOne({ _id: new ObjectId(tripId) });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    if (String(trip.user_id) !== String(req.user.userId)) {
        return res.status(403).json({ message: 'You are not authorized to delete activities for this trip.' });
    }

    const result = await collection.updateOne(
        { _id: new ObjectId(tripId) },
        { $pull: { activities: { activityId } } }
    );

    if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Activity not found.' });
    }

    res.json({ message: 'Activity deleted successfully' });
});

router.delete("/deleteTrip/:id", authenticate, async (req, res) => {
    const collection = db.collection("trips");
    const trip = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    if (String(trip.user_id) !== String(req.user.userId)) {
        return res.status(403).json({ message: 'You are not authorized to delete this trip.' });
    }

    const query = { _id: new ObjectId(req.params.id) };
    let result = await collection.deleteOne(query);

    const userCollection = db.collection("trip_users");
    const userQuery = { trip_id: new ObjectId(req.params.id) };
    await userCollection.deleteMany(userQuery);

    res.status(200).json(result);
});

export default router;