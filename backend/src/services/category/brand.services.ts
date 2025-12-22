import { Types } from "mongoose";
import Category from "../../models/product/category.model.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { Helper } from "../../utils/helper.utils.js";
import Brand from "../../models/product/brand.model.js";

const BrandService = {
  create: async ({ brands, userId, role, userIdByAdmin, shopType }: any) => {
    try {
      if (!Array.isArray(brands) || brands.length === 0) {
        throw new ApiError(400, "Brands array is required.");
      }

      const userRef = userIdByAdmin ? userIdByAdmin : userId;

      // Normalize all names (lowercase + trimmed)
      const formattedCategories = brands.map((c: string) => c.toLowerCase().trim());

      // Check for duplicates in request
      const uniqueNames = [...new Set(formattedCategories)];
      if (uniqueNames.length !== formattedCategories.length) {
        throw new ApiError(400, "Duplicate brand names found in request.");
      }

      // Check for existing categories in DB
      const existing = await Brand.find({ name: { $in: uniqueNames } }).lean();
      const existingNames = existing.map((e) => e.name);

      // Filter only new ones
      const newCategories = uniqueNames.filter((name) => !existingNames.includes(name));

      if (newCategories.length === 0) {
        throw new ApiError(400, "All brands already exist.");
      }

      // Prepare category objects
      const categoriesToInsert = newCategories.map((name) => ({
        name,
        shopType,
        users: [{ user: userRef }],
      }));

      // Bulk insert
      const inserted = await Brand.insertMany(categoriesToInsert);

      return new ApiResponse(201, {
        success: true,
        message: `${inserted.length} brand created successfully.`,
        data: inserted,
      });
    } catch (error: any) {
      if (error.name === "MongoServerError" && error.code === 11000) {
        throw new ApiError(400, "Duplicate brand detected during creation.");
      } else {
        throw new ApiError(500, error.message || "Internal Server Error");
      }
    }
  },

  update: async ({ name, id }: any) => {
    if (name) {
      const updatedBrand = await Brand.findByIdAndUpdate(
        id,
        {
          name,
        },
        { new: true }
      );

      return new ApiResponse(201, updatedBrand);
    } else {
      throw new ApiError(500);
    }
  },

  delete: async ({ brandId, userId, userIdByAdmin, role }: any) => {
    try {
      const category = await Brand.findById(brandId);

      if (!category) {
        throw new ApiError(404, "Brand not found.");
      }

      // Check if this user exists in the category
      const hasUser = category.users.some((u: any) => u.user.toString() === (userIdByAdmin ? userIdByAdmin : userId));

      if (!hasUser) {
        throw new ApiError(400, "User not found in this brand.");
      }

      if (!userIdByAdmin && role === "superAdmin" && category.users.length > 1) {
        throw new ApiError(400, "More than 1 user exist you cannot delete");
      }

      if (category.users.length === 1) {
        await Brand.findByIdAndDelete(brandId);
        return new ApiResponse(200, {
          success: true,
          message: "Brand deleted (last user removed).",
        });
      }

      // Otherwise → just pull the user from the array
      await Brand.updateOne({ _id: brandId }, { $pull: { users: { user: userIdByAdmin ? userIdByAdmin : userId } } });

      return new ApiResponse(200, {
        success: true,
        message: "User removed from brand.",
      });
    } catch (error: any) {
      throw new ApiError(500, error.message || "Internal Server Error");
    }
  },

  get: async ({ filterData, page, pageSize }: any) => {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    const documentCount = await Brand.countDocuments(filterData);

    const brands = await Brand.find(filterData)
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum)
      .sort({ createdAt: -1 });

    const paginationData = {
      documentCount,
      totalPages: Math.ceil(documentCount / pageSizeNum),
      currentPage: pageNum,
      pageSize: pageSizeNum,
    };

    return new ApiResponse(200, { brands, paginationData });
  },

  shopTypeBrands: async ({ shopType }: any) => {
    const brands = await Brand.find({ shopType }).sort({ createdAt: -1 });

    return new ApiResponse(200, { brands });
  },

  getUserBrands: async ({ filterData = {}, page, pageSize, userId }: any) => {
    try {
      const pageNum = parseInt(page, 10);
      const pageSizeNum = parseInt(pageSize, 10);

      // 🔍 Always include userId in filter
      const finalFilter = {
        ...filterData,
        "users.user": userId, // find categories linked to this user
      };

      // 🧮 Count total documents for pagination
      const documentCount = await Brand.countDocuments(finalFilter);

      // 📦 Fetch paginated categories (Mongoose Documents)
      const brands = await Brand.find(finalFilter)
        .skip((pageNum - 1) * pageSizeNum)
        .limit(pageSizeNum)
        .sort({ createdAt: -1 })
        .populate("users.user", "name email") // optional: show user info if needed
        .populate("productIds", "name price") // optional: populate products too
        .populate("shopType", "type _id");

      // 📄 Build pagination metadata
      const paginationData = {
        documentCount,
        totalPages: Math.ceil(documentCount / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      };

      const formatted = brands.map((cat) => {
        const userData = cat.users.find(
          (u: any) =>
            u.user?._id?.toString() === userId.toString() || // populated user
            u.user?.toString() === userId.toString() // unpopulated fallback
        );

        return {
          ...cat.toObject(),
          isActive: userData?.isActive ?? false,
        };
      });

      return new ApiResponse(200, { brands: formatted, paginationData });
    } catch (error: any) {
      throw new ApiError(500, "Failed to fetch user brands");
    }
  },

  addUserToBrands: async ({ brandIds, userId }: any) => {
    try {
      // Fetch all categories where the user is NOT already in users.user
      const brandsToUpdate = await Brand.find({
        _id: { $in: brandIds },
        "users.user": { $ne: userId },
      });

      if (brandsToUpdate.length === 0) {
        return new ApiResponse(200, {
          success: true,
          message: "No categories needed update. User already exists in all categories.",
          updatedCount: 0,
        });
      }

      // Add user entry to each category
      const bulkOps = brandsToUpdate.map((cat) => ({
        updateOne: {
          filter: { _id: cat._id },
          update: {
            $push: {
              users: {
                user: userId,
                isActive: true,
                isDeleted: false,
              },
            },
          },
        },
      }));

      // Execute bulk update
      const result = await Brand.bulkWrite(bulkOps);

      return new ApiResponse(200, {
        success: true,
        message: "User added to brands successfully.",
        updatedCount: result.modifiedCount,
      });
    } catch (error: any) {
      console.error("Error in addUserTobrands:", error);
      throw new ApiError(500, error.message || "Internal Server Error");
    }
  },

  // ----------------------Techonology-----------------------------
};

export { BrandService };
