from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import AuctionStatus, LiveSessionStatus, OrderStatus, UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    role: UserRole
    display_name: str
    country: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: UserRole
    display_name: str
    country: Optional[str] = None
    created_at: datetime


class VendorStoreCreate(BaseModel):
    store_name: str
    description: Optional[str] = None
    region_focus: Optional[str] = None


class VendorStoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vendor_id: int
    store_name: str
    description: Optional[str] = None
    region_focus: Optional[str] = None
    created_at: datetime


class ProductCreate(BaseModel):
    name: str
    description: str
    origin_country: str
    currency: str = "USD"
    supplier_price: float = Field(gt=0)
    available_stock: int = Field(ge=0)
    min_bulk_quantity: int = Field(default=1, ge=1)
    category: Optional[str] = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    supplier_id: int
    name: str
    description: str
    origin_country: str
    currency: str
    supplier_price: float
    available_stock: int
    min_bulk_quantity: int
    category: Optional[str] = None
    created_at: datetime


class ListingCreate(BaseModel):
    product_id: int
    resale_price: float = Field(gt=0)
    shipping_note: Optional[str] = None


class ListingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    store_id: int
    product_id: int
    resale_price: float
    visible: bool
    shipping_note: Optional[str] = None
    created_at: datetime


class OrderItemCreate(BaseModel):
    listing_id: int
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    currency: str = "USD"
    destination_country: str
    destination_address: str
    items: List[OrderItemCreate]


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    buyer_id: int
    status: OrderStatus
    total_amount: float
    currency: str
    destination_country: str
    destination_address: str
    created_at: datetime


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    amount: float
    currency: str
    status: str
    provider: str
    provider_reference: str
    created_at: datetime


class ChatRoomCreate(BaseModel):
    topic: str
    participant_user_ids: List[int] = Field(min_length=1)


class ChatRoomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    topic: str
    created_at: datetime


class ChatMessageCreate(BaseModel):
    room_id: int
    content: str = Field(min_length=1, max_length=4000)


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    room_id: int
    sender_id: int
    content: str
    is_blocked: bool
    moderation_score: float
    moderation_reason: Optional[str] = None
    created_at: datetime


class LiveSessionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_for: Optional[datetime] = None


class LiveSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    host_vendor_id: int
    store_id: int
    title: str
    description: Optional[str] = None
    status: LiveSessionStatus
    scheduled_for: Optional[datetime] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime


class AuctionCreate(BaseModel):
    listing_id: int
    start_price: float = Field(gt=0)
    reserve_price: Optional[float] = Field(default=None, gt=0)


class AuctionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    listing_id: int
    start_price: float
    reserve_price: Optional[float] = None
    current_price: float
    status: AuctionStatus
    winner_user_id: Optional[int] = None
    started_at: datetime
    ended_at: Optional[datetime] = None


class BidCreate(BaseModel):
    amount: float = Field(gt=0)


class BidOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    auction_id: int
    bidder_id: int
    amount: float
    created_at: datetime
