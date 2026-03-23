import React, { useState, useEffect } from "react";
import { TrendingUp, Users, IndianRupee, Star, TrendingDown, ShoppingBag, Lightbulb, Clock, AlertTriangle, Zap } from "lucide-react";
import KPICard from "../ui/KPICard";
import LiveClock from "../ui/LiveClock";
import { motion } from "framer-motion";
import { useDashboard } from "../context/DashboardContext";
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
  const [initialLoad, setInitialLoad] = useState(true);

  const { duration, setDuration, setStatus, setErrorMessage } = useDashboard();

  useEffect(() => {
    let isMounted = true;
    setStatus('live'); 

    const loadDashboardData = async () => {
      try {
        const statsData = await aiService.getStats(duration);
        if (!isMounted) return;
        setStats(statsData);
        setInitialLoad(false);

        if ((statsData as any)?._isFallback) setStatus('warming');
        else setStatus('live');

        const [historyData, transData] = await Promise.all([
          aiService.getHistory(duration),
          aiService.getTransactions(10)
        ]);
        if (!isMounted) return;
        setHistory(historyData);
        setTransactions(transData.map((t, i) => ({ ...t, id: i.toString() })));

        const insightsData = await aiService.getInsights();
        if (isMounted) setInsights(insightsData);

        const predData = await aiService.getPrediction();
        if (isMounted) {
          setPredictionMetrics({
            total: predData.predicted_total,
            ci: predData.confidence_interval,
            trend: predData.trend_percent_change
          });
        }
        
        await aiService.getAnomalies().catch(() => {});

      } catch (err: any) {
        if (isMounted) {
          console.error("Dashboard Load Error:", err);
          setInitialLoad(false);
          setStatus('error');
          setErrorMessage(`AI Gateway Error: ${err.response?.data?.details || err.message}`);
        }
      }
    };

    loadDashboardData();
    return () => { isMounted = false; };
  }, [duration, setStatus, setErrorMessage]);

  if (initialLoad && !stats) return <LoadingSkeleton />;

  const formatINR = (n: number) => "₹" + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const kpis = [
    { title: "Total Revenue", value: stats ? formatINR(stats.revenue) : "₹0", icon: <IndianRupee />, delta: stats?.revenue_change },
    { title: "Net Profit", value: stats ? formatINR(stats.profit) : "₹0", icon: <TrendingUp />, delta: stats?.profit_change },
    { title: "Total Orders", value: stats?.orders.toLocaleString('en-IN') || "0", icon: <ShoppingBag />, delta: stats?.orders_change },
    { title: "Avg Order Value", value: stats ? formatINR(Math.round(stats.aov)) : "₹0", icon: <Star /> },
    { title: "Active Customers", value: stats?.active_customers.toLocaleString('en-IN') || "0", icon: <Users />, delta: stats?.customers_change },
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
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
          val === 'Completed' 
            ? 'bg-accent/10 text-accent' 
            : 'bg-white/5 text-muted/50'
        }`}>
          {val}
        </span>
      )
    },
    { header: "Time", accessor: "date", render: (val) => String(val).replace('T', ' ').split(' ')[1] || "N/A" }
  ];

  return (
    <div className="relative z-10 selection:bg-accent/30 font-sans">
      
      {/* ── CONTEXT BAR ── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="bg-black/20 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-white/5 shadow-xl flex items-center gap-4">
          <Clock size={16} className="text-muted/30" />
          <LiveClock showDate={true} />
        </div>

        <div className="flex items-center gap-2 p-1 bg-black/40 backdrop-blur-2xl rounded-[18px] border border-white/10 shadow-2xl overflow-hidden group">
          {[7, 30, 180].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d as any)}
              className={`relative z-10 rounded-[14px] px-6 py-2.5 text-[10px] font-black tracking-widest transition-all duration-500 overflow-hidden ${
                duration === d
                  ? 'bg-accent text-black shadow-[0_0_30px_rgba(252,163,17,0.4)] scale-100'
                  : 'text-muted/50 hover:text-white hover:bg-white/5 scale-95'
              }`}
            >
              <span className="relative z-10">{d === 7 ? 'WEEK' : d === 30 ? 'MONTH' : 'SEASON'}</span>
              {duration === d && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-accent"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>


        {/* ── KPI ROW ── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} />
          ))}
        </div>

        {/* ── CHART + INTEL ── */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12">

          {/* Chart */}
          <div className="xl:col-span-8 rounded-[24px] glass-card p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp size={16} className="text-accent" />
                Performance Horizon
                <span className="ml-2 text-[9px] font-bold text-muted/30 uppercase tracking-widest">Live</span>
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[9px] font-bold text-muted/40 uppercase tracking-wider">Revenue</span>
              </div>
            </div>
            <div className="h-[320px] w-full">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="proRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fca311" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#fca311" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(229,229,229,0.15)" fontSize={9} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="rgba(229,229,229,0.15)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(252,163,17,0.15)', strokeWidth: 1 }}
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
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="flex-1 rounded-[24px] glass-card flex flex-col overflow-hidden">
              <div className="border-b border-white/5 bg-gradient-to-r from-accent/10 to-transparent px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Zap size={14} className="text-accent" /> AI Prediction Hub
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div>
                  <p className="mb-3 text-[9px] font-bold text-muted/30 uppercase tracking-widest">30-Day Projection</p>
                  {predictionMetrics ? (
                    <div className="relative rounded-xl bg-black/30 border border-white/5 p-4 overflow-hidden">
                      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/10 blur-2xl" />
                      <div className="relative z-10">
                        <div className="text-2xl font-black text-white mb-1">{formatINR(predictionMetrics.total)}</div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold ${predictionMetrics.trend >= 0 ? 'text-accent' : 'text-muted/50'}`}>
                          {predictionMetrics.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {predictionMetrics.trend >= 0 ? '+' : ''}{predictionMetrics.trend}% Trend
                        </div>
                      </div>
                    </div>
                  ) : <Shimmer className="h-20 w-full" />}
                </div>

                <div>
                  <p className="mb-3 text-[9px] font-bold text-muted/30 uppercase tracking-widest">Live Anomalies</p>
                  <div className="space-y-3">
                    <div className="flex gap-3 rounded-xl bg-white/3 border border-white/5 p-3 hover:bg-white/5 transition-colors">
                      <AlertTriangle className="text-accent shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[9px] font-bold text-accent uppercase tracking-wider mb-0.5">Price Variance</p>
                        <p className="text-[11px] text-muted/60 leading-relaxed">Market variance in Home Appliances detected.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-xl bg-accent/5 border border-accent/10 p-3 hover:bg-accent/8 transition-colors">
                      <Zap className="text-accent shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[9px] font-bold text-accent uppercase tracking-wider mb-0.5">Demand Surge</p>
                        <p className="text-[11px] text-muted/60 leading-relaxed">AC sales 3× above normal—heatwave predicted.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── INTELLIGENCE GRID ── */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-[24px] glass-card p-8">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-white">
              <ShoppingBag size={16} className="text-accent" /> Demand Intelligence
            </h2>
            <p className="mb-4 border-l-2 border-accent/30 pl-3 text-xs text-muted/50 italic leading-relaxed">
              {insights?.demand || "Aggregating demand patterns..."}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {["Smart Inverter AC", "Front Load Washer", "4K Smart LED TV", "Microwave Pro"].map((prod, i) => (
                <div key={i} className="group flex flex-col gap-1 rounded-xl bg-black/20 border border-white/5 p-3 hover:bg-black/30 transition-colors">
                  <span className="text-[11px] font-bold text-white group-hover:text-accent transition-colors">{prod}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-accent" />
                    </div>
                    <span className="text-[8px] font-bold text-muted/30 uppercase">High</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] glass-card p-8">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-white">
              <Lightbulb size={16} className="text-accent" /> Business Strategy
            </h2>
            <div className="space-y-4">
              <div className="rounded-xl bg-accent/5 border border-accent/10 p-4 hover:bg-accent/8 transition-colors">
                <p className="mb-1 text-[9px] font-bold text-accent uppercase tracking-wider">Growth Vector</p>
                <p className="text-xs text-muted/70 leading-relaxed">{insights?.bi || "Determining strategic growth patterns..."}</p>
              </div>
              <div className="rounded-xl bg-white/3 border border-white/5 p-4 hover:bg-white/5 transition-colors">
                <p className="mb-1 text-[9px] font-bold text-muted/70 uppercase tracking-wider">KPI Projection</p>
                <p className="text-xs text-muted/70 leading-relaxed">{insights?.kpi_trends || "Calculating profit margin trajectories..."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRANSACTIONS ── */}
        <div className="rounded-[24px] glass-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-6 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <Clock size={16} className="text-accent" /> Ledger Stream
              </h2>
              <p className="mt-0.5 text-[9px] font-bold text-muted/30 uppercase tracking-wider">Latest Events</p>
            </div>
            <div className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-1 text-[9px] font-bold text-accent uppercase tracking-wider">
              {transactions.length} Records
            </div>
          </div>
          <div className="p-2">
            {transactions.length > 0 ? (
              <DataTable columns={transactionColumns} rows={transactions} />
            ) : (
              <div className="py-12 text-center text-[10px] font-bold text-muted/20 uppercase tracking-[0.3em] animate-pulse">
                Synchronizing Ledger Data...
              </div>
            )}
          </div>
        </div>

    </div>
  );
};

export default Dashboard;
