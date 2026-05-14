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

// Register user
router.post('/register', async (req, res) => {
    let collection = await db.collection("users");
    let { first_name, last_name, email, password } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);
    let created_at = new Date().toLocaleDateString();
    let newUser = {first_name, last_name, email, hashedPassword, created_at}
    try {
        let result = await collection.insertOne(newUser);
        res.json({ message: 'User created successfully', userId: result._id })
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Login user
router.post('/login', async (req, res) => {
    let collection = await db.collection("users");
    const { email, password } = req.body;
    const user = await collection.findOne({ email });

    if (user &&  await bcrypt.compare(password, user.hashedPassword)) {
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

export default router;
