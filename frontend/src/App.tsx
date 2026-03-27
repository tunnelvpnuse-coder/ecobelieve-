import { useEffect, useState } from "react";
import { AuthPanel } from "./components/AuthPanel";
import { BuyerOrderPanel } from "./components/BuyerOrderPanel";
import { ChatPanel } from "./components/ChatPanel";
import { LiveAuctionPanel } from "./components/LiveAuctionPanel";
import { MarketplacePanel } from "./components/MarketplacePanel";
import { SupplierVendorPanel } from "./components/SupplierVendorPanel";
import {
  ApiError,
  createAuction,
  createChatRoom,
  createListing,
  createLiveSession,
  createOrder,
  createSupplierProduct,
  createVendorStore,
  endLive,
  getApiBase,
  getAuction,
  getMe,
  getMyVendorStore,
  goLive,
  listChatMessages,
  listListings,
  listLiveSessions,
  listProducts,
  loginUser,
  placeBid,
  registerUser,
  sendChatMessage,
  checkoutOrder,
  closeAuction,
} from "./lib/api";
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
  User,
  VendorStore,
} from "./types/api";

const TOKEN_STORAGE_KEY = "aliafrica_token";

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  const [me, setMe] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [store, setStore] = useState<VendorStore | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<number, ChatMessage[]>>({});
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const canManageVendor = me?.role === "vendor";
  const canManageSupplier = me?.role === "supplier";
  const canBuy = me?.role === "buyer" || me?.role === "vendor";

  async function refreshCatalog() {
    const [productsRes, listingsRes] = await Promise.all([listProducts(), listListings()]);
    setProducts(productsRes);
    setListings(listingsRes);
  }

  async function refreshSessions() {
    const sessionsRes = await listLiveSessions();
    setSessions(sessionsRes);
  }

  useEffect(() => {
    void refreshCatalog().catch((err) => setError(toErrorMessage(err)));
    void refreshSessions().catch((err) => setError(toErrorMessage(err)));
  }, []);

  useEffect(() => {
    if (!token) {
      setMe(null);
      setStore(null);
      setRooms([]);
      setMessagesByRoom({});
      setOrders([]);
      setPayments([]);
      setAuctions([]);
      setBids([]);
      return;
    }
    setBusy(true);
    void getMe(token)
      .then(async (user) => {
        setMe(user);
        if (user.role === "vendor") {
          try {
            const myStore = await getMyVendorStore(token);
            setStore(myStore);
          } catch {
            setStore(null);
          }
        }
      })
      .catch((err) => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setError(toErrorMessage(err));
      })
      .finally(() => setBusy(false));
  }, [token]);

  async function execute(name: string, task: () => Promise<void>) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await task();
      setSuccess(name);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(input: RegisterInput) {
    await execute("Registered user successfully.", async () => {
      await registerUser(input);
    });
  }

  async function handleLogin(input: LoginInput) {
    await execute("Logged in successfully.", async () => {
      const auth = await loginUser(input);
      localStorage.setItem(TOKEN_STORAGE_KEY, auth.access_token);
      setToken(auth.access_token);
    });
  }

  async function handleLogout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setMe(null);
    setStore(null);
    setRooms([]);
    setMessagesByRoom({});
    setOrders([]);
    setPayments([]);
    setAuctions([]);
    setBids([]);
    setSuccess("Logged out.");
  }

  async function handleCreateStore(input: {
    store_name: string;
    description?: string;
    region_focus?: string;
  }) {
    if (!token) return;
    await execute("Vendor store created.", async () => {
      const created = await createVendorStore(token, input);
      setStore(created);
    });
  }

  async function handleCreateProduct(input: {
    name: string;
    description: string;
    origin_country: string;
    currency: string;
    supplier_price: number;
    available_stock: number;
    min_bulk_quantity: number;
    category?: string;
  }) {
    if (!token) return;
    await execute("Supplier product created.", async () => {
      await createSupplierProduct(token, input);
      await refreshCatalog();
    });
  }

  async function handleCreateListing(input: {
    product_id: number;
    resale_price: number;
    shipping_note?: string;
  }) {
    if (!token) return;
    await execute("Listing created for storefront.", async () => {
      await createListing(token, input);
      await refreshCatalog();
    });
  }

  async function handleCreateOrder(input: OrderCreateInput) {
    if (!token) return;
    await execute("Order placed successfully.", async () => {
      const created = await createOrder(token, input);
      setOrders((prev) => [created, ...prev]);
    });
  }

  async function handleCheckout(orderId: number) {
    if (!token) return;
    await execute("Checkout captured successfully.", async () => {
      const payment = await checkoutOrder(token, orderId);
      setPayments((prev) => [payment, ...prev]);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "paid",
              }
            : order,
        ),
      );
    });
  }

  async function handleCreateRoom(input: { topic: string; participant_user_ids: number[] }) {
    if (!token) return;
    await execute("Chat room created.", async () => {
      const room = await createChatRoom(token, input);
      setRooms((prev) => [room, ...prev]);
    });
  }

  async function handleSendMessage(input: { room_id: number; content: string }) {
    if (!token) return;
    await execute("Message sent with moderation.", async () => {
      const message = await sendChatMessage(token, input);
      setMessagesByRoom((prev) => ({
        ...prev,
        [input.room_id]: [...(prev[input.room_id] ?? []), message],
      }));
    });
  }

  async function handleLoadMessages(roomId: number) {
    if (!token) return;
    await execute("Loaded room messages.", async () => {
      const roomMessages = await listChatMessages(token, roomId);
      setMessagesByRoom((prev) => ({ ...prev, [roomId]: roomMessages }));
    });
  }

  async function handleCreateSession(input: {
    title: string;
    description?: string;
    scheduled_for?: string;
  }) {
    if (!token) return;
    await execute("Live session created.", async () => {
      const session = await createLiveSession(token, input);
      setSessions((prev) => [session, ...prev]);
    });
  }

  async function handleGoLive(sessionId: number) {
    if (!token) return;
    await execute("Live session is now active.", async () => {
      const updated = await goLive(token, sessionId);
      setSessions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    });
  }

  async function handleEndLive(sessionId: number) {
    if (!token) return;
    await execute("Live session ended.", async () => {
      const updated = await endLive(token, sessionId);
      setSessions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    });
  }

  async function handleCreateAuction(input: {
    session_id: number;
    listing_id: number;
    start_price: number;
    reserve_price?: number;
  }) {
    if (!token) return;
    await execute("Auction started in session.", async () => {
      const auction = await createAuction(token, input.session_id, input);
      setAuctions((prev) => [auction, ...prev]);
    });
  }

  async function handlePlaceBid(input: { auction_id: number; amount: number }) {
    if (!token) return;
    await execute("Bid submitted successfully.", async () => {
      const bid = await placeBid(token, input.auction_id, { amount: input.amount });
      setBids((prev) => [bid, ...prev]);
      const refreshed = await getAuction(input.auction_id);
      setAuctions((prev) => prev.map((item) => (item.id === refreshed.id ? refreshed : item)));
    });
  }

  async function handleCloseAuction(auctionId: number) {
    if (!token) return;
    await execute("Auction closed.", async () => {
      const closed = await closeAuction(token, auctionId);
      setAuctions((prev) => prev.map((item) => (item.id === closed.id ? closed : item)));
    });
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <h1>Aliafrica Marketplace Frontend</h1>
          <p>
            A role-aware dashboard for supplier sourcing, vendor storefronts, moderated chat, live
            selling, and auctions.
          </p>
          <p className="muted">API base: {getApiBase()}</p>
        </div>
        <div className="auth-meta">
          {me ? (
            <>
              <span>
                Signed in as <strong>{me.display_name}</strong> ({me.role})
              </span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <span>Not signed in</span>
          )}
        </div>
      </header>

      {error ? <div className="alert error">{error}</div> : null}
      {success ? <div className="alert success">{success}</div> : null}

      {!token ? (
        <AuthPanel isBusy={busy} onRegister={handleRegister} onLogin={handleLogin} />
      ) : null}

      <MarketplacePanel
        products={products}
        listings={listings}
        onRefresh={() => execute("Marketplace refreshed.", refreshCatalog)}
        isBusy={busy}
      />

      {token ? (
        <>
          <SupplierVendorPanel
            isSupplier={canManageSupplier}
            isVendor={canManageVendor}
            hasStore={Boolean(store)}
            products={products}
            onCreateStore={handleCreateStore}
            onCreateProduct={handleCreateProduct}
            onCreateListing={handleCreateListing}
            isBusy={busy}
          />

          <BuyerOrderPanel
            canBuy={canBuy}
            listings={listings}
            orders={orders}
            payments={payments}
            onCreateOrder={handleCreateOrder}
            onCheckout={handleCheckout}
            isBusy={busy}
          />

          <ChatPanel
            rooms={rooms}
            messagesByRoom={messagesByRoom}
            onCreateRoom={handleCreateRoom}
            onSendMessage={handleSendMessage}
            onLoadMessages={handleLoadMessages}
            isBusy={busy}
          />

          <LiveAuctionPanel
            sessions={sessions}
            auctions={auctions}
            bids={bids}
            listings={listings}
            onRefreshSessions={() => execute("Live sessions refreshed.", refreshSessions)}
            onCreateSession={handleCreateSession}
            onGoLive={handleGoLive}
            onEndLive={handleEndLive}
            onCreateAuction={handleCreateAuction}
            onPlaceBid={handlePlaceBid}
            onCloseAuction={handleCloseAuction}
            getCurrentAuctionPrice={(auctionId) =>
              auctions.find((auction) => auction.id === auctionId)?.current_price
            }
            isBusy={busy}
          />
        </>
      ) : null}
    </main>
  );
}

export default App;
