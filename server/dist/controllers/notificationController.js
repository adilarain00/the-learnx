"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationAsRead = exports.getAllNotificationsByAdmin = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const Notification_1 = __importDefault(require("../models/Notification"));
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
exports.getAllNotificationsByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const notifications = await Notification_1.default.find().sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve notifications.", 500));
    }
});
exports.markNotificationAsRead = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const notification = await Notification_1.default.findById(req.params.id);
        if (!notification) {
            return next(new errorHandler_1.default("Notification not found.", 404));
        }
        else {
            notification.status
                ? (notification.status = "read")
                : notification?.status;
        }
        await notification.save();
        const notifications = await Notification_1.default.find().sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to mark notification as read.", 500));
    }
});
node_cron_1.default.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await Notification_1.default.deleteMany({
        status: "read",
        createdAt: { $lt: thirtyDaysAgo },
    });
    console.log("Deleted read notifications. Notifications older than 30 days.");
});
//# sourceMappingURL=notificationController.js.map