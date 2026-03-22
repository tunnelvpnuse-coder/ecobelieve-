import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../lib/http-error.js";
import { makeId } from "../lib/id.js";
import { authenticate, authorize, type RequestWithUser } from "../middleware/auth.js";
import { store } from "../store.js";

const createStreamSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  scheduledAt: z.string().datetime()
});

const createAuctionSchema = z.object({
  productId: z.string().min(6),
  startPrice: z.number().positive(),
  reservePrice: z.number().positive()
});

const placeBidSchema = z.object({
  amount: z.number().positive()
});

export const liveRouter = Router();

liveRouter.post(
  "/live/streams",
  authenticate,
  authorize("VENDOR"),
  (req: RequestWithUser, res) => {
    const payload = createStreamSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const stream = {
      id: makeId(),
      vendorId: req.user.id,
      title: payload.title,
      description: payload.description,
      status: "SCHEDULED" as const,
      scheduledAt: payload.scheduledAt,
      createdAt: new Date().toISOString()
    };

    store.liveStreams.push(stream);
    res.status(201).json({ stream });
  }
);

liveRouter.post(
  "/live/streams/:streamId/start",
  authenticate,
  authorize("VENDOR"),
  (req: RequestWithUser, res) => {
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const stream = store.liveStreams.find((entry) => entry.id === req.params.streamId);
    if (!stream) {
      throw new HttpError(404, "Live stream not found");
    }
    if (stream.vendorId !== req.user.id) {
      throw new HttpError(403, "Cannot start another vendor's stream");
    }

    stream.status = "LIVE";
    stream.startedAt = new Date().toISOString();
    res.json({ stream });
  }
);

liveRouter.post(
  "/live/streams/:streamId/end",
  authenticate,
  authorize("VENDOR"),
  (req: RequestWithUser, res) => {
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const stream = store.liveStreams.find((entry) => entry.id === req.params.streamId);
    if (!stream) {
      throw new HttpError(404, "Live stream not found");
    }
    if (stream.vendorId !== req.user.id) {
      throw new HttpError(403, "Cannot end another vendor's stream");
    }

    stream.status = "ENDED";
    stream.endedAt = new Date().toISOString();
    res.json({ stream });
  }
);

liveRouter.get("/live/streams", (_req, res) => {
  res.json({ streams: store.liveStreams });
});

liveRouter.post(
  "/live/streams/:streamId/auctions",
  authenticate,
  authorize("VENDOR"),
  (req: RequestWithUser, res) => {
    const payload = createAuctionSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const stream = store.liveStreams.find((entry) => entry.id === req.params.streamId);
    if (!stream) {
      throw new HttpError(404, "Live stream not found");
    }
    if (stream.vendorId !== req.user.id) {
      throw new HttpError(403, "Cannot create auction on another vendor's stream");
    }
    if (stream.status !== "LIVE") {
      throw new HttpError(400, "Stream must be live before starting auctions");
    }

    const product = store.products.find((entry) => entry.id === payload.productId);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    const auction = {
      id: makeId(),
      streamId: stream.id,
      productId: payload.productId,
      startPrice: payload.startPrice,
      reservePrice: payload.reservePrice,
      currentBid: payload.startPrice,
      status: "LIVE" as const,
      bids: [],
      createdAt: new Date().toISOString()
    };

    store.auctions.push(auction);
    res.status(201).json({ auction, product });
  }
);

liveRouter.post(
  "/live/auctions/:auctionId/bids",
  authenticate,
  authorize("BUYER", "VENDOR", "ADMIN"),
  (req: RequestWithUser, res) => {
    const payload = placeBidSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const auction = store.auctions.find((entry) => entry.id === req.params.auctionId);
    if (!auction) {
      throw new HttpError(404, "Auction not found");
    }
    if (auction.status !== "LIVE") {
      throw new HttpError(400, "Auction is not live");
    }
    if (payload.amount <= auction.currentBid) {
      throw new HttpError(400, "Bid must be greater than current bid");
    }

    auction.currentBid = payload.amount;
    auction.currentWinnerId = req.user.id;
    auction.bids.push({
      bidderId: req.user.id,
      amount: payload.amount,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ auction });
  }
);

liveRouter.post(
  "/live/auctions/:auctionId/close",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  (req: RequestWithUser, res) => {
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const auction = store.auctions.find((entry) => entry.id === req.params.auctionId);
    if (!auction) {
      throw new HttpError(404, "Auction not found");
    }

    const stream = store.liveStreams.find((entry) => entry.id === auction.streamId);
    if (!stream) {
      throw new HttpError(404, "Auction stream missing");
    }

    const canClose =
      req.user.role === "ADMIN" || (req.user.role === "VENDOR" && stream.vendorId === req.user.id);
    if (!canClose) {
      throw new HttpError(403, "Not allowed to close this auction");
    }

    auction.status = "CLOSED";
    auction.closedAt = new Date().toISOString();

    const metReserve = auction.currentBid >= auction.reservePrice;
    res.json({
      auction,
      settlement: metReserve
        ? {
            winnerId: auction.currentWinnerId,
            finalAmount: auction.currentBid,
            status: "RESERVE_MET"
          }
        : {
            winnerId: undefined,
            finalAmount: auction.currentBid,
            status: "RESERVE_NOT_MET"
          }
    });
  }
);
