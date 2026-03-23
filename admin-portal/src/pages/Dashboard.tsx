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
    <div className="min-h-screen bg-black text-white selection:bg-amber-400/30">
      <div className="mx-auto max-w-[1400px] px-6 py-6">

        {/* ── HEADER ── */}
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-white">
              Strategic <span className="text-[#fca311]">Insights</span>
            </h1>
            {errorStatus ? (
              <div className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-rose-400">
                <AlertTriangle size={10} /> {errorStatus}
              </div>
            ) : (stats as any)?._isFallback ? (
              <div className="flex items-center gap-1.5 rounded-full border border-[#fca311]/20 bg-[#fca311]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#fca311] animate-pulse">
                <Zap size={10} /> AI Warming Up
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#14213d] px-4 py-2">
              <LiveClock showDate={true} />
            </div>
            <div className="flex gap-1 rounded-2xl border border-white/5 bg-[#14213d] p-1">
              {[7, 30, 180].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d as any)}
                  className={`rounded-xl px-3.5 py-1.5 text-[10px] font-bold transition-all duration-300 ${
                    duration === d
                      ? 'bg-[#fca311] text-black shadow-lg shadow-[#fca311]/20'
                      : 'text-[#e5e5e5]/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {d === 7 ? '7D' : d === 30 ? '30D' : '6M'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── KPI ROW ── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} />
          ))}
        </div>

        {/* ── CHART + INTEL ── */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12">

          {/* Chart */}
          <div className="xl:col-span-8 rounded-2xl border border-white/5 bg-[#14213d] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp size={16} className="text-[#fca311]" />
                Performance Horizon
                <span className="ml-2 text-[9px] font-bold text-[#e5e5e5]/30 uppercase tracking-widest">Live</span>
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#fca311]" />
                <span className="text-[9px] font-bold text-[#e5e5e5]/40 uppercase tracking-wider">Revenue</span>
              </div>
            </div>
            <div className="h-[320px] w-full">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="proRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fca311" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#fca311" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(229,229,229,0.15)" fontSize={9} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="rgba(229,229,229,0.15)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
                      contentStyle={{ backgroundColor: '#14213d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px', fontSize: '11px' }}
                      itemStyle={{ color: '#fca311', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#fca311" strokeWidth={2.5} fillOpacity={1} fill="url(#proRev)" animationDuration={1200} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <Shimmer className="h-full w-full" />}
            </div>
          </div>

          {/* Intel Sidebar */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="flex-1 rounded-2xl border border-white/5 bg-[#14213d] flex flex-col overflow-hidden">
              <div className="border-b border-white/5 bg-gradient-to-r from-[#fca311]/10 to-transparent px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Zap size={14} className="text-[#fca311]" /> AI Prediction Hub
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div>
                  <p className="mb-3 text-[9px] font-bold text-[#e5e5e5]/30 uppercase tracking-widest">30-Day Projection</p>
                  {predictionMetrics ? (
                    <div className="relative rounded-xl bg-black/30 border border-white/5 p-4 overflow-hidden">
                      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#fca311]/10 blur-2xl" />
                      <div className="relative z-10">
                        <div className="text-2xl font-black text-white mb-1">{formatINR(predictionMetrics.total)}</div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold ${predictionMetrics.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {predictionMetrics.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {predictionMetrics.trend >= 0 ? '+' : ''}{predictionMetrics.trend}% Trend
                        </div>
                      </div>
                    </div>
                  ) : <Shimmer className="h-20 w-full" />}
                </div>

                <div>
                  <p className="mb-3 text-[9px] font-bold text-[#e5e5e5]/30 uppercase tracking-widest">Live Anomalies</p>
                  <div className="space-y-3">
                    <div className="flex gap-3 rounded-xl bg-rose-500/5 border border-rose-500/10 p-3 hover:bg-rose-500/10 transition-colors">
                      <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[9px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">Price Variance</p>
                        <p className="text-[11px] text-[#e5e5e5]/60 leading-relaxed">Market variance in Home Appliances detected.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-xl bg-[#fca311]/5 border border-[#fca311]/10 p-3 hover:bg-[#fca311]/10 transition-colors">
                      <Zap className="text-[#fca311] shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[9px] font-bold text-[#fca311] uppercase tracking-wider mb-0.5">Demand Surge</p>
                        <p className="text-[11px] text-[#e5e5e5]/60 leading-relaxed">AC sales 3× above normal—heatwave predicted.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── INTELLIGENCE GRID ── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-[#14213d] p-6">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-white">
              <ShoppingBag size={16} className="text-[#fca311]" /> Demand Intelligence
            </h2>
            <p className="mb-4 border-l-2 border-[#fca311]/30 pl-3 text-xs text-[#e5e5e5]/50 italic leading-relaxed">
              {insights?.demand || "Aggregating demand patterns..."}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {["Smart Inverter AC", "Front Load Washer", "4K Smart LED TV", "Microwave Pro"].map((prod, i) => (
                <div key={i} className="group flex flex-col gap-1 rounded-xl bg-black/20 border border-white/5 p-3 hover:bg-black/30 transition-colors">
                  <span className="text-[11px] font-bold text-white group-hover:text-[#fca311] transition-colors">{prod}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-[#fca311]" />
                    </div>
                    <span className="text-[8px] font-bold text-[#e5e5e5]/30 uppercase">High</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#14213d] p-6">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-white">
              <Lightbulb size={16} className="text-[#fca311]" /> Business Strategy
            </h2>
            <div className="space-y-4">
              <div className="rounded-xl bg-[#fca311]/5 border border-[#fca311]/10 p-4 hover:bg-[#fca311]/10 transition-colors">
                <p className="mb-1 text-[9px] font-bold text-[#fca311] uppercase tracking-wider">Growth Vector</p>
                <p className="text-xs text-[#e5e5e5]/70 leading-relaxed">{insights?.bi || "Determining strategic growth patterns..."}</p>
              </div>
              <div className="rounded-xl bg-emerald-400/5 border border-emerald-400/10 p-4 hover:bg-emerald-400/10 transition-colors">
                <p className="mb-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">KPI Projection</p>
                <p className="text-xs text-[#e5e5e5]/70 leading-relaxed">{insights?.kpi_trends || "Calculating profit margin trajectories..."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRANSACTIONS ── */}
        <div className="rounded-2xl border border-white/5 bg-[#14213d] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-6 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <Clock size={16} className="text-[#fca311]" /> Ledger Stream
              </h2>
              <p className="mt-0.5 text-[9px] font-bold text-[#e5e5e5]/30 uppercase tracking-wider">Latest Events</p>
            </div>
            <div className="rounded-lg bg-[#fca311]/10 border border-[#fca311]/20 px-3 py-1 text-[9px] font-bold text-[#fca311] uppercase tracking-wider">
              {transactions.length} Records
            </div>
          </div>
          <div className="p-2">
            {transactions.length > 0 ? (
              <DataTable columns={transactionColumns} rows={transactions} />
            ) : (
              <div className="py-12 text-center text-[10px] font-bold text-[#e5e5e5]/20 uppercase tracking-[0.3em] animate-pulse">
                Synchronizing Ledger Data...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
