import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import nodemailer from "nodemailer";
import { SMPT_HOST, SMPT_MAIL, SMPT_PASSWORD, SMPT_PORT, SMPT_SERVICE, } from "../../config/index.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
const CommonController = {
    sendMessage: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { userName, email, message } = req.body;
            const transporter = nodemailer.createTransport({
                host: SMPT_HOST,
                port: Number(SMPT_PORT),
                service: SMPT_SERVICE,
                auth: {
                    user: SMPT_MAIL,
                    pass: SMPT_PASSWORD,
                },
            });
            const mailOptions = {
                from: email, // Your email address
                to: SMPT_MAIL, // Your email address to receive the message
                subject: "User Message",
                text: `User Name: ${userName}\nUser Email: ${email}\n\nMessage:\n${message}`, // Include the user's email in the body
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res
                        .status(500)
                        .json(new ApiResponse(500, "Error sending email", error.message));
                }
                else {
                    res.status(200).json(new ApiResponse(200, "Success"));
                }
            });
        }),
    ],
};
export { CommonController };
//# sourceMappingURL=common.controller.js.map