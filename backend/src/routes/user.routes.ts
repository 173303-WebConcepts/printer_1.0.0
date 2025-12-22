import express from "express";

import { Protected } from "../middlewares/protected.middleware.js";
import { UserController } from "../controllers/auth/user.controller.js";

const userRouter = express.Router();

userRouter.route("/get").get(Protected.auth, UserController.user);

userRouter.route("/block").put(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.block);
userRouter.route("/all").get(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.get);
userRouter.route("/delete/:id").delete(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.delete);
userRouter.route("/counts").get(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.counts);

userRouter.route("/update").put(Protected.auth, UserController.update);

// ------------------------------ Shop Type -------------------------------------
userRouter.route("/shopType").post(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.shopType);
userRouter.route("/shopTypes").get(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.shopTypes);
userRouter.route("/shopType").put(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.shopTypeEdit);
userRouter.route("/shopType/:id").delete(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.shopDelete);

// ------------------------------ Gallery -------------------------------------
userRouter.route("/gallery").post(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.gallery);
userRouter.route("/galleries").get(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.galleries);
userRouter.route("/shop-type-galleries").get(Protected.auth, Protected.roles(["superAdmin", "admin"]), UserController.galleries);

export { userRouter };
