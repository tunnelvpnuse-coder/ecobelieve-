# Aliafrica Frontend

This frontend provides a role-aware dashboard for the Aliafrica marketplace backend.

## Features implemented

- User registration/login (JWT-based backend auth)
- Marketplace catalog view:
  - supplier products
  - vendor listings
- Supplier operations:
  - create products
- Vendor operations:
  - create vendor store
  - publish listings from supplier products
- Buyer/vendor order flow:
  - place order
  - checkout payment
- Chat + moderation:
  - create rooms
  - send/load messages
  - moderation score visibility
- Live commerce:
  - create live sessions
  - go live / end live
  - create auctions
  - place bids
  - close auctions

## Configuration

Set API URL via environment variable:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If not provided, the app defaults to `http://127.0.0.1:8000`.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- This frontend is an MVP dashboard to exercise core backend endpoints quickly.
- It uses local state only (no router, no global store) to keep setup lightweight.
