import { useMemo, useState } from "react";
import type { Product } from "../types/api";

type Props = {
  isSupplier: boolean;
  isVendor: boolean;
  hasStore: boolean;
  products: Product[];
  onCreateStore: (input: {
    store_name: string;
    description?: string;
    region_focus?: string;
  }) => Promise<void>;
  onCreateProduct: (input: {
    name: string;
    description: string;
    origin_country: string;
    currency: string;
    supplier_price: number;
    available_stock: number;
    min_bulk_quantity: number;
    category?: string;
  }) => Promise<void>;
  onCreateListing: (input: {
    product_id: number;
    resale_price: number;
    shipping_note?: string;
  }) => Promise<void>;
  isBusy: boolean;
};

export function SupplierVendorPanel({
  isSupplier,
  isVendor,
  hasStore,
  products,
  onCreateStore,
  onCreateProduct,
  onCreateListing,
  isBusy,
}: Props) {
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeRegion, setStoreRegion] = useState("");

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [originCountry, setOriginCountry] = useState("China");
  const [productCurrency, setProductCurrency] = useState("USD");
  const [supplierPrice, setSupplierPrice] = useState("10");
  const [stock, setStock] = useState("100");
  const [minBulk, setMinBulk] = useState("1");
  const [category, setCategory] = useState("electronics");

  const [listingProductId, setListingProductId] = useState("");
  const [resalePrice, setResalePrice] = useState("20");
  const [shippingNote, setShippingNote] = useState("Ships in 7-14 days");

  const availableProducts = useMemo(() => products, [products]);

  async function submitStore() {
    await onCreateStore({
      store_name: storeName,
      description: storeDescription || undefined,
      region_focus: storeRegion || undefined,
    });
  }

  async function submitProduct() {
    await onCreateProduct({
      name: productName,
      description: productDescription,
      origin_country: originCountry,
      currency: productCurrency,
      supplier_price: Number(supplierPrice),
      available_stock: Number(stock),
      min_bulk_quantity: Number(minBulk),
      category,
    });
  }

  async function submitListing() {
    await onCreateListing({
      product_id: Number(listingProductId),
      resale_price: Number(resalePrice),
      shipping_note: shippingNote || undefined,
    });
  }

  return (
    <section className="panel">
      <h2>Supplier & Vendor Operations</h2>
      <p className="panel-subtitle">
        Role-based actions for product onboarding and storefront merchandising.
      </p>

      {isVendor && (
        <>
          <h3>Vendor Store</h3>
          {!hasStore ? (
            <div className="grid three">
              <label>
                Store Name
                <input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </label>
              <label>
                Description
                <input
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                />
              </label>
              <label>
                Region Focus
                <input value={storeRegion} onChange={(e) => setStoreRegion(e.target.value)} />
              </label>
              <button onClick={submitStore} disabled={isBusy || !storeName.trim()} className="fit">
                Create Store
              </button>
            </div>
          ) : (
            <div className="info-card">Store already exists for this vendor account.</div>
          )}

          <h3>Create Listing from Supplier Product</h3>
          <div className="grid three">
            <label>
              Product
              <select value={listingProductId} onChange={(e) => setListingProductId(e.target.value)}>
                <option value="">Select product</option>
                {availableProducts.map((product) => (
                  <option value={product.id} key={product.id}>
                    #{product.id} {product.name} ({product.currency} {product.supplier_price})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Resale Price
              <input value={resalePrice} onChange={(e) => setResalePrice(e.target.value)} type="number" />
            </label>
            <label>
              Shipping Note
              <input value={shippingNote} onChange={(e) => setShippingNote(e.target.value)} />
            </label>
            <button
              onClick={submitListing}
              disabled={isBusy || !hasStore || !listingProductId || Number(resalePrice) <= 0}
              className="fit"
            >
              Publish Listing
            </button>
          </div>
        </>
      )}

      {isSupplier && (
        <>
          <h3>Supplier Product Catalog</h3>
          <div className="grid four">
            <label>
              Name
              <input value={productName} onChange={(e) => setProductName(e.target.value)} />
            </label>
            <label>
              Description
              <input
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </label>
            <label>
              Origin Country
              <input value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} />
            </label>
            <label>
              Currency
              <input value={productCurrency} onChange={(e) => setProductCurrency(e.target.value)} />
            </label>
            <label>
              Supplier Price
              <input value={supplierPrice} onChange={(e) => setSupplierPrice(e.target.value)} type="number" />
            </label>
            <label>
              Stock
              <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" />
            </label>
            <label>
              MOQ
              <input value={minBulk} onChange={(e) => setMinBulk(e.target.value)} type="number" />
            </label>
            <label>
              Category
              <input value={category} onChange={(e) => setCategory(e.target.value)} />
            </label>
            <button
              onClick={submitProduct}
              disabled={
                isBusy ||
                !productName.trim() ||
                !productDescription.trim() ||
                Number(supplierPrice) <= 0 ||
                Number(stock) < 0
              }
              className="fit"
            >
              Add Product
            </button>
          </div>
        </>
      )}

      {!isSupplier && !isVendor ? (
        <div className="info-card">
          Supplier and vendor operations are available only to supplier/vendor roles.
        </div>
      ) : null}
    </section>
  );
}
