import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error.js";

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    message: "Route not found"
  });
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      details: error.errors
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    message: "Unexpected server error"
  });
};
