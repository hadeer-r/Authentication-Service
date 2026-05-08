"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        console.error("❌  MONGO_URI is not defined in .env file");
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(mongoURI);
        console.log("✅  MongoDB connected successfully");
    }
    catch (error) {
        console.error("❌  MongoDB connection failed:", error);
        process.exit(1);
    }
};
exports.default = connectDB;
