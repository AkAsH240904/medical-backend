import { v4 as uuidv4 } from "uuid";
import Booking from "../models/booking.model.js";

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

async function createBooking(payload) {
  const bookingId = uuidv4();

  Booking.create({
    bookingId,
    ...payload,
    status: BOOKING_STATUS.RECEIVED,
    message: "Booking request received"
  });

  // runSaga(bookingId).catch((err) => {
  //   console.error("Saga crashed globally:", err);
  // });
  setTimeout(async () => {
  await Booking.updateOne(
    { bookingId },
    { status: "PRICING", message: "Calculating base price..." }
  );
}, 3000);

  await triggerWorkflow(bookingId);
  return bookingId;
}
async function triggerWorkflow(bookingId) {
    console.log("Workflow triggered for", bookingId);
  }
async function runSaga(bookingId) {
  try {
    console.log("SAGA START:", bookingId);

    await update(
      bookingId,
      BOOKING_STATUS.PRICING,
      "Calculating base price..."
    );

    await delay();

    const booking = await Booking.findOne({ bookingId }).lean();

if (!booking) {
  throw new Error("Booking not found");
}

console.log("Services:", booking.services);

const basePrice = (booking.services || []).reduce(
  (sum, s) => sum + (Number(s?.price) || 0),
  0
);

console.log("Base price calculated:", basePrice);

await Booking.updateOne(
  { bookingId },
  { $set: { basePrice } }
);


    console.log("Base price saved");

    await update(
      bookingId,
      BOOKING_STATUS.CONFIRMING,
      "Confirming booking..."
    );

    await delay();

    await Booking.updateOne(
      { bookingId },
      {
        $set: {
          status: BOOKING_STATUS.SUCCESS,
          message: "Booking confirmed",
          finalPrice: basePrice,
          referenceId: "BOOK-" + bookingId.slice(0, 8)
        }
      }
    );

    console.log("SAGA COMPLETED SUCCESSFULLY");

  } catch (err) {
    console.error("Saga error:", err);
    await compensate(bookingId, err.message);
  }
}

async function compensate(bookingId, reason) {
  console.log("COMPENSATION STARTED");

  await Booking.updateOne(
    { bookingId },
    {
      $set: {
        status: BOOKING_STATUS.COMPENSATING,
        message: "Rolling back booking..."
      }
    }
  );

  await delay();

  await Booking.updateOne(
    { bookingId },
    {
      $set: {
        status: BOOKING_STATUS.FAILED,
        message: reason || "Booking failed"
      }
    }
  );

  console.log("COMPENSATION COMPLETED");
}

async function update(id, status, message) {
  if (!status) {
    throw new Error("Invalid booking status");
  }

  await Booking.updateOne(
    { bookingId: id },
    {
      $set: { status, message }
    }
  );
}

// function delay(ms = 1500) {
//   return new Promise((res) => setTimeout(res, ms));
// }

export default createBooking;
