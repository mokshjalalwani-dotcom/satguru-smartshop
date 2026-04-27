import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, User, ChevronRight, Lock, TrendingUp, Zap } from "lucide-react";

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("Moksh");

  const handleLogin = (role: 'Admin' | 'Executive') => {
    login(username, role);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-surface/40 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-surface/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-[36px] bg-gradient-to-r from-accent/20 to-surface/40 blur-lg opacity-0 group-hover:opacity-100 transition duration-700" />
          
          <div className="bg-surface border border-white/10 rounded-[32px] p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10">
            {/* Logo */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-accent rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(252,163,17,0.3)] relative">
                <Shield size={36} className="text-black" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(252,163,17,0.5)]">
                  <Zap size={10} className="text-black" />
                </div>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-1">SmartShop</h1>
              <p className="text-muted/60 text-xs uppercase tracking-[0.3em] font-bold">AI-Powered Retail Command Center</p>
            </div>

            {/* Username Input */}
            <div className="space-y-5">
              <div>
                <label className="text-[10px] text-muted/60 uppercase tracking-widest font-bold mb-2.5 block">Identity</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-accent/40 focus:shadow-[0_0_20px_rgba(252,163,17,0.1)] transition-all font-medium text-[15px]"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Role Buttons */}
              <div className="pt-2 space-y-3">
                <label className="text-[10px] text-muted/60 uppercase tracking-widest font-bold block mb-1">Select Access Level</label>
                
                <button 
                  onClick={() => handleLogin('Admin')}
                  className="w-full group bg-black/30 border border-white/10 hover:border-accent/30 rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-[0_0_15px_rgba(252,163,17,0.08)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform border border-accent/20">
                      <Shield size={22} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white leading-none text-[15px]">Boss Dashboard</p>
                      <p className="text-xs text-muted/60 mt-1.5">Full strategic control & AI analytics</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-accent transition-colors relative z-10" />
                </button>

                <button 
                  onClick={() => handleLogin('Executive')}
                  className="w-full group bg-black/30 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-[0_0_15px_rgba(229,229,229,0.03)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/3 rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-muted group-hover:scale-110 transition-transform border border-white/10">
                      <TrendingUp size={22} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white leading-none text-[15px]">Staff Portal</p>
                      <p className="text-xs text-muted/60 mt-1.5">Operational sales & inventory access</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-colors relative z-10" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-white/15 flex items-center justify-center gap-2 font-medium uppercase tracking-[0.2em]">
                <Lock size={10} /> Encrypted Access Protocol Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
