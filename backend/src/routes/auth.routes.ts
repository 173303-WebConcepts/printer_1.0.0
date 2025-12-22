import express from "express";
import passport from "passport";
import { AuthService } from "../services/auth/auth.service.js";
import { FRONTEND_URL } from "../config/index.js";
import { Token } from "../utils/token.utils.js";
import User from "../models/user/user.model.js";
import { AuthController } from "../controllers/auth/auth.controller.js";
import { Protected } from "../middlewares/protected.middleware.js";

const authRouter = express.Router();

// public routes
authRouter.route("/register").post(AuthController.register);
authRouter.route("/login").post(AuthController.login);
authRouter.route("/logout").post(Protected.auth, AuthController.logout);
// authRouter.route("/logout-web").get(AuthController.logoutWeb);
authRouter.route("/send-otp-code").post(AuthController.sendVerificationCode);

authRouter.route("/reset-password-link").post(AuthController.sendPasswordResetLink);
authRouter.route("/reset-password").post(AuthController.resetPassword);
authRouter.route("/reset-PIN").post(AuthController.resetPIN);

authRouter.route("/protected").get(Protected.auth, AuthController.protected);
authRouter.route("/g-exchange-auth-code").post(Protected.auth, AuthController.GExchangeAuthCode);
authRouter.route("/g-refresh-access-token").get(Protected.auth, AuthController.GRefreshAccessToken);

authRouter
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }), AuthService.googleAuth);

// Google OAuth callback route
authRouter.route("/google/callback").get(AuthService.googleAuthCallback);

authRouter.put("/change-password", Protected.auth, AuthController.changePassword);
authRouter.put("/admin/change-password", Protected.auth, Protected.roles(["superAdmin", "admin"]), AuthController.adminChangePassword);

export { authRouter };
