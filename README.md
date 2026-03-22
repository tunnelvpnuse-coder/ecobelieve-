# Aliafrica Marketplace (Supplier -> Vendor -> Buyer)

This repository contains a **detailed starter implementation** for Aliafrica, a multi-vendor e-commerce marketplace connecting global suppliers (with strong China sourcing support) to African vendors and buyers.

The code includes:

- Multi-vendor marketplace backend API
- Supplier product management
- Vendor storefront and listing management
- Buyer order + payment workflow
- Supplier/vendor direct chat with AI moderation
- Live stream and auction sales module
- Lightweight frontend demo page for end-to-end testing

---

## 1) Architecture Overview

### Core users

- **Supplier**: uploads and manages source products.
- **Vendor**: creates storefronts and resells supplier products (dropshipping model).
- **Buyer**: places orders from vendor storefronts.
- **Admin**: confirms payments, oversees marketplace safety.

### Main modules

1. **Auth & RBAC**
   - Session token authentication (Bearer token).
   - Role-based authorization for each route.

2. **Marketplace**
   - Product catalog with search/filtering.
   - Storefronts and listings for vendors.
   - Orders with lifecycle states.
   - Payment transactions and order settlement updates.

3. **Business Chat**
   - Supplier <-> Vendor chat rooms.
   - AI-like moderation scoring (`ALLOW`, `REVIEW`, `BLOCK`) using risk rules.
   - Flags suspicious content (off-platform contact/payment and fraud indicators).

4. **Live Commerce + Auction**
   - Vendor stream scheduling/start/end.
   - Live auction creation per stream.
   - Bid placement and auction close with reserve price logic.

---

## 2) Project Structure

```text
.
├── apps
│   ├── api
│   │   ├── src
│   │   │   ├── index.ts
│   │   │   ├── store.ts
│   │   │   ├── types.ts
│   │   │   ├── middleware
│   │   │   │   ├── auth.ts
│   │   │   │   └── error-handler.ts
│   │   │   ├── modules
│   │   │   │   ├── auth-routes.ts
│   │   │   │   ├── marketplace-routes.ts
│   │   │   │   ├── chat-routes.ts
│   │   │   │   ├── live-routes.ts
│   │   │   │   └── moderation.ts
│   │   │   └── lib
│   │   │       ├── http-error.ts
│   │   │       └── id.ts
│   │   └── package.json
│   └── web
│       ├── index.html
│       ├── styles.css
│       └── app.js
├── package.json
└── README.md
```

---

## 3) Quick Start

### Requirements

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run API

```bash
npm run dev:api
```

API runs on:

- `http://localhost:4000`
- Base API path: `http://localhost:4000/api`

### Open frontend demo

Open `apps/web/index.html` directly in browser (or serve it with any static server).

---

## 4) Seed Accounts (for testing)

- Supplier: `supplier@aliafrica.com` / `Supplier123!`
- Vendor: `vendor@aliafrica.com` / `Vendor123!`
- Buyer: `buyer@aliafrica.com` / `Buyer123!`
- Admin: `admin@aliafrica.com` / `Admin123!`

---

## 5) Important API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Marketplace

- `GET /api/products`
- `POST /api/suppliers/products` (SUPPLIER)
- `PATCH /api/suppliers/products/:productId` (SUPPLIER owner)
- `POST /api/vendors/storefronts` (VENDOR)
- `POST /api/vendors/storefronts/:storefrontId/listings` (VENDOR owner)
- `GET /api/storefronts/:storefrontId`
- `POST /api/orders` (BUYER)
- `GET /api/orders/my`
- `PATCH /api/orders/:orderId/status` (SUPPLIER/VENDOR/ADMIN)
- `POST /api/payments/checkout` (BUYER)
- `POST /api/payments/:paymentId/confirm` (ADMIN)

### Chat + Moderation

- `POST /api/chat/rooms`
- `GET /api/chat/rooms/my`
- `GET /api/chat/rooms/:roomId/messages`
- `POST /api/chat/rooms/:roomId/messages`

### Live + Auction

- `POST /api/live/streams`
- `POST /api/live/streams/:streamId/start`
- `POST /api/live/streams/:streamId/end`
- `GET /api/live/streams`
- `POST /api/live/streams/:streamId/auctions`
- `POST /api/live/auctions/:auctionId/bids`
- `POST /api/live/auctions/:auctionId/close`

---

## 6) AI Moderation Behavior (Chat)

`moderation.ts` scores each message for fraud/safety risk:

- Detects patterns like:
  - Off-platform contact attempts (`whatsapp`, `telegram`, etc.)
  - Off-platform payments (`crypto only`, `pay outside`, etc.)
  - Fraud/illegal keywords
- Returns:
  - `ALLOW`: low risk
  - `REVIEW`: medium risk
  - `BLOCK`: high risk (message rejected)

This creates a practical foundation for replacing rule-based checks with an LLM or external trust/safety service later.

---

## 7) Production Upgrade Path

This starter is intentionally simple for fast iteration. For production:

1. Replace in-memory store with PostgreSQL + Prisma.
2. Replace plain password field with hashed passwords (Argon2/Bcrypt).
3. Add JWT refresh token strategy and session expiry.
4. Integrate real payments (Paystack/Flutterwave webhooks).
5. Add WebSocket infrastructure for real-time chat/live events.
6. Integrate enterprise AI moderation service with audit logs.
7. Add KYC/KYB, dispute management, escrow, and anti-fraud workflows.
8. Add CDN/object storage for media.
9. Add observability (OpenTelemetry, logs, tracing, metrics).

---

## 8) Notes

- The backend is TypeScript + Express.
- The frontend is a static demo interface to test major user flows quickly.
- All data currently resets when API restarts (in-memory store).
