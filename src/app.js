import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import bookingRoutes from "./routes/booking.routes.js";

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());

app.use("/", bookingRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Backend running on port 3000");
  });
});
