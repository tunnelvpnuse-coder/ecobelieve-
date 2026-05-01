from contextlib import asynccontextmanager
from datetime import datetime
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.dependencies import get_current_user, require_role
from app.models import (
    Auction,
    AuctionStatus,
    Bid,
    ChatMessage,
    ChatParticipant,
    ChatRoom,
    LiveSession,
    LiveSessionStatus,
    ModerationEvent,
    Order,
    OrderItem,
    OrderStatus,
    Payment,
    PaymentStatus,
    Product,
    StoreListing,
    User,
    UserRole,
    VendorStore,
)
from app.schemas import (
    AuctionCreate,
    AuctionOut,
    BidCreate,
    BidOut,
    ChatMessageCreate,
    ChatMessageOut,
    ChatRoomCreate,
    ChatRoomOut,
    ListingCreate,
    ListingOut,
    LiveSessionCreate,
    LiveSessionOut,
    OrderCreate,
    OrderOut,
    PaymentOut,
    ProductCreate,
    ProductOut,
    Token,
    UserCreate,
    UserOut,
    VendorStoreCreate,
    VendorStoreOut,
)
from app.security import create_access_token, get_password_hash, verify_password
from app.services.moderation import moderate_message

@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Aliafrica Marketplace API",
    description=(
        "Core backend for a multi-vendor dropshipping marketplace with "
        "supplier onboarding, vendor storefronts, order flow, chat moderation, "
        "live sales sessions, and auction support."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "ok", "service": "aliafrica-core"}


@app.post("/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        display_name=payload.display_name,
        country=payload.country,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == form_data.username))
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return Token(access_token=create_access_token(str(user.id)))


@app.get("/users/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user


@app.post("/vendors/store", response_model=VendorStoreOut, status_code=status.HTTP_201_CREATED)
def create_store(
    payload: VendorStoreCreate,
    user: User = Depends(require_role(UserRole.vendor)),
    db: Session = Depends(get_db),
):
    existing = db.scalar(select(VendorStore).where(VendorStore.vendor_id == user.id))
    if existing:
        raise HTTPException(status_code=400, detail="Store already exists")
    store = VendorStore(vendor_id=user.id, **payload.model_dump())
    db.add(store)
    db.commit()
    db.refresh(store)
    return store


@app.get("/vendors/store/me", response_model=VendorStoreOut)
def get_store_me(
    user: User = Depends(require_role(UserRole.vendor)),
    db: Session = Depends(get_db),
):
    store = db.scalar(select(VendorStore).where(VendorStore.vendor_id == user.id))
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


@app.post("/suppliers/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    user: User = Depends(require_role(UserRole.supplier)),
    db: Session = Depends(get_db),
):
    product = Product(supplier_id=user.id, **payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.get("/products", response_model=list[ProductOut])
def list_products(
    category: str | None = Query(default=None),
    origin_country: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = select(Product)
    if category:
        query = query.where(Product.category == category)
    if origin_country:
        query = query.where(Product.origin_country == origin_country)
    return list(db.scalars(query.order_by(Product.created_at.desc())).all())


@app.post("/vendors/listings", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    user: User = Depends(require_role(UserRole.vendor)),
    db: Session = Depends(get_db),
):
    store = db.scalar(select(VendorStore).where(VendorStore.vendor_id == user.id))
    if not store:
        raise HTTPException(status_code=400, detail="Vendor store is required")

    product = db.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    listing = StoreListing(
        store_id=store.id,
        product_id=payload.product_id,
        resale_price=payload.resale_price,
        shipping_note=payload.shipping_note,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@app.get("/listings", response_model=list[ListingOut])
def list_listings(store_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    query = select(StoreListing).where(StoreListing.visible.is_(True))
    if store_id is not None:
        query = query.where(StoreListing.store_id == store_id)
    return list(db.scalars(query.order_by(StoreListing.created_at.desc())).all())


@app.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role not in (UserRole.buyer, UserRole.vendor):
        raise HTTPException(status_code=403, detail="Only buyers or vendors can place orders")
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    listing_ids = [item.listing_id for item in payload.items]
    listings = {
        listing.id: listing
        for listing in db.scalars(select(StoreListing).where(StoreListing.id.in_(listing_ids))).all()
    }

    total_amount = 0.0
    order_items: list[OrderItem] = []
    for item in payload.items:
        listing = listings.get(item.listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail=f"Listing {item.listing_id} not found")
        line_total = listing.resale_price * item.quantity
        total_amount += line_total
        order_items.append(
            OrderItem(
                listing_id=listing.id,
                quantity=item.quantity,
                unit_price=listing.resale_price,
            )
        )

    order = Order(
        buyer_id=user.id,
        status=OrderStatus.pending_payment,
        total_amount=round(total_amount, 2),
        currency=payload.currency,
        destination_country=payload.destination_country,
        destination_address=payload.destination_address,
    )
    db.add(order)
    db.flush()

    for item in order_items:
        item.order_id = order.id
        db.add(item)

    db.commit()
    db.refresh(order)
    return order


@app.post("/payments/checkout/{order_id}", response_model=PaymentOut)
def checkout_order(
    order_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    if order.status != OrderStatus.pending_payment:
        raise HTTPException(status_code=400, detail="Order already processed")

    payment = Payment(
        order_id=order.id,
        amount=order.total_amount,
        currency=order.currency,
        status=PaymentStatus.captured,
        provider_reference=f"pay_{uuid4().hex[:16]}",
    )
    order.status = OrderStatus.paid
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@app.post("/orders/{order_id}/mark-processing", response_model=OrderOut)
def mark_order_processing(
    order_id: int,
    user: User = Depends(require_role(UserRole.vendor, UserRole.admin)),
    db: Session = Depends(get_db),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.paid:
        raise HTTPException(status_code=400, detail="Order must be paid first")
    order.status = OrderStatus.processing
    db.commit()
    db.refresh(order)
    return order


@app.post("/orders/{order_id}/supplier-ship", response_model=OrderOut)
def supplier_ship_order(
    order_id: int,
    user: User = Depends(require_role(UserRole.supplier)),
    db: Session = Depends(get_db),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = list(db.scalars(select(OrderItem).where(OrderItem.order_id == order.id)).all())
    if not items:
        raise HTTPException(status_code=400, detail="Order has no items")

    supplier_item_found = False
    for item in items:
        listing = db.get(StoreListing, item.listing_id)
        if listing:
            product = db.get(Product, listing.product_id)
            if product and product.supplier_id == user.id:
                item.supplier_fulfillment_status = "shipped"
                supplier_item_found = True

    if not supplier_item_found:
        raise HTTPException(status_code=403, detail="No shippable items owned by this supplier")

    if all(item.supplier_fulfillment_status == "shipped" for item in items):
        order.status = OrderStatus.shipped

    db.commit()
    db.refresh(order)
    return order


@app.post("/chat/rooms", response_model=ChatRoomOut, status_code=status.HTTP_201_CREATED)
def create_chat_room(
    payload: ChatRoomCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    participant_ids = set(payload.participant_user_ids)
    participant_ids.add(user.id)
    users = list(db.scalars(select(User).where(User.id.in_(participant_ids))).all())
    if len(users) != len(participant_ids):
        raise HTTPException(status_code=400, detail="One or more participants do not exist")

    room = ChatRoom(topic=payload.topic)
    db.add(room)
    db.flush()
    for user_id in participant_ids:
        db.add(ChatParticipant(room_id=room.id, user_id=user_id))

    db.commit()
    db.refresh(room)
    return room


def _ensure_chat_membership(room_id: int, user_id: int, db: Session):
    membership = db.scalar(
        select(ChatParticipant).where(
            ChatParticipant.room_id == room_id, ChatParticipant.user_id == user_id
        )
    )
    if not membership:
        raise HTTPException(status_code=403, detail="Not a room participant")


@app.post("/chat/messages", response_model=ChatMessageOut, status_code=status.HTTP_201_CREATED)
def send_message(
    payload: ChatMessageCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    room = db.get(ChatRoom, payload.room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    _ensure_chat_membership(payload.room_id, user.id, db)

    moderation = moderate_message(payload.content)
    blocked = moderation.action == "block"
    message = ChatMessage(
        room_id=payload.room_id,
        sender_id=user.id,
        content=payload.content,
        is_blocked=blocked,
        moderation_score=moderation.score,
        moderation_reason=moderation.reason,
    )
    db.add(message)
    db.flush()
    db.add(
        ModerationEvent(
            message_id=message.id,
            action=moderation.action,
            score=moderation.score,
            tags=moderation.tags,
        )
    )
    db.commit()
    db.refresh(message)
    return message


@app.get("/chat/rooms/{room_id}/messages", response_model=list[ChatMessageOut])
def list_messages(
    room_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_chat_membership(room_id, user.id, db)
    return list(
        db.scalars(select(ChatMessage).where(ChatMessage.room_id == room_id)).all()
    )


@app.post("/live/sessions", response_model=LiveSessionOut, status_code=status.HTTP_201_CREATED)
def create_live_session(
    payload: LiveSessionCreate,
    user: User = Depends(require_role(UserRole.vendor)),
    db: Session = Depends(get_db),
):
    store = db.scalar(select(VendorStore).where(VendorStore.vendor_id == user.id))
    if not store:
        raise HTTPException(status_code=400, detail="Vendor store required")
    session = LiveSession(
        host_vendor_id=user.id,
        store_id=store.id,
        title=payload.title,
        description=payload.description,
        scheduled_for=payload.scheduled_for,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@app.post("/live/sessions/{session_id}/go-live", response_model=LiveSessionOut)
def go_live(
    session_id: int,
    user: User = Depends(require_role(UserRole.vendor)),
    db: Session = Depends(get_db),
):
    session = db.get(LiveSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.host_vendor_id != user.id:
        raise HTTPException(status_code=403, detail="Not your live session")
    session.status = LiveSessionStatus.live
    session.started_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session


@app.post("/live/sessions/{session_id}/end", response_model=LiveSessionOut)
def end_live(
    session_id: int,
    user: User = Depends(require_role(UserRole.vendor)),
    db: Session = Depends(get_db),
):
    session = db.get(LiveSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.host_vendor_id != user.id:
        raise HTTPException(status_code=403, detail="Not your live session")
    session.status = LiveSessionStatus.ended
    session.ended_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session


@app.get("/live/sessions", response_model=list[LiveSessionOut])
def list_live_sessions(db: Session = Depends(get_db)):
    return list(db.scalars(select(LiveSession).order_by(LiveSession.created_at.desc())).all())


@app.post("/auctions/{session_id}", response_model=AuctionOut, status_code=status.HTTP_201_CREATED)
def create_auction(
    session_id: int,
    payload: AuctionCreate,
    user: User = Depends(require_role(UserRole.vendor)),
    db: Session = Depends(get_db),
):
    session = db.get(LiveSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")
    if session.host_vendor_id != user.id:
        raise HTTPException(status_code=403, detail="Not your session")

    listing = db.get(StoreListing, payload.listing_id)
    if not listing or listing.store_id != session.store_id:
        raise HTTPException(status_code=400, detail="Listing must belong to session store")

    auction = Auction(
        session_id=session.id,
        listing_id=payload.listing_id,
        start_price=payload.start_price,
        reserve_price=payload.reserve_price,
        current_price=payload.start_price,
        status=AuctionStatus.live,
    )
    db.add(auction)
    db.commit()
    db.refresh(auction)
    return auction


@app.get("/auctions/{auction_id}", response_model=AuctionOut)
def get_auction(auction_id: int, db: Session = Depends(get_db)):
    auction = db.get(Auction, auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return auction


@app.post("/auctions/{auction_id}/bids", response_model=BidOut, status_code=status.HTTP_201_CREATED)
def place_bid(
    auction_id: int,
    payload: BidCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auction = db.get(Auction, auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.status != AuctionStatus.live:
        raise HTTPException(status_code=400, detail="Auction not live")
    if payload.amount <= auction.current_price:
        raise HTTPException(status_code=400, detail="Bid must be greater than current price")

    bid = Bid(auction_id=auction.id, bidder_id=user.id, amount=payload.amount)
    auction.current_price = payload.amount
    db.add(bid)
    db.commit()
    db.refresh(bid)
    return bid


@app.post("/auctions/{auction_id}/close", response_model=AuctionOut)
def close_auction(
    auction_id: int,
    user: User = Depends(require_role(UserRole.vendor)),
    db: Session = Depends(get_db),
):
    auction = db.get(Auction, auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    session = db.get(LiveSession, auction.session_id)
    if not session or session.host_vendor_id != user.id:
        raise HTTPException(status_code=403, detail="Not your auction")

    bids = list(
        db.scalars(select(Bid).where(Bid.auction_id == auction.id).order_by(Bid.amount.desc())).all()
    )
    winner_bid = bids[0] if bids else None

    auction.status = AuctionStatus.ended
    auction.ended_at = datetime.utcnow()

    if winner_bid and (
        auction.reserve_price is None or winner_bid.amount >= auction.reserve_price
    ):
        auction.winner_user_id = winner_bid.bidder_id

    db.commit()
    db.refresh(auction)
    return auction
