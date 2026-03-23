import React, { useState } from "react";
import { Package, Search, AlertTriangle, Plus, Minus, Box, ShieldCheck, Zap } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

// Mock data
const initialInventory = [
  { id: "INV-01", product: "Premium Smart Watch", category: "Wearables", stock: 45, threshold: 20, status: "Healthy" },
  { id: "INV-02", product: "Wireless Earbuds G2", category: "Audio", stock: 12, threshold: 30, status: "Low Stock" },
  { id: "INV-03", product: "4K Action Camera", category: "Cameras", stock: 5, threshold: 10, status: "Critical" },
  { id: "INV-04", product: "USB-C Fast Charger", category: "Accessories", stock: 200, threshold: 50, status: "Healthy" },
];

const InventoryUpdates: React.FC = () => {
  const [inventory, setInventory] = useLocalStorage("ss_inventory", initialInventory);
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

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Healthy': return 'text-accent border-accent/20 bg-accent/5';
      case 'Low Stock': return 'text-white/80 border-white/20 bg-white/5';
      case 'Critical': return 'text-rose-500 border-rose-500/20 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
      default: return 'text-muted/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">
            Inventory <span className="text-accent">Synchronization</span>
          </h1>
          <p className="text-muted/60 text-sm font-medium">Strategic capacity monitoring and real-time entity adjustment protocol.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/30" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH ENTITY BY SKU/ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-black/40 border border-white/8 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
          />
        </div>
      </div>

      <div className="bg-surface border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="overflow-x-auto relative z-10 p-4">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.3em] text-muted/40 font-black">
                <th className="p-8 pl-10">Entity Identification</th>
                <th className="p-8">Classification</th>
                <th className="p-8 text-center">Status Index</th>
                <th className="p-8 text-center">Load Capacity</th>
                <th className="p-8 pr-10 text-right">Synchronization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.filter(i => i.product.toLowerCase().includes(searchTerm.toLowerCase()) || i.id.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                <tr key={item.id} className="hover:bg-white/3 transition-all group">
                  <td className="p-8 pl-10">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/8 flex items-center justify-center text-muted/20 group-hover:text-accent group-hover:border-accent/30 transition-all shadow-xl">
                        <Box size={20} />
                      </div>
                      <div>
                        <div className="font-black text-sm text-white uppercase tracking-wide group-hover:text-accent transition-colors">{item.product}</div>
                        <div className="text-[10px] font-black text-muted/20 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                           <ShieldCheck size={10} className="text-accent/40" /> {item.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{item.category}</span>
                  </td>
                  <td className="p-8 text-center">
                    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(item.status)}`}>
                      {item.status === 'Critical' && <AlertTriangle size={12} className="animate-pulse" />}
                      {item.status === 'Healthy' && <Zap size={12} />}
                      {item.status}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-xl font-black text-white tabular-nums">{item.stock} <span className="text-[10px] text-muted/40 uppercase tracking-widest ml-1">Units</span></div>
                      <div className="w-32 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(252,163,17,0.3)] ${item.status === 'Healthy' ? 'bg-accent' : item.status === 'Low Stock' ? 'bg-accent/40' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, (item.stock / item.threshold) * 50)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-8 pr-10">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => updateStock(item.id, -1)} 
                        className="w-12 h-12 rounded-2xl bg-black/40 border border-white/8 flex items-center justify-center text-muted/40 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all shadow-lg active:scale-95"
                      >
                        <Minus size={20} />
                      </button>
                      <button 
                        onClick={() => updateStock(item.id, 1)} 
                        className="w-12 h-12 rounded-2xl bg-black/40 border border-white/8 flex items-center justify-center text-muted/40 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all shadow-lg active:scale-95"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inventory.filter(i => i.product.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <div className="py-24 text-center">
              <Package size={64} className="mx-auto mb-6 opacity-5" />
              <p className="text-[10px] font-black text-muted/20 uppercase tracking-[0.4em] italic">No entities detected in operational grid</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-black/40 border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-inner">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[22px] bg-accent/5 border border-accent/20 flex items-center justify-center text-accent"><ShieldCheck size={32} /></div>
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Protocol Integrity Validated</h3>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest mt-1">Real-time Stock Ledger Sync: <span className="text-accent active">ACTIVE</span></p>
           </div>
        </div>
        <div className="text-[10px] font-black text-muted/20 uppercase tracking-[0.5em]">Satguru Operational Matrix • 2026.03.10</div>
      </div>
    </div>
  );
};

export default InventoryUpdates;
