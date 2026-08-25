import React, { useState } from "react";
import { useApi } from "../../Hooks/useApi";

export default function Checkout() {
  const { data: productsData } = useApi('/products');
  const products = productsData || [];

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.product_id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.product_id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { productId: product.product_id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, qty } : item))
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("digisol_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cart.map(({ productId, qty }) => ({ productId, qty })),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setReceipt(data);
      setCart([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = () => {
    setReceipt(null);
    setError("");
  };

  if (receipt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sale Complete</h2>
          <div className="space-y-2 text-xs text-gray-500">
            <p>Transaction ID: <span className="text-gray-900 font-semibold">{receipt.sale?.sale_id}</span></p>
            <p>Total: <span className="text-gray-900 font-semibold">${receipt.total?.toFixed(2)}</span></p>
            <p>Items: <span className="text-gray-900 font-semibold">{receipt.items?.length}</span></p>
          </div>

          <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">QR Receipt Code</p>
            <p className="text-xs text-emerald-400 font-mono break-all">{receipt.receipt?.qr_code}</p>
            <p className="text-[10px] text-gray-400">Customer presents this at exit for verification</p>
          </div>

          <button
            onClick={handleNewSale}
            className="w-full py-3 text-sm font-semibold text-white bg-[#2D6A4F] hover:bg-[#23533e] rounded-xl transition"
          >
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-xs text-gray-500 mt-1">Scan or search products, then complete the sale.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PRODUCT SEARCH */}
          <div className="lg:col-span-2 space-y-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name or barcode..."
              className="w-full text-sm px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/60 text-gray-900 placeholder-gray-400"
            />

            <div className="bg-white border border-gray-200 rounded-2xl p-4 max-h-[500px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No products found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.product_id}
                      onClick={() => addToCart(product)}
                      className="flex items-center justify-between p-3 bg-gray-50/60 border border-gray-200 rounded-xl hover:border-[#2D6A4F]/60 transition text-left"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{product.name}</p>
                        <p className="text-[10px] text-gray-400">{product.barcode || "No barcode"}</p>
                      </div>
                      <span className="text-xs font-bold text-[#52B788]">${product.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CART */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cart ({cart.length} items)</h3>

              {cart.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Add products to begin.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between bg-gray-50/60 rounded-xl px-3 py-2.5 border border-gray-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400">${item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          className="w-6 h-6 rounded-lg bg-gray-200 text-gray-900 text-xs font-bold hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-gray-900 w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          className="w-6 h-6 rounded-lg bg-gray-200 text-gray-900 text-xs font-bold hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Total</span>
                <span className="text-lg font-extrabold text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || loading}
                className="w-full py-3 text-sm font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-lg shadow-[#D35327]/30 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Processing..." : "Complete Sale"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
