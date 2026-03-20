import React from 'react';
import { FileText, Settings, Shield, Globe, Database, Cpu, ChevronRight, RefreshCw, CheckCircle2, Zap, PlayCircle, Trash2, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../api/client';

export const SystemSetupView = () => {
  const [processing, setProcessing] = React.useState<string | null>(null);

  const runWorkflow = async (name: string) => {
    setProcessing(name);
    // Simulate process execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(null);
    alert(`${name} process completed successfully.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Workflow & Setup</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Configure core parameters and execute system-wide operational workflows.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <RefreshCw className="w-4 h-4" />
            Check Engine Updates
          </button>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <Settings className="w-4 h-4" />
            Save Global Config
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workflow controls */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8 bg-white/40">
           <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight border-b border-slate-100 pb-4">Operational Workflows</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Biometric Sync', icon: Zap, desc: 'Synchronize facial embeddings across all active nodes.', color: 'text-amber-600', bg: 'bg-amber-50' },
                { name: 'Database Maintenance', icon: Database, desc: 'Optimize database indexes and clear temporary caches.', color: 'text-primary-600', bg: 'bg-primary-50' },
                { name: 'Log Sanitization', icon: Trash2, desc: 'Archive and clear audit logs older than 90 days.', color: 'text-red-600', bg: 'bg-red-50' },
                { name: 'System Backup', icon: Download, desc: 'Generate a full encrypted backup of current state.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((wf, idx) => (
                <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl transition-all group">
                   <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${wf.bg} ${wf.color}`}>
                        <wf.icon className="w-6 h-6" />
                      </div>
                      <button 
                        disabled={!!processing}
                        onClick={() => runWorkflow(wf.name)}
                        className={`p-2 rounded-xl transition-all ${processing === wf.name ? 'bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-100'}`}
                      >
                        {processing === wf.name ? <RefreshCw className="w-5 h-5 animate-spin text-slate-400" /> : <PlayCircle className="w-5 h-5" />}
                      </button>
                   </div>
                   <h4 className="font-black text-slate-900 mb-1 italic">{wf.name}</h4>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">{wf.desc}</p>
                </div>
              ))}
           </div>
        </div>

        {/* System Settings Mini-panels */}
        <div className="space-y-6">
           <div className="glass-card rounded-[2rem] p-8 border border-slate-100 bg-slate-900 text-white shadow-2xl shadow-slate-200">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                   <Globe className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-black italic">Network Grid</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs font-bold border-b border-white/10 pb-3">
                    <span className="opacity-50 uppercase tracking-widest">Main Entry</span>
                    <span className="font-mono">192.168.1.100</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="opacity-50 uppercase tracking-widest">Traffic Mode</span>
                    <span className="text-emerald-400">ENCRYPTED</span>
                 </div>
              </div>
           </div>

           <div className="glass-card rounded-[2rem] p-8 border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                   <Cpu className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 italic">Hardware Shield</h3>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-4">
                 <p className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-1">Status</p>
                 <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-black text-emerald-900">4 Devices Online</span>
                 </div>
              </div>
              <button className="w-full py-3 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                Device Manager
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
