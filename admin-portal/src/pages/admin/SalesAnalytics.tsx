import React, { useState, useEffect } from "react";
import { TrendingUp, IndianRupee, Activity, Users, Package, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
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
    { 
      title: "Total Revenue", 
      value: stats ? formatINR(stats.revenue) : "—", 
      icon: <IndianRupee size={20} />, 
      change: stats?.revenue_change || "+0.0%", 
      up: !stats?.revenue_change?.startsWith('-') 
    },
    { 
      title: "Net Profit", 
      value: stats ? formatINR(stats.profit) : "—", 
      icon: <TrendingUp size={20} />, 
      change: stats?.profit_change || "+0.0%", 
      up: !stats?.profit_change?.startsWith('-') 
    },
    { 
      title: "Avg Order Value", 
      value: stats ? formatINR(stats.aov) : "—", 
      icon: <Package size={20} />, 
      change: stats?.orders_change || "+0.0%", 
      up: !stats?.orders_change?.startsWith('-') 
    },
    { 
      title: "Active Customers", 
      value: stats ? (stats.active_customers ?? 0).toLocaleString() : "—", 
      icon: <Users size={20} />, 
      change: stats?.customers_change || "+0.0%", 
      up: !stats?.customers_change?.startsWith('-') 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Sales <span className="text-accent">Analytics</span>
          </h1>
          <p className="text-muted/60 text-sm">Deep dive into revenue metrics and strategic growth patterns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!productStats.length) return;
              const header = "Product,Sales,Revenue,Profit,Trend\n";
              const rows = productStats.map(p => `"${p.name}",${p.sales},${p.revenue},${p.profit},"${p.trend}"`).join("\n");
              const blob = new Blob([header + rows], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `sales_analytics_${period}.csv`; a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-muted/60 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
          <div className="flex gap-1 bg-surface p-1 rounded-xl border border-white/5">
            {(['week', 'month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  period === p ? 'bg-accent text-black shadow-lg shadow-accent/10' : 'text-muted/50 hover:text-white'
                }`}
              >
                {p === 'week' ? '7D' : p === 'month' ? '30D' : '6M'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <div key={i} className="group relative overflow-hidden bg-surface border border-white/5 rounded-2xl p-5 hover:border-accent/20 transition-all duration-500 hover:shadow-xl hover:shadow-accent/5">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-accent" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/8 text-accent">
                {kpi.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${kpi.up ? 'text-accent' : 'text-muted/40'}`}>
                {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change}
              </div>
            </div>
            <p className="text-[10px] text-muted/40 font-bold uppercase tracking-[0.15em] mb-1">{kpi.title}</p>
            <h3 className="text-2xl font-black text-white tabular-nums">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-[32px] p-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20">
                <TrendingUp size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Revenue Growth</h2>
                <p className="text-[10px] text-muted/40 uppercase tracking-widest font-bold mt-1">Strategic Performance Visual</p>
              </div>
            </div>
            <div className="text-[10px] font-black text-accent bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20 uppercase tracking-widest">
              Live Flow
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted/30 uppercase text-[10px] font-bold tracking-[0.3em] animate-pulse">
                Synchronizing Ledger...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fca311" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#fca311" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#14213d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', padding: '12px' }}
                    itemStyle={{ color: '#fca311', fontWeight: 700, fontSize: '12px' }}
                    labelStyle={{ color: 'rgba(229,229,229,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                    cursor={{ stroke: 'rgba(252,163,17,0.15)', strokeWidth: 1 }}
                    formatter={((value: number | string) => [formatINR(Number(value)), 'Revenue']) as any}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#fca311" strokeWidth={3} fillOpacity={1} fill="url(#salesGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-surface border border-white/5 rounded-[32px] p-8 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Top Performers</h2>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {productStats.length > 0 ? productStats.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-accent/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center font-black text-white text-xs group-hover:border-accent/40 group-hover:bg-accent/5 transition-all">
                    {i+1}
                  </div>
                  <div className="max-w-[120px]">
                    <h4 className="font-bold text-sm text-white truncate leading-tight">{p.name}</h4>
                    <p className="text-[10px] text-muted/40 font-bold uppercase tracking-wider mt-1">{p.sales} Units Flowed</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-accent text-sm leading-tight">{formatINR(p.revenue)}</div>
                  <div className="text-[10px] text-muted/30 font-bold uppercase mt-1">Margin Flow</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-muted/20 uppercase text-[10px] font-bold tracking-widest">No Flow Detected</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
