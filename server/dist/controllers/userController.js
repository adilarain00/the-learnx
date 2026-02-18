"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserByAdmin = exports.changeUserRoleByAdmin = exports.getAllUsersByAdmin = exports.updateUserProfilePicture = exports.changeUserPassword = exports.updateUserProfile = exports.getCurrentUserProfile = exports.authenticateWithSocialMedia = exports.refreshUserAccessToken = exports.logoutCurrentUser = exports.authenticateUser = exports.activateUserAccount = exports.createActivationToken = exports.registerNewUser = void 0;
const redis_1 = require("../utils/redis");
const jwt_1 = require("../utils/jwt");
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userService_1 = require("../services/userService");
const cloudinary_1 = __importDefault(require("cloudinary"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
exports.registerNewUser = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return next(new errorHandler_1.default("Account already exists. Please sign in or use a different email.", 409));
        }
        const user = {
            name,
            email,
            password,
        };
        const activationToken = (0, exports.createActivationToken)(user);
        const activationCode = activationToken.activationCode;
        await (0, sendMail_1.default)({
            name,
            email,
            subject: "Activate Your Learneazy Account",
            activationCode,
            data: {
                user: { name: user.name },
                activationCode,
            },
        });
        res.status(200).json({
            success: true,
            message: `Check your email ${email
                .trim()
                .toLowerCase()} to activate your account in 5 mins`,
            activationToken: activationToken.token,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Registration failed. Please try again.", 500));
    }
});
const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({ user, activationCode }, process.env.JWT_SECRET, {
        expiresIn: "5m",
    });
    return { token, activationCode };
};
exports.createActivationToken = createActivationToken;
exports.activateUserAccount = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const { activationToken, activationCode } = req.body;
    try {
        const newUser = jsonwebtoken_1.default.verify(activationToken, process.env.JWT_SECRET);
        if (newUser.activationCode !== activationCode.trim()) {
            return next(new errorHandler_1.default("Invalid activation code. Please check your email for the correct 4-digit code and try again.", 400));
        }
        const { name, email, password } = newUser.user;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return next(new errorHandler_1.default("This account has already been activated. Please proceed to sign in with your credentials.", 409));
        }
        await User_1.default.create({
            name,
            email,
            password,
        });
        res.status(201).json({
            success: true,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Account activation failed. Please try again.", 500));
    }
});
exports.authenticateUser = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password");
        if (!user) {
            return next(new errorHandler_1.default("Invalid email or password. Please check your credentials and try again.", 401));
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new errorHandler_1.default("Invalid email or password. Please check your credentials and try again.", 401));
        }
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.logoutCurrentUser = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        // Clear cookies with proper options for production
        const clearCookieOptions = {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            secure: process.env.NODE_ENV === "production",
            domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined,
        };
        res.clearCookie("access_token", clearCookieOptions);
        res.clearCookie("refresh_token", clearCookieOptions);
        // Also try clearing with empty values as fallback
        res.cookie("access_token", "", { maxAge: 1, ...clearCookieOptions });
        res.cookie("refresh_token", "", { maxAge: 1, ...clearCookieOptions });
        const userId = req.user?._id;
        if (userId) {
            await redis_1.redis.del(userId.toString());
        }
        res.status(200).json({
            success: true,
            message: "You have been successfully signed out. Thank you for using Learneazy!",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Logout failed. Please try again.", 500));
    }
});
exports.refreshUserAccessToken = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        const decoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN);
        if (!decoded) {
            return next(new errorHandler_1.default("Invalid refresh token. Please log in again.", 401));
        }
        const session = await redis_1.redis.get(decoded.id);
        if (!session) {
            return next(new errorHandler_1.default("Session expired. Please log in again.", 401));
        }
        const user = JSON.parse(session);
        if (!user) {
            return next(new errorHandler_1.default("User session not found. Please log in again.", 401));
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
            expiresIn: "5m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
            expiresIn: "3d",
        });
        req.user = user;
        res.cookie("access_token", accessToken, jwt_1.accessTokenOptions);
        res.cookie("refresh_token", refreshToken, jwt_1.refreshTokenOptions);
        await redis_1.redis.set(user?._id, JSON.stringify(user), "EX", 604800);
        res.status(200).json({
            success: true,
            accessToken,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Token refresh failed. Please log in again.", 500));
    }
});
exports.authenticateWithSocialMedia = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { email, name, avatar } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            const newUser = await User_1.default.create({
                email,
                name,
                avatar: {
                    public_id: "",
                    url: avatar,
                },
            });
            (0, jwt_1.sendToken)(newUser, 200, res);
        }
        else {
            // Update existing user's avatar if they don't have one
            if (!user.avatar?.url && avatar) {
                user.avatar = {
                    public_id: "",
                    url: avatar,
                };
                await user.save();
            }
            (0, jwt_1.sendToken)(user, 200, res);
        }
    }
    catch (error) {
        return next(new errorHandler_1.default("Social authentication failed. Please try again.", 500));
    }
});
exports.getCurrentUserProfile = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const userId = req.user?._id?.toString();
        if (!userId) {
            return next(new errorHandler_1.default("User not found.", 404));
        }
        (0, userService_1.getUserProfileFromCache)(userId, res);
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve user profile.", 500));
    }
});
exports.updateUserProfile = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const userId = req.user?._id?.toString();
        if (!userId) {
            return next(new errorHandler_1.default("User not authenticated.", 401));
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return next(new errorHandler_1.default("User not found.", 404));
        }
        if (email) {
            const existingUser = await User_1.default.findOne({ email });
            if (existingUser) {
                return next(new errorHandler_1.default("This email is already registered with another account.", 409));
            }
            user.email = email;
        }
        if (name) {
            user.name = name;
        }
        await user.save();
        await redis_1.redis.set(userId, JSON.stringify(user.toObject()));
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to update profile. Please try again.", 500));
    }
});
exports.changeUserPassword = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (oldPassword === newPassword) {
            return next(new errorHandler_1.default("New password must be different from current password.", 400));
        }
        const userId = req.user?._id?.toString();
        if (!userId) {
            return next(new errorHandler_1.default("User not authenticated.", 401));
        }
        const user = await User_1.default.findById(userId).select("+password");
        if (!user) {
            return next(new errorHandler_1.default("User not found.", 404));
        }
        if (!user.password) {
            return next(new errorHandler_1.default("Password change not available for social login accounts.", 400));
        }
        const isPasswordMatch = await user.comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return next(new errorHandler_1.default("Current password is incorrect.", 400));
        }
        user.password = newPassword;
        await user.save();
        await redis_1.redis.set(userId, JSON.stringify(user.toObject()));
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to change password. Please try again.", 500));
    }
});
exports.updateUserProfilePicture = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { avatar } = req.body;
        const userId = req.user?._id?.toString();
        if (!userId) {
            return next(new errorHandler_1.default("User not authenticated.", 401));
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return next(new errorHandler_1.default("User not found.", 404));
        }
        if (avatar) {
            if (user?.avatar?.public_id) {
                await cloudinary_1.default.v2.uploader.destroy(user?.avatar?.public_id);
                const myCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }
            else {
                const myCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }
        }
        await user.save();
        await redis_1.redis.set(userId, JSON.stringify(user.toObject()));
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        console.log(error);
        return next(new errorHandler_1.default("Failed to update profile picture. Please try again.", 500));
    }
});
exports.getAllUsersByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        (0, userService_1.getAllUsers)(res);
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve users list.", 500));
    }
});
exports.changeUserRoleByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const validRoles = ["user", "admin", "instructor", "moderator"];
        if (!validRoles.includes(role)) {
            return next(new errorHandler_1.default("Invalid role. Valid roles are: user, admin, instructor.", 400));
        }
        const isUserExist = await User_1.default.findOne({
            email: email.trim().toLowerCase(),
        });
        if (!isUserExist) {
            return next(new errorHandler_1.default("User not found with this email address.", 404));
        }
        const id = isUserExist._id?.toString();
        if (!id) {
            return next(new errorHandler_1.default("Invalid user data.", 400));
        }
        (0, userService_1.changeUserRole)(res, id, role);
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to update user role.", 500));
    }
});
exports.deleteUserByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findById(id);
        if (!user) {
            return next(new errorHandler_1.default("User not found.", 404));
        }
        await user.deleteOne({ id });
        await redis_1.redis.del(id);
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to delete user.", 500));
    }
});
//# sourceMappingURL=userController.js.map