"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
router.get("/admin/all-orders", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), orderController_1.getAllOrdersByAdmin);
router.post("/process-order", auth_1.isAuthenticated, orderController_1.processOrder);
router.get("/stripe-publishable-key", orderController_1.sendStripePublishableKey);
router.post("/create-payment-intent", orderController_1.createStripePaymentIntent);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map