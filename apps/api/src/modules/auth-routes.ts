import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../lib/http-error.js";
import { authenticate, createSessionToken, type RequestWithUser } from "../middleware/auth.js";
import { store } from "../store.js";
import { makeId } from "../lib/id.js";
import type { UserRole } from "../types.js";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["SUPPLIER", "VENDOR", "BUYER", "ADMIN"]),
  country: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const normalizeRole = (role: UserRole): UserRole => role;

export const authRouter = Router();

authRouter.post("/register", (req, res) => {
  const payload = registerSchema.parse(req.body);

  const existing = store.users.find(
    (user) => user.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (existing) {
    throw new HttpError(409, "Email is already registered");
  }

  const user = {
    id: makeId(),
    fullName: payload.fullName,
    email: payload.email.toLowerCase(),
    password: payload.password,
    role: normalizeRole(payload.role),
    country: payload.country,
    createdAt: new Date().toISOString()
  };

  store.users.push(user);
  const token = createSessionToken(user.id);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      country: user.country
    }
  });
});

authRouter.post("/login", (req, res) => {
  const payload = loginSchema.parse(req.body);
  const user = store.users.find(
    (entry) =>
      entry.email.toLowerCase() === payload.email.toLowerCase() &&
      entry.password === payload.password
  );

  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = createSessionToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      country: user.country
    }
  });
});

authRouter.get("/me", authenticate, (req: RequestWithUser, res) => {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }

  res.json({
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      country: req.user.country
    }
  });
});
