import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle App Custom Error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this unique value already exists.',
    });
    return;
  }

  // General Error
  const statusCode = err.statusCode || 500;
  const message =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected internal server error occurred. Please try again later.'
      : err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.url}:`, err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
