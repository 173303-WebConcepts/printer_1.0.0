import jwt, { Secret } from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY, JWT_SECRET } from "../config/index.js";

interface TokenPayload {
  _id: string;
  userName: string;
  role: string;
  tokenVersion: Number;
  // Add any other properties you expect in your token payload here
}

const Token = {
  generateToken: async (user: any) => {
    try {
      const payload: TokenPayload = {
        _id: user._id,
        userName: user.userName,
        role: user.role,
        tokenVersion: (user.tokenVersion += 1),
      };

      const accessToken = jwt.sign(payload, JWT_SECRET as Secret, {
        expiresIn: (ACCESS_TOKEN_EXPIRY as any) || "10d",
      });

      return Promise.resolve({ accessToken });
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export { Token };
