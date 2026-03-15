"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoUrl = exports.deleteCourseByAdmin = exports.getAllCoursesByAdmin = exports.addReviewReply = exports.addCourseReview = exports.addQuestionAnswer = exports.addCourseQuestion = exports.getEnrolledCourseContent = exports.getAllPublicCoursePreviews = exports.getCoursePublicPreview = exports.updateCourseDetails = exports.createNewCourse = void 0;
const redis_1 = require("../utils/redis");
const courseService_1 = require("../services/courseService");
const cloudinary_1 = __importDefault(require("cloudinary"));
const Course_1 = __importDefault(require("../models/Course"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const Notification_1 = __importDefault(require("../models/Notification"));
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const axios_1 = __importDefault(require("axios"));
exports.createNewCourse = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        (0, courseService_1.createCourse)(data, res, next);
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to create course. Please try again.", 500));
    }
});
exports.updateCourseDetails = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const courseData = (await Course_1.default.findById(courseId));
        if (thumbnail && !thumbnail.startsWith("https")) {
            await cloudinary_1.default.v2.uploader.destroy(courseData.thumbnail.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if (thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData?.thumbnail.public_id,
                url: courseData?.thumbnail.url,
            };
        }
        const course = await Course_1.default.findByIdAndUpdate(courseId, {
            $set: data,
        }, { new: true });
        await redis_1.redis.set(courseId, JSON.stringify(course));
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to update course. Please try again.", 500));
    }
});
exports.getCoursePublicPreview = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const isCacheExist = await redis_1.redis.get(courseId);
        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const course = await Course_1.default.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
            res.status(200).json({
                success: true,
                course,
            });
        }
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve course preview.", 500));
    }
});
exports.getAllPublicCoursePreviews = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const courses = await Course_1.default.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        res.status(200).json({
            success: true,
            courses,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve courses.", 500));
    }
});
exports.getEnrolledCourseContent = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        const courseExists = userCourseList?.find((course) => course._id.toString() === courseId);
        if (!courseExists) {
            return next(new errorHandler_1.default("You are not enrolled in this course. Please purchase the course to access its content.", 403));
        }
        const course = await Course_1.default.findById(courseId);
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            content,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve course content.", 500));
    }
});
exports.addCourseQuestion = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const { question, courseId, contentId } = req.body;
    if (!question || !courseId || !contentId) {
        return next(new errorHandler_1.default("All fields are required.", 400));
    }
    const course = await Course_1.default.findById(courseId);
    if (!course) {
        return next(new errorHandler_1.default("Course not found.", 404));
    }
    // 🔥 FIXED ID MATCHING
    const courseContent = course.courseData.find((item) => item._id.toString() === contentId.toString());
    if (!courseContent) {
        return next(new errorHandler_1.default("Course content not found.", 404));
    }
    if (!req.user) {
        return next(new errorHandler_1.default("User not authenticated", 401));
    }
    const newQuestion = {
        user: {
            _id: req.user._id,
            name: req.user.name,
            avatar: {
                public_id: req.user.avatar?.public_id || "",
                url: req.user.avatar?.url || "",
            },
            role: req.user.role,
        },
        question: question.trim(),
        questionReplies: [],
    };
    courseContent.questions.push(newQuestion);
    await course.save();
    if (!Array.isArray(courseContent.questions)) {
        courseContent.questions = [];
    }
    courseContent.questions.push(newQuestion);
    await course.save();
    await Notification_1.default.create({
        user: req.user._id,
        title: "New Question Received",
        message: `You have a new question in ${course.name}`,
    });
    res.status(201).json({
        success: true,
        message: "Question added successfully",
    });
});
exports.addQuestionAnswer = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const course = await Course_1.default.findById(courseId);
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandler_1.default("Course content not found.", 404));
        }
        const question = courseContent?.questions?.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new errorHandler_1.default("Question not found.", 404));
        }
        const newAnswer = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        question.questionReplies.push(newAnswer);
        await course?.save();
        if (req.user?._id === question.user._id) {
            await Notification_1.default.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `You have a new question in ${course?.name}`,
            });
        }
        else {
            try {
                await (0, sendMail_1.default)({
                    email: question.user.email,
                    subject: "Your Question Has Been Answered - Learneazy LMS",
                    type: "question-reply",
                    data: {
                        name: question.user.name,
                        title: courseContent.title,
                        answer: answer,
                        questionText: question.question,
                        instructorName: req.user?.name || "Course Instructor",
                        courseId: courseId,
                    },
                });
            }
            catch (error) {
                return next(new errorHandler_1.default("Failed to add answer. Please try again.", 500));
            }
        }
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
exports.addCourseReview = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        const courseExists = userCourseList?.some((course) => course._id.toString() === courseId.toString());
        if (!courseExists) {
            return next(new errorHandler_1.default("You must be enrolled in this course to leave a review.", 403));
        }
        const course = await Course_1.default.findById(courseId);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            rating,
            comment: review,
        };
        let avg = 0;
        course?.reviews.push(reviewData);
        course?.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        if (course) {
            course.ratings = avg / course.reviews.length;
        }
        await course?.save();
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
        await Notification_1.default.create({
            user: req.user?._id,
            title: "New Review Received",
            message: `${req.user?.name} has given a review in ${course?.name}`,
        });
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to add review. Please try again.", 500));
    }
});
exports.addReviewReply = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found.", 404));
        }
        const review = course?.reviews?.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            return next(new errorHandler_1.default("Review not found.", 404));
        }
        const replyData = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);
        await course?.save();
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to add reply. Please try again.", 500));
    }
});
exports.getAllCoursesByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        (0, courseService_1.getAllCourses)(res);
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve courses list.", 500));
    }
});
exports.deleteCourseByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course_1.default.findById(id);
        if (!course) {
            return next(new errorHandler_1.default("Course not found.", 404));
        }
        await Course_1.default.findByIdAndDelete(id);
        await redis_1.redis.del(id);
        res.status(200).json({
            success: true,
            message: "Course deleted successfully.",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to delete course.", 500));
    }
});
exports.generateVideoUrl = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { videoId } = req.body;
        const response = await axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Apisecret ${process.env.VDOCIPHER_API_KEY}`,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
//# sourceMappingURL=courseController.js.map