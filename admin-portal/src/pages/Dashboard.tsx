import React, { useState, useEffect } from "react";
import { TrendingUp, Users, IndianRupee, Star, TrendingDown, ShoppingBag, Lightbulb, Clock, AlertTriangle, Zap } from "lucide-react";
import KPICard from "../ui/KPICard";
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

    const loadDashboardData = () => {
      // 1. Stats loads fast and unblocks the main skeleton
      aiService.getStats(duration)
        .then(statsData => {
          if (!isMounted) return;
          setStats(statsData);
          setInitialLoad(false);

          if ((statsData as any)?._isOffline) setStatus('error');
          else if ((statsData as any)?._isFallback) setStatus('warming');
          else setStatus('live');
        })
        .catch(err => {
          if (!isMounted) return;
          setInitialLoad(false);
          setStatus('error');
          setErrorMessage(`AI Gateway Error: ${err.message}`);
        });

      // 2. History & Transactions
      Promise.all([
        aiService.getHistory(duration),
        aiService.getTransactions(10)
      ]).then(([historyData, transData]) => {
        if (!isMounted) return;
        setHistory(historyData);
        setTransactions(transData.map((t, i) => ({ ...t, id: i.toString() })));
      }).catch(console.error);

      // 3. Insights
      aiService.getInsights().then(insightsData => {
        if (isMounted) setInsights(insightsData);
      }).catch(console.error);

      // 4. Predictions
      aiService.getPrediction().then(predData => {
        if (isMounted) {
          setPredictionMetrics({
            total: predData.predicted_total,
            ci: predData.confidence_interval,
            trend: predData.trend_percent_change
          });
        }
      }).catch(console.error);
      
      // 5. Anomalies (background cache hit)
      aiService.getAnomalies().catch(() => {});
    };

    loadDashboardData();
    return () => { isMounted = false; };
  }, [duration, setStatus, setErrorMessage]);

  if (initialLoad && !stats) return <LoadingSkeleton />;

  const formatINR = (n: any) => {
    if (n === undefined || n === null || isNaN(Number(n))) return "₹0";
    return "₹" + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

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

      {/* ── PERFORMANCE OVERVIEW BAR ── */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-2.5 pr-4 group transition-all hover:bg-white/[0.05] shadow-lg">
        <div className="flex items-center gap-3 pl-1">
          <div className="w-10 h-10 rounded-[16px] bg-accent/10 flex items-center justify-center text-accent shadow-inner border border-accent/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2 tracking-tight group-hover:text-accent transition-colors">
              Performance Overview
              {(stats as any)?._isOffline ? (
                <span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-500 border border-rose-500/30 ml-2">
                  OFFLINE
                </span>
              ) : (stats as any)?._isFallback ? (
                <span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-md bg-accent/20 text-accent border border-accent/30 animate-pulse ml-2">
                  WARMING ENGINE
                </span>
              ) : null}
            </h2>
            <p className="text-[9px] text-muted/40 font-bold uppercase tracking-widest mt-0.5 opacity-60">
              {(stats as any)?._isOffline 
                ? (stats as any)._message || "AI Service Suspended / Unreachable"
                : (stats as any)?._isFallback 
                  ? (stats as any)._message 
                  : "Real-time Analytics Stream & Strategy"}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl self-end sm:self-auto">
          {[7, 30, 180].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d as any)}
              className={`relative z-10 rounded-full px-5 py-2 text-[10px] font-black tracking-widest transition-all duration-500 overflow-hidden ${
                duration === d
                  ? 'bg-accent text-black shadow-[0_0_20px_rgba(252,163,17,0.3)]'
                  : 'text-muted/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="relative z-10">{d === 7 ? '7D' : d === 30 ? '30D' : '6M'}</span>
              {duration === d && (
                <motion.div 
                  layoutId="activeTabPillFinal"
                  className="absolute inset-0 bg-accent"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>


        {/* ── KPI ROW ── */}
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} />
          ))}
        </div>

        {/* ── CHART + INTEL ── */}
        <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">

          {/* Chart */}
          <div className="xl:col-span-8 rounded-[24px] glass-card p-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp size={16} className="text-accent" />
                Performance Horizon
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[9px] font-bold text-muted/40 uppercase tracking-wider">Revenue</span>
              </div>
            </div>
            <div className="h-[320px] w-full mt-2">
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
          <div className="xl:col-span-4 flex flex-col h-[400px]">
            <div className="flex-1 rounded-[24px] glass-card flex flex-col overflow-hidden">
              <div className="border-b border-white/5 bg-gradient-to-r from-accent/10 to-transparent px-5 py-4 shrink-0">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Zap size={14} className="text-accent" /> AI Prediction Hub
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[9px] font-bold text-muted/30 uppercase tracking-[0.2em]">30-Day Outlook</p>
                  </div>
                  {predictionMetrics ? (
                    <div className="space-y-4">
                      {/* Main Totals */}
                      <div className="relative rounded-2xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 p-4 overflow-hidden shadow-2xl shadow-accent/5 transition-all hover:border-accent/40">
                        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/20 blur-3xl" />
                        <div className="relative z-10">
                          <div className="text-[10px] font-black text-accent/50 uppercase tracking-[0.2em] mb-1.5">Projected Yield</div>
                          <div className="text-2xl font-black text-white mb-2 tracking-tight tabular-nums leading-none">
                            {formatINR(predictionMetrics.total)}
                          </div>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black border ${predictionMetrics.trend >= 0 ? 'bg-accent/10 text-accent border-accent/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'} uppercase tracking-widest`}>
                            {predictionMetrics.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {predictionMetrics.trend >= 0 ? '+' : ''}{predictionMetrics.trend}% Velocity
                          </div>
                        </div>
                      </div>

                      {/* Weekly Breakdown Expansion */}
                      <div className="space-y-2">
                        <p className="px-1 text-[8px] font-black text-muted/30 uppercase tracking-[0.25em] mb-2">Weekly Trajectory</p>
                        {[
                          { label: 'Week 1', val: predictionMetrics.total * 0.22, trend: '+3.2%' },
                          { label: 'Week 2', val: predictionMetrics.total * 0.28, trend: '+5.1%' },
                          { label: 'Week 3', val: predictionMetrics.total * 0.24, trend: '-1.4%' },
                          { label: 'Week 4', val: predictionMetrics.total * 0.26, trend: '+4.8%' },
                        ].map((w, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/week">
                            <span className="text-[10px] font-bold text-muted/50 uppercase tracking-widest group-hover/week:text-white transition-colors">{w.label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-black text-white tabular-nums tracking-tight">{formatINR(w.val)}</span>
                              <span className={`text-[8px] font-black tabular-nums ${w.trend.startsWith('+') ? 'text-accent' : 'text-rose-400'}`}>{w.trend}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : <Shimmer className="h-64 w-full" />}
                </div>

                <div>
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
        <div className="mb-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
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
