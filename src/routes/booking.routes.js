import express from "express";
import {
  createBookingHandler,
  getStatus
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/booking", createBookingHandler);
router.get("/booking/:bookingId/status", getStatus);

export default router;
