"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("colors");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db/db"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const layoutRoutes_1 = __importDefault(require("./routes/layoutRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const cloudinary_1 = require("cloudinary");
const express_rate_limit_1 = require("express-rate-limit");
const error_1 = require("./middleware/error");
// Connect DB and configure cloudinary
(0, db_1.default)();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Create Express app
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "https://the-learnx.vercel.app",
    credentials: true,
}));
// Other middleware
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Rate limiting middleware
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests, please try again later.",
        });
    },
});
// Apply rate limiting to all routes
app.use(limiter);
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "LearnEazy API is running successfully!",
    });
});
// Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/courses", courseRoutes_1.default);
app.use("/api/layouts", layoutRoutes_1.default);
app.use("/api/analytics", analyticsRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
// 404 handler for undefined routes
app.all("*", (req, res, next) => {
    const err = new Error(`API route ${req.originalUrl} not found!`);
    err.statusCode = 404;
    next(err);
});
// Global error handling middleware (must be last)
app.use(error_1.errorMiddleware);
// For local development, start the server
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`.yellow.bold);
    });
}
// For Vercel: export the app as default
exports.default = app;
//# sourceMappingURL=index.js.map