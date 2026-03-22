export type UserRole = "SUPPLIER" | "VENDOR" | "BUYER" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  country: string;
  createdAt: string;
}

export interface Product {
  id: string;
  supplierId: string;
  title: string;
  description: string;
  category: string;
  priceUsd: number;
  stock: number;
  originCountry: string;
  dropshipEnabled: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Storefront {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  targetCountry: string;
  currency: string;
  createdAt: string;
}

export interface StoreListing {
  id: string;
  storefrontId: string;
  productId: string;
  resellPrice: number;
  quantityLimitPerOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | "CREATED"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Order {
  id: string;
  buyerId: string;
  vendorId: string;
  supplierId: string;
  listingId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  provider: "PAYSTACK" | "FLUTTERWAVE" | "STRIPE" | "MANUAL";
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export type ModerationAction = "ALLOW" | "REVIEW" | "BLOCK";

export interface ModerationResult {
  riskScore: number;
  flags: string[];
  action: ModerationAction;
}

export interface ChatRoom {
  id: string;
  supplierId: string;
  vendorId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  moderation: ModerationResult;
  createdAt: string;
}

export type StreamStatus = "SCHEDULED" | "LIVE" | "ENDED";
export type AuctionStatus = "PENDING" | "LIVE" | "CLOSED";

export interface LiveStream {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  status: StreamStatus;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface Bid {
  bidderId: string;
  amount: number;
  createdAt: string;
}

export interface Auction {
  id: string;
  streamId: string;
  productId: string;
  startPrice: number;
  reservePrice: number;
  currentBid: number;
  currentWinnerId?: string;
  status: AuctionStatus;
  bids: Bid[];
  createdAt: string;
  closedAt?: string;
}
