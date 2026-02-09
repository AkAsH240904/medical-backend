import {
  createBooking,
  pricingService,
  discountService,
  quotaService,
  confirmService,
  compensateService
} from "../services/booking.service.js";

import Booking from "../models/booking.model.js";

export async function createBookingHandler(req, res) {
  try {
    const bookingId = await createBooking(req.body);
    res.status(200).json({ bookingId });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
}

export async function getStatus(req, res) {
  const booking = await Booking.findOne({
    bookingId: req.params.bookingId
  });

  if (!booking) {
    return res.status(200).json({
      status: "NOT_FOUND",
      message: "Booking not found"
    });
  }

  res.status(200).json({
    status: booking.status,
    message: booking.message
  });
}

export async function pricingHandler(req, res) {
  try {
    await pricingService(req.body.bookingId);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
}

export async function discountHandler(req, res) {
  try {
    await discountService(req.body.bookingId);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
}

export async function quotaHandler(req, res) {
  try {
    await quotaService(req.body.bookingId);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
}

export async function confirmHandler(req, res) {
  try {
    await confirmService(req.body.bookingId);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
}

export async function compensateHandler(req, res) {
  try {
    await compensateService(req.body.bookingId, req.body.reason);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
}
