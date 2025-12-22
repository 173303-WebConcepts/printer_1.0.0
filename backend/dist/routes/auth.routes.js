import express from "express";
import passport from "passport";
import { AuthService } from "../services/auth/auth.service.js";
import { AuthController } from "../controllers/auth/auth.controller.js";
import { Protected } from "../middlewares/protected.middleware.js";
const authRouter = express.Router();
// public routes
authRouter.route("/register").post(AuthController.register);
authRouter.route("/login").post(AuthController.login);
authRouter.route("/logout").get(AuthController.logout);
authRouter.route("/send-otp-code").post(AuthController.sendVerificationCode);
authRouter.route("/reset-password-link").post(AuthController.sendPasswordResetLink);
authRouter.route("/reset-password").post(AuthController.resetPassword);
authRouter.route("/protected").get(Protected.auth, AuthController.protected);
authRouter
    .route("/google")
    .get(passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }), AuthService.googleAuth);
// Google OAuth callback route
authRouter.route("/google/callback").get(AuthService.googleAuthCallback);
export { authRouter };
//# sourceMappingURL=auth.routes.js.map