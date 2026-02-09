import express from "express";
import {
  createBookingHandler,
  getStatus,
  pricingHandler,
  discountHandler,
  quotaHandler,
  confirmHandler,
  compensateHandler
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/booking", createBookingHandler);
router.get("/booking/status/:bookingId", getStatus);

router.post("/booking/pricing", pricingHandler);
router.post("/booking/discount", discountHandler);
router.post("/booking/quota", quotaHandler);
router.post("/booking/confirm", confirmHandler);
router.post("/booking/compensate", compensateHandler);

export default router;
