"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
router.get("/admin/all-notifications", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), notificationController_1.getAllNotificationsByAdmin);
router.put("/admin/mark-read/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), notificationController_1.markNotificationAsRead);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map