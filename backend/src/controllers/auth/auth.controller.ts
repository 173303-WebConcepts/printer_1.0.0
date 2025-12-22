import { NextFunction, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { AuthService } from "../../services/auth/auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { ValidationSchema } from "../../utils/validationSchema.utils.js";
import { NODE_ENV } from "../../config/index.js";

const AuthController = {
  changePassword: [
    // validate(ValidationSchema.changePassword),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { oldPassword, newPassword } = req.body;
      const { _id } = req.user as any;

      const response = await AuthService.changePassword({
        userId: _id,
        oldPassword,
        newPassword,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  // 👑 Admin changing another user’s password
  adminChangePassword: [
    // validate(ValidationSchema.adminChangePassword),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { targetUserId, newPassword } = req.body;
      const { role } = req.user as any;

      const response = await AuthService.adminChangePassword({
        role,
        targetUserId,
        newPassword,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  register: [
    validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, password, phone, shopType, avatar } = req.body;
      const response = await AuthService.register({
        name,
        password,
        phone,
        shopType,
        // avatar,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  login: [
    validate(ValidationSchema.loginSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { phone, password, isMobile } = req.body;

      const response = await AuthService.login({
        phone,
        password,
        res,
        isMobile,
      });
      res.status(response.statusCode).json(response);
    }),
  ],

  logout: [
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { _id: userId } = req.user;

      const response = await AuthService.logout({
        userId,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  logoutWeb: [
    // validate(ValidationSchema.loginSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: NODE_ENV === "pro",
        sameSite: "strict",
      });

      return res.status(200).json({
        success: true,
        message: "logged out successfully",
      });
    }),
  ] as any,

  protected: [
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      return res.status(200).json({
        success: true,
        message: "Success",
      });
    }),
  ] as any,

  sendPasswordResetLink: [
    validate(ValidationSchema.sendPasswordResetLinkSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      let { email, userId } = req.body;

      const response = await AuthService.sendPasswordResetLink({
        email,
        userId,
      });

      res.status(response.statusCode).json(response);
    }),
  ],

  resetPassword: [
    validate(ValidationSchema.resetPasswordSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { userId, token } = req.query;
      const { password } = req.body;

      const response = await AuthService.resetPassword({
        userId,
        token,
        password,
      });

      res.status(response.statusCode).json(response);
    }),
  ],

  resetPIN: [
    // validate(ValidationSchema.resetPasswordSchema),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { email, newPIN, OTPCode } = req.body;

      const response = await AuthService.resetPIN({
        email,
        newPIN,
        OTPCode,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  sendVerificationCode: [
    validate(ValidationSchema.vefificationCode),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;

      const response = await AuthService.sendVerificationCode({
        email,
      });

      res.status(response.statusCode).json(response);
    }),
  ],

  GRefreshAccessToken: [
    // validate(ValidationSchema.vefificationCode),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
       const { _id: userId } = req.user as any;

      const response = await AuthService.GRefreshAccessToken({userId});

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  GExchangeAuthCode: [
    // validate(ValidationSchema.vefificationCode),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { authCode, email } = req.body;
      const { _id: userId } = req.user as any;

      const response = await AuthService.GExchangeAuthCode({
        authCode,
        userId,
        email,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,
};

export { AuthController };
