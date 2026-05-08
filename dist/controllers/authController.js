"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateToken = (id, role) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    return jsonwebtoken_1.default.sign({ id, role }, secret, { expiresIn });
};
const setTokenCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true, // JS in the browser cannot read this cookie
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
};
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ message: "Please provide name, email, and password." });
        return;
    }
    if (!isValidEmail(email)) {
        res.status(400).json({ message: "Please provide a valid email address." });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ message: "Password must be at least 6 characters." });
        return;
    }
    try {
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: "A user with this email already exists." });
            return;
        }
        // Create the user — password hashing happens in the model's pre-save hook
        const user = await User_1.default.create({ name, email, password, role });
        const token = generateToken(user._id.toString(), user.role);
        setTokenCookie(res, token);
        res.status(201).json({ message: "Registration successful." });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
};
exports.register = register;
// ─── Login ───────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Please provide email and password." });
        return;
    }
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        const token = generateToken(user._id.toString(), user.role);
        setTokenCookie(res, token);
        // Return user info — never return the password
        res.status(200).json({
            message: "Login successful.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};
exports.login = login;
// ─── Logout ──────────────────────────────────────────────────────────────────
const logout = (_req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully." });
};
exports.logout = logout;
// ─── Update User ─────────────────────────────────────────────────────────────
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    if (email && !isValidEmail(email)) {
        res.status(400).json({ message: "Please provide a valid email address." });
        return;
    }
    try {
        // Build the update object with only the fields that were actually sent
        const updates = {};
        if (name)
            updates.name = name;
        if (email)
            updates.email = email;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ message: "No valid fields to update." });
            return;
        }
        // Check if the new email is already taken by someone else
        if (email) {
            const emailTaken = await User_1.default.findOne({ email, _id: { $ne: id } });
            if (emailTaken) {
                res.status(409).json({ message: "This email is already in use." });
                return;
            }
        }
        const updatedUser = await User_1.default.findByIdAndUpdate(id, updates, {
            new: true, // return the updated document
            runValidators: true, // run schema validators on update
        }).select("-password");
        if (!updatedUser) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res.status(200).json({ message: "User updated successfully.", user: updatedUser });
    }
    catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: "Server error during update." });
    }
};
exports.updateUser = updateUser;
// ─── Delete User ─────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
    const { id } = req.params;
    // A user can only delete their own account
    if (req.user?.id !== id) {
        res.status(403).json({ message: "You are not allowed to delete another user's account." });
        return;
    }
    try {
        const user = await User_1.default.findByIdAndDelete(id);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Clear the cookie after account deletion
        res.clearCookie("token");
        res.status(200).json({ message: "Account deleted successfully." });
    }
    catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Server error during deletion." });
    }
};
exports.deleteUser = deleteUser;
