"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripePaymentIntent = exports.sendStripePublishableKey = exports.getAllOrdersByAdmin = exports.processOrder = void 0;
const User_1 = __importDefault(require("../models/User"));
const redis_1 = require("../utils/redis");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Course_1 = __importDefault(require("../models/Course"));
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const orderService_1 = require("../services/orderService");
exports.processOrder = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { courseId, paymentInfo } = req.body;
        if (paymentInfo) {
            if ("id" in paymentInfo) {
                const paymentIntentId = paymentInfo.id;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                if (paymentIntent.status !== "succeeded") {
                    return next(new errorHandler_1.default("Payment failed. Please try again.", 400));
                }
            }
        }
        const user = await User_1.default.findById(req.user?._id);
        const courseExistInUser = user?.courses.some((course) => course._id.toString() === courseId);
        if (courseExistInUser) {
            return next(new errorHandler_1.default("You have already purchased this course. Please check your enrolled courses.", 409));
        }
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found. Please check the course ID.", 404));
        }
        const data = {
            courseId: course._id?.toString() || courseId,
            userId: user?._id?.toString() || req.user?._id?.toString(),
            paymentInfo,
        };
        const orderNumber = (course._id?.toString() || courseId)
            .slice(-6)
            .toUpperCase();
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Order Confirmation - Course Purchase Successful",
                    type: "order-confirmation",
                    data: {
                        userName: user.name,
                        courseName: course.name,
                        orderNumber: orderNumber,
                        amount: course.price.toFixed(2),
                        date: new Date().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }),
                        courseId: course._id?.toString() || courseId,
                    },
                });
            }
        }
        catch (error) {
            console.error("Order confirmation email failed:", error);
        }
        if (course._id && user) {
            user.courses.push({
                courseId: course._id.toString(),
                _id: course._id,
            });
        }
        if (req.user?._id && user) {
            await redis_1.redis.set(req.user._id.toString(), JSON.stringify(user));
        }
        await user?.save();
        await Notification_1.default.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course.name}`,
        });
        course.purchased = (course.purchased || 0) + 1;
        await course.save();
        (0, orderService_1.createOrderRecord)(data, res, next);
    }
    catch (error) {
        return next(new errorHandler_1.default("Order processing failed. Please try again or contact support.", 500));
    }
});
exports.getAllOrdersByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        (0, orderService_1.getAllOrders)(res);
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve orders list.", 500));
    }
});
exports.sendStripePublishableKey = (0, catchAsyncError_1.default)(async (req, res) => {
    res.status(200).json({
        publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});
exports.createStripePaymentIntent = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "USD",
            description: "Learneazy Course Payment",
            metadata: {
                company: "Learneazy",
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.status(201).json({
            success: true,
            clientSecret: myPayment.client_secret,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
//# sourceMappingURL=orderController.js.map