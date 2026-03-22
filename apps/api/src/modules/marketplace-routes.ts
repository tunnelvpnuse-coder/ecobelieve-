import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../lib/http-error.js";
import { makeId } from "../lib/id.js";
import { authenticate, authorize, type RequestWithUser } from "../middleware/auth.js";
import { store } from "../store.js";
import type { OrderStatus, PaymentStatus } from "../types.js";

const createProductSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  priceUsd: z.number().positive(),
  stock: z.number().int().min(0),
  originCountry: z.string().min(2),
  dropshipEnabled: z.boolean().default(true),
  images: z.array(z.string().url()).default([])
});

const updateProductSchema = createProductSchema.partial();

const createStorefrontSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  targetCountry: z.string().min(2),
  currency: z.string().length(3)
});

const createListingSchema = z.object({
  productId: z.string().min(6),
  resellPrice: z.number().positive(),
  quantityLimitPerOrder: z.number().int().positive(),
  isActive: z.boolean().default(true)
});

const createOrderSchema = z.object({
  listingId: z.string().min(6),
  quantity: z.number().int().positive()
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["CREATED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
});

const checkoutSchema = z.object({
  orderId: z.string().min(6),
  provider: z.enum(["PAYSTACK", "FLUTTERWAVE", "STRIPE", "MANUAL"]),
  currency: z.string().length(3).default("USD")
});

export const marketplaceRouter = Router();

marketplaceRouter.get("/products", (req, res) => {
  const { q, category, country, minPrice, maxPrice } = req.query;
  const qText = typeof q === "string" ? q.toLowerCase() : undefined;
  const categoryText =
    typeof category === "string" ? category.toLowerCase() : undefined;
  const countryText = typeof country === "string" ? country.toLowerCase() : undefined;
  const min = typeof minPrice === "string" ? Number(minPrice) : undefined;
  const max = typeof maxPrice === "string" ? Number(maxPrice) : undefined;

  const filtered = store.products.filter((product) => {
    if (qText) {
      const matches =
        product.title.toLowerCase().includes(qText) ||
        product.description.toLowerCase().includes(qText);
      if (!matches) {
        return false;
      }
    }

    if (categoryText && product.category.toLowerCase() !== categoryText) {
      return false;
    }

    if (countryText && product.originCountry.toLowerCase() !== countryText) {
      return false;
    }

    if (min !== undefined && !Number.isNaN(min) && product.priceUsd < min) {
      return false;
    }

    if (max !== undefined && !Number.isNaN(max) && product.priceUsd > max) {
      return false;
    }

    return true;
  });

  res.json({ products: filtered });
});

marketplaceRouter.post(
  "/suppliers/products",
  authenticate,
  authorize("SUPPLIER"),
  (req: RequestWithUser, res) => {
    const payload = createProductSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const product = {
      id: makeId(),
      supplierId: req.user.id,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.products.push(product);
    res.status(201).json({ product });
  }
);

marketplaceRouter.patch(
  "/suppliers/products/:productId",
  authenticate,
  authorize("SUPPLIER"),
  (req: RequestWithUser, res) => {
    const payload = updateProductSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const product = store.products.find((entry) => entry.id === req.params.productId);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    if (product.supplierId !== req.user.id) {
      throw new HttpError(403, "Only the owner supplier can update this product");
    }

    Object.assign(product, payload, { updatedAt: new Date().toISOString() });
    res.json({ product });
  }
);

marketplaceRouter.post(
  "/vendors/storefronts",
  authenticate,
  authorize("VENDOR"),
  (req: RequestWithUser, res) => {
    const payload = createStorefrontSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const storefront = {
      id: makeId(),
      vendorId: req.user.id,
      ...payload,
      createdAt: new Date().toISOString()
    };

    store.storefronts.push(storefront);
    res.status(201).json({ storefront });
  }
);

marketplaceRouter.post(
  "/vendors/storefronts/:storefrontId/listings",
  authenticate,
  authorize("VENDOR"),
  (req: RequestWithUser, res) => {
    const payload = createListingSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const storefront = store.storefronts.find(
      (entry) => entry.id === req.params.storefrontId
    );
    if (!storefront) {
      throw new HttpError(404, "Storefront not found");
    }
    if (storefront.vendorId !== req.user.id) {
      throw new HttpError(403, "Only storefront owner can add listings");
    }

    const product = store.products.find((entry) => entry.id === payload.productId);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }
    if (!product.dropshipEnabled) {
      throw new HttpError(400, "Product is not enabled for dropshipping");
    }

    const listing = {
      id: makeId(),
      storefrontId: storefront.id,
      ...payload,
      createdAt: new Date().toISOString()
    };

    store.listings.push(listing);
    res.status(201).json({ listing });
  }
);

marketplaceRouter.get("/storefronts/:storefrontId", (req, res) => {
  const storefront = store.storefronts.find(
    (entry) => entry.id === req.params.storefrontId
  );
  if (!storefront) {
    throw new HttpError(404, "Storefront not found");
  }

  const listings = store.listings.filter(
    (entry) => entry.storefrontId === req.params.storefrontId && entry.isActive
  );

  const hydratedListings = listings.map((listing) => {
    const product = store.products.find((entry) => entry.id === listing.productId);
    return {
      ...listing,
      product
    };
  });

  res.json({
    storefront,
    listings: hydratedListings
  });
});

marketplaceRouter.post(
  "/orders",
  authenticate,
  authorize("BUYER"),
  (req: RequestWithUser, res) => {
    const payload = createOrderSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const listing = store.listings.find(
      (entry) => entry.id === payload.listingId && entry.isActive
    );
    if (!listing) {
      throw new HttpError(404, "Listing not found or inactive");
    }

    if (payload.quantity > listing.quantityLimitPerOrder) {
      throw new HttpError(400, "Quantity exceeds per-order limit");
    }

    const storefront = store.storefronts.find(
      (entry) => entry.id === listing.storefrontId
    );
    const product = store.products.find((entry) => entry.id === listing.productId);
    if (!storefront || !product) {
      throw new HttpError(400, "Listing references missing entities");
    }

    if (product.stock < payload.quantity) {
      throw new HttpError(400, "Insufficient supplier stock");
    }

    const total = payload.quantity * listing.resellPrice;
    const order = {
      id: makeId(),
      buyerId: req.user.id,
      vendorId: storefront.vendorId,
      supplierId: product.supplierId,
      listingId: listing.id,
      items: [
        {
          productId: product.id,
          quantity: payload.quantity,
          unitPrice: listing.resellPrice
        }
      ],
      status: "CREATED" as OrderStatus,
      paymentStatus: "PENDING" as PaymentStatus,
      totalAmount: total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.orders.push(order);
    res.status(201).json({ order });
  }
);

marketplaceRouter.get(
  "/orders/my",
  authenticate,
  (req: RequestWithUser, res) => {
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const myOrders = store.orders.filter((order) => {
      if (req.user?.role === "BUYER") {
        return order.buyerId === req.user.id;
      }
      if (req.user?.role === "VENDOR") {
        return order.vendorId === req.user.id;
      }
      if (req.user?.role === "SUPPLIER") {
        return order.supplierId === req.user.id;
      }
      return true;
    });

    res.json({ orders: myOrders });
  }
);

marketplaceRouter.patch(
  "/orders/:orderId/status",
  authenticate,
  authorize("VENDOR", "SUPPLIER", "ADMIN"),
  (req: RequestWithUser, res) => {
    const payload = updateOrderStatusSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const order = store.orders.find((entry) => entry.id === req.params.orderId);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    const canUpdate =
      req.user.role === "ADMIN" ||
      order.vendorId === req.user.id ||
      order.supplierId === req.user.id;
    if (!canUpdate) {
      throw new HttpError(403, "Cannot update this order");
    }

    order.status = payload.status;
    order.updatedAt = new Date().toISOString();
    res.json({ order });
  }
);

marketplaceRouter.post(
  "/payments/checkout",
  authenticate,
  authorize("BUYER"),
  (req: RequestWithUser, res) => {
    const payload = checkoutSchema.parse(req.body);
    if (!req.user) {
      throw new HttpError(401, "Not authenticated");
    }

    const order = store.orders.find((entry) => entry.id === payload.orderId);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    if (order.buyerId !== req.user.id) {
      throw new HttpError(403, "Only the buyer can checkout this order");
    }

    const payment = {
      id: makeId(),
      orderId: order.id,
      provider: payload.provider,
      amount: order.totalAmount,
      currency: payload.currency.toUpperCase(),
      status: "PENDING" as PaymentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.payments.push(payment);
    res.status(201).json({
      payment,
      checkoutUrl: `https://payments.aliafrica.local/tx/${payment.id}`
    });
  }
);

marketplaceRouter.post(
  "/payments/:paymentId/confirm",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    const payment = store.payments.find((entry) => entry.id === req.params.paymentId);
    if (!payment) {
      throw new HttpError(404, "Payment not found");
    }

    payment.status = "COMPLETED";
    payment.updatedAt = new Date().toISOString();

    const order = store.orders.find((entry) => entry.id === payment.orderId);
    if (order) {
      order.paymentStatus = "COMPLETED";
      order.status = "PAID";
      order.updatedAt = new Date().toISOString();

      for (const item of order.items) {
        const product = store.products.find((entry) => entry.id === item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          product.updatedAt = new Date().toISOString();
        }
      }
    }

    res.json({ payment, order });
  }
);
