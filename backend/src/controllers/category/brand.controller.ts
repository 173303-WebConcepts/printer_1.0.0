import { NextFunction, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import Category from "../../models/product/category.model.js";
import { AuthService } from "../../services/auth/auth.service.js";
import { CategoryService } from "../../services/category/category.service.js";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { Helper } from "../../utils/helper.utils.js";
import { ValidationSchema } from "../../utils/validationSchema.utils.js";
import { ProductService } from "../../services/product/product.service.js";
import { BrandService } from "../../services/category/brand.services.js";

const BrandController = {
  create: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { brands, userIdByAdmin, shopType } = req.body;
      const { _id: userId, role } = req.user as any;

      const response = await BrandService.create({
        brands,
        userId,
        userIdByAdmin,
        role,
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

      const response = await BrandService.update({
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

      const response = await BrandService.delete({
        brandId: id,
        userId,
        userIdByAdmin,
        role,
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

      const response = await BrandService.get({
        filterData,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  getUserBrands: [
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

      const response = await BrandService.getUserBrands({
        filterData,
        userId: userId ? userId : loginUserId,
        page,
        pageSize,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  addUserToBrands: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { userId, brandIds } = req.body;

      const response = await BrandService.addUserToBrands({
        brandIds,
        userId,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  shopTypeBrands: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { shopType } = req.query;

      const response = await BrandService.shopTypeBrands({
        shopType,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,
};

export { BrandController };
