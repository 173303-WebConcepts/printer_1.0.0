import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/index.js";
import { ApiError } from "../utils/apiError.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import User from "../models/user/user.model.js";
const Protected = {
    auth: asyncHandler(async (req, res, next) => {
        // const token = req.header("Authorization")?.split(" ")[1];
        const token = req.cookies?.access_token;
        if (!token)
            throw new ApiError(403, "Access Denied: No token provided");
        try {
            const tokenDetails = jwt.verify(token, JWT_SECRET);
            req.user = tokenDetails;
            next();
        }
        catch (err) {
            throw new ApiError(403, "Access Denied: Invalid token");
        }
    }),
    roles: (roles) => {
        return (req, res, next) => {
            const userRole = req.user?.role;
            if (userRole && roles.includes(userRole)) {
                next();
            }
            else {
                res.status(403).json({
                    error: true,
                    message: "You are not authorized",
                });
            }
        };
    },
    socketAuthenticator: async (err, socket, next) => {
        try {
            if (err)
                return next(err);
            const authToken = socket.request.cookies["access_token"];
            if (!authToken)
                return;
            const decodedData = jwt.verify(authToken, JWT_SECRET);
            const user = await User.findById(decodedData._id);
            if (!user)
                return;
            socket.user = user;
            return next();
        }
        catch (error) {

            // throw new ApiError(403, "Access Denied: Invalid token");
        }
    },
};
export { Protected };
//# sourceMappingURL=protected.middleware.js.map