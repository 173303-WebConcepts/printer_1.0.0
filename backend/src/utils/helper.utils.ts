import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { NODE_ENV, SMPT_MAIL, SMPT_PASSWORD } from "../config/index.js";
import nodemailer from "nodemailer";
import { ApiError } from "./apiError.utils.js";
import ejs from "ejs";

const Helper = {
  deleteImages: async (files: []) => {
    try {
      const __dirname = fileURLToPath(import.meta.url);
      const directory = path.resolve(__dirname, "../../../public/images");

      const deletePromises = files.map(async (fileName) => {
        const deleteFilePath = path.join(directory, fileName);
        fs.unlink(deleteFilePath, (err) => {
          if (err) {
            console.error(`Error deleting images:`, err.message);
          } else {

          }
        });
      });

      await Promise.all(deletePromises);
    } catch (error: any) {
      console.error("Error deleting images:", error.message);
    }
  },

  setCookie: (accessToken: any, res: any) => {
    // res.cookie("access_token", accessToken, {
    //   httpOnly: true,
    //   // secure: NODE_ENV == "pro" ? true : false,
    //   secure: NODE_ENV == "pro" ? true : false,
    //   sameSite: NODE_ENV == "pro" ? "strict" : "lax", // Adjust according to your needs
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    // });

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      // secure: NODE_ENV == "pro" ? true : false,
      secure: NODE_ENV == "pro" ? true : false,
      sameSite: NODE_ENV == "pro" ? "none" : "lax", // Adjust according to your needs
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // res.cookie("access_token", accessToken, {
    //   httpOnly: true,
    //   secure: true, // always true in production when using SameSite=None
    //   sameSite: "none", // Allow cross-site cookies
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });
  },

  sendEmailMessage: async ({ email, subject, ejsTemplate, data }: { email: string; subject: string; ejsTemplate: any; data: any }) => {
    // Render the EJS template with dynamic data
    const renderedHtml = ejs.render(ejsTemplate, { ...data });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: SMPT_MAIL,
        pass: SMPT_PASSWORD,
      },
    });

    const mailOptions = {
      to: email,
      from: SMPT_MAIL,
      subject: subject,
      html: renderedHtml,
    };

    // Wrap sendMail in a Promise for error handling
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {

          reject(new ApiError(400, "Error while sending email"));
        } else {
          resolve(info);
        }
      });
    });
  },
};

export { Helper };
