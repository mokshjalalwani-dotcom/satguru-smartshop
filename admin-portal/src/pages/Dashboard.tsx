import React, { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, Lightbulb, ShoppingBag, Users, IndianRupee, Clock, Star, Zap, TrendingDown } from "lucide-react";
import KPICard from "../ui/KPICard";
import LiveClock from "../ui/LiveClock";
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
import { aiService, type Transaction, type HistoryData, type AIStats, type AIInsights } from "../services/ai";

type TransactionRow = Transaction & { id: string };

// Inline shimmer for individual sections
const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [predictionMetrics, setPredictionMetrics] = useState<{total: number, ci: {lower: number, upper: number}, trend: number} | null>(null);

  const [duration, setDuration] = useState<7 | 30 | 180>(7);
  const [initialLoad, setInitialLoad] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Sequentialize API calls to prevent "Cold Start" memory spikes on Render Free Tier
  useEffect(() => {
    let isMounted = true;
    setErrorStatus(null);

    const loadDashboardData = async () => {
      try {
        // 1. Stats (Priority 1)
        const statsData = await aiService.getStats(duration);
        if (!isMounted) return;
        setStats(statsData);
        setInitialLoad(false);

        // Small pauses (600ms+) between calls prevent parallel CPU/RAM spikes
        await new Promise(r => setTimeout(r, 600));

        // 2. History & Transactions (Priority 2)
        const [historyData, transData] = await Promise.all([
          aiService.getHistory(duration),
          aiService.getTransactions(10)
        ]);
        if (!isMounted) return;
        setHistory(historyData);
        setTransactions(transData.map((t, i) => ({ ...t, id: i.toString() })));

        await new Promise(r => setTimeout(r, 1000));

        // 3. Insights (Non-critical)
        const insightsData = await aiService.getInsights();
        if (isMounted) setInsights(insightsData);

        await new Promise(r => setTimeout(r, 1500));

        // 4. Predictions (The heavy ML step - do last)
        const predData = await aiService.getPrediction();
        if (isMounted) {
          setPredictionMetrics({
            total: predData.predicted_total,
            ci: predData.confidence_interval,
            trend: predData.trend_percent_change
          });
        }
        
        // 5. Anomalies (Can fail silently)
        await aiService.getAnomalies().catch(() => {});

      } catch (err: any) {
        if (isMounted) {
          console.error("Dashboard Load Error:", err);
          setInitialLoad(false);
          setErrorStatus(`AI Gateway Error: ${err.response?.data?.details || err.message}`);
        }
      }
    };

    loadDashboardData();

    return () => { isMounted = false; };
  }, [duration]);

  // Show full skeleton only on very first load — after that sections render independently
  if (initialLoad && !stats) return <LoadingSkeleton />;


  const formatINR = (n: number) => "₹" + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const kpis = [
    { title: "Total Revenue", value: stats ? formatINR(stats.revenue) : "₹0", icon: <IndianRupee />, accent: "text-emerald-400", delta: stats?.revenue_change },
    { title: "Net Profit", value: stats ? formatINR(stats.profit) : "₹0", icon: <TrendingUp />, accent: "text-amber-400", delta: stats?.profit_change },
    { title: "Total Orders", value: stats?.orders.toLocaleString('en-IN') || "0", icon: <ShoppingBag />, accent: "text-cyan-400", delta: stats?.orders_change },
    { title: "Avg Order Value", value: stats ? formatINR(Math.round(stats.aov)) : "₹0", icon: <Star />, accent: "text-purple-400" },
    { title: "Active Customers", value: stats?.active_customers.toLocaleString('en-IN') || "0", icon: <Users />, accent: "text-blue-400", delta: stats?.customers_change },
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
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${val === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
          {val}
        </span>
      )
    },
    { header: "Time", accessor: "date", render: (val) => String(val).replace('T', ' ').split(' ')[1] || "N/A" }
  ];

  return (
    <div className="space-y-10 animate-fade-in max-w-[1600px] mx-auto pb-20 pt-4">
      
      {/* 🚀 HEADER UNIT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-4">
            Strategic Insights
            {errorStatus ? (
              <div className="flex items-center gap-2 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-rose-500/20">
                <AlertTriangle size={12} /> {errorStatus}
              </div>
            ) : (stats as any)?._isFallback ? (
              <div className="flex items-center gap-2 bg-xbrand/10 text-xbrand text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-xbrand/20 animate-pulse">
                <Zap size={12} /> AI Warming Up
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-500/20">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Intelligence
              </div>
            )}
          </h1>
          <p className="text-white/40 text-sm mt-1 font-medium tracking-tight">Enterprise Retail Intelligence & Decision Support</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-2xl">
           <LiveClock showDate={true} />
           <div className="h-8 w-[1px] bg-white/10 mx-2" />
           <div className="flex gap-1">
            {[7, 30, 180].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
                  duration === d ? "bg-xbrand text-black shadow-xl shadow-xbrand/20" : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {d === 7 ? "7D" : d === 30 ? "30D" : "6M"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 KPI TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* 🔮 CORE ANALYTICS ENGINE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        
        {/* Main Trend Engine */}
        <div className="xl:col-span-8 group relative overflow-hidden rounded-[32px] border border-white/5 bg-white/5 p-8 transition-all hover:border-white/10">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <TrendingUp size={24} className="text-xbrand" /> 
              Performance Horizon
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Real-time Feed</span>
            </h2>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-xbrand" />
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Revenue</span>
               </div>
            </div>
          </div>
          
          <div className="h-[420px] w-full">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="proRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#00f2fe" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                  <Tooltip 
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    contentStyle={{ backgroundColor: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
                    itemStyle={{ color: '#00f2fe', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#00f2fe" strokeWidth={4} fillOpacity={1} fill="url(#proRev)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <Shimmer className="h-full w-full" />}
          </div>
        </div>

        {/* Intelligence Stream */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           <div className="flex-1 overflow-hidden rounded-[32px] border border-white/5 bg-white/5 transition-all hover:border-white/10 flex flex-col">
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-xbrand/10 to-transparent">
                  <h2 className="text-lg font-black text-white flex items-center gap-3">
                    <Zap size={20} className="text-xbrand" /> AI Prediction Hub
                  </h2>
              </div>
              <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">30-Day Projection</p>
                    {predictionMetrics ? (
                       <div className="relative p-6 rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-xbrand/5 rounded-bl-full blur-2xl" />
                          <div className="relative z-10">
                            <div className="text-4xl font-black text-white mb-2">{formatINR(predictionMetrics.total)}</div>
                            <div className={`flex items-center gap-2 text-xs font-bold ${predictionMetrics.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                               {predictionMetrics.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                               {predictionMetrics.trend >= 0 ? '+' : ''}{predictionMetrics.trend}% Expected Trend
                            </div>
                          </div>
                       </div>
                    ) : <Shimmer className="h-28 w-full" />}
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Live Anomalies</p>
                    <div className="space-y-4">
                       <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex gap-4 transition-all hover:bg-rose-500/10">
                          <AlertTriangle className="text-rose-400 shrink-0" size={18} />
                          <div>
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Price Variance</p>
                            <p className="text-xs text-white/70 leading-relaxed">Market variance in Home Appliances. Isolation Forest identifies price deviations.</p>
                          </div>
                       </div>
                       <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4 transition-all hover:bg-amber-500/10">
                          <Zap className="text-amber-400 shrink-0" size={18} />
                          <div>
                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Demand Surge</p>
                            <p className="text-xs text-white/70 leading-relaxed">Smart Inverter AC sales 3× above normal—extreme heatwave predicted.</p>
                          </div>
                       </div>
                    </div>
                  </div>
              </div>
           </div>
        </div>
      </div>

      {/* 🧠 SECONDARY INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="rounded-[32px] border border-white/5 bg-white/5 p-8 transition-all hover:border-white/10">
            <h2 className="text-xl font-black text-white flex items-center gap-3 mb-8">
              <ShoppingBag size={24} className="text-xbrand" /> Demand Intelligence
            </h2>
            <div className="space-y-4">
                <p className="text-sm text-white/50 leading-relaxed italic border-l-2 border-xbrand/30 pl-4 py-1 mb-6">
                  {insights?.demand || "Aggregating demand patterns from historical cycles..."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Smart Inverter AC", "Front Load Washer", "4K Smart LED TV", "Microwave Pro"].map((prod, i) => (
                    <div key={i} className="flex flex-col gap-1 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 group">
                      <span className="text-xs font-black text-white group-hover:text-xbrand transition-colors">{prod}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-xbrand w-3/4 rounded-full" />
                        </div>
                        <span className="text-[10px] font-black text-white/30 uppercase">High</span>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
         </div>

         <div className="rounded-[32px] border border-white/5 bg-white/5 p-8 transition-all hover:border-white/10">
            <h2 className="text-xl font-black text-white flex items-center gap-3 mb-8">
              <Lightbulb size={24} className="text-amber-400" /> Business Strategy
            </h2>
            <div className="grid gap-6">
               <div className="p-6 rounded-2xl bg-amber-400/5 border border-amber-400/10 transition-all hover:bg-amber-400/10">
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">Growth Vector</p>
                  <p className="text-sm text-white/80 leading-relaxed">{insights?.bi || "Determining strategic growth patterns..."}</p>
               </div>
               <div className="p-6 rounded-2xl bg-emerald-400/5 border border-emerald-400/10 transition-all hover:bg-emerald-400/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">KPI Projection</p>
                  <p className="text-sm text-white/80 leading-relaxed">{insights?.kpi_trends || "Calculating profit margin trajectories..."}</p>
               </div>
            </div>
         </div>
      </div>

      {/* 💼 TRANSACTION ENGINE */}
      <div className="rounded-[32px] border border-white/5 bg-white/5 overflow-hidden transition-all hover:border-white/10">
        <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Clock size={24} className="text-blue-400" /> Ledger Stream
            </h2>
            <p className="text-xs text-white/30 mt-1 uppercase tracking-widest font-bold">Latest Operational Events</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
            {transactions.length} Active Records
          </div>
        </div>
        <div className="p-2">
          {transactions.length > 0 ? (
            <DataTable columns={transactionColumns} rows={transactions} />
          ) : (
            <div className="p-20 text-center animate-pulse text-white/20 font-black uppercase tracking-[0.5em] text-xs">
              Synchronizing Ledger Data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
