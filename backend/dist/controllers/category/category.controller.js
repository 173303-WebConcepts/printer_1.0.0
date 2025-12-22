import { CategoryService } from "../../services/category/category.service.js";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
const CategoryController = {
    create: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { name } = req.body;
            const response = await CategoryService.create({
                name,
            });
            res.status(response.statusCode).json(response);
        }),
    ],
    update: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { name } = req.body;
            const { id } = req.params;
            const response = await CategoryService.update({
                name,
                id,
            });
            res.status(response.statusCode).json(response);
        }),
    ],
    delete: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { id } = req.params;
            const response = await CategoryService.delete({
                id,
            });
            res.status(response.statusCode).json(response);
        }),
    ],
    get: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { name } = req.query;
            const filterData = {};
            if (name)
                filterData.name = {
                    $regex: name,
                    $options: "i",
                };
            const response = await CategoryService.get({
                filterData,
            });
            res.status(response.statusCode).json(response);
        }),
    ],
};
export { CategoryController };
//# sourceMappingURL=category.controller.js.map