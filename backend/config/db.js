import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/greatstack");
    console.log("DB connected successfully");
  } catch (error) {
    console.log("DB connection error:", error);
    process.exit(1);
  }
};
