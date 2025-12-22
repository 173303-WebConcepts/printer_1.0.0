import express from "express";
import { Protected } from "../middlewares/protected.middleware.js";
import bodyParser from "body-parser";
import { PaymentController } from "../controllers/payment/payment.controller.js";
const paymentRouter = express.Router();
paymentRouter.route("/create-checkout-session").post(Protected.auth, PaymentController.create);
paymentRouter.route("/webhook").post(bodyParser.raw({ type: 'application/json' }), PaymentController.stripeWebHook);
export { paymentRouter };
//# sourceMappingURL=payment.routes.js.map