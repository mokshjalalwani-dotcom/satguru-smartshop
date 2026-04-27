import React, { useState, useEffect, useCallback } from "react";
import {
  Brain, Package, AlertTriangle, ArrowRight, Zap,
  Search, TrendingUp, TrendingDown, RefreshCw, CheckCircle
} from "lucide-react";
import { aiService } from "../../services/ai";
import api from "../../services/api";
import LoadingSkeleton from "../../ui/LoadingSkeleton";

const formatINR = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

// Normalise both AI-service shape AND MongoDB-fallback shape into one interface
interface InvRow {
  id:             string;
  name:           string;
  category:       string;
  stock:          number;
  status:         string;
  predictedDemand:number;   // 7-day forecast
  daysOfStock:    number;
  dailyVelocity:  number;
  sold30:         number;
  trend:          string;   // e.g. "+12%"
  alert:          string | null;
}

const normalise = (raw: any): InvRow => ({
  id:              raw.product_id ?? raw.id ?? "—",
  name:            raw.name       ?? raw.product ?? "Unknown",
  category:        raw.category   ?? "—",
  stock:           raw.stock      ?? 0,
  status:          raw.status     ?? "Healthy",
  predictedDemand: raw.predicted_demand_7d ?? raw.predictedDemand ?? 0,
  daysOfStock:     raw.days_of_stock ?? raw.days_to_stockout ?? 999,
  dailyVelocity:   raw.daily_velocity ?? 0,
  sold30:          raw.sold_last_30d ?? 0,
  trend:           raw.trend ?? (raw.daily_velocity ? `${raw.daily_velocity.toFixed(1)}/day` : "—"),
  alert:           raw.alert ?? null,
});

const statusStyle = (s: string) => {
  switch (s) {
    case "Healthy":     return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "Low Stock":   return "text-accent bg-accent/10 border-accent/20";
    case "Critical":
    case "Out of Stock":return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    default:            return "text-muted/40 bg-white/5 border-white/5";
  }
};

const InventoryIntelligence: React.FC = () => {
  const [data, setData]           = useState<InvRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const handleReorder = async (productId: string) => {
    try {
      setRestockingId(productId);
      const reorderAmount = 20; // Default reorder amount
      await api.restockProduct(productId, reorderAmount);
      await fetchData(); // Refresh data from AI and backend
    } catch (e) {
      console.error("Restock failed:", e);
    } finally {
      setRestockingId(null);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aiData, dbProducts] = await Promise.all([
        aiService.getInventory().catch(() => []),
        api.getProducts().catch(() => [])
      ]);

      const merged = (aiData as any[]).map(aiItem => {
        const prodName = aiItem.name || aiItem.product;
        const dbInfo = dbProducts.find(p => p.name === prodName);
        if (dbInfo) {
          aiItem.id = dbInfo.product_id; // Override with real MongoDB ID for Reordering
          aiItem.stock = dbInfo.stock;   // Override with true live stock
          const threshold = aiItem.threshold || 5;
          const daysLeft = aiItem.days_to_stockout || 99;
          
          if (dbInfo.stock <= threshold || daysLeft <= 7) {
            aiItem.status = 'Critical';
          } else if (dbInfo.stock <= threshold * 2 || daysLeft <= 14) {
            aiItem.status = 'Low Stock';
          } else {
            aiItem.status = 'Healthy';
          }
        }
        return normalise(aiItem);
      });

      // Append any new DB items not seen by AI yet
      for (const dbInfo of dbProducts) {
        if (!merged.find(m => m.id === dbInfo.product_id)) {
          merged.push(normalise({
            id: dbInfo.product_id,
            name: dbInfo.name,
            category: dbInfo.category || "General",
            stock: dbInfo.stock,
            status: dbInfo.stock <= 5 ? 'Critical' : 'Healthy',
            predictedDemand: 0,
            daysOfStock: 999,
            dailyVelocity: 0,
            sold30: 0,
            trend: "0/day"
          }));
        }
      }

      setData(merged);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Inventory fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Summary stats
  const criticalCount = data.filter(i => i.status === "Critical" || i.status === "Out of Stock").length;
  const lowStockCount = data.filter(i => i.status === "Low Stock").length;
  const highVelocity  = data.filter(i => i.dailyVelocity > 1).length;
  const reorderValue  = data
    .filter(i => i.status !== "Healthy")
    .reduce((sum, i) => sum + (i.predictedDemand || 0) * 1500, 0); // rough avg price estimate

  const filtered = data.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && data.length === 0) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <LoadingSkeleton className="h-16 w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          <LoadingSkeleton className="h-24 rounded-2xl" />
          <LoadingSkeleton className="h-24 rounded-2xl" />
          <LoadingSkeleton className="h-24 rounded-2xl" />
        </div>
        <LoadingSkeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">
            Inventory <span className="text-accent">Intelligence</span>
          </h1>
          <p className="text-muted/60 text-[11px] font-bold">
            Real-time stock levels · 30-day velocity · AI demand forecast
            {lastUpdated && (
              <span className="ml-3 text-muted/30">
                · Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-xl text-accent">
            <Brain size={14} className="animate-pulse" />
            <span className="font-black text-[9px] uppercase tracking-widest">Live Stock Engine</span>
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-white/8 bg-surface text-muted/60 hover:text-white hover:border-white/20 transition-all"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Critical / OOS", value: criticalCount, icon: <AlertTriangle size={18} />, color: "rose" },
          { label: "Low Stock",      value: lowStockCount,  icon: <Package size={18} />,       color: "amber" },
          { label: "High Velocity",  value: highVelocity,   icon: <Zap size={18} />,           color: "accent" },
          { label: "Reorder Est.",   value: formatINR(reorderValue), icon: <ArrowRight size={18} />, color: "accent", isText: true },
        ].map((card, i) => (
          <div key={i} className="group relative bg-surface border border-white/5 p-5 rounded-3xl overflow-hidden transition-all hover:border-accent/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-bl-[40px] pointer-events-none" />
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-muted/40 text-[9px] uppercase tracking-widest">{card.label}</h3>
              <span className="text-accent/50">{card.icon}</span>
            </div>
            <p className="text-2xl font-black text-white tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Brain size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Stock Intelligence Grid</h2>
              <p className="text-[9px] text-muted/40 font-bold uppercase tracking-widest mt-0.5">{filtered.length} products · velocity-ranked</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/30" size={14} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-black/40 border border-white/8 rounded-xl text-[10px] font-bold text-white focus:outline-none focus:border-accent/40 transition-all w-52"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-black/20 border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-muted/40">
              <tr>
                <th className="p-4 pl-6 font-bold">Product</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Stock</th>
                <th className="p-4 font-bold text-center">Days Left</th>
                <th className="p-4 font-bold text-center text-accent">AI Demand (7D)</th>
                <th className="p-4 font-bold text-center">30D Sold</th>
                <th className="p-4 pr-6 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted/20 text-[11px] font-black uppercase tracking-widest">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered
                  .sort((a, b) => {
                    const order: Record<string,number> = { "Out of Stock": 0, Critical: 1, "Low Stock": 2, Healthy: 3 };
                    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
                  })
                  .map(item => (
                    <tr key={item.id} className="hover:bg-white/3 transition-colors group">
                      <td className="p-3 pl-6">
                        <div className="font-bold text-white text-sm group-hover:text-accent transition-colors">{item.name}</div>
                        <div className="text-[8px] text-muted/30 font-mono mt-0.5">{item.id}</div>
                      </td>
                      <td className="p-3">
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{item.category}</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${statusStyle(item.status)}`}>
                          {item.status === "Critical" || item.status === "Out of Stock"
                            ? <AlertTriangle size={9} className="animate-pulse" />
                            : item.status === "Healthy" ? <CheckCircle size={9} /> : <Package size={9} />}
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-lg font-black text-white tabular-nums">{item.stock}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${item.daysOfStock < 14 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : item.daysOfStock < 30 ? "bg-accent/10 text-accent border-accent/20" : "bg-white/5 text-white/40 border-white/10"}`}>
                          {item.daysOfStock >= 990 ? "∞" : `${item.daysOfStock}d`}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-xl font-black text-accent tabular-nums">{item.predictedDemand}</span>
                        <span className="text-[9px] text-muted/30 ml-1">units</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-black text-white/70 tabular-nums text-sm">{item.sold30}</span>
                          <span className={`text-[8px] font-bold flex items-center gap-0.5 ${item.dailyVelocity > 0.5 ? "text-accent" : "text-muted/30"}`}>
                            {item.dailyVelocity > 0.5 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                            {item.dailyVelocity.toFixed(1)}/day
                          </span>
                        </div>
                      </td>
                      <td className="p-3 pr-6 text-right">
                        {item.status !== "Healthy" ? (
                          <button 
                            onClick={() => handleReorder(item.id)}
                            disabled={restockingId === item.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:brightness-110 text-black text-[9px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-accent/10 disabled:opacity-50 disabled:cursor-not-allowed">
                            {restockingId === item.id ? (
                              <><RefreshCw size={11} className="animate-spin" /> Restocking</>
                            ) : (
                              <>Reorder <ArrowRight size={11} /></>
                            )}
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-muted/20 uppercase tracking-widest">OK</span>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryIntelligence;
