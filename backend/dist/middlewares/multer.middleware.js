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
// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: "user-uploads", // Folder in Cloudinary where images will be uploaded
            // format: ['jpg'],  // Optional: force a specific format
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // Create custom public_id
            resource_type: "image",
        };
    },
});
const upload = multer({ storage: storage });
export { upload };
//# sourceMappingURL=multer.middleware.js.map