import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });
console.log(`Loaded env from ${envPath}`);
console.log(`EMAIL_USER ${process.env.EMAIL_USER ? 'present' : 'missing'}, EMAIL_PASS ${process.env.EMAIL_PASS ? 'present' : 'missing'}`);

import usersRoutes from "./routes/usersRoutes.mjs";
import contactsRoutes from "./routes/contactsRoutes.mjs";
import reviewsRoutes from "./routes/reviewsRoutes.mjs";
import tripsRoutes from "./routes/tripsRoutes.mjs";
import itineraryRoutes from "./routes/itineraryRoutes.mjs";
import tripUsersRoutes from "./routes/tripUsersRoutes.mjs";
import weatherRoutes from "./routes/weatherRoutes.mjs";

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Warning: EMAIL_USER or EMAIL_PASS is not configured in the loaded .env file.");
}

app.use(express.static(path.join(__dirname, "../public")));
app.use("/users", usersRoutes);
app.use("/contacts", contactsRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/trips", tripsRoutes);
app.use("/itinerary", itineraryRoutes);
app.use("/tripUsers", tripUsersRoutes);
app.use("/weather", weatherRoutes);

const viewPages = ["index", "login", "register", "contact", "reviews", "trips"];
app.get('/:page.html', (req, res, next) => {
    const pageName = req.params.page;
    if (!viewPages.includes(pageName)) return next();
    res.sendFile(path.join(__dirname, `../public/views/${pageName}.html`));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/views/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});