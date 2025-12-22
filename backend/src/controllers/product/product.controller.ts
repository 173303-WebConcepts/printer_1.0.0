import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../../services/category/category.service.js";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { ProductService } from "../../services/product/product.service.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";

const ProductController = {
  syncProducts: [
    asyncHandler(async (req: any, res: Response) => {
      const { create = [], update = [], delete: deleteIds = [] } = req.body;
      const userId = req.user._id;

      let createdResults: any[] = [];
      let updatedResults: any[] = [];
      let deletedResults: any[] = [];

      // -------------------------------------------------
      // 1️⃣ CREATE (pending items from device)
      // -------------------------------------------------
      if (create.length > 0) {
        const resp = await ProductService.createMultipleProducts({
          userId,
          products: create,
        });



        // ⚠ Your create API returns:
        // new ApiResponse(201, { success, message, data: inserted })
        createdResults = resp.data?.products; // inserted categories
      }

      // -------------------------------------------------
      // 2️⃣ UPDATE (updated items from device)
      // -------------------------------------------------
      if (update.length > 0) {
        await CategoryService.updateMultipleCategories({
          categories: update,
          userId,
        });

        updatedResults = update;
      }

      // -------------------------------------------------
      // 3️⃣ DELETE (deleted items from device)
      // -------------------------------------------------
      if (deleteIds.length > 0) {
        await ProductService.deleteMultipleProducts({
          ids: deleteIds,
        });

        deletedResults = deleteIds;
      }

      // -------------------------------------------------
      // 4️⃣ SERVER → DEVICE Sync (changes since last sync)
      // -------------------------------------------------

      const resp = await ProductService.getUserProducts({
        userId,
      });

      // ⚠ Your create API returns:
      // new ApiResponse(201, { success, message, data: inserted })
      const serverUpdatesSinceLastSync = resp.data?.products; // inserted categories

      return res.json(
        new ApiResponse(200, {
          created: createdResults,
          updated: updatedResults,
          deleted: deletedResults,
          serverUpdatesSinceLastSync,
        })
      );
    }),
  ] as any,

  create: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, sku, barcode, unit, purchasePrice, sellingPrice, stock, isActive, brandId, categoryId, image, userIdByAdmin } =
        req.body;
      const { _id: userId } = req.user as any;

      const response = await ProductService.create({
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
        userId: userIdByAdmin ? userIdByAdmin : userId,
        image,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  update: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, sku, barcode, unit, purchasePrice, sellingPrice, stock, isActive, brandId, categoryId } = req.body;
      const { id } = req.params;

      const response = await ProductService.update({
        id,
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
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  delete: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const response = await ProductService.delete({
        id,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  getUserProducts: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, page, pageSize, userIdByAdmin, isActive } = req.query;
      const { _id: userId } = req.user as any;

      const filterData: any = {};
      if (name)
        filterData.name = {
          $regex: name,
          $options: "i",
        };

      if (isActive) filterData.isActive = isActive;

      const response = await ProductService.getUserProducts({
        userId: userIdByAdmin ? userIdByAdmin : userId,
        page,
        pageSize,
        filterData,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  //   --------------------------Category------------------------------------

  createCategory: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, image, isActive } = req.body;
      const { _id: userId } = req.user as any;

      const response = await ProductService.createCategory({
        name,
        image,
        isActive,
        userId,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  UserCategories: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { _id: userId } = req.user as any;

      const response = await ProductService.UserCategories({
        userId,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  deleteCategory: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const response = await ProductService.deleteCategory({
        id,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  UserCategoryEdit: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, image, isActive } = req.body;
      const { id } = req.params;

      const response = await ProductService.UserCategoryEdit({
        id,
        name,
        image,
        isActive,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  //   --------------------------Brand------------------------------------

  createBrand: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, image, isActive } = req.body;
      const { _id: userId } = req.user as any;

      const response = await ProductService.createBrand({
        name,
        image,
        isActive,
        userId,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  UserBrands: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { _id: userId } = req.user as any;

      const response = await ProductService.UserBrands({
        userId,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  deleteBrand: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const response = await ProductService.deleteBrand({
        id,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  UserBrandEdit: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, image, isActive } = req.body;
      const { id } = req.params;

      const response = await ProductService.UserBrandEdit({
        id,
        name,
        image,
        isActive,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,
};

export { ProductController };
