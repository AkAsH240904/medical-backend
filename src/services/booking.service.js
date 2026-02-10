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
  pricingService(bookingId);
  discountService(bookingId);
  quotaService(bookingId);
  confirmService(bookingId);
 
  return bookingId;
}

export async function pricingService(bookingId) {
  const booking = await Booking.findOne({ bookingId }).lean();
  if (!booking) throw new Error("Booking not found");

  const basePrice = (booking.services || []).reduce(
    (sum, s) => sum + Number(s.price || 0),
    0
  );

  await Booking.updateOne(
    { bookingId },
    {
      $set: {
        status: BOOKING_STATUS.PRICING,
        message: "Calculating base price...",
        basePrice,
        finalPrice: basePrice
      }
    }
  );
}

export async function discountService(bookingId) {
  const booking = await Booking.findOne({ bookingId }).lean();
  if (!booking) throw new Error("Booking not found");

  const today = new Date();
  const dob = new Date(booking.dob);

  const isBirthday =
    today.getDate() === dob.getDate() &&
    today.getMonth() === dob.getMonth();

  const eligible =
    (booking.gender === "Female" && isBirthday) ||
    booking.basePrice > 1000;

  const finalPrice = eligible
    ? Math.round(booking.basePrice * 0.88)
    : booking.basePrice;

  await Booking.updateOne(
    { bookingId },
    {
      $set: {
        status: BOOKING_STATUS.DISCOUNT_CHECK,
        finalPrice,
        message: eligible ? "Discount applied" : "No discount applicable"
      }
    }
  );
}

const DAILY_LIMIT = 2;

export async function quotaService(bookingId) {
  const booking = await Booking.findOne({ bookingId }).lean();
  if (!booking) throw new Error("Booking not found");

  await Booking.updateOne(
    { bookingId },
    {
      $set: {
        status: BOOKING_STATUS.QUOTA_CHECK,
        message: "Checking discount quota..."
      }
    }
  );

  if (booking.finalPrice === booking.basePrice) return;

  const today = new Date().toISOString().split("T")[0];
  let quota = await Quota.findOne({ date: today });

  if (!quota) {
    quota = await Quota.create({ date: today, used: 0 });
  }

  if (quota.used >= DAILY_LIMIT) {
    throw new Error("Daily discount quota exceeded");
  }

  await Quota.updateOne(
    { date: today },
    { $inc: { used: 1 } }
  );
}

export async function confirmService(bookingId) {
  await Booking.updateOne(
    { bookingId },
    {
      $set: {
        status: BOOKING_STATUS.CONFIRMING,
        message: "Confirming booking..."
      }
    }
  );

  await Booking.updateOne(
    { bookingId },
    {
      $set: {
        status: BOOKING_STATUS.SUCCESS,
        message: "Booking confirmed successfully",
        referenceId: "BOOK-" + bookingId.slice(0, 8)
      }
    }
  );
}

export async function compensateService(bookingId, reason) {
  await Booking.updateOne(
    { bookingId },
    {
      $set: {
        status: BOOKING_STATUS.COMPENSATING,
        message: "Rolling back booking..."
      }
    }
  );

  await Booking.updateOne(
    { bookingId },
    {
      $set: {
        status: BOOKING_STATUS.FAILED,
        message: reason || "Booking failed"
      }
    }
  );
}
