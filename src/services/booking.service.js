import { v4 as uuidv4 } from "uuid";
import Booking from "../models/booking.model.js";
import Quota from "../models/quota.model.js";
import { triggerWorkflow } from "./workflow.service.js";

const BOOKING_STATUS = {
  RECEIVED: "RECEIVED",
  PRICING: "PRICING",
  DISCOUNT_CHECK: "DISCOUNT_CHECK",
  QUOTA_CHECK: "QUOTA_CHECK",
  CONFIRMING: "CONFIRMING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  COMPENSATING: "COMPENSATING"
};

export async function createBooking(payload) {
  const bookingId = uuidv4();

  await Booking.create({
    bookingId,
    ...payload,
    status: BOOKING_STATUS.RECEIVED,
    message: "Booking request received"
  });

  await triggerWorkflow(bookingId);
  return bookingId;
}

export async function pricingService(bookingId) {
  const booking = await Booking.findOne({ bookingId });
  if (!booking) throw new Error("Booking not found");

  booking.status = BOOKING_STATUS.PRICING;
  booking.message = "Calculating base price...";
  await booking.save();

  const basePrice = booking.services.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );

  booking.basePrice = basePrice;
  booking.finalPrice = basePrice;
  await booking.save();
}

export async function discountService(bookingId) {
  const booking = await Booking.findOne({ bookingId });
  if (!booking) throw new Error("Booking not found");

  booking.status = BOOKING_STATUS.DISCOUNT_CHECK;
  booking.message = "Checking discount eligibility...";
  await booking.save();

  const today = new Date();
  const dob = new Date(booking.dob);

  const isBirthday =
    today.getDate() === dob.getDate() &&
    today.getMonth() === dob.getMonth();

  const eligible =
    (booking.gender === "Female" && isBirthday) ||
    booking.basePrice > 1000;

  if (eligible) {
    booking.finalPrice = Math.round(booking.basePrice * 0.88);
    booking.message = "Discount applied";
  } else {
    booking.message = "No discount applicable";
  }

  await booking.save();
}

const DAILY_LIMIT = 2;

export async function quotaService(bookingId) {
  const booking = await Booking.findOne({ bookingId });
  if (!booking) throw new Error("Booking not found");

  booking.status = BOOKING_STATUS.QUOTA_CHECK;
  booking.message = "Checking discount quota...";
  await booking.save();

  if (booking.finalPrice === booking.basePrice) return;

  const today = new Date().toISOString().split("T")[0];
  let quota = await Quota.findOne({ date: today });

  if (!quota) {
    quota = await Quota.create({ date: today, used: 0 });
  }

  if (quota.used >= DAILY_LIMIT) {
    throw new Error("Daily discount quota exceeded");
  }

  quota.used += 1;
  await quota.save();
}

export async function confirmService(bookingId) {
  const booking = await Booking.findOne({ bookingId });
  if (!booking) throw new Error("Booking not found");

  booking.status = BOOKING_STATUS.CONFIRMING;
  booking.message = "Confirming booking...";
  await booking.save();

  booking.referenceId = "BOOK-" + bookingId.slice(0, 8);
  booking.status = BOOKING_STATUS.SUCCESS;
  booking.message = "Booking confirmed successfully";
  await booking.save();
}

export async function compensateService(bookingId, reason) {
  const booking = await Booking.findOne({ bookingId });
  if (!booking) return;

  booking.status = BOOKING_STATUS.COMPENSATING;
  booking.message = "Rolling back booking...";
  await booking.save();

  booking.status = BOOKING_STATUS.FAILED;
  booking.message = reason || "Booking failed";
  await booking.save();
}
