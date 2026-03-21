import React, { useState } from "react";
import ProductList from "../components/ProductList";
import { type Product } from "../components/ProductList";
import { Package, CheckCircle, X } from "lucide-react";
import FloatingModal from "../ui/FloatingModal";
import AddProductForm from "../ui/AddProductForm";
import api from "../services/api.ts";

const Products: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddProduct = async (data: { name: string; price: string; category: string; description: string }) => {
    try {
      await api.addProduct({
        name: data.name,
        price: Number(data.price),
        stock: 50, // default stock for new products
      });
      setShowAddModal(false);
      setRefreshKey(k => k + 1); // trigger ProductList to refetch
      setToast(`✅ "${data.name}" added successfully!`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast("❌ Failed to add product. Try again.");
      setTimeout(() => setToast(null), 3000);
    }
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
          onClick={() => setShowAddModal(true)}
          className="bg-xblue hover:bg-xblue-hover text-white text-[14px] px-5 py-2 rounded-full transition-colors font-bold"
        >
          + Add Product
        </button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-xcard border border-white/10 rounded-2xl px-5 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] animate-in slide-in-from-right-5 flex items-center gap-3">
          {toast}
          <button onClick={() => setToast(null)} className="text-white/40 hover:text-white"><X size={14} /></button>
        </div>
      )}

      {/* Selected product preview */}
      {selectedProduct && (
        <div className="border border-xblue/30 bg-xblue-faded text-xblue text-[14px] rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle size={16} />
          Selected: <span className="font-bold">{selectedProduct.name}</span>
          <span className="text-xtext-secondary ml-1">— ₹{selectedProduct.price.toLocaleString("en-IN")}</span>
          <button onClick={() => setSelectedProduct(null)} className="ml-auto text-white/40 hover:text-white"><X size={14} /></button>
        </div>
      )}

      {/* Product List */}
      <ProductList key={refreshKey} onSelect={handleSelectProduct} />

      {/* Add Product Modal */}
      <FloatingModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Product">
        <AddProductForm onSubmit={handleAddProduct} onCancel={() => setShowAddModal(false)} />
      </FloatingModal>
    </div>
  );
};

export default Products;
