export type UserRole = "supplier" | "vendor" | "buyer" | "admin";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  display_name: string;
  country?: string | null;
  created_at: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
  display_name: string;
  country?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VendorStore {
  id: number;
  vendor_id: number;
  store_name: string;
  description?: string | null;
  region_focus?: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  supplier_id: number;
  name: string;
  description: string;
  origin_country: string;
  currency: string;
  supplier_price: number;
  available_stock: number;
  min_bulk_quantity: number;
  category?: string | null;
  created_at: string;
}

export interface Listing {
  id: number;
  store_id: number;
  product_id: number;
  resale_price: number;
  visible: boolean;
  shipping_note?: string | null;
  created_at: string;
}

export interface OrderItemCreate {
  listing_id: number;
  quantity: number;
}

export interface OrderCreateInput {
  currency: string;
  destination_country: string;
  destination_address: string;
  items: OrderItemCreate[];
}

export interface Order {
  id: number;
  buyer_id: number;
  status: string;
  total_amount: number;
  currency: string;
  destination_country: string;
  destination_address: string;
  created_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  provider_reference: string;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  topic: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  content: string;
  is_blocked: boolean;
  moderation_score: number;
  moderation_reason?: string | null;
  created_at: string;
}

export interface LiveSession {
  id: number;
  host_vendor_id: number;
  store_id: number;
  title: string;
  description?: string | null;
  status: "scheduled" | "live" | "ended";
  scheduled_for?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at: string;
}

export interface Auction {
  id: number;
  session_id: number;
  listing_id: number;
  start_price: number;
  reserve_price?: number | null;
  current_price: number;
  status: "scheduled" | "live" | "ended";
  winner_user_id?: number | null;
  started_at: string;
  ended_at?: string | null;
}

export interface Bid {
  id: number;
  auction_id: number;
  bidder_id: number;
  amount: number;
  created_at: string;
}
