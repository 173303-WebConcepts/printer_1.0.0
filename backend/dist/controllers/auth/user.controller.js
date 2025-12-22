import { asyncHandler } from "../../utils/asyncHandler.utils.js";
import { UserService } from "../../services/auth/user.service.js";
import mongoose from "mongoose";
const UserController = {
    user: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { _id } = req.user;
            const response = await UserService.user({
                id: _id,
            });
            res.status(response.statusCode).json(response);
        }),
    ],
    get: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { page = 1, pageSize = 10, name, email, role, isBlocked, _id } = req.query;
            const { _id: userId } = req.user;
            const filterData = {};
            if (_id) {
                try {
                    filterData._id = new mongoose.Types.ObjectId(_id); // <- very important
                }
                catch (err) {
                    return res.status(400).json({ message: "Invalid ID format" });
                }
            }
            if (name) {
                filterData.name = {
                    $regex: name,
                    $options: "i",
                };
            }
            if (email) {
                filterData.email = {
                    $regex: email,
                    $options: "i",
                };
            }
            if (role) {
                filterData.role = role;
            }
            if (isBlocked) {
                filterData.isBlocked = isBlocked;
            }
            const response = await UserService.get({ page, pageSize, filterData, userId });
            res.status(response.statusCode).json(response);
        }),
    ],
    counts: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const response = await UserService.counts();
            res.status(response.statusCode).json(response);
        }),
    ],
    delete: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { id } = req.params;
            const response = await UserService.delete({ id });
            res.status(response.statusCode).json(response);
        }),
    ],
    block: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { userId, isBlocked } = req.body;
            const response = await UserService.block({ userId, isBlocked });
            res.status(response.statusCode).json(response);
        }),
    ],
    shopType: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { shopTypes } = req.body;
            const response = await UserService.shopType({ shopTypes });
            res.status(response.statusCode).json(response);
        }),
    ],
    shopTypeEdit: [
        // validate(ValidationSchema.registerSchema),
        asyncHandler(async (req, res, next) => {
            const { id, shopType } = req.body;
            const response = await UserService.shopTypeEdit({ id, shopType });
            res.status(response.statusCode).json(response);
        }),
    ],
};
export { UserController };
//# sourceMappingURL=user.controller.js.map