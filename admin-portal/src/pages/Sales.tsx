import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IndianRupee, Package, CheckCircle } from "lucide-react";
import SaleForm from "../components/SaleForm";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import api from "../services/api";

interface Product {
  product_id: string;
  name: string;
  price: number;
}

const Sales: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-xtext flex items-center gap-2">
          <IndianRupee size={22} className="text-xblue" />
          New Sale
        </h2>
        <p className="text-[14px] text-xtext-secondary mt-0.5">Select a product and complete a sale</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Product Selector — Left Column (3/5) */}
        <div className="lg:col-span-3">
          <p className="text-[13px] text-xtext-secondary mb-3 font-medium">Choose a Product</p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((p, i) => {
                const isSelected = selectedProduct?.product_id === p.product_id;
                return (
                  <motion.button
                    key={p.product_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    onClick={() => setSelectedProduct(p)}
                    className={`group text-left p-4 rounded-xl border transition-colors ${isSelected
                      ? "bg-xblue-faded border-xblue/30"
                      : "bg-xdark border-xdark-border hover:bg-xdark-lighter"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isSelected
                        ? "bg-xblue/20 text-xblue"
                        : "bg-xdark-elevated text-xtext-secondary group-hover:text-xtext"
                        }`}>
                        {isSelected ? <CheckCircle size={16} /> : <Package size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[14px] font-bold truncate ${isSelected ? "text-xblue" : "text-xtext"}`}>
                          {p.name}
                        </p>
                        <p className={`text-[13px] mt-0.5 ${isSelected ? "text-xblue-light" : "text-xtext-secondary"}`}>
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sale Form — Right Column (2/5) */}
        <div className="lg:col-span-2 bg-xdark border border-xdark-border rounded-xl p-5">
          <p className="text-[13px] text-xtext-secondary mb-3 font-medium">Sale Details</p>
          <SaleForm selectedProduct={selectedProduct} />
        </div>
      </div>
    </div>
  );
};

export default Sales;
