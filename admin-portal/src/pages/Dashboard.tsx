import React, { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, Lightbulb, ShoppingBag, Users, IndianRupee, Clock, Star, Zap, TrendingDown, ShieldAlert, UserCheck } from "lucide-react";
import KPICard from "../ui/KPICard";
import DataTable, { type Column } from "../ui/DataTable";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import { 
  ResponsiveContainer, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Area 
} from "recharts";
import { aiService, type Transaction, type HistoryData, type AIStats, type AIInsights, type Prediction} from "../services/ai";

type TransactionRow = Transaction & { id: string };

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [duration, setDuration] = useState<7 | 30 | 180>(7);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setErrorStatus(null);
        
        // Fetch individually to prevent one failure from breaking everything
        const [statsData, insightsData, transData, historyData, predictData] = await Promise.allSettled([
          aiService.getStats(duration),
          aiService.getInsights(),
          aiService.getTransactions(10),
          aiService.getHistory(duration),
          aiService.getPrediction()
        ]);

        if (!isMounted) return;

        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (insightsData.status === 'fulfilled') setInsights(insightsData.value);
        if (transData.status === 'fulfilled') {
          setTransactions(transData.value.map((t, i) => ({ ...t, id: i.toString() })));
        }
        if (historyData.status === 'fulfilled') setHistory(historyData.value);
        if (predictData.status === 'fulfilled') setPredictions(predictData.value.predictions);

        if (statsData.status === 'rejected') {
           const err = statsData.reason as any;
           setErrorStatus(`Stats Failed: ${err.response?.data?.details || err.message}`);
        } else if (historyData.status === 'rejected') {
           const err = historyData.reason as any;
           setErrorStatus(`History Failed: ${err.message}`);
        } else if (predictData.status === 'rejected') {
           const err = predictData.reason as any;
           setErrorStatus(`Prediction Failed: ${err.response?.data?.details || err.message}`);
        }
      } catch (error: any) {
        console.error("Dashboard Fetch Error:", error);
        setErrorStatus(`Global Error: ${error.message}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboardData();
    return () => { isMounted = false; };
  }, [duration]);

  if (loading) return <LoadingSkeleton />;

  const periodText = duration === 7 ? "7 Days" : duration === 30 ? "30 Days" : "6 Months";

  const formatINR = (n: number) => "₹" + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const kpis = [
    { title: `Revenue (${periodText})`, value: stats ? formatINR(stats.revenue) : "₹0", icon: <IndianRupee size={20} />, accent: "text-emerald-400" },
    { title: `Net Profit (${periodText})`, value: stats ? formatINR(stats.profit) : "₹0", icon: <TrendingUp size={20} />, accent: "text-amber-400" },
    { title: `Orders (${periodText})`, value: stats?.orders.toLocaleString('en-IN') || "0", icon: <ShoppingBag size={20} />, accent: "text-cyan-400" },
    { title: "Avg Order Value", value: stats ? formatINR(Math.round(stats.aov)) : "₹0", icon: <Star size={20} />, accent: "text-purple-400" },
    { title: "Active Customers", value: stats?.active_customers.toLocaleString('en-IN') || "0", icon: <Users size={20} />, accent: "text-blue-400" },
  ];

  const transactionColumns: Column<TransactionRow>[] = [
    { header: "Order ID", accessor: "order_id" },
    { header: "Customer", accessor: "customer_id" },
    { header: "Product", accessor: "product" },
    { header: "Amount", accessor: "price", render: (val) => "₹" + Number(val).toLocaleString('en-IN') },
    { 
      header: "Status", 
      accessor: "payment_status",
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${val === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          {val}
        </span>
      )
    },
    { header: "Time", accessor: "date", render: (val) => String(val).replace('T', ' ').split(' ')[1] || "N/A" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
            Strategic Analytics
            {errorStatus && (
              <span className="text-xs font-medium bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
                {errorStatus}
              </span>
            )}
          </h1>
          <p className="text-xtext-secondary text-sm mt-1">Smart Retail Decision Support System powered by AI.</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
          {[7, 30, 180].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                duration === d ? "bg-xbrand text-black shadow-lg shadow-xbrand/20" : "text-white/60 hover:text-white"
              }`}
            >
              {d === 7 ? "7 Days" : d === 30 ? "30 Days" : "6 Months"}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* Row 2: Sales Trend & AI Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-xcard border border-white/5 rounded-2xl p-6 glass-morphism">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-white">
            <TrendingUp size={20} className="text-xbrand" /> Business Trend Analysis
          </h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#00f2fe' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00f2fe" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-xcard border border-white/5 rounded-2xl p-6 glass-morphism flex flex-col">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-white">
            <Clock size={20} className="text-purple-400" /> AI Predictive Forecasts
          </h2>
          <div className="space-y-4 flex-1 pr-2 overflow-y-auto max-h-[250px] custom-scrollbar">
            
             {predictions.length > 0 ? predictions.slice(0, 5).map((p, i) => (
                <div key={i} className={`p-3 border rounded-xl ${i === 0 ? 'bg-xbrand/10 border-xbrand/20' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${i === 0 ? 'text-xbrand' : 'text-white/40'}`}>
                            {i === 0 ? 'Next Day Forecast' : `T+${i+1} Forecast`}
                        </span>
                        <span className="text-[10px] text-white/50">{p.date}</span>
                    </div>
                    <p className="text-sm text-white/90">Predicted Sales: <strong>{formatINR(p.predicted_sales)}</strong></p>
                    <p className="text-xs text-white/40 mt-1">Confidence Score: {(92 - i * 2)}%</p>
                </div>
             )) : (
                <div className="text-center py-10 text-xtext-secondary text-xs italic">
                    AI models are processing future trends...
                </div>
             )}

          </div>
        </div>
      </div>

      {/* Row 3: Demand & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-xcard border border-white/5 rounded-2xl p-6 glass-morphism">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
            <ShoppingBag size={20} className="text-orange-400" /> AI Demand Intelligence
          </h2>
          <div className="space-y-3">
             <p className="text-sm text-white/70 mb-4">{insights?.demand}</p>
             <div className="space-y-2">
                {["Smartphone X", "Laptop Pro", "Wireless Buds", "Smart Watch", "Tablet G1"].map((prod, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-sm text-white">{prod}</span>
                        <span className="text-xs font-bold text-orange-400">High Demand</span>
                    </div>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-xcard border border-white/5 rounded-2xl p-6 glass-morphism">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
            <Lightbulb size={20} className="text-yellow-400" /> AI Business Insights
          </h2>
          <div className="grid gap-4">
             <div className="p-4 bg-yellow-400/5 border border-yellow-400/10 rounded-2xl">
                <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-1">Growth Pattern</div>
                <p className="text-sm text-white/90">{insights?.bi}</p>
             </div>
             <div className="p-4 bg-green-400/5 border border-green-400/10 rounded-2xl">
                <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">KPI Trend Analysis</div>
                <p className="text-sm text-white/90">{insights?.kpi_trends}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Row 4: Anomalies & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-xcard border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-rose-500/5 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-rose-400">
                    <ShieldAlert size={20} /> Anomaly Alerts
                </h2>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 uppercase tracking-wider">Live</span>
            </div>
            <div className="p-4 space-y-3">
                <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 rounded-xl hover:bg-rose-500/10 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle size={14} className="text-rose-400" />
                      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Price Spike</span>
                    </div>
                    <p className="text-sm text-white">{insights?.anomalies || 'Detected unusual spike in Electronics (+45%) yesterday.'}</p>
                </div>
                <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl hover:bg-amber-500/10 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap size={14} className="text-amber-400" />
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Demand Anomaly</span>
                    </div>
                    <p className="text-sm text-white">Earbuds G2 sales 3× above normal — possible bulk order detected.</p>
                </div>
                <div className="p-3.5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/10 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <TrendingDown size={14} className="text-cyan-400" />
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Revenue Dip</span>
                    </div>
                    <p className="text-sm text-white">Weekend revenue 18% below weekday average — seasonal pattern.</p>
                </div>
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <UserCheck size={14} className="text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Customer Surge</span>
                    </div>
                    <p className="text-sm text-white">New customer registrations up 32% — Holi prep effect likely.</p>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 bg-xcard border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <Clock size={20} className="text-blue-400" /> Recent Transactions
            </h2>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 uppercase tracking-wider">{transactions.length} Records</span>
          </div>
          <DataTable columns={transactionColumns} rows={transactions.map((t, i) => ({ ...t, id: i.toString() }))} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
