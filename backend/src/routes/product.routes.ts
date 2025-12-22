import express from "express";
import { Protected } from "../middlewares/protected.middleware.js";
import { ProductController } from "../controllers/product/product.controller.js";

const productRouter = express.Router();

// ------------------Product-------------------------------
productRouter.route("/create").post(Protected.auth, ProductController.create);
productRouter.route("/user-products").get(Protected.auth, ProductController.getUserProducts);
productRouter.route("/update/:id").put(Protected.auth, ProductController.update);
productRouter.route("/delete/:id").delete(Protected.auth, ProductController.delete);

productRouter.route("/sync").post(Protected.auth, ProductController.syncProducts);


// ------------------Category-------------------------------
productRouter.route("/category").post(Protected.auth, ProductController.createCategory);
productRouter.route("/user-categories").get(Protected.auth, ProductController.UserCategories);
productRouter.route("/category/:id").put(Protected.auth, ProductController.UserCategoryEdit);
productRouter.route("/category/:id").delete(Protected.auth, ProductController.deleteCategory);

// ------------------Brand-------------------------------
productRouter.route("/brand").post(Protected.auth, ProductController.createBrand);
productRouter.route("/user-brands").get(Protected.auth, ProductController.UserBrands);
productRouter.route("/brand/:id").put(Protected.auth, ProductController.UserBrandEdit);
productRouter.route("/brand/:id").delete(Protected.auth, ProductController.deleteBrand);


export { productRouter };
