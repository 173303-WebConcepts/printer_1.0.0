import { Types } from "mongoose";
import Category from "../../models/product/category.model.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { Helper } from "../../utils/helper.utils.js";
import Product from "../../models/product/product.model.js";

const ProductService = {
  create: async ({ name, unit, purchasePrice, sellingPrice, stock, isActive, brandId, categoryId, userId, image }: any) => {
    let product = await Product.create({
      name,
      unit,
      purchasePrice,
      sellingPrice,
      stock,
      isActive,
      brandId,
      categoryId,
      userId,
      image,
    });

    if (product) {
      return new ApiResponse(201, { product });
    }

    throw new ApiError(500);
  },

  update: async ({ id, name, sku, barcode, unit, purchasePrice, sellingPrice, stock, isActive, brandId, categoryId }: any) => {
    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        sku,
        barcode,
        unit,
        purchasePrice,
        sellingPrice,
        stock,
        isActive,
        brandId,
        categoryId,
      },
      { new: true }
    );

    if (product) {
      return new ApiResponse(201, product);
    }

    throw new ApiError(500);
  },

  delete: async ({ id }: { id: string }) => {
    const product = await Product.findByIdAndDelete(id);

    if (product) {
      return new ApiResponse(200, product);
    }

    throw new ApiError(500);
  },

  createMultipleProducts: async ({ products, userId }: any) => {
    try {
      if (!Array.isArray(products) || products.length === 0) {
        throw new ApiError(400, "Products array is required.");
      }

      // Normalize product names
      const formattedProducts = products.map((p: any) => ({
        ...p,
        name: p.name.toLowerCase().trim(),
      }));

      // Check for duplicate names inside request
      const names = formattedProducts.map((p) => p.name);
      const uniqueNames = [...new Set(names)];

      if (uniqueNames.length !== names.length) {
        throw new ApiError(400, "Duplicate product names found in request.");
      }

      // Check for existing products for this user
      const existing = await Product.find({
        name: { $in: uniqueNames },
        userId,
      }).lean();

      const existingNames = existing.map((e) => e.name);

      // Filter NEW ones only
      const newProducts = formattedProducts.filter((p) => !existingNames.includes(p.name));

      if (newProducts.length === 0) {
        throw new ApiError(400, "All products already exist.");
      }

      // Prepare insert array
      const insertPayload = newProducts.map((p) => ({
        name: p.name,
        image: p.image || "",
        unit: p.unit || null,
        purchasePrice: p.purchasePrice || 0,
        sellingPrice: p.sellingPrice || 0,
        stock: p.stock || 0,
        isActive: p.isActive ?? true,
        brandId: p.brandId || null,
        categoryId: p.categoryId || null,
        userId,
      }));

      // 🔥 Bulk Insert (HIGH PERFORMANCE)
      const inserted = await Product.insertMany(insertPayload);

      return new ApiResponse(201, {
        success: true,
        count: inserted.length,
        products: inserted,
      });
    } catch (error: any) {
      if (error.name === "MongoServerError" && error.code === 11000) {
        throw new ApiError(400, "Duplicate product detected during creation.");
      }

      throw new ApiError(500, error.message || "Internal Server Error");
    }
  },

  deleteMultipleProducts: async ({ ids }: any) => {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "Product IDs are required");
      }

      // Delete all products with _id in the array
      const deleteResult = await Product.deleteMany({ _id: { $in: ids } });

      return new ApiResponse(200, {
        success: true,
        deletedCount: deleteResult.deletedCount,
        message: "Products deleted successfully.",
      });
    } catch (error: any) {
      throw new ApiError(500, error.message || "Internal Server Error");
    }
  },

  getUserProducts: async ({ userId, page, pageSize, filterData }: any) => {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    const finalFilters = {
      ...filterData,
      userId,
    };

    const documentCount = await Product.countDocuments(finalFilters);

    const products = await Product.find(finalFilters)
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum)
      .sort({ createdAt: -1 })
      .populate("categoryId brandId", "_id name");

    const paginationData = {
      documentCount,
      totalPages: Math.ceil(documentCount / pageSizeNum),
      currentPage: pageNum,
      pageSize: pageSizeNum,
    };

    return new ApiResponse(200, { products, paginationData });
  },

  // ----------------------Category-----------------------------

  createCategory: async ({ name, image, isActive, userId }: any) => {
    let category = await Category.create({
      name,
      image,
      isActive,
      userId,
    });

    if (category) {
      return new ApiResponse(201, { category });
    }

    throw new ApiError(500);
  },

  deleteCategory: async ({ id }: any) => {
    let category = await Category.findByIdAndDelete(id);

    if (category) {
      return new ApiResponse(201, { category });
    }

    throw new ApiError(500);
  },

  UserCategories: async ({ userId }: any) => {
    let category = await Category.find({
      userId,
    });

    return new ApiResponse(201, { category });
  },

  UserCategoryEdit: async ({ name, image, isActive, id }: any) => {
    let category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        image,
        isActive,
      },
      { new: true }
    );

    if (category) {
      return new ApiResponse(201, { category });
    }

    throw new ApiError(500);
  },

  // ----------------------Brand-----------------------------

  createBrand: async ({ name, image, isActive, userId }: any) => {
    let category = await Category.create({
      name,
      image,
      isActive,
      userId,
    });

    if (category) {
      return new ApiResponse(201, { category });
    }

    throw new ApiError(500);
  },

  deleteBrand: async ({ id }: any) => {
    let category = await Category.findByIdAndDelete(id);

    if (category) {
      return new ApiResponse(201, { category });
    }

    throw new ApiError(500);
  },

  UserBrands: async ({ userId }: any) => {
    let category = await Category.find({
      userId,
    });

    return new ApiResponse(201, { category });
  },

  UserBrandEdit: async ({ name, image, isActive, id }: any) => {
    let category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        image,
        isActive,
      },
      { new: true }
    );

    if (category) {
      return new ApiResponse(201, { category });
    }

    throw new ApiError(500);
  },
};

export { ProductService };
