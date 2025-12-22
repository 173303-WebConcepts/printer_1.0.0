import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { JWT_SECRET } from "../config/index.js";
import { ApiError } from "../utils/apiError.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import User from "../models/user/user.model.js";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

interface TokenPayload {
  roles: string[];
}

const Protected = {
  auth: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // const token = req.header("Authorization")?.split(" ")[1];
    const token = req.cookies?.access_token;

    if (!token) throw new ApiError(403, "Access Denied: No token provided");

    try {
      const tokenDetails: any = jwt.verify(token, JWT_SECRET as Secret) as TokenPayload;
      // 2️⃣ Fetch the user from DB
      const user = await User.findById(tokenDetails._id).select("tokenVersion userName role");
      if (!user) throw new ApiError(403, "User not found");

      // 3️⃣ Compare token version (invalidate old sessions)
      if (tokenDetails.tokenVersion !== user.tokenVersion) {
        throw new ApiError(401, "Token expired due to re-login");
      }

      req.user = tokenDetails;
      next();
    } catch (err) {
      console.log(err)
      throw new ApiError(403, "Access Denied: Invalid token");
    }
  }) as any,

  roles: (roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
      const userRole = req.user?.role;
      if (userRole && roles.includes(userRole)) {
        next();
      } else {
        res.status(403).json({
          error: true,
          message: "You are not authorized",
        });
      }
    };
  },

  socketAuthenticator: async (err: any, socket: any, next: any) => {
    try {
      if (err) return next(err);

      const authToken = socket.request.cookies["access_token"];

      if (!authToken) return;

      const decodedData: any = jwt.verify(authToken, JWT_SECRET as Secret);

      const user = await User.findById(decodedData._id);

      if (!user) return;

      socket.user = user;

      return next();
    } catch (error) {

      // throw new ApiError(403, "Access Denied: Invalid token");
    }
  },
};

export { Protected };
