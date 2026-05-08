"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
// Public routes — no token needed
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
router.post("/logout", authController_1.logout);
// Protected routes — must be logged in
router.put("/user/:id", authMiddleware_1.default, authController_1.updateUser);
router.delete("/user/:id", authMiddleware_1.default, authController_1.deleteUser);
exports.default = router;
