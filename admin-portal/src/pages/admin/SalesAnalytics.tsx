import React, { useState, useEffect } from "react";
import { TrendingUp, IndianRupee, Activity, Users, ShoppingCart, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from "recharts";
import { aiService, type HistoryData } from "../../services/ai";


const formatINR = (amount?: number) => amount !== undefined ? `₹${amount.toLocaleString('en-IN')}` : '₹0';

const SalesAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [chartData, setChartData] = useState<HistoryData[]>([]);
  const [productStats, setProductStats] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 180;
  const fetchData = async () => {
    setLoading(true);
    try {
      const [history, statsData, pStats] = await Promise.all([
        aiService.getHistory(days),
        aiService.getStats(days),
        aiService.getProductStats(days)
      ]);

      console.log("history:", history);
      console.log("statsData:", statsData);  // 👈 check keys here

      setChartData(history);
      setStats(statsData);
      setProductStats(pStats);
    } catch (error) {
      console.error("SalesAnalytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [period]);

  const kpis = [
  { title: "Total Revenue", value: stats ? formatINR(stats.revenue) : "—", icon: <IndianRupee size={20} />, accent: "from-emerald-500 to-cyan-500", textAccent: "text-emerald-400", change: "+12.5%", up: true },
  { title: "Net Profit", value: stats ? formatINR(stats.profit) : "—", icon: <TrendingUp size={20} />, accent: "from-amber-500 to-orange-500", textAccent: "text-amber-400", change: "+15.2%", up: true },
  { title: "Avg Order Value", value: stats ? formatINR(stats.aov) : "—", icon: <Package size={20} />, accent: "from-indigo-500 to-purple-500", textAccent: "text-indigo-400", change: "+3.1%", up: true },
  { title: "Active Customers", value: stats ? (stats.active_customers ?? 0).toLocaleString() : "—", icon: <Users size={20} />, accent: "from-purple-500 to-pink-500", textAccent: "text-purple-400", change: "-2.4%", up: false },
];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Sales Analytics</h1>
          <p className="text-xtext-secondary text-sm">Deep dive into revenue metrics, customer behavior, and transaction history.</p>
        </div>
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {(['week', 'month', 'year'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                period === p ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              {p === 'week' ? '7 Days' : p === 'month' ? '30 Days' : '6 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <div key={i} className="relative group">
            <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition duration-500 bg-gradient-to-r ${kpi.accent}`} />
            <div className="bg-xcard border border-white/5 rounded-2xl p-5 relative z-10 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.accent} bg-opacity-10`} style={{background: 'rgba(255,255,255,0.05)'}}>
                  <span className={kpi.textAccent}>{kpi.icon}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${kpi.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {kpi.change}
                </div>
              </div>
              <p className="text-[10px] text-xtext-secondary font-bold uppercase tracking-wider mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-black text-white">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart — REAL DATA from API */}
        <div className="lg:col-span-2 bg-xcard border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none" />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <TrendingUp size={18} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold">Revenue Growth</h2>
            </div>
            <div className="text-xs text-xtext-secondary bg-background px-3 py-1.5 rounded-lg border border-white/5 font-bold uppercase tracking-wider">
              Live Data
            </div>
          </div>
          <div className="h-[320px] w-full relative z-10">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xtext-secondary">
                <Activity size={24} className="animate-pulse mr-3" /> Loading chart data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#10b981' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                    formatter={((value: number | string) => [formatINR(Number(value)), 'Revenue']) as any}
            
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#salesGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-xcard border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-tr-full pointer-events-none" />
          <h2 className="text-xl font-bold mb-6 relative z-10">Top Selling Items</h2>
          <div className="space-y-3 relative z-10">
            {productStats.length > 0 ? productStats.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center font-black text-white text-sm border border-white/10">
                    {i+1}
                  </div>
                  <div className="max-w-[120px]">
                    <h4 className="font-bold text-xs text-white truncate">{p.name}</h4>
                    <p className="text-[10px] text-xtext-secondary mt-0.5">{p.sales} units</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400 text-xs">{formatINR(p.revenue)}</div>
                  <div className="text-[10px] text-amber-400/80 font-medium">Profit: {formatINR(p.profit)}</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-xtext-secondary">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
