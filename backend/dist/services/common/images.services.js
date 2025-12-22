import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import cloudinary from "../../middlewares/cloudinary.middleware.js";
const ImagesService = {
    delete: async ({ public_ids }) => {
        // Delete images from Cloudinary
        const deletePromises = public_ids.map((public_id) => cloudinary.uploader.destroy(public_id));
        const results = await Promise.all(deletePromises);
        // Check if all deletions were successful
        const allDeleted = results.every((result) => result.result === "ok");
        if (allDeleted) {
            return new ApiResponse(200, results);
        }
        else {
            throw new ApiError(400, "Some images could not be deleted", results);
        }
    },
};
export { ImagesService };
//# sourceMappingURL=images.services.js.map