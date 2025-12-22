import { NextFunction, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import Category from "../../models/product/category.model.js";
import { AuthService } from "../../services/auth/auth.service.js";
import { CategoryService } from "../../services/category/category.service.js";
import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { Helper } from "../../utils/helper.utils.js";
import { PaymentService } from "../../services/payment/payment.service.js";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../../config/index.js";
import User from "../../models/user/user.model.js";

const stripe = new Stripe(STRIPE_SECRET_KEY!);
const endpointSecret = STRIPE_WEBHOOK_SECRET!;

const PaymentController = {
  create: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const { plan } = req.body;
      const { _id: userId } = req.user;

      const response = await PaymentService.create({
        plan,
        userId,
      });

      res.status(response.statusCode).json(response);
    }),
  ] as any,

  stripeWebHook: [
    // validate(ValidationSchema.registerSchema),
    asyncHandler(async (req: any, res: Response, next: NextFunction) => {
      const sig = req.headers["stripe-signature"];

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === "checkout.session.completed") {
        const session: any = event.data.object;

        const userId = session.metadata.userId;
        const plan = session.metadata.plan;

        // Define key increments
        let silverIncrement = 0;
        let goldIncrement = 0;

        switch (plan) {
          case "basic":
            silverIncrement = 10;
            break;
          case "premium":
            silverIncrement = 20;
            break;
          case "ultimate":
            silverIncrement = 50;
            goldIncrement = 1;
            break;
          default:
            console.warn(`Unknown plan: ${plan}`);
            break;
        }

        // Update user keys
        await User.findByIdAndUpdate(userId, {
          $inc: {
            "keys.silver": silverIncrement,
            "keys.gold": goldIncrement,
          },
        });
      }

      res.status(200).json({ received: true });
    }),
  ] as any,
};

export { PaymentController };
