"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAuthenticated = void 0;
const redis_1 = require("../utils/redis");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsyncError_1 = __importDefault(require("./catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
exports.isAuthenticated = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
        return next(new errorHandler_1.default("🔒 Access denied. Please sign in to your account to access this resource.", 401));
    }
    let decoded = null;
    try {
        decoded = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN);
    }
    catch {
        decoded = null;
    }
    if (!decoded || !decoded.id) {
        return next(new errorHandler_1.default("Invalid authentication token. Please sign in again to continue.", 401));
    }
    const user = await redis_1.redis.get(decoded.id);
    if (!user) {
        return next(new errorHandler_1.default("Your session has expired or user data is not available. Please sign in again.", 401));
    }
    req.user = JSON.parse(user);
    next();
});
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user?.role)) {
            return next(new errorHandler_1.default("You do not have permission to perform this action.", 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=auth.js.map