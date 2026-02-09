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
  try {
    if (!req.body.bookingId) {
      return res.status(400).json({ error: "bookingId required" });
    }
    await pricingService(req.body.bookingId);
    res.json({ ok: true });
  } catch (err) {
    console.error("Pricing error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function discountHandler(req, res) {
  try {
    await discountService(req.body.bookingId);
    res.json({ ok: true });
  } catch (err) {
    console.error("Discount error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function quotaHandler(req, res) {
  try {
    await quotaService(req.body.bookingId);
    res.json({ ok: true });
  } catch (err) {
    console.error("Quota error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function confirmHandler(req, res) {
  try {
    await confirmService(req.body.bookingId);
    res.json({ ok: true });
  } catch (err) {
    console.error("Confirm error:", err);
    res.status(500).json({ error: err.message });
  }
}


export async function compensateHandler(req, res) {
  try {
    await compensateService(req.body.bookingId, req.body.reason);
    res.json({ ok: true });
  } catch (err) {
    console.error("Compensation error:", err);
    res.json({ ok: false, error: err.message });
  }
}


