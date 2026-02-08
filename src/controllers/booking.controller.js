import createBooking from "../services/booking.service.js";
import Booking from "../models/booking.model.js";

export async function createBookingHandler(req, res) {
  try {
    const bookingId =  await createBooking(req.body);
    res.json({ bookingId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getStatus(req, res) {
  const booking = await Booking.findOne({
    bookingId: req.params.bookingId
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  res.json({
    status: booking.status,
    message: booking.message
  });
}
