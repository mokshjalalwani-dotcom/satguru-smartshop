import React, { useState } from "react";
import ProductList from "../components/ProductList";
import { type Product } from "../components/ProductList";
import { Package, CheckCircle, X, Plus } from "lucide-react";
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
      setToast(`Product "${data.name}" added to inventory.`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast("Security alert: Failed to register product.");
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-24 right-8 z-[100] bg-surface border border-accent/20 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl animate-in slide-in-from-right-8 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
          {toast}
          <button onClick={() => setToast(null)} className="text-muted/30 hover:text-white transition-colors"><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase flex items-center gap-4">
            <Package size={32} className="text-accent" />
            Product <span className="text-accent">Registry</span>
          </h2>
          <p className="text-muted/60 text-sm font-medium">Strategic asset management and inventory categorization terminal.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-accent text-black font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-accent/10 transition-all"
        >
          <Plus size={18} /> Integrate Asset
        </button>
      </div>

      {/* Selected product preview */}
      {selectedProduct && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 flex items-center gap-4 animate-in slide-in-from-top-4">
          <CheckCircle size={20} className="text-accent" />
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest leading-none mb-1">Active Selection</p>
            <p className="text-sm font-black text-white uppercase tracking-wide">
              {selectedProduct.name} <span className="mx-2 text-muted/20">|</span> <span className="text-accent">₹{selectedProduct.price.toLocaleString("en-IN")}</span>
            </p>
          </div>
          <button onClick={() => setSelectedProduct(null)} className="ml-auto p-2 rounded-xl hover:bg-white/5 text-muted/30 hover:text-white transition-all"><X size={16} /></button>
        </div>
      )}

      {/* Product List */}
      <div className="bg-surface border border-white/5 rounded-[40px] p-2 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <ProductList key={refreshKey} onSelect={handleSelectProduct} />
      </div>

      {/* Add Product Modal */}
      <FloatingModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Asset Integration Protocol">
        <AddProductForm onSubmit={handleAddProduct} onCancel={() => setShowAddModal(false)} />
      </FloatingModal>
    </div>
  );
};

export default Products;
