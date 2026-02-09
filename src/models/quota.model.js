import mongoose from "mongoose";

const quotaSchema = new mongoose.Schema({
  date: String,
  used: Number
});

export default mongoose.model("Quota", quotaSchema);
