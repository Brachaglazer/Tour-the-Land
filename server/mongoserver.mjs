import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "express-async-errors";

import contactsRoutes from "./routes/contactsRoutes.mjs";
import itineraryRoutes from "./routes/itineraryRoutes.mjs";
import reviewsRoutes from "./routes/reviewsRoutes.mjs";
import tripsRoutes from "./routes/tripsRoutes.mjs";
import tripUsersRoutes from "./routes/tripUsersRoutes.mjs";
import usersRoutes from "./routes/usersRoutes.mjs";
import weatherRoutes from "./routes/weatherRoutes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const PORT = process.env.PORT || 3000;
const app = express();

const publicDir = path.join(__dirname, "..", "public");

app.use(cors());
app.use(express.json());

app.use("/css", express.static(path.join(publicDir, "css")));
app.use("/js", express.static(path.join(publicDir, "js")));
app.use("/images", express.static(path.join(publicDir, "images")));
app.use("/", express.static(path.join(publicDir, "views")));

app.use("/contacts", contactsRoutes);
app.use("/itinerary", itineraryRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/trips", tripsRoutes);
app.use("/tripUsers", tripUsersRoutes);
app.use("/users", usersRoutes);
app.use("/weather", weatherRoutes);

app.use((err, _req, res, _next) => {
  res.status(500).send("Uh oh! An unexpected error occurred.");
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
