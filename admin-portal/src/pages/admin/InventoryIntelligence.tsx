import React, { useState, useEffect } from "react";
import { Brain, Package, AlertTriangle, ArrowRight, Zap, Search, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { aiService, type InventoryItem } from "../../services/ai";
import LoadingSkeleton from "../../ui/LoadingSkeleton";

const formatINR = (amount: number) => "₹" + amount.toLocaleString('en-IN');

const InventoryIntelligence: React.FC = () => {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [searchTerm, _setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [_stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, inventoryData] = await Promise.all([
          aiService.getStats(7),
          aiService.getInventory()
        ]);
        setStats(statsData);
        setData(inventoryData);
      } catch (e) {
        console.error("Inventory Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
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

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Healthy': return 'text-muted/60 bg-white/5 border-white/5';
      case 'Low Stock': return 'text-accent bg-accent/10 border-accent/20';
      case 'Critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-muted/40 bg-white/5 border-white/5';
    }
  };

  const criticalCount = data.filter(i => i.status === 'Critical').length;
  const lowStockCount = data.filter(i => i.status === 'Low Stock').length;
  const reorderValue = data.filter(i => i.status !== 'Healthy')
    .reduce((sum, item) => sum + (item.predictedDemand * item.price), 0);

  const filtered = data.filter(i => 
    i.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">
            Inventory <span className="text-accent">Intelligence</span>
          </h1>
          <p className="text-muted/60 text-[11px] font-bold">AI-driven demand prediction and automated reorder protocol.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-xl text-accent shadow-lg shadow-accent/5">
            <Brain size={14} className="animate-pulse" />
            <span className="font-black text-[9px] uppercase tracking-widest">AI Engine Pulse</span>
          </div>
          <button 
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
            className="p-2 rounded-xl border border-white/8 bg-surface text-muted/60 hover:text-white hover:border-white/20 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* AI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative bg-surface border border-white/5 p-5 rounded-3xl overflow-hidden transition-all duration-500 hover:border-accent/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[40px] pointer-events-none group-hover:bg-accent/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-muted/40 text-[9px] uppercase tracking-widest">Risk Analysis</h3>
            <AlertTriangle className="text-accent/50 group-hover:text-accent transition-colors" size={18} />
          </div>
          <p className="text-3xl font-black text-white mb-1 tabular-nums">{criticalCount + lowStockCount}</p>
          <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest opacity-60">7-Day Stockout Risk</p>
        </div>
        
        <div className="group relative bg-surface border border-white/5 p-5 rounded-3xl overflow-hidden transition-all duration-500 hover:border-accent/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[40px] pointer-events-none group-hover:bg-accent/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
             <h3 className="font-bold text-muted/40 text-[9px] uppercase tracking-widest">Velocity Surges</h3>
             <Zap className="text-accent/50 group-hover:text-accent transition-colors" size={18} />
          </div>
          <p className="text-3xl font-black text-white mb-1 tabular-nums">
            {data.filter(i => parseInt(i.trend) > 20).length}
          </p>
          <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest opacity-60">Abnormal Sales Detection</p>
        </div>

        <div className="group relative bg-surface border border-white/5 p-5 rounded-3xl overflow-hidden transition-all duration-500 hover:border-accent/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[40px] pointer-events-none group-hover:bg-accent/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
             <h3 className="font-bold text-muted/40 text-[9px] uppercase tracking-widest">Capital Pipeline</h3>
             <div className="w-5 h-5 rounded bg-accent/10 flex items-center justify-center text-accent/50 group-hover:text-accent transition-colors">
               <Package size={14} />
             </div>
          </div>
          <p className="text-2xl font-black text-white mb-1 tabular-nums">{formatINR(reorderValue)}</p>
          <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest opacity-60">Suggested Reorder Value</p>
        </div>
      </div>

      {/* Main Intelligence Grid */}
      <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Brain size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Forecasting Engine</h2>
              <p className="text-[9px] text-muted/40 font-bold uppercase tracking-widest mt-0.5">Real-time demand synchronization</p>
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/30 group-focus-within:text-accent transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH PRODUCTS..." 
              value={searchTerm}
              onChange={(e) => _setSearchTerm(e.target.value)}
              className="pl-10 pr-5 py-2.5 bg-black/40 border border-white/8 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-accent/40 transition-all w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-black/20 border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-muted/40">
              <tr>
                <th className="p-4 pl-6 font-bold">Product Entity</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Live Units</th>
                <th className="p-4 font-bold text-center">Horizon</th>
                <th className="p-4 font-bold text-center text-accent">AI Predict (7D)</th>
                <th className="p-4 font-bold">Velocity</th>
                <th className="p-4 pr-6 text-right font-bold">AI Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-white/3 transition-colors group">
                  <td className="p-3 pl-6">
                    <div className="text-[13px] font-bold text-white tracking-wide group-hover:text-accent transition-colors leading-none">{item.product}</div>
                    <div className="text-[8px] text-muted/30 font-bold mt-1 uppercase tracking-wider">{item.id}</div>
                  </td>
                  <td className="p-3">
                     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(item.status)}`}>
                      {item.status === 'Critical' && <AlertTriangle size={10} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-lg font-black text-white/90 tabular-nums">{item.stock}</span>
                  </td>
                  <td className="p-3 text-center">
                    {item.days_to_stockout !== undefined ? (
                      <span className={`text-[9px] font-black px-2 py-1.5 rounded-lg border transition-all ${item.urgent_flag ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-lg shadow-rose-500/5' : 'bg-black/30 text-white/60 border-white/10'}`}>
                        {item.days_to_stockout} DAYS
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-xl font-black text-accent tabular-nums">{item.predictedDemand}</span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-black flex items-center gap-1 transition-all ${item.trend.startsWith('+') ? 'text-accent' : 'text-muted/30'}`}>
                      {item.trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {item.trend}
                    </span>
                  </td>
                  <td className="p-3 pr-6 text-right">
                    {item.status !== 'Healthy' ? (
                      <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:brightness-110 text-black text-[9px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-accent/10">
                        {item.reorderSuggestion} <ArrowRight size={14} />
                      </button>
                    ) : (
                      <span className="text-[9px] font-black text-muted/20 px-4 uppercase tracking-widest">Protocol Clear</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryIntelligence;
