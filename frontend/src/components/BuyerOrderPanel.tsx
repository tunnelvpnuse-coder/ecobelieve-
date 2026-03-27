import { useMemo, useState } from "react";
import type { Listing, Order, Payment } from "../types/api";

type Props = {
  canBuy: boolean;
  listings: Listing[];
  orders: Order[];
  payments: Payment[];
  isBusy: boolean;
  onCreateOrder: (payload: {
    currency: string;
    destination_country: string;
    destination_address: string;
    items: { listing_id: number; quantity: number }[];
  }) => Promise<void>;
  onCheckout: (orderId: number) => Promise<void>;
};

export function BuyerOrderPanel({
  canBuy,
  listings,
  orders,
  payments,
  isBusy,
  onCreateOrder,
  onCheckout,
}: Props) {
  const [listingId, setListingId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [destinationCountry, setDestinationCountry] = useState("Kenya");
  const [destinationAddress, setDestinationAddress] = useState("Nairobi CBD");
  const [currency, setCurrency] = useState("USD");
  const [checkoutOrderId, setCheckoutOrderId] = useState("");

  const listingOptions = useMemo(() => listings.map((item) => item.id), [listings]);

  async function handleCreateOrder() {
    if (!listingId) return;
    await onCreateOrder({
      destination_country: destinationCountry,
      destination_address: destinationAddress,
      currency,
      items: [{ listing_id: Number(listingId), quantity }],
    });
  }

  async function handleCheckout() {
    if (!checkoutOrderId) return;
    await onCheckout(Number(checkoutOrderId));
  }

  return (
    <section className="panel">
      <h2>Buyer Orders & Payments</h2>
      <p className="panel-subtitle">Place orders from listings and complete checkout.</p>
      {!canBuy ? (
        <div className="info-card">Order placement is available to buyer and vendor roles.</div>
      ) : null}
      <div className="grid two">
        <label>
          Listing ID
          <input
            list="listing-ids"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            placeholder="e.g. 1"
          />
          <datalist id="listing-ids">
            {listingOptions.map((id) => (
              <option value={id} key={id} />
            ))}
          </datalist>
        </label>
        <label>
          Quantity
          <input
            value={quantity}
            type="number"
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </label>
        <label>
          Destination Country
          <input
            value={destinationCountry}
            onChange={(e) => setDestinationCountry(e.target.value)}
            placeholder="Kenya"
          />
        </label>
        <label>
          Destination Address
          <input
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder="Nairobi CBD"
          />
        </label>
        <label>
          Currency
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
        </label>
      </div>
      <div className="actions">
        <button disabled={isBusy || !canBuy} onClick={handleCreateOrder}>
          Place Order
        </button>
      </div>

      <div className="grid two top-gap">
        <label>
          Checkout Order ID
          <input
            value={checkoutOrderId}
            onChange={(e) => setCheckoutOrderId(e.target.value)}
            placeholder="e.g. 2"
          />
        </label>
      </div>
      <div className="actions">
        <button className="secondary" disabled={isBusy || !canBuy} onClick={handleCheckout}>
          Checkout
        </button>
      </div>

      <div className="grid two top-gap">
        <div>
          <h3>Orders</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Currency</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.status}</td>
                    <td>{order.total_amount}</td>
                    <td>{order.currency}</td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3>Payments</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{payment.order_id}</td>
                    <td>{payment.status}</td>
                    <td>{payment.amount}</td>
                  </tr>
                ))}
                {!payments.length && (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      No payments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
