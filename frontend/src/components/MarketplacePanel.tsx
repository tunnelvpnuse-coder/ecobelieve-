import { useMemo } from "react";
import type { Listing, Product } from "../types/api";

type Props = {
  products: Product[];
  listings: Listing[];
  isBusy: boolean;
  onRefresh: () => Promise<void>;
};

export function MarketplacePanel({ products, listings, isBusy, onRefresh }: Props) {
  const productNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const product of products) map.set(product.id, product.name);
    return map;
  }, [products]);

  return (
    <section className="panel">
      <h2>Marketplace</h2>
      <p className="panel-subtitle">
        Browse supplier products and vendor storefront listings across the platform.
      </p>
      <div className="actions">
        <button className="secondary" disabled={isBusy} onClick={onRefresh}>
          Refresh Catalog
        </button>
      </div>

      <div className="grid two">
        <div className="subpanel">
          <h3>Products ({products.length})</h3>
          <ul className="list tall">
            {products.map((product) => (
              <li key={product.id}>
                <strong>{product.name}</strong>
                <div className="muted">
                  Origin: {product.origin_country} | MOQ: {product.min_bulk_quantity} | Stock:{" "}
                  {product.available_stock}
                </div>
                <div>
                  Supplier price: {product.currency} {product.supplier_price.toFixed(2)}
                </div>
              </li>
            ))}
            {!products.length && <li className="empty-row">No products yet.</li>}
          </ul>
        </div>

        <div className="subpanel">
          <h3>Listings ({listings.length})</h3>
          <ul className="list tall">
            {listings.map((listing) => (
              <li key={listing.id}>
                <strong>Listing #{listing.id}</strong>
                <div>
                  Product:{" "}
                  {productNameById.get(listing.product_id) ?? `Product ${listing.product_id}`}
                </div>
                <div>
                  Price: USD {listing.resale_price.toFixed(2)} | Store #{listing.store_id}
                </div>
                {listing.shipping_note ? (
                  <div className="muted">Shipping: {listing.shipping_note}</div>
                ) : null}
              </li>
            ))}
            {!listings.length && <li className="empty-row">No listings yet.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
