// import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_NAME } from "../config/index.js";

// // import { v2 as cloudinary } from 'cloudinary';

// const cloudinary = await import('cloudinary').then(pkg => pkg.v2);

// // Configure Cloudinary with your credentials
// cloudinary.config({
//   cloud_name: CLOUDINARY_NAME,  // Add your Cloudinary cloud name
//   api_key: CLOUDINARY_API_KEY,        // Add your Cloudinary API key
//   api_secret: CLOUDINARY_API_SECRET,  // Add your Cloudinary API secret
// });

// export default cloudinary;

import cloudinary from "cloudinary";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_NAME } from "../config/index.js";
const { v2: cloudinaryInstance } = cloudinary;

// Configure Cloudinary with your credentials
cloudinaryInstance.config({
  cloud_name: CLOUDINARY_NAME, // Add your Cloudinary cloud name
  api_key: CLOUDINARY_API_KEY, // Add your Cloudinary API key
  api_secret: CLOUDINARY_API_SECRET, // Add your Cloudinary API secret
});

export default cloudinaryInstance;
