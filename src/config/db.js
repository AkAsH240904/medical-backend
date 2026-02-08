import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(
      `DB connected successfully! Host: ${conn.connection.host}`
    );

  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

export default connectDb;
