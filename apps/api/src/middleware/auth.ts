import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";
import { makeId } from "../lib/id.js";
import { store } from "../store.js";
import type { User, UserRole } from "../types.js";

export interface RequestWithUser extends Request {
  user?: User;
}

export const createSessionToken = (userId: string): string => {
  const token = `alia_${makeId().replace(/-/g, "")}`;
  store.sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString()
  });

  return token;
};

export const authenticate = (
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or invalid Bearer token");
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const session = store.sessions.find((entry) => entry.token === token);
  if (!session) {
    throw new HttpError(401, "Invalid session token");
  }

  const user = store.users.find((entry) => entry.id === session.userId);
  if (!user) {
    throw new HttpError(401, "Session user not found");
  }

  req.user = user;
  next();
};

export const authorize = (...roles: UserRole[]) => {
  return (req: RequestWithUser, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, "Insufficient role permissions");
    }

    next();
  };
};
