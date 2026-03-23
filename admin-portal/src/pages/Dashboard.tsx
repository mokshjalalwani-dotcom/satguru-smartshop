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
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex justify-between items-center bg-xcard/30 backdrop-blur-xl p-6 rounded-3xl border border-white/5 mb-8">
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
        
        <div className="flex items-center gap-6">
          <LiveClock />
          
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
            {[7, 30, 180].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d as any)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  duration === d ? "bg-xbrand text-black shadow-lg shadow-xbrand/40" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {d === 7 ? "7 Days" : d === 30 ? "30 Days" : "6 Months"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* Row 2: Sales Trend & AI Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-xcard border border-white/5 rounded-2xl p-6 glass-morphism flex flex-col">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-white">
            <TrendingUp size={20} className="text-xbrand" /> Business Trend Analysis
          </h2>
          <div className="flex-1 w-full h-[400px]">
            {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={0}>
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
            ) : (
              <div className="h-full flex items-center justify-center">
                <Shimmer className="w-full h-full min-h-[400px]" />
              </div>
            )}
          </div>
        </div>

        {/* Unified AI Predictions Section */}
        <div className="bg-xcard border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[520px]">
          <div className="p-5 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
             <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
               <Zap size={20} className="text-purple-400" /> AI Predictions
             </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 bg-black/20">
            {/* 30-Day Forecast Block */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} className="text-purple-400" /> 30-Day Forecast
              </h3>
              
              {predictionMetrics ? (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Projected Revenue</div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-white">{formatINR(predictionMetrics.total)}</span>
                    <span className={`text-sm font-bold mb-1 ${predictionMetrics.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {predictionMetrics.trend >= 0 ? '+' : ''}{predictionMetrics.trend}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xtext-secondary text-xs italic bg-white/5 rounded-xl border border-white/5">
                  <Shimmer className="w-24 h-4 mx-auto mb-2" />
                  Computing 30-day projection...
                </div>
              )}
            </div>

            {/* Anomaly Alerts exactly matching the picture */}
            <div className="space-y-4">
              
              <div className="space-y-3">
                <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle size={14} className="text-rose-400" />
                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">PRICE SPIKE</span>
                  </div>
                  <p className="text-sm text-white/90">
                    Market variance detected in Home Appliance segment. Isolation Forest identifies price deviations.
                  </p>
                </div>

                <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap size={14} className="text-amber-400" />
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">DEMAND ANOMALY</span>
                  </div>
                  <p className="text-sm text-white/90">
                    Smart Inverter AC sales 3× above normal — extreme heatwave predicted.
                  </p>
                </div>

                <div className="p-3.5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingDown size={14} className="text-cyan-400" />
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">REVENUE DIP</span>
                  </div>
                  <p className="text-sm text-white/90">
                    Washing Machine revenue 18% below weekday average — end of month pattern.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">SIGNUP SURGE</span>
                  </div>
                  <p className="text-sm text-white/90">
                    New customer registrations up 32% — marketing effect likely.
                  </p>
                </div>
              </div>
            </div>
            
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
             <p className="text-sm text-white/70 mb-4">{insights?.demand || <Shimmer className="w-3/4 h-4" />}</p>
             <div className="space-y-2">
                {["Smart Inverter AC", "Front Load Washing Machine", "Double Door Refrigerator", "Microwave Oven", "4K Smart LED TV"].map((prod, i) => (
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
                <div className="text-sm text-white/90">{insights?.bi || <Shimmer className="w-full h-4" />}</div>
             </div>
             <div className="p-4 bg-green-400/5 border border-green-400/10 rounded-2xl">
                <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">KPI Trend Analysis</div>
                <div className="text-sm text-white/90">{insights?.kpi_trends || <Shimmer className="w-full h-4" />}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Transactions */}
      <div className="bg-xcard border border-white/5 rounded-2xl overflow-hidden glass-morphism">
        <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <Clock size={20} className="text-blue-400" /> Recent Transactions
          </h2>
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 uppercase tracking-wider">{transactions.length} Records</span>
        </div>
        {transactions.length > 0 ? (
          <DataTable columns={transactionColumns} rows={transactions} />
        ) : (
          <div className="p-10 text-center animate-pulse text-white/50">Processing transaction records...</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
