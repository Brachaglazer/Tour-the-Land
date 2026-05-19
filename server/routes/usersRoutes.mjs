import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import db from "../conn.mjs";

/*
Users Routes:
/register : POST new user
/login: POST login user
/me: GET current user
*/

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || "tourtheland-secret";

function authenticate(req, res, next) {
    const token = req?.headers?.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided.' });

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Failed to authenticate token.' });
    }
}

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
        res.json({ token, first_name: user.first_name, last_name: user.last_name, id: user._id, message: 'Logged in successfully' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

router.post('/logout', async (_req, res) => {
    res.json({ message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req, res) => {
    try {
        const collection = await db.collection("users");
        const user = await collection.findOne({ _id: new ObjectId(req.user.userId) }, { projection: { hashedPassword: 0 } });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json({ id: user._id, first_name: user.first_name, last_name: user.last_name, email: user.email });
    } catch (error) {
        res.status(500).json({ message: 'Failed to load user.' });
    }
});

export default router;
