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

export async function pricingHandler(req, res) {
  await pricingService(req.body.bookingId);
  res.json({ ok: true });
}

export async function discountHandler(req, res) {
  await discountService(req.body.bookingId);
  res.json({ ok: true });
}

export async function quotaHandler(req, res) {
  await quotaService(req.body.bookingId);
  res.json({ ok: true });
}

export async function confirmHandler(req, res) {
  await confirmService(req.body.bookingId);
  res.json({ ok: true });
}

export async function compensateHandler(req, res) {
  await compensateService(req.body.bookingId, req.body.reason);
  res.json({ ok: true });
}

