const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    }
    catch (err) {
        const error = err; // Cast err to MyError
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            errors: error.errors || [],
            stack: error.stack,
        });
    }
};
export { asyncHandler };
//# sourceMappingURL=asyncHandler.utils.js.map