import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import User from "../../models/user/user.model.js";
import ShopType from "../../models/user/shop.model.js";
const UserService = {
    user: async ({ id }) => {
        const existingUser = await User.findById(id).select("-password -googleId");
        if (existingUser) {
            return new ApiResponse(201, { user: existingUser });
        }
        else {
            throw new ApiError(400, "Failed!");
        }
    },
    get: async ({ page, pageSize, filterData, userId }) => {
        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);
        const shouldFilterById = !!filterData._id;
        const query = {
            ...filterData,
            ...(shouldFilterById ? {} : { _id: { $ne: userId } }),
        };
        // Get the total number of documents matching the filter
        const documentCount = await User.countDocuments(query);
        // Apply filtering and pagination using skip, limit, and the filterData
        const users = await User.find(query)
            .skip((pageNum - 1) * pageSizeNum)
            .limit(pageSizeNum)
            .sort({ createdAt: -1 });
        // Prepare pagination data
        const paginationData = {
            documentCount,
            totalPages: Math.ceil(documentCount / pageSizeNum),
            currentPage: pageNum,
            pageSize: pageSizeNum,
        };
        return new ApiResponse(200, { users, paginationData });
    },
    counts: async () => {
        const [totalUsers, totalAdmins, totalBlocked, totalPremium] = await Promise.all([
            User.countDocuments(), // all users
            User.countDocuments({ role: { $in: ["admin", "superAdmin"] } }),
            User.countDocuments({ isBlocked: true }),
            User.countDocuments({ premimumCounts: { $gt: 0 } }),
        ]);
        return new ApiResponse(200, { totalUsers, totalAdmins, totalBlocked, totalPremium });
    },
    block: async ({ userId, isBlocked }) => {
        const existingUser = await User.findByIdAndUpdate(userId, { isBlocked });
        if (existingUser) {
            return new ApiResponse(201, { user: existingUser });
        }
        else {
            throw new ApiError(400, "Failed!");
        }
    },
    shopType: async ({ shopTypes }) => {
        const docs = shopTypes.map((type) => ({ type }));
        const createdShopTypes = await ShopType.insertMany(docs);
        if (createdShopTypes && createdShopTypes.length > 0) {
            return new ApiResponse(201, { shopTypes: createdShopTypes });
        }
        else {
            throw new ApiError(400, "Failed to create shop types");
        }
    },
    shopTypeEdit: async ({ id, shopType }) => {
        const updatedShopType = await ShopType.findByIdAndUpdate(id, { type: shopType }, { new: true });
        if (updatedShopType) {
            return new ApiResponse(201, { shopType: updatedShopType });
        }
        else {
            throw new ApiError(400, "Failed to create shop types");
        }
    },
    delete: async ({ id }) => {
        const existingUser = await User.findByIdAndDelete(id);
        if (existingUser) {
            return new ApiResponse(201, {});
        }
        else {
            throw new ApiError(400, "Failed!");
        }
    },
};
export { UserService };
//# sourceMappingURL=user.service.js.map