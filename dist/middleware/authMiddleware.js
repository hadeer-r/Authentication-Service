"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    // Read the JWT from the HttpOnly cookie
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: "Not authorized. No token found." });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Attach the decoded user info to the request
        req.user = { id: decoded.id, role: decoded.role };
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Not authorized. Token is invalid." });
    }
};
exports.default = protect;
