import express from "express";
import passport from "passport";
import { AuthService } from "../services/auth/auth.service.js";
import { FRONTEND_URL } from "../config/index.js";
import { Token } from "../utils/token.utils.js";
import User from "../models/user/user.model.js";
import { AuthController } from "../controllers/auth/auth.controller.js";
import { Protected } from "../middlewares/protected.middleware.js";
import bodyParser from "body-parser";
import { PaymentController } from "../controllers/payment/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.route("/create-checkout-session").post(Protected.auth, PaymentController.create);
paymentRouter.route("/webhook").post(bodyParser.raw({type: 'application/json'}), PaymentController.stripeWebHook)


export { paymentRouter };

