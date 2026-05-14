import express from "express";
import db from "../conn.mjs";

/*
Users Routes:
/ : POST new user
*/

const router = express.Router();

router.post('/', async (req, res) => {
    let collection = await db.collection("users");
    let newUser = req.body;
    newUser.created_at = new Date().toLocaleDateString();
    let result = await collection.insertOne(newUser);
    res.json({ message: 'User added successfully', userId: result._id })
});


export default router;
