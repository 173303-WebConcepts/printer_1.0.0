import express from "express";
import { ImagesController } from "../controllers/common/images.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { CommonController } from "../controllers/common/common.controller.js";
import multer from "multer";
import { Protected } from "../middlewares/protected.middleware.js";

const commonRouter = express.Router();

// protected routes
// commonRouter.route("/upload_images").post(upload.array("images", 2), ImagesController.upload);

commonRouter.route("/upload_images").post(
  Protected.auth,
  (req: any, res: any, next: any) => {
    upload.array("images", 10)(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message: "You can upload a maximum of 10 images only.",
        });
      }
      next(err);
    });
  },
  ImagesController.upload
);

commonRouter.route("/delete_images").post(Protected.auth, ImagesController.delete);

// commonRouter.route("/delete_images").post(ImagesController.delete);

// commonRouter.route("/upload_image").post(upload.single("image"), ImagesController.uploadSingle);

commonRouter.route("/sendMessage").post(CommonController.sendMessage);

export { commonRouter };
