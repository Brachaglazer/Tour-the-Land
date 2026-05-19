import express from "express";
import nodemailer from "nodemailer";
import db from "../conn.mjs";

/*
Contact Routes:
/ : POST new contact
*/

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const collection = await db.collection("contacts");
        const newDocument = { name, email, message, date: new Date().toLocaleDateString() };
        const result = await collection.insertOne(newDocument);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Contact request from ${name} - ${email}`,
            text: message
        };

        let responseMessage = 'Contact saved successfully.';

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            responseMessage = 'Contact saved, but email is not configured.';
            console.warn('Contact form submission saved without email send because EMAIL_USER or EMAIL_PASS is missing.');
        } else {
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            try {
                await transporter.sendMail(mailOptions);
                responseMessage = 'Contact sent successfully';
            } catch (error) {
                console.error('Email send error:', error);
                responseMessage = 'Contact saved, but email delivery failed.';
            }
        }

        res.json({
            message: responseMessage,
            contactId: result.insertedId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to save contact message. Please try again later.' });
    }
});

export default router;
