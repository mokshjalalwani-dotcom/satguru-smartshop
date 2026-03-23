import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, ShieldCheck, Zap } from "lucide-react";
import api from "../services/api.ts";
import LoadingSkeleton from "../ui/LoadingSkeleton";

export type Product = {
  product_id: string;
  name: string;
  price: number;
};

const ProductList: React.FC<{ onSelect?: (p: Product) => void }> = ({ onSelect }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-32 rounded-[28px] bg-black/20 shadow-inner" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((p, i) => (
        <motion.div
          key={p.product_id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
          onClick={() => onSelect && onSelect(p)}
          className="group cursor-pointer bg-black/20 border border-white/5 rounded-[28px] p-6 hover:bg-black/40 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-bl-[40px] pointer-events-none group-hover:bg-accent/10 transition-all" />
          
          <div className="flex items-start gap-5 relative z-10">
            {/* Product icon */}
            <div className="w-14 h-14 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-muted/30 group-hover:text-accent group-hover:border-accent/30 shadow-xl transition-all duration-500">
              <Package size={22} />
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <h3 className="text-sm font-black text-white uppercase tracking-wide truncate group-hover:text-accent transition-colors">{p.name}</h3>
                 <ShieldCheck size={12} className="text-muted/10 group-hover:text-accent/40 transition-colors" />
               </div>
              <p className="text-xl font-black text-white/90 tabular-nums mb-3 mt-1">
                ₹{p.price.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center gap-2">
                 <Zap size={10} className="text-accent/40" />
                 <span className="text-[9px] font-black text-muted/40 uppercase tracking-[0.2em]">Asset Grid Ready</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500">
             <button className="w-full py-2.5 rounded-xl bg-accent text-black text-[9px] font-black uppercase tracking-widest shadow-lg shadow-accent/20">Initialize Selection</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductList;
