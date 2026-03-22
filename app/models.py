import enum
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    supplier = "supplier"
    vendor = "vendor"
    buyer = "buyer"
    admin = "admin"


class OrderStatus(str, enum.Enum):
    pending_payment = "pending_payment"
    paid = "paid"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentStatus(str, enum.Enum):
    created = "created"
    authorized = "authorized"
    captured = "captured"
    failed = "failed"


class LiveSessionStatus(str, enum.Enum):
    scheduled = "scheduled"
    live = "live"
    ended = "ended"


class AuctionStatus(str, enum.Enum):
    scheduled = "scheduled"
    live = "live"
    ended = "ended"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, index=True)
    display_name = Column(String(120), nullable=False)
    country = Column(String(120), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    supplier_products = relationship("Product", back_populates="supplier")
    vendor_store = relationship("VendorStore", back_populates="vendor", uselist=False)
    placed_orders = relationship("Order", back_populates="buyer")
    chat_messages = relationship("ChatMessage", back_populates="sender")
    live_sessions = relationship("LiveSession", back_populates="host_vendor")


class VendorStore(Base):
    __tablename__ = "vendor_stores"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    store_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    region_focus = Column(String(120), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    vendor = relationship("User", back_populates="vendor_store")
    listings = relationship("StoreListing", back_populates="store")
    live_sessions = relationship("LiveSession", back_populates="store")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    origin_country = Column(String(120), nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    supplier_price = Column(Float, nullable=False)
    available_stock = Column(Integer, nullable=False)
    min_bulk_quantity = Column(Integer, default=1, nullable=False)
    category = Column(String(120), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    supplier = relationship("User", back_populates="supplier_products")
    listings = relationship("StoreListing", back_populates="product")


class StoreListing(Base):
    __tablename__ = "store_listings"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("vendor_stores.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    resale_price = Column(Float, nullable=False)
    visible = Column(Boolean, default=True, nullable=False)
    shipping_note = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    store = relationship("VendorStore", back_populates="listings")
    product = relationship("Product", back_populates="listings")
    order_items = relationship("OrderItem", back_populates="listing")
    auctions = relationship("Auction", back_populates="listing")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending_payment, nullable=False)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    destination_country = Column(String(120), nullable=False)
    destination_address = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    buyer = relationship("User", back_populates="placed_orders")
    items = relationship("OrderItem", back_populates="order")
    payments = relationship("Payment", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("store_listings.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    supplier_fulfillment_status = Column(String(80), default="pending", nullable=False)

    order = relationship("Order", back_populates="items")
    listing = relationship("StoreListing", back_populates="order_items")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.created, nullable=False)
    provider = Column(String(80), default="aliafrica_secure_checkout", nullable=False)
    provider_reference = Column(String(120), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    order = relationship("Order", back_populates="payments")


class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(160), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    participants = relationship("ChatParticipant", back_populates="room")
    messages = relationship("ChatMessage", back_populates="room")


class ChatParticipant(Base):
    __tablename__ = "chat_participants"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    room = relationship("ChatRoom", back_populates="participants")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_blocked = Column(Boolean, default=False, nullable=False)
    moderation_score = Column(Float, default=0, nullable=False)
    moderation_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    room = relationship("ChatRoom", back_populates="messages")
    sender = relationship("User", back_populates="chat_messages")
    moderation_events = relationship("ModerationEvent", back_populates="message")


class ModerationEvent(Base):
    __tablename__ = "moderation_events"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=False, index=True)
    action = Column(String(50), nullable=False)
    score = Column(Float, nullable=False)
    tags = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    message = relationship("ChatMessage", back_populates="moderation_events")


class LiveSession(Base):
    __tablename__ = "live_sessions"

    id = Column(Integer, primary_key=True, index=True)
    host_vendor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("vendor_stores.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(LiveSessionStatus), default=LiveSessionStatus.scheduled, nullable=False)
    scheduled_for = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    host_vendor = relationship("User", back_populates="live_sessions")
    store = relationship("VendorStore", back_populates="live_sessions")
    auctions = relationship("Auction", back_populates="session")


class Auction(Base):
    __tablename__ = "auctions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("live_sessions.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("store_listings.id"), nullable=False, index=True)
    start_price = Column(Float, nullable=False)
    reserve_price = Column(Float, nullable=True)
    current_price = Column(Float, nullable=False)
    status = Column(Enum(AuctionStatus), default=AuctionStatus.live, nullable=False)
    winner_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)

    session = relationship("LiveSession", back_populates="auctions")
    listing = relationship("StoreListing", back_populates="auctions")
    bids = relationship("Bid", back_populates="auction")


class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=False, index=True)
    bidder_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    auction = relationship("Auction", back_populates="bids")
