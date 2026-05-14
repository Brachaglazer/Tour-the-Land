import express from "express";
import db from "../conn.mjs";

/*
Reviews Routes:
/ : GET all reviews
/addReview : POST new review
*/

const router = express.Router();

router.get("/", async (req, res) => {
    let collection = await db.collection("reviews");
    let results = await collection.find({})
    .toArray();
    res.send(results).status(200);
});

router.post('/addReview', async (req, res) => {
    let collection = await db.collection("reviews");
    let newReview = req.body;
    newReview.date = new Date().toLocaleDateString();
    let result = await collection.insertOne(newReview);
    res.json({ message: 'Review added successfully', reviewId: result._id })
});


export default router;
