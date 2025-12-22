import { NextFunction, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import Category from "../../models/product/category.model.js";
import { AuthService } from "../../services/auth/auth.service.js";
import { CategoryService } from "../../services/category/category.service.js";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { Helper } from "../../utils/helper.utils.js";
import { ValidationSchema } from "../../utils/validationSchema.utils.js";
import { ProductService } from "../../services/product/product.service.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";

const CategoryController = {
  syncCategories: asyncHandler(async (req: any, res: Response) => {
    const { create = [], update = [], delete: deleteIds = [] } = req.body;
    const userId = req.user._id;

    let createdResults: any[] = [];
    let updatedResults: any[] = [];
    let deletedResults: any[] = [];

    // -------------------------------------------------
    // 1️⃣ CREATE (pending items from device)
    // -------------------------------------------------
    if (create.length > 0) {
      const resp = await CategoryService.create({
        categories: create,
        userId,
      });

      console.log("resp.data", resp.data)

      // ⚠ Your create API returns:
      // new ApiResponse(201, { success, message, data: inserted })
      createdResults = resp.data?.data; // inserted categories
    }

    // -------------------------------------------------
    // 2️⃣ UPDATE (updated items from device)
    // -------------------------------------------------
    if (update.length > 0) {
      await CategoryService.updateMultipleCategories({
        categories: update,
        userId,
      });

      updatedResults = update
    }

    // -------------------------------------------------
    // 3️⃣ DELETE (deleted items from device)
    // -------------------------------------------------
    if (deleteIds.length > 0) {
      await CategoryService.deleteMultipleCategories({
        ids: deleteIds,
        userId,
      });

      deletedResults = deleteIds;
    }

    // -------------------------------------------------
    // 4️⃣ SERVER → DEVICE Sync (changes since last sync)
    // -------------------------------------------------

    const resp = await CategoryService.getUserCategories({
      userId,
    });

    // ⚠ Your create API returns:
    // new ApiResponse(201, { success, message, data: inserted })
    const serverUpdatesSinceLastSync = resp.data?.categories; // inserted categories

    return res.json(
      new ApiResponse(200, {
        created: createdResults,
        updated: updatedResults,
        deleted: deletedResults,
        serverUpdatesSinceLastSync,
      })
    );
  }),

  create: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { categories, userIdByAdmin, shopType } = req.body;
      const { _id: userId } = req.user as any;

      const response = await CategoryService.create({
        categories,
        userId,
        userIdByAdmin,
        shopType,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  update: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name } = req.body;
      const { id } = req.params;

      const response = await CategoryService.update({
        name,
        id,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  delete: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { id, userIdByAdmin } = req.params;
      const { _id: userId, role } = req.user as any;

      const response = await CategoryService.delete({
        categoryId: id,
        userId,
        userIdByAdmin,
        role,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  deleteMultipleCategories: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { ids } = req.body;
      const { _id: userId, role } = req.user as any;

      const response = await CategoryService.deleteMultipleCategories({
        ids,
        userId,
        role,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  updateMultipleCategories: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { categories } = req.body;
      const { _id: userId } = req.user as any;

      const response = await CategoryService.updateMultipleCategories({
        categories,
        userId,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  get: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name } = req.query;

      const filterData: any = {};
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
  ] as any,

  getUserCategories: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, userId, page, pageSize } = req.query;
      const { _id: loginUserId } = req.user as any;

      const filterData: any = {};
      if (name)
        filterData.name = {
          $regex: name,
          $options: "i",
        };

      const response = await CategoryService.getUserCategories({
        filterData,
        userId: userId ? userId : loginUserId,
        page,
        pageSize,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  addUserToCategories: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { userId, categoriesIds } = req.body;

      const response = await CategoryService.addUserToCategories({
        categoriesIds,
        userId,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  shopTypeCategories: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { shopType } = req.query;

      const response = await CategoryService.shopTypeCategories({
        shopType,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,
};

export { CategoryController };
