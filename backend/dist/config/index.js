import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
// Specify the path to your environment file
const __dirname = fileURLToPath(import.meta.url);
const envFilePathDev = path.resolve(__dirname, "../../../.env.development.local");
const envFilePathPro = path.resolve(__dirname, "../../../.env.production.local");
// Load environment variables from the specified file
config({
    // path: process.env.NODE_ENV == "pro" ? envFilePathPro : envFilePathDev,
    path: false ? envFilePathPro : envFilePathDev, // true: pro & false: dev
});
export const { PORT, DEBUG_MODE, NODE_ENV, DEV_MONGODB_URI, PRO_MONGODB_URI, REFRESH_TOKEN_PRIVATE_KEY, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, BACKEND_URL, SMPT_HOST, SMPT_PORT, SMPT_SERVICE, SMPT_MAIL, SMPT_PASSWORD, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, SESSION_SECRET, FRONTEND_URL, CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, STRIPE_PUBLISH_KEY, STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET, FRONTEND_URI, JWT_SECRET, ADMIN_PANEL, } = process.env;
//# sourceMappingURL=index.js.map