import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from "../conn.mjs";

/*
Users Routes:
/register : POST new user
/login: POST login user
*/

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || "tourtheland-secret";

// Register user
router.post('/register', async (req, res) => {
    let collection = await db.collection("users");
    let { first_name, last_name, email, password } = req.body;
    try {
        let hashedPassword = await bcrypt.hash(password, 10);
        let created_at = new Date().toLocaleDateString();
        let newUser = { first_name, last_name, email, hashedPassword, created_at };
        let result = await collection.insertOne(newUser);
        res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    let collection = await db.collection("users");
    const { email, password } = req.body;
    const user = await collection.findOne({ email });

    if (user && await bcrypt.compare(password, user.hashedPassword)) {
        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
        res.json({ token, first_name: user.first_name, last_name: user.last_name, id: user._id });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

export default router;
