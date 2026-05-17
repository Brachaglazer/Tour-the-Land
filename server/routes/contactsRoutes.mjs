import express from "express";
import nodemailer from "nodemailer";
import db from "../conn.mjs";

/*
Contact Routes:
/ : POST new contact
*/

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'tourtheland43@gmail.com',
        pass: 'pidi qmod nvxh rykr'
    }
});

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const collection = await db.collection("contacts");
        const newDocument = { name, email, message, date: new Date().toLocaleDateString() };
        const result = await collection.insertOne(newDocument);

        const mailOptions = {
            from: 'tourtheland43@gmail.com',
            to: 'tourtheland43@gmail.com',
            subject: `Contact request from ${name} - ${email}`,
            text: message
        };

        let emailSent = false;
        try {
            await transporter.sendMail(mailOptions);
            emailSent = true;
        } catch (error) {
            console.error('Email send error:', error);
        }

        res.json({
            message: emailSent ? 'Contact sent successfully' : 'Contact saved, but email delivery failed',
            contactId: result.insertedId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to save contact message. Please try again later.' });
    }
});

export default router;
