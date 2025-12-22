import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ImagesService } from "../../services/common/images.services.js";
const ImagesController = {
    upload: [
        // validate(ValidationSchema.createCategorySchema),
        asyncHandler(async (req, res, next) => {
            const uploaded = req.files.map((file) => file.filename);
            res.status(201).json(new ApiResponse(201, uploaded));
        }),
    ],
    delete: [
        // validate(ValidationSchema.createCategorySchema),
        asyncHandler(async (req, res, next) => {
            const { public_ids } = req.body;
            if (!Array.isArray(public_ids) || public_ids.length === 0) {
                throw new ApiError(400, "Invalid input. Please provide an array of public IDs.");
            }
            const response = await ImagesService.delete({
                public_ids,
            });
            return res.status(response.statusCode).json(response);
        }),
    ],
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
//# sourceMappingURL=images.controller.js.map