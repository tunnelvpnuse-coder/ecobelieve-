import { useState } from "react";
import type { Auction, Bid, Listing, LiveSession } from "../types/api";

type Props = {
  sessions: LiveSession[];
  auctions: Auction[];
  bids: Bid[];
  listings: Listing[];
  isBusy: boolean;
  onRefreshSessions: () => Promise<void>;
  onCreateSession: (input: {
    title: string;
    description?: string;
    scheduled_for?: string;
  }) => Promise<void>;
  onGoLive: (sessionId: number) => Promise<void>;
  onEndLive: (sessionId: number) => Promise<void>;
  onCreateAuction: (input: {
    session_id: number;
    listing_id: number;
    start_price: number;
    reserve_price?: number;
  }) => Promise<void>;
  onPlaceBid: (input: { auction_id: number; amount: number }) => Promise<void>;
  onCloseAuction: (auctionId: number) => Promise<void>;
  getCurrentAuctionPrice: (auctionId: number) => number | undefined;
};

export function LiveAuctionPanel({
  sessions,
  auctions,
  bids,
  listings,
  isBusy,
  onRefreshSessions,
  onCreateSession,
  onGoLive,
  onEndLive,
  onCreateAuction,
  onPlaceBid,
  onCloseAuction,
  getCurrentAuctionPrice,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [sessionIdForAuction, setSessionIdForAuction] = useState(0);
  const [listingId, setListingId] = useState(0);
  const [startPrice, setStartPrice] = useState(0);
  const [reservePrice, setReservePrice] = useState(0);
  const [auctionId, setAuctionId] = useState(0);
  const [bidAmount, setBidAmount] = useState(0);

  return (
    <section className="panel">
      <h2>Live Streaming & Auctions</h2>
      <p className="panel-subtitle">
        Vendors can host live sessions and run product auctions in real time.
      </p>

      <div className="grid three">
        <label>
          Session Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Friday Mega Deals" />
        </label>
        <label>
          Description
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Flash sale for fashion products"
          />
        </label>
        <label>
          Schedule (ISO datetime)
          <input
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            placeholder="2026-04-05T15:00:00"
          />
        </label>
      </div>

      <div className="actions">
        <button className="secondary" disabled={isBusy} onClick={onRefreshSessions}>
          Refresh Sessions
        </button>
        <button
          disabled={isBusy || !title.trim()}
          onClick={() =>
            onCreateSession({
              title,
              description: description || undefined,
              scheduled_for: scheduledFor || undefined,
            })
          }
        >
          Create Live Session
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Host Vendor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.id}</td>
                <td>{session.title}</td>
                <td>{session.status}</td>
                <td>{session.host_vendor_id}</td>
                <td>
                  <div className="inline-actions">
                    <button
                      className="secondary"
                      disabled={isBusy}
                      onClick={() => onGoLive(session.id)}
                    >
                      Go Live
                    </button>
                    <button
                      className="secondary"
                      disabled={isBusy}
                      onClick={() => onEndLive(session.id)}
                    >
                      End
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  No live sessions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3>Create Auction</h3>
      <div className="grid four">
        <label>
          Session ID
          <input
            type="number"
            value={sessionIdForAuction || ""}
            onChange={(e) => setSessionIdForAuction(Number(e.target.value))}
            placeholder="1"
          />
        </label>
        <label>
          Listing ID
          <input
            type="number"
            value={listingId || ""}
            onChange={(e) => setListingId(Number(e.target.value))}
            placeholder="10"
          />
        </label>
        <label>
          Start Price
          <input
            type="number"
            step="0.01"
            value={startPrice || ""}
            onChange={(e) => setStartPrice(Number(e.target.value))}
            placeholder="15.00"
          />
        </label>
        <label>
          Reserve Price (optional)
          <input
            type="number"
            step="0.01"
            value={reservePrice || ""}
            onChange={(e) => setReservePrice(Number(e.target.value))}
            placeholder="20.00"
          />
        </label>
      </div>
      <div className="actions">
        <button
          disabled={isBusy || !sessionIdForAuction || !listingId || !startPrice}
          onClick={() =>
            onCreateAuction({
              session_id: sessionIdForAuction,
              listing_id: listingId,
              start_price: startPrice,
              reserve_price: reservePrice || undefined,
            })
          }
        >
          Create Auction
        </button>
      </div>

      <h3>Bid on Auction</h3>
      <div className="grid two">
        <label>
          Auction ID
          <input
            type="number"
            value={auctionId || ""}
            onChange={(e) => setAuctionId(Number(e.target.value))}
            placeholder="2"
          />
        </label>
        <label>
          Bid Amount
          <input
            type="number"
            step="0.01"
            value={bidAmount || ""}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            placeholder="25.00"
          />
        </label>
      </div>
      <div className="actions">
        <button
          className="secondary"
          disabled={isBusy || !auctionId || !bidAmount}
          onClick={() => onPlaceBid({ auction_id: auctionId, amount: bidAmount })}
        >
          Place Bid
        </button>
        <button
          className="secondary"
          disabled={isBusy || !auctionId}
          onClick={() => onCloseAuction(auctionId)}
        >
          Close Auction
        </button>
      </div>

      <div className="grid two top-gap">
        <div className="subpanel">
          <h3>Listings available for auction</h3>
          <ul className="list">
            {listings.map((listing) => (
              <li key={listing.id}>
                Listing #{listing.id} - USD {listing.resale_price.toFixed(2)} (Store #{listing.store_id})
              </li>
            ))}
            {!listings.length && <li className="empty-row">No listings published yet.</li>}
          </ul>
        </div>
        <div className="subpanel">
          <h3>Auctions</h3>
          <ul className="list">
            {auctions.map((auction) => (
              <li key={auction.id}>
                Auction #{auction.id} - Session #{auction.session_id} - Status: {auction.status} - Current:{" "}
                {getCurrentAuctionPrice(auction.id) ?? auction.current_price}
              </li>
            ))}
            {!auctions.length && <li className="empty-row">No auctions created yet.</li>}
          </ul>
        </div>
      </div>

      <div className="subpanel top-gap">
        <h3>Bids</h3>
        <ul className="list">
          {bids.map((bid) => (
            <li key={bid.id}>
              Bid #{bid.id} - Auction #{bid.auction_id} - User #{bid.bidder_id} - {bid.amount}
            </li>
          ))}
          {!bids.length && <li className="empty-row">No bids yet.</li>}
        </ul>
      </div>
    </section>
  );
}
