import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  name: String,
  gender: String,
  dob: String,
   services: [
    {
      name: String,
      price: Number
    }
  ],
  status: String,
  message: String,
  basePrice: Number,
  finalPrice: Number,
  referenceId: String
}, { timestamps: true });

export default mongoose.model("Booking", BookingSchema);
