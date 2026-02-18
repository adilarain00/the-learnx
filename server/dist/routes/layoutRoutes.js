"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const layoutController_1 = require("../controllers/layoutController");
const auth_1 = require("../middleware/auth");
router.post("/admin/create-layout", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), layoutController_1.createWebsiteLayoutByAdmin);
router.put("/admin/update-layout", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), layoutController_1.updateWebsiteLayoutByAdmin);
router.get("/public/layout/:type", layoutController_1.getWebsiteLayoutByType);
exports.default = router;
//# sourceMappingURL=layoutRoutes.js.map