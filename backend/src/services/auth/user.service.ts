import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import User from "../../models/user/user.model.js";
import ShopType from "../../models/user/shop.model.js";
import Gallery from "../../models/gallery/gallery.model.js";

const UserService = {
  user: async ({ id }: { id: string }) => {
    const existingUser = await User.findById(id).select("-password -googleId");
    if (existingUser) {
      return new ApiResponse(201, { user: existingUser });
    } else {
      throw new ApiError(400, "Failed!");
    }
  },

  get: async ({ page, pageSize, filterData, userId }: any) => {
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
      .sort({ createdAt: -1 })
      .populate("shopType", "_id type");

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
      User.countDocuments({ isPremium: true }),
    ]);

    return new ApiResponse(200, { totalUsers, totalAdmins, totalBlocked, totalPremium });
  },

  block: async ({ userId, isBlocked }: any) => {
    const existingUser = await User.findByIdAndUpdate(userId, { isBlocked }, { new: true });

    if (existingUser) {
      return new ApiResponse(201, { user: existingUser });
    } else {
      throw new ApiError(400, "Failed!");
    }
  },

  update: async ({ userId, updateFields }: any) => {
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

    if (!updatedUser) {
      throw new ApiError(400, "Failed!");
    }

    return new ApiResponse(201, { user: updatedUser });
  },

  shopType: async ({ shopTypes }: any) => {
    // Step 1: Normalize input (trim + lowercase + remove duplicates in request)
    const cleanedTypes = [...new Set(shopTypes.map((t: any) => t.trim().toLowerCase()))];

    // Step 2: Find existing types in DB
    const existingTypes = await ShopType.find({ type: { $in: cleanedTypes } }).lean();
    const existingTypeNames = existingTypes.map((t) => t.type);

    // Step 3: Filter out already existing ones
    const newTypes = cleanedTypes.filter((t) => !existingTypeNames.includes(t));

    // Step 4: If all provided types already exist
    if (newTypes.length === 0) {
      return new ApiResponse(200, {
        message: `No new shop types created. The following already exist: ${existingTypeNames.join(", ")}`,
        duplicated: existingTypeNames,
        shopTypes: [],
      });
    }

    // Step 5: Try inserting only the new ones
    const docs = newTypes.map((type) => ({ type }));
    const createdShopTypes = await ShopType.insertMany(docs, { ordered: false });

    // Step 6: Return both created and duplicate ones
    return new ApiResponse(201, {
      message:
        existingTypeNames.length > 0
          ? `Shop types created successfully. Duplicates skipped: ${existingTypeNames.join(", ")}`
          : "Shop types created successfully.",
      created: createdShopTypes,
      duplicated: existingTypeNames,
    });
  },

  shopTypes: async ({ page, pageSize, filterData = {} }: any) => {
    try {
      const query = { ...filterData };

      // 🧮 Get total count regardless of pagination
      const documentCount = await ShopType.countDocuments(query);

      let shoptypes;
      let paginationData = null;

      if (page && pageSize) {
        // 🔢 Convert to integers safely
        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        shoptypes = await ShopType.find(query)
          .skip((pageNum - 1) * pageSizeNum)
          .limit(pageSizeNum)
          .sort({ createdAt: -1 });

        paginationData = {
          documentCount,
          totalPages: Math.ceil(documentCount / pageSizeNum),
          currentPage: pageNum,
          pageSize: pageSizeNum,
        };
      } else {
        // 🚀 No pagination — return all documents
        shoptypes = await ShopType.find(query).sort({ createdAt: -1 });
      }

      return new ApiResponse(200, { shoptypes, paginationData });
    } catch (error) {
      console.error("Error fetching shop types:", error);
      throw new ApiError(500, "Failed to fetch shop types");
    }
  },

  shopTypeEdit: async ({ id, shopType }: any) => {
    const updatedShopType = await ShopType.findByIdAndUpdate(id, { type: shopType }, { new: true });

    if (updatedShopType) {
      return new ApiResponse(201, { shopType: updatedShopType });
    } else {
      throw new ApiError(400, "Failed to create shop types");
    }
  },

  delete: async ({ id }: any) => {
    const existingUser = await User.findByIdAndDelete(id);

    if (existingUser) {
      return new ApiResponse(201, {});
    } else {
      throw new ApiError(400, "Failed!");
    }
  },

  shopDelete: async ({ id }: any) => {
    const isDeleted = await ShopType.findByIdAndDelete(id);

    if (isDeleted) {
      return new ApiResponse(201, { isDeleted });
    } else {
      throw new ApiError(400, "Failed!");
    }
  },

  gallery: async ({ images, shopType }: any) => {
    // Prepare documents for insert
    const galleryDocs = images.map((img: string) => ({
      image: img.trim(),
      shopType,
    }));

    // Insert multiple records at once
    const saved = await Gallery.insertMany(galleryDocs);

    if (saved) {
      return new ApiResponse(201, { saved });
    }

    throw new ApiError(500);
  },

  galleries: async ({ filterData = {}, page = 1, pageSize = 10 }: any) => {
    try {
      const pageNum = parseInt(page, 10);
      const pageSizeNum = parseInt(pageSize, 10);

      const finalFilter = {
        ...filterData,
      };

      // 🧮 Count total documents for pagination
      const documentCount = await Gallery.countDocuments(finalFilter);

      // 📦 Fetch paginated categories (Mongoose Documents)
      const galleries = await Gallery.find(finalFilter)
        .skip((pageNum - 1) * pageSizeNum)
        .limit(pageSizeNum)
        .sort({ createdAt: -1 })
        .populate("shopType", "type _id");

      // 📄 Build pagination metadata
      const paginationData = {
        documentCount,
        totalPages: Math.ceil(documentCount / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      };

      return new ApiResponse(200, { galleries, paginationData });
    } catch (error: any) {
      console.error("Error in getUserCategories:", error);
      throw new ApiError(500, "Failed to fetch user categories");
    }
  },
};

export { UserService };
