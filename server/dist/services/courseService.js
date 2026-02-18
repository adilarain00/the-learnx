"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCourses = exports.createCourse = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
exports.createCourse = (0, catchAsyncError_1.default)(async (data, res) => {
    const course = await Course_1.default.create(data);
    res.status(201).json({
        success: true,
        course,
    });
});
const getAllCourses = async (res) => {
    const courses = await Course_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        courses,
    });
};
exports.getAllCourses = getAllCourses;
//# sourceMappingURL=courseService.js.map