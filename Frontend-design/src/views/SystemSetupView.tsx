import React from 'react';
import { FileText, Settings, Shield, Globe, Database, Cpu, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const SystemSetupView = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Setup</h1>
          <p className="text-slate-500 mt-1 font-medium">Configure core system parameters and infrastructure settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-xs">
            <RefreshCw className="w-4 h-4" />
            Check Updates
          </button>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs">
            <Settings className="w-4 h-4" />
            Apply Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <motion.div whileHover={{ y: -5 }} className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6 hover:shadow-xl transition-all">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl w-fit">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Network Config</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Manage server endpoints, IP allowlists, and connectivity parameters.</p>
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Status</span>
              <span className="text-emerald-600">Connected</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[92%] bg-emerald-500 rounded-full" />
            </div>
          </div>
          <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            Configure <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6 hover:shadow-xl transition-all">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-3xl w-fit">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Database Sync</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Manage local and cloud database synchronization and backups.</p>
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Last Sync</span>
              <span className="text-slate-900">10m ago</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[100%] bg-primary-500 rounded-full" />
            </div>
          </div>
          <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            Manage Data <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6 hover:shadow-xl transition-all">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl w-fit">
            <Cpu className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Hardware Integration</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Configure biometric scanners and terminal hardware settings.</p>
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Devices</span>
              <span className="text-slate-900">04 Active</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[75%] bg-amber-500 rounded-full" />
            </div>
          </div>
          <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            Device Manager <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <h3 className="text-xl font-black text-slate-900">System Logs & Health</h3>
          <button className="text-primary-600 text-xs font-black uppercase tracking-widest hover:underline">View Full Logs</button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">Core Services Operational</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">All systems are running normally</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Healthy</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl text-primary-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Security Patch Applied</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Version 2.4.1 installed successfully</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied</span>
          </div>
        </div>
      </div>
    </div>
  );
};
