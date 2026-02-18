"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
router.get("/admin/users", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analyticsController_1.getUserAnalyticsByAdmin);
router.get("/admin/orders", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analyticsController_1.getOrderAnalyticsByAdmin);
router.get("/admin/courses", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analyticsController_1.getCourseAnalyticsByAdmin);
exports.default = router;
//# sourceMappingURL=analyticsRoutes.js.map