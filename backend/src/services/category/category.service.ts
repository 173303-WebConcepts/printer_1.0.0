import { Types } from "mongoose";
import Category from "../../models/product/category.model.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { Helper } from "../../utils/helper.utils.js";

const CategoryService = {
  create: async ({ categories, userId, userIdByAdmin, shopType }: any) => {
    try {
      if (!Array.isArray(categories) || categories.length === 0) {
        throw new ApiError(400, "Categories array is required.");
      }

      const userRef = userIdByAdmin ? userIdByAdmin : userId;

      // Normalize all names (lowercase + trimmed)
      const formattedCategories = categories.map((c: string) => c.toLowerCase().trim());

      // Check for duplicates in request
      const uniqueNames = [...new Set(formattedCategories)];
      if (uniqueNames.length !== formattedCategories.length) {
        throw new ApiError(400, "Duplicate category names found in request.");
      }

      // Check for existing categories in DB
      const existing = await Category.find({ name: { $in: uniqueNames } }).lean();
      const existingNames = existing.map((e) => e.name);

      // Filter only new ones
      const newCategories = uniqueNames.filter((name) => !existingNames.includes(name));

      if (newCategories.length === 0) {
        throw new ApiError(400, "All categories already exist.");
      }

      // Prepare category objects
      const categoriesToInsert = newCategories.map((name) => ({
        name,
        shopType,
        users: [{ user: userRef }],
      }));

      // Bulk insert
      const inserted = await Category.insertMany(categoriesToInsert);

      return new ApiResponse(201, {
        success: true,
        message: `${inserted.length} category(ies) created successfully.`,
        data: inserted,
      });
    } catch (error: any) {
      if (error.name === "MongoServerError" && error.code === 11000) {
        throw new ApiError(400, "Duplicate category detected during creation.");
      } else {
        throw new ApiError(500, error.message || "Internal Server Error");
      }
    }
  },

  update: async ({ name, id }: any) => {
    if (name) {
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        {
          name,
        },
        { new: true }
      );

      return new ApiResponse(201, updatedCategory);
    } else {
      throw new ApiError(500);
    }
  },

  delete: async ({ categoryId, userId, userIdByAdmin, role }: any) => {
    try {
      const category = await Category.findById(categoryId);



      if (!category) {
        throw new ApiError(404, "Category not found.");
      }

      // Check if this user exists in the category
      const hasUser = category.users.some((u: any) => u.user.toString() === (userIdByAdmin ? userIdByAdmin : userId));

      if (!hasUser) {
        throw new ApiError(400, "User not found in this category.");
      }

      if (!userIdByAdmin && role === "superAdmin" && category.users.length > 1) {
        throw new ApiError(400, "More than 1 user exist you cannot delete");
      }

      if (category.users.length === 1) {
        await Category.findByIdAndDelete(categoryId);
        return new ApiResponse(200, {
          success: true,
          message: "Category deleted (last user removed).",
        });
      }

      // Otherwise → just pull the user from the array
      await Category.updateOne({ _id: categoryId }, { $pull: { users: { user: userIdByAdmin ? userIdByAdmin : userId } } });

      return new ApiResponse(200, {
        success: true,
        message: "User removed from category.",
      });
    } catch (error: any) {
      throw new ApiError(500, error.message || "Internal Server Error");
    }
  },

  deleteMultipleCategories: async ({ ids, userId }: any) => {
    try {

      const categories = await Category.find({ _id: { $in: ids } });


      let deleteIds: string[] = [];
      let updateIds: string[] = [];

      categories.forEach((cat) => {
        const hasUser = cat.users.some((u) => String(u.user) === String(userId));

        if (!hasUser) return;

        if (cat.users.length === 1) {
          deleteIds.push(cat._id);
        } else {
          updateIds.push(cat._id);
        }
      });

      // 🔥 Delete categories that only have one user
      if (deleteIds.length > 0) {
        await Category.deleteMany({ _id: { $in: deleteIds } });
      }

      // 🔥 Pull user from categories having multiple users
      if (updateIds.length > 0) {
        await Category.updateMany({ _id: { $in: updateIds } }, { $pull: { users: { user: userId } } });
      }

      return new ApiResponse(200, {
        success: true,
        deletedCount: deleteIds.length,
        updatedCount: updateIds.length,
        message: "Bulk delete optimized.",
      });
    } catch (error: any) {
      throw new ApiError(500, error.message || "Internal Server Error");
    }
  },

  updateMultipleCategories: async ({ categories, userId }: any) => {
    try {


      const ids = categories.map((c: any) => c.id);

      // Fetch categories owned or shared with this user
      const existingCategories = await Category.find({
        _id: { $in: ids },
        "users.user": userId, // only categories user belongs to
      });



      if (existingCategories.length === 0) {
        return new ApiResponse(200, {
          success: false,
          updatedCount: 0,
          message: "No accessible categories found.",
        });
      }

      let updateOps: any[] = [];

      existingCategories.forEach((cat) => {
        const payloadItem = categories.find((c: any) => String(c.id) === String(cat._id));
        if (!payloadItem) return;

        updateOps.push({
          updateOne: {
            filter: { _id: cat._id },
            update: {
              $set: {
                name: payloadItem.name,
                updatedAt: new Date(),
              },
            },
          },
        });
      });

      if (updateOps.length === 0) {
        return new ApiResponse(200, {
          success: false,
          updatedCount: 0,
          message: "No valid updates found.",
        });
      }

      // 🔥 Perform bulk updates
      const bulkResult = await Category.bulkWrite(updateOps);



      return new ApiResponse(200, {
        success: true,
        updatedCount: bulkResult.modifiedCount,
        message: "Categories updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating categories:", error);
      throw new ApiError(500, error.message || "Internal Server Error");
    }
  },

  get: async ({ filterData, page, pageSize }: any) => {
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

  shopTypeCategories: async ({ shopType }: any) => {
    const categories = await Category.find({ shopType }).sort({ createdAt: -1 });

    return new ApiResponse(200, { categories });
  },

  getUserCategories: async ({ filterData = {}, page, pageSize, userId }: any) => {
    try {
      const pageNum = parseInt(page, 10);
      const pageSizeNum = parseInt(pageSize, 10);

      // 🔍 Always include userId in filter
      const finalFilter = {
        ...filterData,
        "users.user": userId, // find categories linked to this user
      };

      // 🧮 Count total documents for pagination
      const documentCount = await Category.countDocuments(finalFilter);

      // 📦 Fetch paginated categories (Mongoose Documents)
      const categories = await Category.find(finalFilter)
        .skip((pageNum - 1) * pageSizeNum)
        .limit(pageSizeNum)
        .sort({ createdAt: -1 })
        .populate("users.user", "name email") // optional: show user info if needed
        .populate("shopType", "type _id");

      // 📄 Build pagination metadata
      const paginationData = {
        documentCount,
        totalPages: Math.ceil(documentCount / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      };

      const formatted = categories.map((cat) => {
        const userData = cat.users.find(
          (u: any) =>
            u.user?._id?.toString() === userId.toString() || // populated user
            u.user?.toString() === userId.toString() // unpopulated fallback
        );

        return {
          ...cat.toObject(),
          // isActive: userData?.isActive ?? false,
        };
      });

      return new ApiResponse(200, { categories: formatted, paginationData });
    } catch (error: any) {
      console.error("Error in getUserCategories:", error);
      throw new ApiError(500, "Failed to fetch user categories");
    }
  },

  addUserToCategories: async ({ categoriesIds, userId }: any) => {
    try {
      // Fetch all categories where the user is NOT already in users.user
      const categoriesToUpdate = await Category.find({
        _id: { $in: categoriesIds },
        "users.user": { $ne: userId },
      });

      if (categoriesToUpdate.length === 0) {
        return new ApiResponse(200, {
          success: true,
          message: "No categories needed update. User already exists in all categories.",
          updatedCount: 0,
        });
      }

      // Add user entry to each category
      const bulkOps = categoriesToUpdate.map((cat) => ({
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
      const result = await Category.bulkWrite(bulkOps);

      return new ApiResponse(200, {
        success: true,
        message: "User added to categories successfully.",
        updatedCount: result.modifiedCount,
      });
    } catch (error: any) {
      console.error("Error in addUserToCategories:", error);
      throw new ApiError(500, error.message || "Internal Server Error");
    }
  },

  // ----------------------Techonology-----------------------------
};

export { CategoryService };
