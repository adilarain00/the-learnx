"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoUrl = exports.deleteCourseByAdmin = exports.getAllCoursesByAdmin = exports.addReviewReply = exports.addCourseReview = exports.addQuestionAnswer = exports.addCourseQuestion = exports.getEnrolledCourseContent = exports.getAllPublicCoursePreviews = exports.getCoursePublicPreview = exports.updateCourseDetails = exports.createNewCourse = void 0;
const redis_1 = require("../utils/redis");
const courseService_1 = require("../services/courseService");
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const Course_1 = __importDefault(require("../models/Course"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const Notification_1 = __importDefault(require("../models/Notification"));
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const axios_1 = __importDefault(require("axios"));
const getSafeUserSnapshot = (user) => {
    if (!user?._id)
        return null;
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
    };
};
const isUserEnrolledInCourse = (user, courseId) => {
    const list = user?.courses;
    if (!courseId || !Array.isArray(list))
        return false;
    return list.some((c) => {
        const byId = c?._id?.toString?.() === courseId.toString();
        const byCourseId = c?.courseId?.toString?.() === courseId.toString();
        return byId || byCourseId;
    });
};
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
        const courseExists = isUserEnrolledInCourse(req.user, courseId);
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
    try {
        const { question, courseId, contentId } = req.body;
        if (!question || !courseId || !contentId) {
            return next(new errorHandler_1.default("Missing required fields: question, courseId, contentId.", 400));
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId) ||
            !mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandler_1.default("Invalid courseId or contentId.", 400));
        }
        if (!isUserEnrolledInCourse(req.user, courseId)) {
            return next(new errorHandler_1.default("You must be enrolled in this course to ask a question.", 403));
        }
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found.", 404));
        }
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandler_1.default("Course content not found.", 404));
        }
        const userSnapshot = getSafeUserSnapshot(req.user);
        if (!userSnapshot) {
            return next(new errorHandler_1.default("User not authenticated.", 401));
        }
        const normalizedQuestion = typeof question === "string" ? question.trim() : "";
        if (!normalizedQuestion) {
            return next(new errorHandler_1.default("Question cannot be empty.", 400));
        }
        const newQuestion = {
            user: userSnapshot,
            question: normalizedQuestion,
            questionReplies: [],
        };
        if (!Array.isArray(courseContent.questions)) {
            courseContent.questions = [];
        }
        courseContent.questions.push(newQuestion);
        await course.save();
        // Best-effort notification: do not fail question creation if notification fails
        try {
            await Notification_1.default.create({
                title: "New Question Received",
                message: `You have a new question in ${course?.name}`,
            });
        }
        catch (notificationError) {
            console.error("Failed to create notification for new course question:", notificationError);
        }
        res.status(200).json({
            success: true,
            message: "Question added successfully.",
            course,
        });
    }
    catch (error) {
        console.error("addCourseQuestion failed:", error);
        return next(new errorHandler_1.default("Failed to add question. Please try again.", 500));
    }
});
exports.addQuestionAnswer = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        if (!answer || !courseId || !contentId || !questionId) {
            return next(new errorHandler_1.default("Missing required fields: answer, courseId, contentId, questionId.", 400));
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId) ||
            !mongoose_1.default.Types.ObjectId.isValid(contentId) ||
            !mongoose_1.default.Types.ObjectId.isValid(questionId)) {
            return next(new errorHandler_1.default("Invalid courseId, contentId, or questionId.", 400));
        }
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found.", 404));
        }
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandler_1.default("Course content not found.", 404));
        }
        const question = courseContent?.questions?.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new errorHandler_1.default("Question not found.", 404));
        }
        const normalizedAnswer = typeof answer === "string" ? answer.trim() : "";
        if (!normalizedAnswer) {
            return next(new errorHandler_1.default("Answer cannot be empty.", 400));
        }
        const answerUserSnapshot = getSafeUserSnapshot(req.user);
        if (!answerUserSnapshot) {
            return next(new errorHandler_1.default("User not authenticated.", 401));
        }
        const newAnswer = {
            user: answerUserSnapshot,
            answer: normalizedAnswer,
            _id: new mongoose_1.default.Types.ObjectId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        if (!Array.isArray(question.questionReplies)) {
            question.questionReplies = [];
        }
        question.questionReplies.push(newAnswer);
        await course.save();
        // Best-effort side effects: never fail after saving (prevents duplicate answers on retries)
        const questionOwnerId = question?.user?._id;
        const answerOwnerId = req.user?._id;
        // If someone other than the question owner answered, notify via email.
        if (answerOwnerId &&
            questionOwnerId &&
            answerOwnerId.toString() !== questionOwnerId.toString()) {
            try {
                await (0, sendMail_1.default)({
                    email: question.user.email,
                    subject: "Your Question Has Been Answered - Learneazy LMS",
                    type: "question-reply",
                    data: {
                        name: question.user.name,
                        title: courseContent.title,
                        answer: newAnswer.answer,
                        questionText: question.question,
                        instructorName: req.user?.name || "Course Instructor",
                        courseId: courseId,
                    },
                });
            }
            catch (mailError) {
                console.error("Failed to send question reply email:", mailError);
            }
        }
        // Persist a notification record (admin dashboard), best-effort.
        try {
            await Notification_1.default.create({
                title: "New Question Reply Received",
                message: `A question received a new reply in ${course?.name}`,
            });
        }
        catch (notificationError) {
            console.error("Failed to create notification for question reply:", notificationError);
        }
        res.status(200).json({
            success: true,
            message: "Answer added successfully.",
            course,
        });
    }
    catch (error) {
        console.error("addQuestionAnswer failed:", error);
        return next(new errorHandler_1.default("Failed to add answer. Please try again.", 500));
    }
});
exports.addCourseReview = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return next(new errorHandler_1.default("Invalid courseId.", 400));
        }
        const courseExists = isUserEnrolledInCourse(req.user, courseId);
        if (!courseExists) {
            return next(new errorHandler_1.default("You must be enrolled in this course to leave a review.", 403));
        }
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found.", 404));
        }
        const { review, rating } = req.body;
        const normalizedReview = typeof review === "string" ? review.trim() : "";
        if (!normalizedReview) {
            return next(new errorHandler_1.default("Review cannot be empty.", 400));
        }
        const numericRating = Number(rating);
        if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
            return next(new errorHandler_1.default("Rating must be a number between 1 and 5.", 400));
        }
        const reviewUserSnapshot = getSafeUserSnapshot(req.user);
        if (!reviewUserSnapshot) {
            return next(new errorHandler_1.default("User not authenticated.", 401));
        }
        const alreadyReviewed = course.reviews?.some((rev) => {
            const reviewerId = rev?.user?._id?.toString?.();
            return reviewerId && reviewerId === reviewUserSnapshot._id.toString();
        });
        if (alreadyReviewed) {
            return next(new errorHandler_1.default("You have already reviewed this course.", 409));
        }
        const reviewData = {
            user: reviewUserSnapshot,
            rating: numericRating,
            comment: normalizedReview,
            commentReplies: [],
        };
        course.reviews.push(reviewData);
        const total = course.reviews.reduce((sum, rev) => {
            const value = Number(rev?.rating);
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);
        course.ratings =
            course.reviews.length > 0 ? total / course.reviews.length : 0;
        await course.save();
        // Best-effort cache + notifications: never fail after saving (prevents duplicate reviews on retries)
        try {
            await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
        }
        catch (cacheError) {
            console.error("Failed to cache course after review:", cacheError);
        }
        try {
            await Notification_1.default.create({
                title: "New Review Received",
                message: `${reviewUserSnapshot?.name} has given a review in ${course?.name}`,
            });
        }
        catch (notificationError) {
            console.error("Failed to create notification for review:", notificationError);
        }
        res.status(200).json({
            success: true,
            message: "Review added successfully.",
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
        if (!comment || typeof comment !== "string" || !comment.trim()) {
            return next(new errorHandler_1.default("Reply comment cannot be empty.", 400));
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId) ||
            !mongoose_1.default.Types.ObjectId.isValid(reviewId)) {
            return next(new errorHandler_1.default("Invalid courseId or reviewId.", 400));
        }
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found.", 404));
        }
        const review = course?.reviews?.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            return next(new errorHandler_1.default("Review not found.", 404));
        }
        const replyUserSnapshot = getSafeUserSnapshot(req.user);
        if (!replyUserSnapshot) {
            return next(new errorHandler_1.default("User not authenticated.", 401));
        }
        const replyData = {
            user: replyUserSnapshot,
            comment: comment.trim(),
            _id: new mongoose_1.default.Types.ObjectId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);
        await course.save();
        try {
            await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
        }
        catch (cacheError) {
            console.error("Failed to cache course after review reply:", cacheError);
        }
        res.status(200).json({
            success: true,
            message: "Reply added successfully.",
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