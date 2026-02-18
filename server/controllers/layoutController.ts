import { Request, Response, NextFunction } from "express";
import catchAsyncError from "../middleware/catchAsyncError";
import errorHandler from "../utils/errorHandler";
import Layout from "../models/Layout";
import cloudinary from "cloudinary";

const normalizeCategoryTitles = (categories: any) => {
  if (!Array.isArray(categories)) {
    throw new errorHandler("Categories must be an array.", 400);
  }

  const normalized = categories.map((item: any) => {
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    return { title };
  });

  const hasEmpty = normalized.some((c) => !c.title);
  if (hasEmpty) {
    throw new errorHandler("Category title cannot be empty.", 400);
  }

  const seen = new Set<string>();
  for (const c of normalized) {
    const key = c.title.toLowerCase();
    if (seen.has(key)) {
      throw new errorHandler(
        `Duplicate category detected: "${c.title}".`,
        409
      );
    }
    seen.add(key);
  }

  return normalized;
};

export const createWebsiteLayoutByAdmin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const isTypeExist = await Layout.findOne({ type });
      if (isTypeExist) {
        return next(
          new errorHandler(
            `${type} layout already exists. Please update the existing layout instead.`,
            409
          )
        );
      }

      if (type === "Banner") {
        const { image, title, subTitle } = req.body;
        const myCloud = await cloudinary.v2.uploader.upload(image, {
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
        await Layout.create(banner);
      }
      if (type === "FAQ") {
        const { faq } = req.body;
        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );
        await Layout.create({ type: "FAQ", faq: faqItems });
      }
      if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItems = normalizeCategoryTitles(categories);
        await Layout.create({
          type: "Categories",
          categories: categoriesItems,
        });
      }

      res.status(201).json({
        success: true,
        message: `${type} layout created successfully.`,
      });
    } catch (error: any) {
      return next(
        error instanceof errorHandler
          ? error
          : new errorHandler(error.message, 500)
      );
    }
  }
);

export const updateWebsiteLayoutByAdmin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      if (type === "Banner") {
        const bannerData: any = await Layout.findOne({ type: "Banner" });

        const { image, title, subTitle } = req.body;
        const data = image.startsWith("https")
          ? bannerData
          : await cloudinary.v2.uploader.upload(image, {
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

        await Layout.findByIdAndUpdate(bannerData._id, { banner });
      }

      if (type === "FAQ") {
        const { faq } = req.body;
        const FaqItem = await Layout.findOne({ type: "FAQ" });
        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );
        await Layout.findByIdAndUpdate(FaqItem?._id, {
          type: "FAQ",
          faq: faqItems,
        });
      }
      if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItems = normalizeCategoryTitles(categories);

        // Upsert so admin UI works even if Categories layout doesn't exist yet
        const layout = await Layout.findOneAndUpdate(
          { type: "Categories" },
          { $set: { type: "Categories", categories: categoriesItems } },
          { new: true, upsert: true, runValidators: true }
        );

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
    } catch (error: any) {
      return next(
        error instanceof errorHandler
          ? error
          : new errorHandler("Failed to update layout. Please try again.", 500)
      );
    }
  }
);

export const getWebsiteLayoutByType = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      const layout = await Layout.findOne({ type });
      res.status(200).json({
        success: true,
        layout,
      });
    } catch (error: any) {
      return next(
        new errorHandler("Failed to retrieve layout. Please try again.", 500)
      );
    }
  }
);