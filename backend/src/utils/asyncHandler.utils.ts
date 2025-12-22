import { NextFunction, Request, Response } from "express";

interface MyError extends Error {
  statusCode?: number;
  errors?: any[];
  stack?: string;
}

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      const error = err as MyError; // Cast err to MyError
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        errors: error.errors || [],
        stack: error.stack,
      });
    }
  };

export { asyncHandler };
