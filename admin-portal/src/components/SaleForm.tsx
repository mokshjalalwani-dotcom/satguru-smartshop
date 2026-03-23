import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import type { NewSale } from "../services/api";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { ShoppingCart, CheckCircle, ExternalLink, ShieldCheck, Zap, Receipt } from "lucide-react";

interface Product {
  product_id: string;
  name: string;
  price: number;
}

interface Props {
  selectedProduct: Product | null;
}

const SaleForm: React.FC<Props> = ({ selectedProduct }) => {
  const [customerName, setCustomerName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [invoiceUrl, setInvoiceUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSale = async () => {
    if (!selectedProduct) return;
    if (!customerName.trim()) return;

    const saleData: NewSale = {
      customer: customerName.trim(),
      amount: selectedProduct.price * quantity,
      products: [selectedProduct.product_id],
    };

    try {
      setLoading(true);
      const result = await api.createSale(saleData);
      setInvoiceUrl(result.invoiceUrl);
    } catch (err) {
      console.error("Sale error:", err);
    } finally {
      setLoading(false);
    }
  };

  const total = selectedProduct ? selectedProduct.price * quantity : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Selected Product Summary */}
      <div className="bg-black/40 border border-white/10 rounded-[32px] p-6 relative overflow-hidden group transition-all hover:border-accent/30">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[40px] pointer-events-none" />
        <div className="flex items-center gap-4 mb-6 relative z-10">
           <div className={`p-3 rounded-2xl border transition-all ${selectedProduct ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-black/60 border-white/5 text-muted/20'}`}>
              <ShoppingCart size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] mb-1">Target Asset</p>
              {selectedProduct ? (
                <h4 className="text-sm font-black text-white uppercase tracking-wide">{selectedProduct.name}</h4>
              ) : (
                <h4 className="text-sm font-black text-muted/20 uppercase tracking-wide italic">No Asset Loaded</h4>
              )}
           </div>
        </div>
        
        {selectedProduct && (
           <div className="flex items-end justify-between relative z-10 pt-4 border-t border-white/5">
              <div>
                <p className="text-[9px] font-black text-muted/40 uppercase tracking-widest mb-1">Unit Valuation</p>
                <p className="text-lg font-black text-white tabular-nums">₹{selectedProduct.price.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">Asset Sync</p>
                <p className="text-xs font-black text-accent uppercase tracking-widest flex items-center gap-1 justify-end"><ShieldCheck size={12} /> SECURE</p>
              </div>
           </div>
        )}
      </div>

      {/* Inputs */}
      <div className="space-y-5">
        <Input
          label="Entity Designation"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="ENTER CUSTOMER NAME..."
        />

        <Input
          label="Load Quantity"
          value={String(quantity)}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          type="number"
          placeholder="1"
        />
      </div>

      {/* Order Summary Summary */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/40 rounded-[28px] p-6 border border-white/5 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Base Computation</span>
              <span className="text-xs font-black text-white/80 tabular-nums">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center px-1 border-t border-white/5 pt-4">
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Flow Settlement</span>
              <span className="text-2xl font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(252,163,17,0.1)]">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <Button 
        onClick={handleSale} 
        disabled={loading || !selectedProduct || !customerName.trim()}
        className="w-full py-5 rounded-[22px] shadow-2xl transition-all"
      >
        <Zap size={18} className="mr-3" />
        {loading ? "INITIALIZING..." : `AUTHORIZE SETTLEMENT — ₹${total.toLocaleString("en-IN")}`}
      </Button>

      {/* Invoice Generation */}
      <AnimatePresence>
        {invoiceUrl && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/5 border-2 border-accent/20 rounded-[32px] p-8 text-center relative overflow-hidden shadow-2xl shadow-accent/10"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-accent shadow-[0_0_15px_rgba(252,163,17,0.5)]" />
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
              <Receipt size={32} className="text-accent" />
            </div>
            <p className="text-lg font-black text-white uppercase tracking-tight mb-2">Protocol Successful</p>
            <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.3em] mb-8">Registry ID Generated</p>
            
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-accent/20"
            >
              <ExternalLink size={16} /> VIEW MASTER INVOICE
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SaleForm;
