import React, { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, Lightbulb, ShoppingBag, Users, IndianRupee, Clock, Star, Zap, TrendingDown, ShieldAlert, UserCheck, Activity } from "lucide-react";
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
import { aiService, type Transaction, type HistoryData, type AIStats, type AIInsights, type Prediction, type Anomaly } from "../services/ai";

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
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [predictionMetrics, setPredictionMetrics] = useState<{total: number, ci: {lower: number, upper: number}, trend: number} | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [duration, setDuration] = useState<7 | 30 | 180>(7);
  const [initialLoad, setInitialLoad] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Fire each API call independently — UI updates progressively as each resolves
  useEffect(() => {
    let isMounted = true;
    setErrorStatus(null);

    // Stats (fast — usually first to load)
    aiService.getStats(duration).then(data => {
      if (isMounted) { setStats(data); setInitialLoad(false); }
    }).catch(err => {
      if (isMounted) { setInitialLoad(false); setErrorStatus(`Stats: ${err.response?.data?.details || err.message}`); }
    });

    // History (chart data)
    aiService.getHistory(duration).then(data => {
      if (isMounted) setHistory(data);
    }).catch(() => {});

    // Transactions
    aiService.getTransactions(10).then(data => {
      if (isMounted) setTransactions(data.map((t, i) => ({ ...t, id: i.toString() })));
    }).catch(() => {});

    // Insights
    aiService.getInsights().then(data => {
      if (isMounted) setInsights(data);
    }).catch(() => {});

    // Predictions (can be slow — AI model inference)
    aiService.getPrediction().then(data => {
      if (isMounted) {
        setPredictions(data.predictions);
        setPredictionMetrics({
          total: data.predicted_total,
          ci: data.confidence_interval,
          trend: data.trend_percent_change
        });
      }
    }).catch(err => {
      if (isMounted) setErrorStatus(prev => prev || `Prediction: ${err.response?.data?.details || err.message}`);
    });

    // Anomalies
    aiService.getAnomalies().then(data => {
      if (isMounted) setAnomalies(data.anomalies || []);
    }).catch(() => {});

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

  // --- Build weekly breakdown from 30-day daily forecasts ---
  const weeklyBreakdown = (() => {
    if (predictions.length === 0) return [];
    const weeks: { label: string; total: number }[] = [];
    for (let w = 0; w < 4; w++) {
      const slice = predictions.slice(w * 7, (w + 1) * 7);
      if (slice.length === 0) break;
      const startDate = slice[0].date.slice(5);
      const endDate = slice[slice.length - 1].date.slice(5);
      weeks.push({
        label: `${startDate} → ${endDate}`,
        total: slice.reduce((s, p) => s + p.predicted_revenue, 0),
      });
    }
    const remainder = predictions.slice(28);
    if (remainder.length > 0 && weeks.length >= 4) {
      weeks[3].total += remainder.reduce((s, p) => s + p.predicted_revenue, 0);
    }
    return weeks;
  })();

  const maxWeekly = Math.max(...weeklyBreakdown.map(w => w.total), 1);

  // --- Helper for anomaly display ---
  const getAnomalyStyle = (anomaly: Anomaly) => {
    const sev = anomaly.severity || 'WARNING';
    const aType = anomaly.type || '';
    if (sev === 'CRITICAL') return { bg: 'bg-rose-500/5', border: 'border-rose-500/20', icon: <AlertTriangle size={14} className="text-rose-400" />, label: 'text-rose-400', tagBg: 'CRITICAL' };
    if (aType.includes('multivariate')) return { bg: 'bg-amber-500/5', border: 'border-amber-500/20', icon: <Zap size={14} className="text-amber-400" />, label: 'text-amber-400', tagBg: 'PATTERN' };
    return { bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', icon: <Activity size={14} className="text-cyan-400" />, label: 'text-cyan-400', tagBg: 'WARNING' };
  };

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
            {history.length > 0 ? (
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
            ) : (
              <div className="h-full flex items-center justify-center">
                <Shimmer className="w-full h-[280px]" />
              </div>
            )}
          </div>
        </div>

        {/* AI 30-Day Forecast */}
        <div className="bg-xcard border border-white/5 rounded-2xl p-6 glass-morphism flex flex-col">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
            <Clock size={20} className="text-purple-400" /> AI 30-Day Forecast
          </h2>
          
          {predictionMetrics && (
             <div className="mb-5 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
               <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Projected Revenue — Next 30 Days</div>
               <div className="flex items-end gap-2">
                 <span className="text-2xl font-black text-white">{formatINR(predictionMetrics.total)}</span>
                 <span className={`text-sm font-bold mb-1 ${predictionMetrics.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {predictionMetrics.trend >= 0 ? '+' : ''}{predictionMetrics.trend}%
                 </span>
               </div>
               <div className="text-xs text-white/50 mt-1">
                 CI: {formatINR(predictionMetrics.ci.lower)} – {formatINR(predictionMetrics.ci.upper)}
               </div>
             </div>
          )}

          {/* Weekly Breakdown Bars */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] custom-scrollbar pr-1">
            {weeklyBreakdown.length > 0 ? weeklyBreakdown.map((week, i) => (
              <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Week {i + 1}
                  </span>
                  <span className="text-xs text-white/50">{week.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${(week.total / maxWeekly) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white min-w-[80px] text-right">{formatINR(week.total)}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-xtext-secondary text-xs italic">
                  AI models are computing 30-day projections...
              </div>
            )}

            {predictionMetrics && (
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl mt-2">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Model Confidence</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-400" style={{ width: '88%' }} />
                  </div>
                  <span className="text-xs font-bold text-indigo-400">88%</span>
                </div>
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
        {/* Anomaly Alerts — fetched from /anomalies API */}
        <div className="bg-xcard border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-rose-500/5 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-rose-400">
                    <ShieldAlert size={20} /> Anomaly Alerts
                </h2>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 uppercase tracking-wider">
                  {anomalies.length > 0 ? `${anomalies.length} Found` : 'Live'}
                </span>
            </div>
            <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                {anomalies.length > 0 ? anomalies.slice(0, 8).map((anomaly, i) => {
                  const style = getAnomalyStyle(anomaly);
                  return (
                    <div key={i} className={`p-3.5 ${style.bg} border ${style.border} rounded-xl hover:brightness-110 transition-all`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        {style.icon}
                        <span className={`text-[10px] ${style.label} font-bold uppercase tracking-widest`}>{style.tagBg}</span>
                        {anomaly.date && <span className="text-[10px] text-white/30 ml-auto">{anomaly.date}</span>}
                      </div>
                      <p className="text-sm text-white">
                        <strong>{anomaly.product || 'System'}</strong>
                        {anomaly.reason ? ` — ${anomaly.reason}` : anomaly.sales ? ` — ${anomaly.sales} units at ₹${anomaly.price?.toLocaleString('en-IN')}` : ' — Unusual pattern detected'}
                      </p>
                    </div>
                  );
                }) : (
                  <>
                    <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <UserCheck size={14} className="text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">System Health</span>
                      </div>
                      <p className="text-sm text-white">No anomalies detected — all metrics within normal range.</p>
                    </div>
                    <div className="p-3.5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Activity size={14} className="text-cyan-400" />
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">AI Engine</span>
                      </div>
                      <p className="text-sm text-white">Isolation Forest model actively monitoring transactions for price/volume outliers.</p>
                    </div>
                    <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <TrendingDown size={14} className="text-indigo-400" />
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Z-Score Monitor</span>
                      </div>
                      <p className="text-sm text-white">Daily revenue Z-Score analysis running — no outliers beyond 3σ threshold.</p>
                    </div>
                  </>
                )}
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
