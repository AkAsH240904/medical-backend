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
router.get("/booking/:bookingId/status", getStatus);
router.post("/pricing", pricingHandler);
router.post("/discount", discountHandler);
router.post("/quota", quotaHandler);
router.post("/confirm", confirmHandler);
router.post("/compensate", compensateHandler);


export default router;
