import { validate } from "../../middlewares/validation.middleware.js";
import { AuthService } from "../../services/auth/auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { ValidationSchema } from "../../utils/validationSchema.utils.js";
import { NODE_ENV } from "../../config/index.js";
const AuthController = {
    register: [
        validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { name, email, password, role, otpCode, phone } = req.body;
            const response = await AuthService.register({
                name,
                email,
                password,
                role,
                res,
                otpCode,
                phone,
            });
            res.status(response.statusCode).json(response);
        }),
    ],
    login: [
        validate(ValidationSchema.loginSchema),
        asyncHandler(async (req, res, next) => {
            const { email, password } = req.body;
            const response = await AuthService.login({
                email,
                password,
                res,
            });
            res.status(response.statusCode).json(response);
        }),
    ],
    logout: [
        // validate(ValidationSchema.loginSchema),
        asyncHandler(async (req, res, next) => {
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
    ],
    protected: [
        asyncHandler(async (req, res, next) => {
            return res.status(200).json({
                success: true,
                message: "Success",
            });
        }),
    ],
    sendPasswordResetLink: [
        validate(ValidationSchema.sendPasswordResetLinkSchema),
        asyncHandler(async (req, res, next) => {
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
        asyncHandler(async (req, res, next) => {
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
    sendVerificationCode: [
        validate(ValidationSchema.vefificationCode),
        asyncHandler(async (req, res, next) => {
            const { email } = req.body;
            const response = await AuthService.sendVerificationCode({
                email,
            });
            res.status(response.statusCode).json(response);
        }),
    ],
};
export { AuthController };
//# sourceMappingURL=auth.controller.js.map