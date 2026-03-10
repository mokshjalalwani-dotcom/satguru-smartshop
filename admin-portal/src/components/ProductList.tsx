import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p, i) => (
        <motion.div
          key={p.product_id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          onClick={() => onSelect && onSelect(p)}
          className="group cursor-pointer bg-xdark border border-xdark-border rounded-xl p-4 hover:bg-xdark-lighter interactive-card"
        >
          <div className="flex items-start gap-3">
            {/* Product icon */}
            <div className="w-10 h-10 rounded-full bg-xblue-faded flex items-center justify-center text-xblue shrink-0">
              <Package size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-bold text-xtext truncate">{p.name}</h3>
              <p className="text-[13px] text-xtext-secondary mt-1">
                ₹{p.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductList;
