import Category from "../../models/inventory/category.model.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
const CategoryService = {
    create: async ({ name }) => {
        try {
            let category = await Category.create({
                name,
            });
            return new ApiResponse(201, { category });
        }
        catch (error) {
            if (error.name === "MongoServerError" && error.code === 11000) {
                throw new ApiError(400, `Category already exists: ${name}`);
            }
            else {
                throw new ApiError(500);
            }
        }
    },
    update: async ({ name, id }) => {
        if (name) {
            const updatedCategory = await Category.findByIdAndUpdate(id, {
                name,
            }, { new: true });
            return new ApiResponse(201, updatedCategory);
        }
        else {
            throw new ApiError(500);
        }
    },
    delete: async ({ id }) => {
        const deletedCategory = await Category.findByIdAndDelete(id);
        return new ApiResponse(201, deletedCategory);
    },
    get: async ({ filterData, page, pageSize }) => {
        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);
        const documentCount = await Category.countDocuments(filterData);
        const categories = await Category.find(filterData)
            .skip((pageNum - 1) * pageSizeNum)
            .limit(pageSizeNum)
            .sort({ createdAt: -1 });
        const paginationData = {
            documentCount,
            totalPages: Math.ceil(documentCount / pageSizeNum),
            currentPage: pageNum,
            pageSize: pageSizeNum,
        };
        return new ApiResponse(200, { categories, paginationData });
    },
    // ----------------------Techonology-----------------------------
};
export { CategoryService };
//# sourceMappingURL=category.service.js.map