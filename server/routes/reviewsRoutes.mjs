import express from "express";
import db from "../conn.mjs";
import jwt from 'jsonwebtoken';

/*
Reviews Routes:
/ : GET all reviews
/addReview : POST new review
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

router.get("/", authenticate, async (req, res) => {
    let collection = await db.collection("reviews");
    let results = await collection.find({})
    .toArray();
    res.send(results).status(200);
});

router.post('/addReview', authenticate, async (req, res) => {
    let collection = await db.collection("reviews");
    let newReview = req.body;
    newReview.date = new Date().toLocaleDateString();
    let result = await collection.insertOne(newReview);
    res.json({ message: 'Review added successfully', reviewId: result._id })
});


export default router;
