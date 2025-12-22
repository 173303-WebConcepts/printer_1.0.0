import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY, JWT_SECRET } from "../config/index.js";
const Token = {
    generateToken: async (user) => {
        try {
            const payload = {
                _id: user._id,
                userName: user.userName,
                role: user.role,
            };
            const accessToken = jwt.sign(payload, JWT_SECRET, {
                expiresIn: ACCESS_TOKEN_EXPIRY || "7d",
            });
            return Promise.resolve({ accessToken });
        }
        catch (err) {
            return Promise.reject(err);
        }
    },
};
export { Token };
//# sourceMappingURL=token.utils.js.map