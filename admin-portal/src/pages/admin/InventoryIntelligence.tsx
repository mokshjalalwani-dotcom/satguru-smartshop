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
      <div className="space-y-8">
        <LoadingSkeleton className="h-20 w-1/3" />
        <div className="grid grid-cols-3 gap-6">
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
        </div>
        <LoadingSkeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Healthy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Low Stock': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
      default: return 'text-white/70 bg-white/5 border-white/10';
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Inventory Intelligence</h1>
          <p className="text-xtext-secondary text-sm">AI-driven demand prediction and automated reorder tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-indigo-400">
            <Brain size={18} className="animate-pulse" />
            <span className="font-bold text-sm">AI Engine Active</span>
          </div>
          <button 
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000); }}
            className="p-2.5 rounded-xl border border-white/10 bg-background text-xtext-secondary hover:text-white hover:border-white/20 transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* AI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl opacity-20 group-hover:opacity-40 blur-lg transition duration-500 bg-gradient-to-r from-rose-500 to-pink-500" />
          <div className="bg-xcard border border-rose-500/20 p-6 rounded-3xl relative z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="font-bold text-rose-400 text-sm">Predicted Stockouts</h3>
              <AlertTriangle className="text-rose-400 opacity-50" size={24} />
            </div>
            <p className="text-4xl font-black text-white mb-2 relative z-10">{criticalCount + lowStockCount}</p>
            <p className="text-sm text-xtext-secondary relative z-10">Products at risk within 7 days</p>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl opacity-20 group-hover:opacity-40 blur-lg transition duration-500 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="bg-xcard border border-amber-500/20 p-6 rounded-3xl relative z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
               <h3 className="font-bold text-amber-400 text-sm">Demand Surges</h3>
               <Zap className="text-amber-400 opacity-50" size={24} />
            </div>
            <p className="text-4xl font-black text-white mb-2 relative z-10">
              {data.filter(i => parseInt(i.trend) > 20).length}
            </p>
            <p className="text-sm text-xtext-secondary relative z-10">Abnormal sales velocity detected</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl opacity-20 group-hover:opacity-40 blur-lg transition duration-500 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="bg-xcard border border-cyan-500/20 p-6 rounded-3xl relative z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
               <h3 className="font-bold text-cyan-400 text-sm">Reorder Queue Value</h3>
               <Package className="text-cyan-400 opacity-50" size={24} />
            </div>
            <p className="text-4xl font-black text-white mb-2 relative z-10">{formatINR(reorderValue)}</p>
            <p className="text-sm text-xtext-secondary relative z-10">Suggested replenishments</p>
          </div>
        </div>
      </div>

      {/* Main Intelligence Grid */}
      <div className="bg-xcard border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Brain className="text-indigo-400" size={18} /> AI Forecasting Engine
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-xtext-secondary" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => _setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-background border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-background/50 border-b border-white/5 text-xs uppercase tracking-wider text-xtext-secondary">
              <tr>
                <th className="p-4 pl-6 font-medium">Product</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Current Stock</th>
                <th className="p-4 font-medium text-center">Days to Stockout</th>
                <th className="p-4 font-medium text-center text-indigo-400">AI Predict (7d)</th>
                <th className="p-4 font-medium">Trend</th>
                <th className="p-4 pr-6 text-right font-medium">AI Suggestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-white tracking-wide">{item.product}</div>
                    <div className="text-xs text-xtext-secondary font-medium">{item.id}</div>
                  </td>
                  <td className="p-4">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(item.status)}`}>
                      {item.status === 'Critical' && <AlertTriangle size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-lg font-bold">{item.stock}</span>
                  </td>
                  <td className="p-4 text-center">
                    {item.days_to_stockout !== undefined ? (
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-md border ${item.urgent_flag ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-white/5 text-white/80 border-white/10'}`}>
                        {item.days_to_stockout} Days
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-lg font-black text-indigo-400">{item.predictedDemand}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-bold flex items-center gap-1 ${item.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.trend.startsWith('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {item.trend}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {item.status !== 'Healthy' ? (
                      <button className="flex items-center justify-end gap-2 ml-auto px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                        {item.reorderSuggestion} <ArrowRight size={16} />
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-xtext-secondary px-4">{item.reorderSuggestion}</span>
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
