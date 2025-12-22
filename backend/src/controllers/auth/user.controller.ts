import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { UserService } from "../../services/auth/user.service.js";
import mongoose from "mongoose";

const UserController = {
  user: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.user as any;

      const response = await UserService.user({
        id: _id,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  get: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { page = 1, pageSize = 10, name, phone, role, isBlocked, _id } = req.query;
      const { _id: userId } = req.user;

      const filterData: any = {};

      if (_id) {
        try {
          filterData._id = new mongoose.Types.ObjectId(_id); // <- very important
        } catch (err) {
          return res.status(400).json({ message: "Invalid ID format" });
        }
      }

      if (name) {
        filterData.name = {
          $regex: name,
          $options: "i",
        };
      }
      if (phone) {
        filterData.phone = phone;
      }
      if (role) {
        filterData.role = role;
      }
      if (isBlocked) {
        filterData.isBlocked = isBlocked;
      }

      const response = await UserService.get({ page, pageSize, filterData, userId });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  counts: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const response = await UserService.counts();

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  delete: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const response = await UserService.delete({ id });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  block: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { userId, isBlocked } = req.body;

      const response = await UserService.block({ userId, isBlocked });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  update: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { email, GRefreshToken } = req.body;
      const { _id: userId } = req.user;

      const updateFields: any = {};

        if (email) updateFields.email = email;
    if (GRefreshToken) updateFields.GRefreshToken = GRefreshToken;

      const response = await UserService.update({ updateFields, userId });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  shopType: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { shopTypes } = req.body;

      const response = await UserService.shopType({ shopTypes });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  gallery: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { images, shopType } = req.body;

      const response = await UserService.gallery({ images, shopType });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  galleries: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { page = 1, pageSize = 10, shopType, _id } = req.query;

      const filterData: any = {};

      if (_id) {
        try {
          filterData._id = new mongoose.Types.ObjectId(_id); // <- very important
        } catch (err) {
          return res.status(400).json({ message: "Invalid ID format" });
        }
      }
      if (_id) {
        try {
          filterData._id = new mongoose.Types.ObjectId(_id); // <- very important
        } catch (err) {
          return res.status(400).json({ message: "Invalid ID format" });
        }
      }
      if (shopType) {
        filterData.shopType = new mongoose.Types.ObjectId(shopType);
      }

      const response = await UserService.galleries({ page, pageSize, filterData });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  shopTypes: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const response = await UserService.shopTypes({});

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  shopTypeEdit: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { id, shopType } = req.body;

      const response = await UserService.shopTypeEdit({ id, shopType });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  shopDelete: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const response = await UserService.shopDelete({ id });

      res.status(response.statusCode).json(response);
    }),
  ] as any,
};

export { UserController };
