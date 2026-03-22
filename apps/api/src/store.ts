import { makeId } from "./lib/id.js";
import type {
  Auction,
  ChatMessage,
  ChatRoom,
  LiveStream,
  Order,
  PaymentTransaction,
  Product,
  StoreListing,
  Storefront,
  User
} from "./types.js";

interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

const now = (): string => new Date().toISOString();

const users: User[] = [
  {
    id: makeId(),
    fullName: "Li Wei",
    email: "supplier@aliafrica.com",
    password: "Supplier123!",
    role: "SUPPLIER",
    country: "China",
    createdAt: now()
  },
  {
    id: makeId(),
    fullName: "Amina Njeri",
    email: "vendor@aliafrica.com",
    password: "Vendor123!",
    role: "VENDOR",
    country: "Kenya",
    createdAt: now()
  },
  {
    id: makeId(),
    fullName: "Kwame Mensah",
    email: "buyer@aliafrica.com",
    password: "Buyer123!",
    role: "BUYER",
    country: "Ghana",
    createdAt: now()
  },
  {
    id: makeId(),
    fullName: "Platform Admin",
    email: "admin@aliafrica.com",
    password: "Admin123!",
    role: "ADMIN",
    country: "Nigeria",
    createdAt: now()
  }
];

const supplier = users.find((u) => u.role === "SUPPLIER");
const vendor = users.find((u) => u.role === "VENDOR");

const products: Product[] =
  supplier === undefined
    ? []
    : [
        {
          id: makeId(),
          supplierId: supplier.id,
          title: "Portable Solar Power Bank",
          description:
            "20,000mAh fast-charge solar power bank suitable for off-grid markets.",
          category: "Electronics",
          priceUsd: 14.5,
          stock: 1500,
          originCountry: "China",
          dropshipEnabled: true,
          images: [
            "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1000&q=60"
          ],
          createdAt: now(),
          updatedAt: now()
        }
      ];

const storefronts: Storefront[] =
  vendor === undefined
    ? []
    : [
        {
          id: makeId(),
          vendorId: vendor.id,
          name: "Nairobi Smart Gadgets",
          description: "Affordable imported gadgets for East African customers.",
          targetCountry: "Kenya",
          currency: "KES",
          createdAt: now()
        }
      ];

const listings: StoreListing[] =
  storefronts.length === 0 || products.length === 0
    ? []
    : [
        {
          id: makeId(),
          storefrontId: storefronts[0].id,
          productId: products[0].id,
          resellPrice: 22,
          quantityLimitPerOrder: 20,
          isActive: true,
          createdAt: now()
        }
      ];

const orders: Order[] = [];
const payments: PaymentTransaction[] = [];
const rooms: ChatRoom[] = [];
const messages: ChatMessage[] = [];
const liveStreams: LiveStream[] = [];
const auctions: Auction[] = [];
const sessions: Session[] = [];

export const store = {
  users,
  products,
  storefronts,
  listings,
  orders,
  payments,
  rooms,
  messages,
  liveStreams,
  auctions,
  sessions
};
