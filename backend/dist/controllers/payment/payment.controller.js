import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { PaymentService } from "../../services/payment/payment.service.js";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../../config/index.js";
import User from "../../models/user/user.model.js";
const stripe = new Stripe(STRIPE_SECRET_KEY);
const endpointSecret = STRIPE_WEBHOOK_SECRET;
const PaymentController = {
    create: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { plan } = req.body;
            const { _id: userId } = req.user;
            const response = await PaymentService.create({
                plan,
                userId,
            });
            res.status(response.statusCode).json(response);
        }),
    ],
    stripeWebHook: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const sig = req.headers["stripe-signature"];
            let event;
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            }
            catch (err) {
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
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
    ],
};
export { PaymentController };
//# sourceMappingURL=payment.controller.js.map