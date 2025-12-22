import { ApiError } from "../utils/apiError.utils.js";
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message.replace(/\"/g, "")).join(", ");
            return next(new ApiError(400, errorMessage));
        }
        next();
    };
};
// const validate = (schema: Schema) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const { error } = schema.validate(req.body, { abortEarly: false });
//     if (error) {
//       // Log the error details for debugging purposes
//       const errorMessage = error.details.map((detail) => detail.message).join(", ");
//       // Pass the error to the ApiError handler
//       return next(new ApiError(400, errorMessage));
//     }
//     next();
//   };
// };
export { validate };
//# sourceMappingURL=validation.middleware.js.map