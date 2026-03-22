import cors from "cors";
import express from "express";
import { authRouter } from "./modules/auth-routes.js";
import { chatRouter } from "./modules/chat-routes.js";
import { liveRouter } from "./modules/live-routes.js";
import { marketplaceRouter } from "./modules/marketplace-routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: "*"
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    name: "Aliafrica Marketplace API",
    version: "0.1.0",
    docs: {
      auth: ["/api/auth/register", "/api/auth/login", "/api/auth/me"],
      marketplace: [
        "/api/products",
        "/api/suppliers/products",
        "/api/vendors/storefronts",
        "/api/orders",
        "/api/orders/my",
        "/api/payments/checkout"
      ],
      chat: ["/api/chat/rooms", "/api/chat/rooms/my", "/api/chat/rooms/:roomId/messages"],
      live: [
        "/api/live/streams",
        "/api/live/streams/:streamId/start",
        "/api/live/streams/:streamId/auctions",
        "/api/live/auctions/:auctionId/bids"
      ]
    }
  });
});

app.use("/api/auth", authRouter);
app.use("/api", marketplaceRouter);
app.use("/api", chatRouter);
app.use("/api", liveRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Aliafrica API listening on http://localhost:${PORT}`);
  console.log("Seed accounts:");
  console.log("  supplier@aliafrica.com / Supplier123!");
  console.log("  vendor@aliafrica.com / Vendor123!");
  console.log("  buyer@aliafrica.com / Buyer123!");
  console.log("  admin@aliafrica.com / Admin123!");
});
