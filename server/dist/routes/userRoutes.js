"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const userController_1 = require("../controllers/userController");
const auth_1 = require("./../middleware/auth");
router.post("/auth/register", userController_1.registerNewUser);
router.post("/auth/activate", userController_1.activateUserAccount);
router.post("/auth/login", userController_1.authenticateUser);
router.get("/auth/logout", auth_1.isAuthenticated, userController_1.logoutCurrentUser);
router.get("/auth/refresh-token", userController_1.refreshUserAccessToken);
router.post("/auth/social-login", userController_1.authenticateWithSocialMedia);
router.get("/profile/me", auth_1.isAuthenticated, userController_1.getCurrentUserProfile);
router.put("/profile/update-info", auth_1.isAuthenticated, userController_1.updateUserProfile);
router.put("/profile/change-password", auth_1.isAuthenticated, userController_1.changeUserPassword);
router.put("/profile/update-avatar", auth_1.isAuthenticated, userController_1.updateUserProfilePicture);
router.get("/admin/users", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), userController_1.getAllUsersByAdmin);
router.put("/admin/change-user-role", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), userController_1.changeUserRoleByAdmin);
router.delete("/admin/delete/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), userController_1.deleteUserByAdmin);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map