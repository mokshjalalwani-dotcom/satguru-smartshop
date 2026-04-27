import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle, Smartphone, AlertTriangle, Eye, EyeOff, RefreshCw } from "lucide-react";
import axios from "axios";

// Simple UPI ID format validator: something@something
const isValidUpiId = (id: string) => /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+$/.test(id.trim());

const StoreSettings: React.FC = () => {
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showId, setShowId] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/settings?key=upi_id");
      if (res.data?.value) setUpiId(res.data.value);
    } catch {
      // No settings yet — keep blank
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    const trimmed = upiId.trim();
    if (!trimmed) return;
    if (!isValidUpiId(trimmed)) {
      setMessage({ text: "Please enter a valid UPI ID (e.g. yourname@okaxis)", type: "error" });
      return;
    }
    try {
      setSaving(true);
      setMessage(null);
      await axios.post("/api/settings", { key: "upi_id", value: trimmed });
      setMessage({ text: "Payment QR updated! All billing screens will now use this UPI ID.", type: "success" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      const detail = err?.response?.data?.error || "Could not connect to server. Make sure the backend is running.";
      setMessage({ text: detail, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const isValid = isValidUpiId(upiId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 border-b border-white/5 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex flex-shrink-0 items-center justify-center text-accent shadow-xl">
          <Settings size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1">
            Shop <span className="text-accent">Settings</span>
          </h1>
          <p className="text-muted/60 text-sm font-medium">Set up your payment details and shop preferences.</p>
        </div>
      </div>

      <div className="bg-surface border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <h2 className="text-xl font-black text-white mb-1 flex items-center gap-3 relative z-10">
          <Smartphone className="text-accent" /> UPI Payment Setup
        </h2>
        <p className="text-muted/40 text-xs font-medium mb-6 relative z-10">
          When your staff selects "Pay by UPI" at the billing screen, customers will scan this QR code to pay.
        </p>

        <div className="space-y-6 relative z-10 max-w-xl">
          <div>
            <label className="text-xs font-black text-muted/50 uppercase tracking-widest mb-3 block">
              Your UPI ID
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type={showId ? "text" : "password"}
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveSettings()}
                  placeholder="e.g. satguru@okaxis"
                  className={`w-full bg-black/40 border rounded-2xl px-6 py-4 text-white font-bold tracking-wider placeholder:text-muted/20 focus:ring-4 focus:ring-accent/5 focus:outline-none transition-all ${
                    upiId && !isValid ? "border-rose-500/50 focus:border-rose-500/60" : "border-white/10 focus:border-accent/40"
                  }`}
                  disabled={loading}
                />
                <button
                  onClick={() => setShowId(!showId)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/30 hover:text-muted/60 transition-colors"
                  title={showId ? "Hide UPI ID" : "Show UPI ID"}
                >
                  {showId ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                onClick={fetchSettings}
                disabled={loading}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 text-muted/40 hover:text-white hover:border-white/20 transition-all"
                title="Reload saved UPI ID"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            {upiId && !isValid && (
              <p className="text-[10px] text-rose-400 font-medium mt-2 flex items-center gap-1.5">
                <AlertTriangle size={12} /> Not a valid UPI ID. It should look like: name@bankname
              </p>
            )}
            {!upiId && (
              <p className="text-[10px] text-muted/40 font-medium mt-2 flex items-start gap-1.5">
                <AlertTriangle size={13} className="text-accent flex-shrink-0 mt-0.5" />
                This ID is used to generate the QR code your customers scan to make payment. Contact your bank if you don't know your UPI ID.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
            {message ? (
              <div className={`text-xs font-black tracking-wide flex items-center gap-2 ${message.type === "success" ? "text-green-400" : "text-rose-400"}`}>
                {message.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                {message.text}
              </div>
            ) : (
              <div />
            )}

            <button
              onClick={saveSettings}
              disabled={saving || loading || !upiId.trim() || !isValid}
              className="px-8 py-3.5 bg-accent text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-xl shadow-accent/10 transition-all flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save UPI ID</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
