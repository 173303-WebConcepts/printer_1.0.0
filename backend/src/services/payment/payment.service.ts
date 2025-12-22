import Stripe from "stripe";
import { PRICE_LOOKUP } from "../../utils/constants.utils.js";
import { FRONTEND_URL, STRIPE_SECRET_KEY } from "../../config/index.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

type PlanType = "basic" | "premium" | "ultimate";

const stripe = new Stripe(STRIPE_SECRET_KEY!);

const PaymentService = {
  create: async ({ plan, userId }: { plan: PlanType; userId: string }) => {
    try {
      const priceId = PRICE_LOOKUP[plan];

      if (!priceId) throw new Error("Invalid plan");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${FRONTEND_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}/cancel`,
        metadata: {
          userId,
          plan,
        },
      });

      return new ApiResponse(200, { url: session.url });
    } catch (err) {
      console.error(err);
      throw new ApiError(500, "Stripe checkout failed");
    }
  },
};

export { PaymentService };
