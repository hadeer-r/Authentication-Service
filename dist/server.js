"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// Load .env variables first — before anything else
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ─── Connect to Database ──────────────────────────────────────────────────────
(0, db_1.default)();
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express_1.default.json()); // parse incoming JSON bodies
app.use((0, cookie_parser_1.default)()); // parse cookies (needed to read the JWT cookie)
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // allow cookies to be sent cross-origin
}));
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes_1.default);
// ─── 404 Fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found." });
});
// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀  Auth service is running on http://localhost:${PORT}`);
});
