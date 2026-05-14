import express from "express";
import cors from "cors";
import "express-async-errors";
import contactsRoutes from "./routes/contactsRoutes.mjs";
import itineraryRoutes from "./routes/itineraryRoutes.mjs"
import reviewsRoutes from "./routes/reviewsRoutes.mjs";
import tripsRoutes from "./routes/tripsRoutes.mjs";
import tripUsersRoutes from "./routes/tripUsersRoutes.mjs"
import usersRoutes from "./routes/usersRoutes.mjs"


const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/contacts", contactsRoutes);
app.use("/itinerary", itineraryRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/trips", tripsRoutes);
app.use("/tripUsers", tripUsersRoutes);
app.use("/users", usersRoutes);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occured.")
})

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
