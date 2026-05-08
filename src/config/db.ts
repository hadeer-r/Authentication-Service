import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error("❌  MONGO_URI is not defined in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("✅  MongoDB connected successfully");
  } catch (error) {
    console.error("❌  MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
