import React, { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, CreditCard, ChevronRight } from "lucide-react";

const mockProducts = [
  { id: "P1", name: "Premium Smart Watch", price: 24999, stock: 45, category: "Wearables" },
  { id: "P2", name: "Wireless Earbuds G2", price: 4999, stock: 120, category: "Audio" },
  { id: "P3", name: "4K Action Camera", price: 32999, stock: 12, category: "Cameras" },
  { id: "P4", name: "USB-C Fast Charger", price: 1499, stock: 200, category: "Accessories" },
];

const formatINR = (amount: number) => {
  return "₹" + amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const SalesProcessing: React.FC = () => {
  const [cart, setCart] = useState<{product: any, qty: number}[]>([]);
  
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

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* Left: Product Catalog */}
      <div className="flex-1 bg-xcard border border-white/5 rounded-3xl p-6 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Sales Terminal</h2>
            <p className="text-sm text-xtext-secondary">Select products to add to current order</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-xtext-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search products by tag/SKU..." 
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-4">
          {mockProducts.map(prod => (
            <div key={prod.id} className="p-4 bg-background border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{prod.category}</span>
                <span className="text-xs text-xtext-secondary font-medium">{prod.stock} in stock</span>
              </div>
              <h3 className="font-bold text-lg mb-1">{prod.name}</h3>
              <p className="text-xl font-light text-white mb-6">{formatINR(prod.price)}</p>
              
              <button 
                onClick={() => addToCart(prod)}
                className="mt-auto w-full py-2.5 rounded-xl border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all font-bold text-sm flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <Plus size={16} /> Add to Order
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cart/Checkout panel */}
      <div className="w-full xl:w-[400px] bg-background border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none" />
        
        <h3 className="text-xl font-bold flex items-center gap-3 mb-6 relative z-10">
          <ShoppingCart size={22} className="text-emerald-400" /> Current Order
        </h3>

        <div className="flex-1 overflow-y-auto space-y-4 mb-6 relative z-10 pr-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-xtext-secondary">
              <ShoppingCart size={40} className="mb-4 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex-1">
                  <h4 className="font-bold text-sm line-clamp-1">{item.product.name}</h4>
                  <p className="text-emerald-400 text-sm font-semibold">{formatINR(item.product.price * item.qty)}</p>
                </div>
                <div className="flex items-center gap-3 bg-background rounded-lg p-1 border border-white/5">
                  <button onClick={() => removeQty(item.product.id)} className="p-1 hover:text-rose-400 transition-colors"><Minus size={14} /></button>
                  <span className="w-4 text-center text-sm font-bold">{item.qty}</span>
                  <button onClick={() => addToCart(item.product)} className="p-1 hover:text-emerald-400 transition-colors"><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-white/10 pt-4 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xtext-secondary">Subtotal</span>
            <span className="font-medium">{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xtext-secondary">GST (18%)</span>
            <span className="font-medium">{formatINR(gst)}</span>
          </div>
          <div className="flex justify-between items-end mb-6">
            <span className="text-lg font-bold">Total</span>
            <span className="text-3xl font-black text-white">{formatINR(total)}</span>
          </div>

          <button 
            disabled={cart.length === 0}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-lg flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 disabled:grayscale"
          >
            <CreditCard size={20} />
            Charge {formatINR(total)}
            <ChevronRight size={20} className="ml-2 opacity-50" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesProcessing;
