import React, { useState } from "react";
import { Package, Search, AlertTriangle, Plus, Minus } from "lucide-react";

// Mock data
const initialInventory = [
  { id: "INV-01", product: "Premium Smart Watch", category: "Wearables", stock: 45, threshold: 20, status: "Healthy" },
  { id: "INV-02", product: "Wireless Earbuds G2", category: "Audio", stock: 12, threshold: 30, status: "Low Stock" },
  { id: "INV-03", product: "4K Action Camera", category: "Cameras", stock: 5, threshold: 10, status: "Critical" },
  { id: "INV-04", product: "USB-C Fast Charger", category: "Accessories", stock: 200, threshold: 50, status: "Healthy" },
];

const InventoryUpdates: React.FC = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState("");

  const updateStock = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + delta);
        let newStatus = "Healthy";
        if (newStock === 0) newStatus = "Critical";
        else if (newStock <= item.threshold) newStatus = "Low Stock";
        return { ...item, stock: newStock, status: newStatus };
      }
      return item;
    }));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Healthy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Low Stock': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-white/70 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Inventory Updates</h1>
          <p className="text-xtext-secondary text-sm">Monitor stock levels in real-time and physically update inventory counts.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-xtext-secondary" size={18} />
          <input 
            type="text" 
            placeholder="Search by SKU or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-xcard border border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="bg-xcard border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="overflow-x-auto relative z-10 p-2">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xtext-secondary text-sm">
                <th className="p-4 font-medium pl-6 rounded-tl-xl">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Stock Level</th>
                <th className="p-4 font-medium pr-6 text-right rounded-tr-xl">Quick Update</th>
              </tr>
            </thead>
            <tbody>
              {inventory.filter(i => i.product.toLowerCase().includes(searchTerm.toLowerCase()) || i.id.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background border border-white/10 flex items-center justify-center text-xtext-secondary group-hover:text-emerald-400 transition-colors">
                        <Package size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{item.product}</div>
                        <div className="text-xs text-xtext-secondary mt-0.5">{item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-white/80">{item.category}</span>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(item.status)}`}>
                      {item.status === 'Critical' && <AlertTriangle size={12} />}
                      {item.status}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-white w-10">{item.stock}</div>
                      <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.status === 'Healthy' ? 'bg-emerald-400' : item.status === 'Low Stock' ? 'bg-amber-400' : 'bg-rose-400'}`}
                          style={{ width: `${Math.min(100, (item.stock / item.threshold) * 50)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => updateStock(item.id, -1)} className="p-2 rounded-lg bg-background text-xtext-secondary hover:text-white hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 transition-all">
                        <Minus size={16} />
                      </button>
                      <button onClick={() => updateStock(item.id, 1)} className="p-2 rounded-lg bg-background text-xtext-secondary hover:text-white hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/30 transition-all">
                        <Plus size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inventory.filter(i => i.product.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <div className="p-8 text-center text-xtext-secondary">
              <Package size={32} className="mx-auto mb-3 opacity-20" />
              <p>No products found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryUpdates;
