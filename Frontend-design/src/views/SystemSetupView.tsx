import React from 'react';
import { FileText, Settings, Shield, Globe, Database, Cpu, ChevronRight, RefreshCw, CheckCircle2, Zap, PlayCircle, Trash2, Download, Wifi, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../api/client';

export const SystemSetupView = () => {
  const [processing, setProcessing] = React.useState<string | null>(null);
  const [health, setHealth] = React.useState<any>(null);

  const fetchHealth = async () => {
    try {
      const res = await apiRequest('/api/reporting/system-health/');
      if (res.success) setHealth(res.health);
    } catch (err) {
      console.error("Failed to fetch system health", err);
    }
  };

  React.useEffect(() => {
    // Direct redirection for administrators as they use Django Admin "only"
    // window.location.assign(`http://${window.location.hostname}:8000/admin/accounts/workflow/`);
    // NOTE: Keep the React view for manual triggers even if sidebar redirects.
    // However, if the user navigates here, we show the controls.
    fetchHealth();
  }, []);

  const runWorkflow = async (name: string, endpoint: string) => {
    setProcessing(name);
    try {
      const res = await apiRequest(endpoint, { method: 'POST' });
      if (res.success) {
        alert(res.message);
        fetchHealth();
      }
    } catch (err: any) {
      alert(err.message || "Process execution failed");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Workflow & Setup</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Configure core parameters and execute system-wide operational workflows.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.assign(`http://${window.location.hostname}:8000/admin/accounts/workflow/`)}
            className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-[10px]"
          >
            <Shield className="w-4 h-4" />
            Django Admin
          </button>
          <button 
            onClick={fetchHealth}
            className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-[10px]"
          >
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
                { name: 'Biometric Sync', icon: Zap, desc: 'Synchronize facial embeddings across all active nodes.', endpoint: '/api/reporting/sync-biometrics/', color: 'text-amber-600', bg: 'bg-amber-50' },
                { name: 'Database Maintenance', icon: Database, desc: 'Optimize database indexes and clear temporary caches.', endpoint: '/api/reporting/system-operation/db_maintenance/', color: 'text-primary-600', bg: 'bg-primary-50' },
                { name: 'Log Sanitization', icon: Trash2, desc: 'Archive and clear audit logs older than 90 days.', endpoint: '/api/reporting/sanitize-logs/', color: 'text-red-600', bg: 'bg-red-50' },
                { name: 'System Backup', icon: Download, desc: 'Generate a full encrypted backup of current state.', endpoint: '/api/reporting/system-operation/system_backup/', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((wf, idx) => (
                <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl transition-all group">
                   <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${wf.bg} ${wf.color}`}>
                        <wf.icon className="w-6 h-6" />
                      </div>
                      <button 
                        disabled={!!processing}
                        onClick={() => runWorkflow(wf.name, wf.endpoint)}
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

        {/* Right status panel */}
        <div className="glass-card rounded-[2.5rem] p-10 border border-primary-100 bg-primary-50/50 relative overflow-hidden group">
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl" />
           <div className="relative z-10">
              <h3 className="text-2xl font-black text-slate-900 mb-2 italic">System Status</h3>
              <p className="text-slate-500 font-bold mb-8 italic text-sm opacity-80">Real-time engine telemetry and heartbeats.</p>
              
              <div className="space-y-4">
                 {[
                   { label: 'Database Grid', value: health?.db_status || 'Checking...', icon: Database },
                   { label: 'API Response', value: health?.api_latency || '...', icon: Zap },
                   { label: 'Terminal Grid', value: health?.active_terminals || '...', icon: Wifi },
                   { label: 'Engine Uptime', value: health?.uptime || '...', icon: Activity },
                 ].map((stat, idx) => (
                   <div key={idx} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-primary-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                            <stat.icon className="w-4 h-4" />
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 italic uppercase">
                        {stat.value === 'Checking...' ? <RefreshCw className="w-3 h-3 animate-spin text-primary-600"/> : stat.value}
                      </span>
                   </div>
                 ))}
              </div>

              <div className="mt-8 pt-8 border-t border-primary-100">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Sync Status</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Stable</span>
                 </div>
                 <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      className="h-full bg-primary-600"
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
