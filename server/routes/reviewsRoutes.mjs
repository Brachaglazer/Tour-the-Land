import express from "express";
import { ObjectId } from 'mongodb';
import db from "../conn.mjs";
import jwt from 'jsonwebtoken';

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

async function requireAdmin(req, res, next) {
    try {
        const userId = req?.user?.userId;
        if (!userId) return res.status(403).json({ message: 'Forbidden. Admin only.' });
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) return res.status(403).json({ message: 'Forbidden. Admin only.' });
        if (user.role === 'admin' || user.is_admin === true) return next();
        return res.status(403).json({ message: 'Forbidden. Admin only.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error validating admin.' });
    }
}

router.get("/", async (req, res) => {
    try {
        let collection = await db.collection("reviews");
        let results = await collection.find({}).toArray();
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load reviews.' });
    }
});

router.post('/addReview', authenticate, async (req, res) => {
    try {
        let collection = await db.collection("reviews");
        let newReview = req.body;
        newReview.date = new Date().toLocaleDateString();
        let result = await collection.insertOne(newReview);
        res.json({ message: 'Review added successfully', reviewId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add review.' });
    }
});

router.delete('/deleteAll', authenticate, requireAdmin, async (req, res) => {
    try {
        let collection = await db.collection("reviews");
        let result = await collection.deleteMany({});
        res.json({ message: 'All reviews deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete reviews.' });
    }
});

export default router;
