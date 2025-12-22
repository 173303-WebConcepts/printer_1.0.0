// import { Request } from "express";
// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
//     // if (file.mimetype.startsWith("images/")) {
//     cb(null, "./public/images");
//     // }
//   },

//   filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
//     cb(null, Date.now() + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// export { upload };

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.middleware.js";

// ✅ Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Clean filename: remove extension, trim, replace spaces/special chars
    const cleanName = file.originalname
      .split(".")[0]
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]/g, ""); // keep letters, numbers, -, _

    return {
      folder: "user-uploads",
      public_id: `${Date.now()}-${cleanName}`,
      resource_type: "image",
    };
  },
});

const upload = multer({
  storage,
  limits: { files: 10 }, // 10 image limit
});

export { upload };
