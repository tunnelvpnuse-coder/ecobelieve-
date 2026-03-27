import type {
  Auction,
  Bid,
  ChatMessage,
  ChatRoom,
  Listing,
  LiveSession,
  LoginInput,
  Order,
  OrderCreateInput,
  Payment,
  Product,
  RegisterInput,
  TokenResponse,
  User,
  VendorStore,
} from "../types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export function getApiBase(): string {
  return API_BASE;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? String((payload as { detail: string }).detail)
        : `Request failed (${response.status})`;
    throw new ApiError(detail, response.status, payload);
  }
  return payload as T;
}

export async function registerUser(input: RegisterInput): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginUser(input: LoginInput): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("username", input.email);
  body.set("password", input.password);
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = await response.json();
  if (!response.ok) {
    const detail = payload?.detail ?? "Failed to login";
    throw new ApiError(detail, response.status, payload);
  }
  return payload as TokenResponse;
}

export async function getMe(token: string): Promise<User> {
  return request<User>("/users/me", {}, token);
}

export async function createVendorStore(
  token: string,
  input: { store_name: string; description?: string; region_focus?: string },
): Promise<VendorStore> {
  return request<VendorStore>(
    "/vendors/store",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function getMyVendorStore(token: string): Promise<VendorStore> {
  return request<VendorStore>("/vendors/store/me", {}, token);
}

export async function createSupplierProduct(
  token: string,
  input: {
    name: string;
    description: string;
    origin_country: string;
    currency: string;
    supplier_price: number;
    available_stock: number;
    min_bulk_quantity: number;
    category?: string;
  },
): Promise<Product> {
  return request<Product>(
    "/suppliers/products",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function listProducts(): Promise<Product[]> {
  return request<Product[]>("/products");
}

export async function createListing(
  token: string,
  input: { product_id: number; resale_price: number; shipping_note?: string },
): Promise<Listing> {
  return request<Listing>(
    "/vendors/listings",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function listListings(): Promise<Listing[]> {
  return request<Listing[]>("/listings");
}

export async function createOrder(token: string, input: OrderCreateInput): Promise<Order> {
  return request<Order>("/orders", { method: "POST", body: JSON.stringify(input) }, token);
}

export async function checkoutOrder(token: string, orderId: number): Promise<Payment> {
  return request<Payment>(`/payments/checkout/${orderId}`, { method: "POST" }, token);
}

export async function createChatRoom(
  token: string,
  input: { topic: string; participant_user_ids: number[] },
): Promise<ChatRoom> {
  return request<ChatRoom>("/chat/rooms", { method: "POST", body: JSON.stringify(input) }, token);
}

export async function sendChatMessage(
  token: string,
  input: { room_id: number; content: string },
): Promise<ChatMessage> {
  return request<ChatMessage>(
    "/chat/messages",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function listChatMessages(token: string, roomId: number): Promise<ChatMessage[]> {
  return request<ChatMessage[]>(`/chat/rooms/${roomId}/messages`, {}, token);
}

export async function createLiveSession(
  token: string,
  input: { title: string; description?: string; scheduled_for?: string },
): Promise<LiveSession> {
  return request<LiveSession>(
    "/live/sessions",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function listLiveSessions(): Promise<LiveSession[]> {
  return request<LiveSession[]>("/live/sessions");
}

export async function goLive(token: string, sessionId: number): Promise<LiveSession> {
  return request<LiveSession>(`/live/sessions/${sessionId}/go-live`, { method: "POST" }, token);
}

export async function endLive(token: string, sessionId: number): Promise<LiveSession> {
  return request<LiveSession>(`/live/sessions/${sessionId}/end`, { method: "POST" }, token);
}

export async function createAuction(
  token: string,
  sessionId: number,
  input: { listing_id: number; start_price: number; reserve_price?: number },
): Promise<Auction> {
  return request<Auction>(
    `/auctions/${sessionId}`,
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function getAuction(auctionId: number): Promise<Auction> {
  return request<Auction>(`/auctions/${auctionId}`);
}

export async function placeBid(
  token: string,
  auctionId: number,
  input: { amount: number },
): Promise<Bid> {
  return request<Bid>(
    `/auctions/${auctionId}/bids`,
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function closeAuction(token: string, auctionId: number): Promise<Auction> {
  return request<Auction>(`/auctions/${auctionId}/close`, { method: "POST" }, token);
}

export { ApiError };
