import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../lib/http-error.js";
import { makeId } from "../lib/id.js";
import { authenticate, authorize, type RequestWithUser } from "../middleware/auth.js";
import { moderateBusinessMessage } from "./moderation.js";
import { store } from "../store.js";

const createRoomSchema = z.object({
  supplierId: z.string().min(6),
  vendorId: z.string().min(6)
});

const createMessageSchema = z.object({
  text: z.string().min(1).max(4000)
});

export const chatRouter = Router();

chatRouter.post(
  "/chat/rooms",
  authenticate,
  authorize("SUPPLIER", "VENDOR", "ADMIN"),
  (req: RequestWithUser, res) => {
    const payload = createRoomSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const supplier = store.users.find(
      (entry) => entry.id === payload.supplierId && entry.role === "SUPPLIER"
    );
    const vendor = store.users.find(
      (entry) => entry.id === payload.vendorId && entry.role === "VENDOR"
    );
    if (!supplier || !vendor) {
      throw new HttpError(404, "Supplier or vendor not found");
    }

    const participant =
      req.user.role === "ADMIN" ||
      req.user.id === payload.supplierId ||
      req.user.id === payload.vendorId;
    if (!participant) {
      throw new HttpError(403, "You must be a participant to open this room");
    }

    const existing = store.rooms.find(
      (room) =>
        room.supplierId === payload.supplierId && room.vendorId === payload.vendorId
    );
    if (existing) {
      res.json({ room: existing, existed: true });
      return;
    }

    const room = {
      id: makeId(),
      supplierId: payload.supplierId,
      vendorId: payload.vendorId,
      createdAt: new Date().toISOString()
    };
    store.rooms.push(room);
    res.status(201).json({ room, existed: false });
  }
);

chatRouter.get("/chat/rooms/my", authenticate, (req: RequestWithUser, res) => {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }

  const rooms = store.rooms.filter((room) => {
    if (req.user?.role === "ADMIN") {
      return true;
    }

    return room.supplierId === req.user?.id || room.vendorId === req.user?.id;
  });

  res.json({ rooms });
});

chatRouter.get("/chat/rooms/:roomId/messages", authenticate, (req: RequestWithUser, res) => {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }

  const room = store.rooms.find((entry) => entry.id === req.params.roomId);
  if (!room) {
    throw new HttpError(404, "Chat room not found");
  }

  const participant =
    req.user.role === "ADMIN" ||
    room.supplierId === req.user.id ||
    room.vendorId === req.user.id;
  if (!participant) {
    throw new HttpError(403, "Not allowed to view messages in this room");
  }

  const messages = store.messages.filter(
    (message) => message.roomId === req.params.roomId
  );
  res.json({ messages });
});

chatRouter.post(
  "/chat/rooms/:roomId/messages",
  authenticate,
  (req: RequestWithUser, res) => {
    const payload = createMessageSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const room = store.rooms.find((entry) => entry.id === req.params.roomId);
    if (!room) {
      throw new HttpError(404, "Chat room not found");
    }

    const participant =
      req.user.role === "ADMIN" ||
      room.supplierId === req.user.id ||
      room.vendorId === req.user.id;
    if (!participant) {
      throw new HttpError(403, "Not allowed to post in this room");
    }

    const moderation = moderateBusinessMessage(payload.text);
    if (moderation.action === "BLOCK") {
      res.status(422).json({
        message: "Message blocked by AI moderation",
        moderation
      });
      return;
    }

    const message = {
      id: makeId(),
      roomId: room.id,
      senderId: req.user.id,
      text: payload.text,
      moderation,
      createdAt: new Date().toISOString()
    };

    store.messages.push(message);
    res.status(201).json({
      message,
      moderation
    });
  }
);
