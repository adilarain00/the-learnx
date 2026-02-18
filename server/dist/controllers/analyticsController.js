"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderAnalyticsByAdmin = exports.getCourseAnalyticsByAdmin = exports.getUserAnalyticsByAdmin = void 0;
const analyticsGenerator_1 = require("../utils/analyticsGenerator");
const User_1 = __importDefault(require("../models/User"));
const Order_1 = __importDefault(require("../models/Order"));
const Course_1 = __importDefault(require("../models/Course"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
exports.getUserAnalyticsByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const users = await (0, analyticsGenerator_1.generateLast12MothsData)(User_1.default);
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve user analytics. Please try again.", 500));
    }
});
exports.getCourseAnalyticsByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const courses = await (0, analyticsGenerator_1.generateLast12MothsData)(Course_1.default);
        res.status(200).json({
            success: true,
            courses,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve course analytics. Please try again.", 500));
    }
});
exports.getOrderAnalyticsByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const orders = await (0, analyticsGenerator_1.generateLast12MothsData)(Order_1.default);
        res.status(200).json({
            success: true,
            orders,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve order analytics. Please try again.", 500));
    }
});
//# sourceMappingURL=analyticsController.js.map