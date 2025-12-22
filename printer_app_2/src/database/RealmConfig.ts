import { CategorySchema } from "./schemas/Category";
import { Image } from "./schemas/Image";
import { Profile } from "./schemas/Profile";
import { ProductSchema, UnitObject, BrandObject, CategoryObject } from "./schemas/Product";
import { TransactionSchema, TransactionItemSchema } from "./schemas/Transaction";
import { TokenCounter } from "./schemas/TokenCounter";
import { Settings } from "./schemas/Settings";

export const realmConfig = {
  schema: [
    Image,
    Profile,
    TokenCounter,
    ProductSchema,
    UnitObject,
    BrandObject,
    CategoryObject,
    CategorySchema,
    TransactionSchema,
    TransactionItemSchema,
    Settings
  ],
  schemaVersion: 1, // keep version 1
  deleteRealmIfMigrationNeeded: true, // 🚨 auto-wipe DB if schema changed // AVOID in production mode
};
