import { STRIPE_PRICE_ID } from "../config/index.js";

export const DB_NAME_DEV: string = "printer-dev";
export const DB_NAME_PRO: string = "printer-pro";

export const AD_PRICE = 20;

// Plan-to-price mapping
export const PRICE_LOOKUP = {
  basic: STRIPE_PRICE_ID, // Replace with your real Stripe Price IDs
  premium: "price_2XXXXXXX",
  ultimate: "price_3XXXXXXX",
};
