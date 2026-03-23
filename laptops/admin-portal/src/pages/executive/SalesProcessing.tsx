import React, { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, CreditCard, ChevronRight, CheckCircle, X, ShieldAlert } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const mockProducts = [
  { id: "P1", name: "Premium Smart Watch", price: 24999, stock: 45, category: "Wearables" },
  { id: "P2", name: "Wireless Earbuds G2", price: 4999, stock: 120, category: "Audio" },
  { id: "P3", name: "4K Action Camera", price: 32999, stock: 12, category: "Cameras" },
  { id: "P4", name: "USB-C Fast Charger", price: 1499, stock: 200, category: "Accessories" },
];

interface SaleRecord {
  id: string;
  total: number;
  items: number;
  date: string;
}

const formatINR = (amount: number) => {
  return "₹" + amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const SalesProcessing: React.FC = () => {
  const [cart, setCart] = useState<{product: any, qty: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<SaleRecord | null>(null);
  const [salesHistory, setSalesHistory] = useLocalStorage<SaleRecord[]>("ss_sales_history", []);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? {...item, qty: item.qty + 1} : item);
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeQty = (productId: string) => {
    setCart(prev => prev.map(item => item.product.id === productId ? {...item, qty: Math.max(0, item.qty - 1)} : item).filter(item => item.qty > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const sale: SaleRecord = {
      id: `SALE-${String(salesHistory.length + 1).padStart(4, "0")}`,
      total,
      items: cart.reduce((s, i) => s + i.qty, 0),
      date: new Date().toLocaleString(),
    };
    setSalesHistory(prev => [sale, ...prev]);
    setLastSale(sale);
    setShowSuccess(true);
    setCart([]);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const filteredProducts = mockProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col xl:flex-row gap-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-8 z-[100] bg-surface border border-accent/20 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl animate-in slide-in-from-right-8 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
          {toast}
          <button onClick={() => setToast(null)} className="text-muted/30 hover:text-white transition-colors"><X size={14} /></button>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccess && lastSale && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-accent/20 rounded-[40px] p-12 text-center max-w-sm shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent shadow-[0_0_20px_rgba(252,163,17,0.5)]" />
            <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-8 shadow-inner shadow-accent/5">
              <CheckCircle size={48} className="text-accent" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Transmission Complete</h2>
            <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] mb-8">Registry ID: <span className="text-accent">{lastSale.id}</span></p>
            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 mb-8">
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest mb-1">Settled Amount</p>
              <p className="text-4xl font-black text-white tabular-nums">{formatINR(lastSale.total)}</p>
            </div>
            <p className="text-[10px] font-black text-muted/20 uppercase tracking-[0.3em]">{lastSale.items} UNITS • {lastSale.date}</p>
          </div>
        </div>
      )}

      {/* Left: Product Catalog */}
      <div className="flex-1 bg-surface border border-white/5 rounded-[32px] p-8 flex flex-col h-full overflow-hidden shadow-xl relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-10 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Sales <span className="text-accent">Terminal</span></h2>
            <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest mt-1">Operational Transaction Interface</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40" size={18} />
            <input
              type="text"
              placeholder="SEARCH ENTITY BY SKU/TAG..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-black/40 border border-white/8 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          {filteredProducts.map(prod => (
            <div key={prod.id} className="p-6 bg-black/20 border border-white/5 rounded-[28px] hover:border-accent/40 transition-all group flex flex-col relative overflow-hidden shadow-lg hover:shadow-accent/5">
               <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-bl-[40px] pointer-events-none group-hover:bg-accent/10 transition-all" />
              <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-xl uppercase tracking-widest">{prod.category}</span>
                <span className="text-[9px] font-black text-muted/40 uppercase tracking-widest">{prod.stock} UNITS</span>
              </div>
              <h3 className="font-black text-lg text-white group-hover:text-accent transition-colors mb-2 uppercase tracking-wide">{prod.name}</h3>
              <p className="text-2xl font-black text-white/90 mb-8 tabular-nums">{formatINR(prod.price)}</p>
              <button
                onClick={() => addToCart(prod)}
                className="mt-auto w-full py-4 rounded-2xl bg-black/40 border border-white/5 text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-accent hover:text-black hover:border-accent transition-all shadow-xl hover:shadow-accent/10"
              >
                INITIALIZE LOAD
              </button>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-2 text-center py-24 text-muted/20 uppercase text-[10px] font-black tracking-[0.3em] italic">No entities detected matching "{searchTerm}"</div>
          )}
        </div>
      </div>

      {/* Right: Cart/Checkout panel */}
      <div className="w-full xl:w-[450px] bg-surface border border-white/10 rounded-[40px] p-8 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <h3 className="text-xl font-black text-white flex items-center gap-4 mb-8 relative z-10 uppercase tracking-tight">
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent"><ShoppingCart size={22} /></div>
          Current Queue
          {cart.length > 0 && <span className="text-[10px] bg-white/5 text-muted/40 border border-white/10 px-3 py-1 rounded-full font-black ml-auto">{cart.reduce((s, i) => s + i.qty, 0)} UNITS</span>}
        </h3>

        <div className="flex-1 overflow-y-auto space-y-4 mb-8 relative z-10 pr-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted/10 py-24">
              <ShieldAlert size={64} className="mb-6 opacity-5" />
              <p className="uppercase text-[10px] font-black tracking-[0.4em]">Queue Depleted</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between p-5 bg-black/40 rounded-[22px] border border-white/5 group transition-all hover:border-accent/20">
                <div className="flex-1">
                  <h4 className="font-black text-xs text-white/90 uppercase tracking-widest line-clamp-1 mb-1">{item.product.name}</h4>
                  <p className="text-accent text-[11px] font-black tabular-nums">{formatINR(item.product.price * item.qty)}</p>
                </div>
                <div className="flex items-center gap-4 bg-black/60 rounded-xl p-2 border border-white/5 ml-4">
                  <button onClick={() => removeQty(item.product.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted/40 hover:text-rose-500 transition-all"><Minus size={14} /></button>
                  <span className="w-5 text-center text-xs font-black text-white/90 tabular-nums">{item.qty}</span>
                  <button onClick={() => addToCart(item.product)} className="p-1.5 rounded-lg hover:bg-accent/10 text-muted/40 hover:text-accent transition-all"><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-black/40 rounded-[32px] p-8 border border-white/8 relative z-10 shadow-inner">
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Base Value</span>
              <span className="text-xs font-black text-white/90 tabular-nums">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Protocol Tax (18%)</span>
              <span className="text-xs font-black text-white/90 tabular-nums">{formatINR(gst)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end mb-8 border-t border-white/5 pt-6">
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Total Settlement</span>
            <span className="text-4xl font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(252,163,17,0.1)]">{formatINR(total)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-5 rounded-2xl bg-accent text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:brightness-110 shadow-2xl shadow-accent/20 transition-all disabled:opacity-20 disabled:grayscale disabled:shadow-none"
          >
            <CreditCard size={20} />
            AUTHORIZE SETTLEMENT
            <ChevronRight size={20} className="ml-1 opacity-40" />
          </button>

          {cart.length > 0 && (
            <button
              onClick={() => { setCart([]); showToast("Queue Purged."); }}
              className="w-full mt-4 py-3 rounded-2xl border border-white/8 text-[9px] font-black text-muted/20 uppercase tracking-[0.4em] hover:text-rose-500 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all"
            >
              PURGE QUEUE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesProcessing;
