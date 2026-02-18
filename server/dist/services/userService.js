"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserRole = exports.getAllUsers = exports.getUserProfileFromCache = void 0;
const redis_1 = require("../utils/redis");
const User_1 = __importDefault(require("../models/User"));
const getUserProfileFromCache = async (id, res) => {
    const userJson = await redis_1.redis.get(id);
    if (userJson) {
        const user = JSON.parse(userJson);
        res.status(201).json({
            success: true,
            user,
        });
    }
    else {
        const user = await User_1.default.findById(id);
        if (user) {
            await redis_1.redis.set(id, JSON.stringify(user), "EX", 604800);
            res.status(201).json({
                success: true,
                user,
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
    }
};
exports.getUserProfileFromCache = getUserProfileFromCache;
const getAllUsers = async (res) => {
    const users = await User_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        users,
    });
};
exports.getAllUsers = getAllUsers;
const changeUserRole = async (res, id, role) => {
    const user = await User_1.default.findByIdAndUpdate(id, { role }, { new: true });
    res.status(201).json({
        success: true,
        user,
    });
};
exports.changeUserRole = changeUserRole;
//# sourceMappingURL=userService.js.map