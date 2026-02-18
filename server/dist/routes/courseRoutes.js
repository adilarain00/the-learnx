"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("./../middleware/auth");
router.post("/admin/create", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), courseController_1.createNewCourse);
router.put("/admin/update/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), courseController_1.updateCourseDetails);
router.get("/admin/all-courses", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), courseController_1.getAllCoursesByAdmin);
router.delete("/admin/delete/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), courseController_1.deleteCourseByAdmin);
router.get("/public/preview/:id", courseController_1.getCoursePublicPreview);
router.get("/public/all-previews", courseController_1.getAllPublicCoursePreviews);
router.get("/enrolled/content/:id", auth_1.isAuthenticated, courseController_1.getEnrolledCourseContent);
router.put("/enrolled/question", auth_1.isAuthenticated, courseController_1.addCourseQuestion);
router.put("/enrolled/answer", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin", "instructor"), courseController_1.addQuestionAnswer);
router.put("/enrolled/review/:id", auth_1.isAuthenticated, courseController_1.addCourseReview);
router.put("/enrolled/review-reply", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), courseController_1.addReviewReply);
router.post("/video/getVdoCipherOTP", courseController_1.generateVideoUrl);
exports.default = router;
//# sourceMappingURL=courseRoutes.js.map