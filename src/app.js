import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import bookingRoutes from "./routes/booking.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Medical Booking API Running");
});

app.use("/", bookingRoutes);

const PORT = process.env.PORT || 8080;

// connectDB()
//   .then(() => {
//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("DB connection failed:", err);
//   });

async function startServer() {
  try {
    //await connectDB();
    console.log("DB connected");
  } catch (err) {
    console.error("DB failed:", err);
  }

  app.listen(process.env.PORT || 8080, () => {
    console.log("Server running");
  });
}

startServer();
