import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Plus, Minus, CreditCard, ChevronRight, CheckCircle, X, ShieldAlert, Loader, User, Trash2, Download, FileText } from "lucide-react";
import axios from "axios";

import { QRCodeSVG } from "qrcode.react";

interface Product {
  product_id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

interface SaleRecord {
  id: string;
  customer: string;
  total: number;
  items: number;
  date: string;
  invoiceUrl?: string;
}

const formatINR = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const PAYMENT_METHODS = ["Cash", "UPI", "Card", "NetBanking"];

const SalesProcessing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [upiId, setUpiId] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<SaleRecord | null>(null);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Load products and settings from backend
  useEffect(() => {
    // Fetch Products
    axios.get("/api/products")
      .then(res => {
        const data: Product[] = (res.data as any[]).map(p => ({
          product_id: p.product_id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          category: p.category || "Electronics",
        }));
        setProducts(data.filter(p => p.stock > 0));
      })
      .catch(err => {
        console.warn("Products fetch failed:", err.message);
        showToast("Failed to load products", "error");
      })
      .finally(() => setProductsLoading(false));

    // Fetch UPI Settings
    axios.get("/api/settings?key=upi_id")
      .then(res => {
        if (res.data && res.data.value) setUpiId(res.data.value);
      })
      .catch(err => console.warn("UPI fetch failed:", err.message));
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.product_id === product.product_id);
      if (existing) {
        if (existing.qty >= product.stock) {
          showToast(`Only ${product.stock} units in stock`, "error");
          return prev;
        }
        return prev.map(i =>
          i.product.product_id === product.product_id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeQty = (productId: string) => {
    setCart(prev =>
      prev.map(i => i.product.product_id === productId ? { ...i, qty: Math.max(0, i.qty - 1) } : i)
        .filter(i => i.qty > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);

    const payload = {
      customer: customerName.trim() || "Walk-in Customer",
      payment_method: paymentMethod,
      items: cart.map(i => ({
        product_id: i.product.product_id,
        product_name: i.product.name,
        quantity: i.qty,
        unit_price: i.product.price,
        line_total: i.product.price * i.qty,
      })),
      subtotal,
      gst_amount: gst,
      total_price: total,
    };

    try {
      const res = await axios.post("/api/sales", payload);
      const data = res.data;
      const sale: SaleRecord = {
        id: data.sale_id,
        customer: payload.customer,
        total,
        items: cart.reduce((s, i) => s + i.qty, 0),
        date: new Date().toLocaleString("en-IN"),
        invoiceUrl: data.invoiceUrl,
      };
      setSalesHistory(prev => [sale, ...prev.slice(0, 19)]);
      setLastSale(sale);
      setCart([]);
      setCustomerName("");
      setShowSuccess(true);
      showToast("Sale complete! Invoice ready.", "success");
    } catch (err: any) {
      showToast("Checkout failed. Try again.", "error");
      console.error("[CHECKOUT]", err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const downloadInvoice = (invoiceUrl: string, saleId: string) => {
    const link = document.createElement("a");
    link.href = invoiceUrl;
    link.download = `invoice_${saleId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-8 z-[100] border rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl animate-in slide-in-from-right-8 flex items-center gap-4 ${toast.type === "error" ? "bg-rose-950 border-rose-500/30" : "bg-surface border-accent/20"}`}>
          <div className={`w-2 h-2 rounded-full animate-ping ${toast.type === "error" ? "bg-rose-500" : "bg-accent"}`} />
          {toast.msg}
          <button onClick={() => setToast(null)} className="text-muted/30 hover:text-white transition-colors"><X size={14} /></button>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccess && lastSale && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-accent/20 rounded-[40px] p-12 text-center max-w-sm shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent shadow-[0_0_20px_rgba(252,163,17,0.5)]" />
            <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-accent" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Sale Complete</h2>
            <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] mb-6">
              Invoice: <span className="text-accent">{lastSale.id}</span>
            </p>
            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 mb-6">
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest mb-1">Customer</p>
              <p className="text-lg font-black text-white mb-3">{lastSale.customer}</p>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest mb-1">Amount Settled</p>
              <p className="text-4xl font-black text-white tabular-nums">{formatINR(lastSale.total)}</p>
            </div>
            <div className="flex gap-3">
              {lastSale.invoiceUrl && (
                <button
                  onClick={() => downloadInvoice(lastSale.invoiceUrl!, lastSale.id)}
                  className="flex-1 py-3.5 rounded-2xl bg-accent text-black font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                >
                  <Download size={16} /> Download PDF
                </button>
              )}
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-1 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:border-white/20 transition-all"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left: Product Catalog */}
      <div className="flex-1 bg-surface border border-white/5 rounded-[32px] p-6 flex flex-col overflow-hidden shadow-xl relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 relative z-10 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Billing <span className="text-accent">Counter</span></h2>
            <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest mt-1">
              {products.length} products available
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40" size={18} />
            <input
              type="text"
              placeholder="Search product or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-black/40 border border-white/8 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 content-start auto-rows-max overflow-y-auto pr-1 pb-4 flex-1 min-h-0" style={{ scrollbarWidth: 'thin' }}>
          {productsLoading ? (
            <div className="col-span-2 flex items-center justify-center py-24 gap-4 text-muted/40">
              <Loader size={22} className="animate-spin text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest">Loading catalog...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-2 text-center py-24 text-muted/20 uppercase text-[10px] font-black tracking-[0.3em]">
              {searchTerm ? `No results for "${searchTerm}"` : "No products available"}
            </div>
          ) : (
            filteredProducts.map(prod => {
              const inCart = cart.find(i => i.product.product_id === prod.product_id);
              return (
                <div key={prod.product_id}
                  onClick={() => { if (prod.stock > 0) addToCart(prod); }}
                  className={`p-5 min-h-[160px] bg-black/20 border border-white/5 rounded-[24px] transition-all group flex flex-col relative overflow-hidden ${prod.stock > 0 ? "hover:border-accent/30 hover:bg-accent/5 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <span className="text-[9px] font-black text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-xl uppercase tracking-widest truncate whitespace-nowrap">{prod.category}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 ${prod.stock <= 5 ? "text-rose-400" : "text-muted/40"}`}>
                      {prod.stock} left
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-white group-hover:text-accent transition-colors mb-2 leading-tight flex-1">{prod.name}</h3>
                  <p className="text-xl font-black text-white/90 mb-4 tabular-nums">{formatINR(prod.price)}</p>
                  {inCart && (
                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeQty(prod.product_id); }}
                        className="flex-none p-2.5 rounded-xl bg-black/60 border border-white/10 text-muted/50 hover:text-rose-400 hover:border-rose-500/20 transition-all"
                      ><Minus size={14} /></button>
                      <span className="flex-1 text-center font-black text-white text-sm">{inCart.qty}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(prod); }}
                        className="flex-none p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-black transition-all"
                      ><Plus size={14} /></button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Cart + Checkout */}
      <div className="w-full xl:w-[420px] bg-surface border border-white/10 rounded-[32px] p-6 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Cart header */}
        <h3 className="text-lg font-black text-white flex items-center gap-3 mb-5 relative z-10 uppercase tracking-tight">
          <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent"><ShoppingCart size={20} /></div>
          Cart
          {cart.length > 0 && (
            <span className="text-[10px] bg-white/5 text-muted/40 border border-white/10 px-3 py-1 rounded-full font-black ml-auto">
              {cart.reduce((s, i) => s + i.qty, 0)} units
            </span>
          )}
        </h3>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-5 relative z-10 pr-1 min-h-0" style={{ scrollbarWidth: 'thin' }}>
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted/10 py-16">
              <ShieldAlert size={56} className="mb-4 opacity-10" />
              <p className="uppercase text-[10px] font-black tracking-[0.3em]">No items added yet</p>
              <p className="text-[9px] text-muted/30 font-bold mt-1 normal-case tracking-wide">Click a product on the left to add it here</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.product_id} className="flex items-center justify-between p-4 bg-black/40 rounded-[18px] border border-white/5 group hover:border-accent/20 transition-all">
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-xs text-white/90 uppercase tracking-wide line-clamp-1 mb-0.5">{item.product.name}</h4>
                  <p className="text-accent text-[11px] font-black tabular-nums">{formatINR(item.product.price * item.qty)}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <div className="flex items-center gap-1 bg-black/60 rounded-xl p-1.5 border border-white/5">
                    <button onClick={() => removeQty(item.product.product_id)} className="p-1 rounded-lg hover:bg-rose-500/10 text-muted/40 hover:text-rose-500 transition-all"><Minus size={12} /></button>
                    <span className="w-5 text-center text-xs font-black text-white/90">{item.qty}</span>
                    <button onClick={() => addToCart(item.product)} className="p-1 rounded-lg hover:bg-accent/10 text-muted/40 hover:text-accent transition-all"><Plus size={12} /></button>
                  </div>
                  <button onClick={() => removeItem(item.product.product_id)} className="p-1.5 rounded-lg text-muted/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={13} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer + Payment */}
        <div className="space-y-3 mb-4 relative z-10">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/30" size={15} />
            <input
              type="text"
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/8 rounded-xl text-xs font-medium text-white placeholder:text-muted/20 focus:outline-none focus:border-accent/40 transition-all"
            />
          </div>
          <div className="flex gap-2 mb-2">
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm}
                onClick={() => setPaymentMethod(pm)}
                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${paymentMethod === pm ? "bg-accent text-black" : "bg-black/40 border border-white/8 text-muted/40 hover:border-accent/20 hover:text-white"}`}
              >{pm}</button>
            ))}
          </div>

          {paymentMethod === "UPI" && cart.length > 0 && upiId && (
            <div className="flex flex-col items-center bg-black/40 rounded-2xl p-4 border border-accent/20 animate-in zoom-in-95 mt-2 transition-all">
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-3">Scan below to pay {formatINR(total)}</span>
              <div className="bg-white p-3 rounded-xl shadow-lg shadow-accent/5">
                <QRCodeSVG
                  value={`upi://pay?pa=${upiId}&pn=Satguru%20SmartShop&am=${total}&cu=INR`}
                  size={140}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <span className="text-[9px] font-black text-muted/40 uppercase tracking-widest mt-3">UPI ID: {upiId}</span>
            </div>
          )}
        </div>

        {/* Totals + Checkout */}
        <div className="bg-black/40 rounded-[24px] p-5 border border-white/8 relative z-10">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Subtotal</span>
              <span className="text-xs font-black text-white/90 tabular-nums">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">GST (18%)</span>
              <span className="text-xs font-black text-white/90 tabular-nums">{formatINR(gst)}</span>
            </div>
          </div>
          <div className="flex justify-between items-end mb-5 border-t border-white/5 pt-4">
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Total</span>
            <span className="text-3xl font-black text-white tabular-nums">{formatINR(total)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkoutLoading}
            className="w-full py-4 rounded-2xl bg-accent text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:brightness-110 shadow-2xl shadow-accent/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? (
              <><Loader size={18} className="animate-spin" /> Processing...</>
            ) : (
              <><CreditCard size={18} /> Checkout & Generate Invoice <ChevronRight size={16} /></>
            )}
          </button>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="w-full mt-3 py-2.5 rounded-2xl border border-white/8 text-[9px] font-black text-muted/20 uppercase tracking-[0.4em] hover:text-rose-500 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Recent Sales History */}
        {salesHistory.length > 0 && (
          <div className="mt-4 relative z-10">
            <p className="text-[9px] font-black text-muted/30 uppercase tracking-widest mb-2 flex items-center gap-2">
              <FileText size={11} /> Recent Session Sales
            </p>
            <div className="space-y-2 max-h-36 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {salesHistory.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[10px] font-black text-white/70">{s.customer}</p>
                    <p className="text-[9px] text-muted/30 font-black">{s.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-accent tabular-nums">{formatINR(s.total)}</span>
                    {s.invoiceUrl && (
                      <button
                        onClick={() => downloadInvoice(s.invoiceUrl!, s.id)}
                        className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-black transition-all"
                        title="Download Invoice"
                      ><Download size={12} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesProcessing;
