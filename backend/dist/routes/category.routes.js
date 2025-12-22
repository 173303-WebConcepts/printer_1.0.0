import express from "express";
import { CategoryController } from "../controllers/category/category.controller.js";
import { Protected } from "../middlewares/protected.middleware.js";
const categoryRouter = express.Router();
// Industry
categoryRouter.route("/create").post(Protected.auth, Protected.roles(["superAdmin", "admin"]), CategoryController.create);
// categoryRouter.route("/update-category/:id").put(Protected.auth, Protected.roles(["superAdmin", "admin"]), CategoryController.update);
categoryRouter.route("/delete/:id").delete(Protected.auth, Protected.roles(["superAdmin", "admin"]), CategoryController.delete);
categoryRouter.route("/get").get(CategoryController.get);
export { categoryRouter };
//# sourceMappingURL=category.routes.js.map