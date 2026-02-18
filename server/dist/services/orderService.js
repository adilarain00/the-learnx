"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.createOrderRecord = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
exports.createOrderRecord = (0, catchAsyncError_1.default)(async (data, res) => {
    const order = await Order_1.default.create(data);
    res.status(201).json({
        succcess: true,
        order,
    });
});
const getAllOrders = async (res) => {
    const orders = await Order_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        orders,
    });
};
exports.getAllOrders = getAllOrders;
//# sourceMappingURL=orderService.js.map