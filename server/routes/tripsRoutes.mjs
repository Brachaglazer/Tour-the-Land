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

async function getMembershipForUser(tripId, userId) {
    const collection = await db.collection("trip_users");
    return await collection.findOne({
        trip_id: new ObjectId(tripId),
        user_id: String(userId)
    });
}

async function getTripsForUser(userId) {
    const tripUsersCollection = await db.collection("trip_users");
    const memberships = await tripUsersCollection.find({ user_id: String(userId) }).toArray();
    if (!memberships.length) return [];

    const tripIds = memberships.map(m => new ObjectId(m.trip_id));
    const tripsCollection = await db.collection("trips");
    const trips = await tripsCollection.find({ _id: { $in: tripIds } }).toArray();

    const allMembers = await tripUsersCollection.find({ trip_id: { $in: tripIds } }).toArray();

    const participantsByTrip = {};
    allMembers.forEach(member => {
        const key = String(member.trip_id);
        if (!participantsByTrip[key]) {
            participantsByTrip[key] = [];
        }
        participantsByTrip[key].push({
            user_id: String(member.user_id),
            role: member.role,
            tripUserId: member._id?.toString()
        });
    });

    return trips.map(trip => {
        const membership = memberships.find(m => String(m.trip_id) === String(trip._id));
        return {
            ...trip,
            role: membership?.role || (String(trip.user_id) === String(userId) ? 'owner' : 'viewer'),
            membershipId: membership?._id?.toString(),
            participants: participantsByTrip[String(trip._id)] || []
        };
    });
}

router.get("/:id", authenticate, async (req, res) => {
    let results = await getTripsForUser(req.params.id);
    res.status(200).json(results);
});

router.post('/addTrip', authenticate, async (req, res) => {
    let collection = await db.collection("trips");
    let activities = [];
    if (Array.isArray(req.body.activities)) {
        activities = req.body.activities.map(activity => ({
            activityId: activity.activityId || new ObjectId().toString(),
            title: activity.title ? activity.title.trim() : '',
            description: activity.description ? activity.description.trim() : '',
            time: activity.time ? activity.time.trim() : '',
            created_at: activity.created_at || new Date().toLocaleDateString()
        }));
    }

    let newTrip = {
        title: req.body.title,
        description: req.body.description,
        user_id: req.user.userId,
        start_date: req.body.start_date || '',
        end_date: req.body.end_date || '',
        created_at: new Date().toLocaleDateString(),
        activities
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

    const membership = await getMembershipForUser(tripId, req.user.userId);
    if (!membership || membership.role === 'viewer') {
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

    const membership = await getMembershipForUser(tripId, req.user.userId);
    if (!membership || (membership.role === 'viewer')) {
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

    const membership = await getMembershipForUser(tripId, req.user.userId);
    if (!membership || membership.role === 'viewer') {
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

    const membership = await getMembershipForUser(tripId, req.user.userId);
    if (!membership || membership.role === 'viewer') {
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

router.patch('/reorderActivity/:tripId', authenticate, async (req, res) => {
    const { tripId } = req.params;
    const { activityId, direction } = req.body;

    if (!activityId || !['up', 'down'].includes(direction)) {
        return res.status(400).json({ message: 'Invalid reorder request.' });
    }

    const collection = await db.collection("trips");
    const trip = await collection.findOne({ _id: new ObjectId(tripId) });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    const membership = await getMembershipForUser(tripId, req.user.userId);
    if (!membership || membership.role === 'viewer') {
        return res.status(403).json({ message: 'You are not authorized to reorder activities on this trip.' });
    }

    const index = trip.activities.findIndex(activity => activity.activityId === activityId);
    if (index === -1) {
        return res.status(404).json({ message: 'Activity not found.' });
    }

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= trip.activities.length) {
        return res.status(200).json({ message: 'Activity order unchanged.', activities: trip.activities });
    }

    const activities = [...trip.activities];
    [activities[index], activities[swapIndex]] = [activities[swapIndex], activities[index]];

    await collection.updateOne({ _id: new ObjectId(tripId) }, { $set: { activities } });

    res.json({ message: 'Activity reordered successfully', activities });
});

router.post('/share/:id', authenticate, async (req, res) => {
    const tripId = req.params.id;
    const { email, role } = req.body;

    if (!email || !['editor', 'viewer'].includes(role)) {
        return res.status(400).json({ message: 'A valid email and role are required.' });
    }

    const tripCollection = await db.collection("trips");
    const trip = await tripCollection.findOne({ _id: new ObjectId(tripId) });
    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    const membership = await getMembershipForUser(tripId, req.user.userId);
    if (!membership || membership.role === 'viewer') {
        return res.status(403).json({ message: 'You are not authorized to share this trip.' });
    }

    const usersCollection = await db.collection("users");
    const friend = await usersCollection.findOne({ email: email.trim().toLowerCase() });
    if (!friend) {
        return res.status(404).json({ message: 'Friend was not found. Ask them to register first.' });
    }
    if (String(friend._id) === String(req.user.userId)) {
        return res.status(400).json({ message: 'You cannot share a trip with yourself.' });
    }

    const tripUsersCollection = await db.collection("trip_users");
    const existing = await tripUsersCollection.findOne({ trip_id: new ObjectId(tripId), user_id: friend._id.toString() });
    if (existing) {
        await tripUsersCollection.updateOne({ _id: existing._id }, { $set: { role, invited_by: String(req.user.userId) } });
        return res.json({ message: 'Share updated successfully', tripUserId: existing._id.toString() });
    }

    const result = await tripUsersCollection.insertOne({
        trip_id: new ObjectId(tripId),
        user_id: friend._id.toString(),
        role,
        invited_by: String(req.user.userId),
        created_at: new Date().toLocaleDateString()
    });

    res.json({ message: 'Trip shared successfully', tripUserId: result.insertedId.toString() });
});

router.delete("/deleteTrip/:id", authenticate, async (req, res) => {
    const collection = db.collection("trips");
    const trip = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    const membership = await getMembershipForUser(req.params.id, req.user.userId);
    if (!membership) {
        return res.status(403).json({ message: 'You are not authorized to remove this trip.' });
    }

    const userCollection = db.collection("trip_users");
    const tripOwnerId = String(trip.user_id);
    const currentUserId = String(req.user.userId);

    if (membership.role !== 'owner') {
        const deleteMembership = { _id: new ObjectId(membership._id) };
        const result = await userCollection.deleteOne(deleteMembership);
        return res.status(200).json({ message: 'Removed from shared trip successfully', removedCount: result.deletedCount });
    }

    const otherMembers = await userCollection.find({ trip_id: new ObjectId(req.params.id), user_id: { $ne: currentUserId } }).sort({ created_at: 1 }).toArray();
    if (otherMembers.length === 0) {
        const query = { _id: new ObjectId(req.params.id) };
        let result = await collection.deleteOne(query);
        await userCollection.deleteMany({ trip_id: new ObjectId(req.params.id) });
        return res.status(200).json({ message: 'Trip deleted successfully', deletedCount: result.deletedCount });
    }

    const nextOwner = otherMembers[0];
    await collection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { user_id: nextOwner.user_id } }
    );

    await userCollection.updateOne(
        { _id: new ObjectId(nextOwner._id) },
        { $set: { role: 'owner' } }
    );

    await userCollection.deleteOne({ _id: new ObjectId(membership._id) });

    res.status(200).json({ message: 'Trip ownership transferred and removed from your list.', transferredTo: nextOwner.user_id });
});

export default router;