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

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'tourtheland43@gmail.com',
            pass: 'pidi qmod nvxh rykr'
        }
    });

    // Email message options
    const mailOptions = {
        from: 'tourtheland43@gmail.com',
        to: 'tourtheland43@gmail.com',
        subject: `Contact request from ${name} - ${email}`,
        text: message
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
	    console.log(`Message from ${name} - ${email}`);
            res.status(500).json({ message: 'Failed to send email' });
        } else {
            console.log('Email sent: ' + info.response);
            res.json({ message: 'Email sent successfully' });
        }
    });

    // Add contact info to db
    let collection = await db.collection("contacts");
    let newDocument = req.body;
    newDocument.date = new Date().toLocaleDateString();
    let result = await collection.insertOne(newDocument);
    res.json({ message: 'Contact sent successfully', contactId: result._id })
});



export default router;
