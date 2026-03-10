import React, { useState } from "react";
import ProductList from "../components/ProductList";
import { type Product } from "../components/ProductList";
import { Package, CheckCircle } from "lucide-react";

const Products: React.FC = () => {
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-xtext flex items-center gap-2">
            <Package size={22} className="text-xblue" />
            Products
          </h2>
          <p className="text-[14px] text-xtext-secondary mt-0.5">Manage your product inventory</p>
        </div>
        <button
          onClick={() => setShowPlaceholder(true)}
          className="bg-xblue hover:bg-xblue-hover text-white text-[14px] px-5 py-2 rounded-full transition-colors font-bold"
        >
          + Add Product
        </button>
      </div>

      {/* Placeholder message */}
      {showPlaceholder && (
        <div className="border border-xdark-border text-xtext-secondary text-[14px] rounded-xl px-4 py-3 flex items-center gap-2">
          <span>💡</span>
          Use the floating + button to add a new product.
        </div>
      )}

      {/* Selected product preview */}
      {selectedProduct && (
        <div className="border border-xblue/30 bg-xblue-faded text-xblue text-[14px] rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle size={16} />
          Selected: <span className="font-bold">{selectedProduct.name}</span>
          <span className="text-xtext-secondary ml-1">— ₹{selectedProduct.price.toLocaleString("en-IN")}</span>
        </div>
      )}

      {/* Product List */}
      <ProductList onSelect={handleSelectProduct} />
    </div>
  );
};

export default Products;
