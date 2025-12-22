import express from "express";
import { Protected } from "../middlewares/protected.middleware.js";
import { UserController } from "../controllers/auth/user.controller.js";
const userRouter = express.Router();
userRouter.route("/get").get(Protected.auth, UserController.user);
userRouter.route("/block").put(Protected.auth, UserController.block);
userRouter.route("/get-users").get(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.get);
userRouter.route("/delete/:id").delete(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.delete);
userRouter.route("/counts").get(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.counts);
userRouter.route("/shopType").post(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.shopType);
userRouter.route("/shopType").put(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.shopTypeEdit);
export { userRouter };
//# sourceMappingURL=user.routes.js.map