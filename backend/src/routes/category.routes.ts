import express from "express";
import { CategoryController } from "../controllers/category/category.controller.js";
import { Protected } from "../middlewares/protected.middleware.js";
import { BrandController } from "../controllers/category/brand.controller.js";

const categoryRouter = express.Router();

categoryRouter.route("/create").post(Protected.auth, CategoryController.create);
categoryRouter.route("/update/:id").put(Protected.auth, CategoryController.update);
categoryRouter.route("/delete/:id").delete(Protected.auth, CategoryController.delete);
categoryRouter
  .route("/delete/:id/:userIdByAdmin")
  .delete(Protected.auth, Protected.roles(["superAdmin", "admin"]), CategoryController.delete);
categoryRouter.route("/get").get(CategoryController.get);

// User Categories
categoryRouter.route("/user-categories").get(Protected.auth, CategoryController.getUserCategories);
categoryRouter.route("/add-user-to-categories").put(Protected.auth, CategoryController.addUserToCategories);
categoryRouter.route("/update-multiple").put(Protected.auth, CategoryController.updateMultipleCategories);
categoryRouter.route("/shop-type-categories").get(Protected.auth, CategoryController.shopTypeCategories);
categoryRouter.route("/delete-multiple").post(Protected.auth, CategoryController.deleteMultipleCategories);

categoryRouter.route("/sync").post(Protected.auth, CategoryController.syncCategories as any);

// ____________________________Brand_________________________________________

categoryRouter.route("/brand/create").post(Protected.auth, BrandController.create);
categoryRouter.route("/brand/update/:id").put(Protected.auth, BrandController.update);
categoryRouter.route("/brand/delete/:id").delete(Protected.auth, BrandController.delete);
categoryRouter
  .route("/brand/delete/:id/:userIdByAdmin")
  .delete(Protected.auth, Protected.roles(["superAdmin", "admin"]), BrandController.delete);
categoryRouter.route("/brand/get").get(BrandController.get);

// User Brands
categoryRouter.route("/user-brands").get(Protected.auth, BrandController.getUserBrands);
categoryRouter.route("/add-user-to-brands").put(Protected.auth, BrandController.addUserToBrands);
categoryRouter.route("/shop-type-brands").get(Protected.auth, BrandController.shopTypeBrands);

export { categoryRouter };
