# Aliafrica Core System (MVP)

This repository now contains a working backend MVP for **Aliafrica**, a multi-vendor
marketplace connecting global suppliers (with a China/manufacturing focus) to
vendors and buyers across Africa.

## Included features

- Multi-vendor marketplace foundation
- Supplier accounts and product catalog management
- Vendor storefronts and product listing/reselling
- Buyer/vendor order placement and supplier fulfillment hooks
- Secure checkout flow (mocked provider integration points)
- Direct chat rooms with AI-style fraud/business-context monitoring
- Live selling sessions for vendors
- Auction creation, bidding, and winner selection

## Tech stack

- Python 3.11+
- FastAPI
- SQLAlchemy (SQLite by default)
- JWT auth (`python-jose`)
- Password hashing (`passlib`)

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open API docs:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Core API workflow

1. Register users with roles (`supplier`, `vendor`, `buyer`, `admin`)
2. Vendor creates a store
3. Supplier creates products
4. Vendor creates listings from supplier products
5. Buyer (or vendor) creates orders and checks out
6. Supplier marks shipment progress
7. Supplier/vendor use chat rooms with moderation
8. Vendor creates live sessions and runs auctions

## Main endpoints

### Auth & Users

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`

### Supplier & Catalog

- `POST /suppliers/products`
- `GET /products`

### Vendor Storefront

- `POST /vendors/store`
- `GET /vendors/store/me`
- `POST /vendors/listings`
- `GET /listings`

### Orders & Payments

- `POST /orders`
- `POST /payments/checkout/{order_id}`
- `POST /orders/{order_id}/mark-processing`
- `POST /orders/{order_id}/supplier-ship`

### Chat + AI Fraud Monitoring

- `POST /chat/rooms`
- `POST /chat/messages`
- `GET /chat/rooms/{room_id}/messages`

Moderation runs automatically on message creation and labels content with:

- `allow`
- `warn`
- `block`

based on suspicious patterns and business-context heuristics.

### Live Selling + Auctions

- `POST /live/sessions`
- `POST /live/sessions/{session_id}/go-live`
- `POST /live/sessions/{session_id}/end`
- `GET /live/sessions`
- `POST /auctions/{session_id}`
- `POST /auctions/{auction_id}/bids`
- `POST /auctions/{auction_id}/close`
- `GET /auctions/{auction_id}`

## Testing

```bash
pytest -q
```

## Notes for production hardening

This MVP is intentionally focused on core flows. Before production, add:

- Full payment gateway integration (Stripe/Flutterwave/Paystack/etc.)
- WebSocket chat/live streams
- Object/media storage and CDN
- Stronger AI moderation models and human review queue
- Audit logs, rate limiting, RBAC expansion, and compliance controls
- Migration tooling (Alembic), observability, and CI/CD pipelines
