import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { Helper } from "../../utils/helper.utils.js";
import { BACKEND_URL } from "../../config/index.js";
import cloudinary from "../../middlewares/cloudinary.middleware.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ImagesService } from "../../services/common/images.services.js";

interface File {
  filename: string;
}

const ImagesController = {
  upload: [
    // validate(ValidationSchema.createCategorySchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      if (!req.files || (req.files as any[]).length === 0) {
        return res.status(400).json({ success: false, message: "No images were uploaded." });
      }

      const uploaded: string[] = (req.files as File[]).map((file: File) => file.filename);

      res.status(201).json(new ApiResponse(201, uploaded));
    }),
  ] as any,
  delete: [
    // validate(ValidationSchema.createCategorySchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { public_ids }: { public_ids: string[] } = req.body;

      if (!Array.isArray(public_ids) || public_ids.length === 0) {
        throw new ApiError(400, "Invalid input. Please provide an array of public IDs.");
      }

      const response = await ImagesService.delete({
        public_ids,
      });

      return res.status(response.statusCode).json(response);
    }),
  ] as any,
  // delete: [
  //     // validate(ValidationSchema.createCategorySchema),
  //     asyncHandler(
  //         async (req: Request, res: Response, next: NextFunction) => {
  //             const { images } = req.body as { images: [] };

  //             let c_images = [];
  //             if (Array.isArray(images)) {
  //                 c_images = images;
  //             } else {
  //                 c_images = [images];
  //             }

  //             Helper.deleteImages(c_images as []);

  //             res.status(201).json(new ApiResponse(201, ""));
  //         }
  //     ),
  // ],

  // uploadSingle: [
  //     // validate(ValidationSchema.createCategorySchema),
  //     asyncHandler(
  //         async (req: Request, res: Response, next: NextFunction) => {
  //             if (!req.file) {
  //                 return res
  //                     .status(400)
  //                     .json({ success: 0, message: "No file uploaded" });
  //             }

  //             res.status(201).json({
  //                 success: 1,
  //                 file: {
  //                     url: `${BACKEND_URL}/images/${req.file.filename}`,
  //                 },
  //             });
  //         }
  //     ),
  // ],
};

export { ImagesController };
