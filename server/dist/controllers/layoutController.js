"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebsiteLayoutByType = exports.updateWebsiteLayoutByAdmin = exports.createWebsiteLayoutByAdmin = void 0;
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const Layout_1 = __importDefault(require("../models/Layout"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const normalizeCategoryTitles = (categories) => {
    if (!Array.isArray(categories)) {
        throw new errorHandler_1.default("Categories must be an array.", 400);
    }
    const normalized = categories.map((item) => {
        const title = typeof item?.title === "string" ? item.title.trim() : "";
        return { title };
    });
    const hasEmpty = normalized.some((c) => !c.title);
    if (hasEmpty) {
        throw new errorHandler_1.default("Category title cannot be empty.", 400);
    }
    const seen = new Set();
    for (const c of normalized) {
        const key = c.title.toLowerCase();
        if (seen.has(key)) {
            throw new errorHandler_1.default(`Duplicate category detected: "${c.title}".`, 409);
        }
        seen.add(key);
    }
    return normalized;
};
exports.createWebsiteLayoutByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { type } = req.body;
        const isTypeExist = await Layout_1.default.findOne({ type });
        if (isTypeExist) {
            return next(new errorHandler_1.default(`${type} layout already exists. Please update the existing layout instead.`, 409));
        }
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "layout",
            });
            const banner = {
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                },
            };
            await Layout_1.default.create(banner);
        }
        if (type === "FAQ") {
            const { faq } = req.body;
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer,
                };
            }));
            await Layout_1.default.create({ type: "FAQ", faq: faqItems });
        }
        if (type === "Categories") {
            const { categories } = req.body;
            const categoriesItems = normalizeCategoryTitles(categories);
            await Layout_1.default.create({
                type: "Categories",
                categories: categoriesItems,
            });
        }
        res.status(201).json({
            success: true,
            message: `${type} layout created successfully.`,
        });
    }
    catch (error) {
        return next(error instanceof errorHandler_1.default
            ? error
            : new errorHandler_1.default(error.message, 500));
    }
});
exports.updateWebsiteLayoutByAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { type } = req.body;
        if (type === "Banner") {
            const bannerData = await Layout_1.default.findOne({ type: "Banner" });
            const { image, title, subTitle } = req.body;
            const data = image.startsWith("https")
                ? bannerData
                : await cloudinary_1.default.v2.uploader.upload(image, {
                    folder: "layout",
                });
            const banner = {
                type: "Banner",
                image: {
                    public_id: image.startsWith("https")
                        ? bannerData.banner.image.public_id
                        : data?.public_id,
                    url: image.startsWith("https")
                        ? bannerData.banner.image.url
                        : data?.secure_url,
                },
                title,
                subTitle,
            };
            await Layout_1.default.findByIdAndUpdate(bannerData._id, { banner });
        }
        if (type === "FAQ") {
            const { faq } = req.body;
            const FaqItem = await Layout_1.default.findOne({ type: "FAQ" });
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer,
                };
            }));
            await Layout_1.default.findByIdAndUpdate(FaqItem?._id, {
                type: "FAQ",
                faq: faqItems,
            });
        }
        if (type === "Categories") {
            const { categories } = req.body;
            const categoriesItems = normalizeCategoryTitles(categories);
            // Upsert so admin UI works even if Categories layout doesn't exist yet
            const layout = await Layout_1.default.findOneAndUpdate({ type: "Categories" }, { $set: { type: "Categories", categories: categoriesItems } }, { new: true, upsert: true, runValidators: true });
            res.status(200).json({
                success: true,
                message: `${type} layout updated successfully.`,
                layout,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: `${type} layout updated successfully.`,
        });
    }
    catch (error) {
        return next(error instanceof errorHandler_1.default
            ? error
            : new errorHandler_1.default("Failed to update layout. Please try again.", 500));
    }
});
exports.getWebsiteLayoutByType = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { type } = req.params;
        const layout = await Layout_1.default.findOne({ type });
        res.status(200).json({
            success: true,
            layout,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to retrieve layout. Please try again.", 500));
    }
});
//# sourceMappingURL=layoutController.js.map