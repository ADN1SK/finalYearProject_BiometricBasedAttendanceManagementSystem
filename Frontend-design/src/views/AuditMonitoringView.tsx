import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, Clock, Search, Filter, Download, User as UserIcon, CheckCircle2, Activity, Zap, Database, Server, Loader2, X, ShieldAlert, TriangleAlert, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { User } from '../types';

export const AuditMonitoringView = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditResults, setAuditResults] = useState<{score: number, timestamp: string, audit_results: any[]} | null>(null);
  
  const [systemStatus, setSystemStatus] = useState({
    db: 'WAITING',
    api: '---ms',
    terminal: '--- ACTIVE',
    uptime: '---'
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/reporting/audit-logs/');
      if (res.success) setLogs(res.logs);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await apiRequest('/api/reporting/system-health/');
      if (res.success) {
        setSystemStatus({
          db: res.health.db_status,
          api: res.health.api_latency,
          terminal: res.health.active_terminals,
          uptime: res.health.uptime
        });
      }
    } catch (err) {
      console.error("Failed to fetch system health", err);
    }
  };

  const handleRunAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await apiRequest('/api/reporting/security-audit/');
      if (res.success) {
        setAuditResults(res);
        setShowAuditModal(true);
      }
    } catch (err) {
      console.error("Security audit failed", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleMitigation = (action: string) => {
    setShowAuditModal(false);
    
    // Map mitigation actions to system routes
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('permissions') || actionLower.includes('privileges')) {
      navigate('/usermanagement');
    } else if (actionLower.includes('lockdown') || actionLower.includes('policy')) {
      navigate('/policies');
    } else if (actionLower.includes('sanitization') || actionLower.includes('setup')) {
      navigate('/systemsetup');
    } else {
      // Default fallback
      navigate('/');
    }
  };

  useEffect(() => {
    if (user.role === 'ADMIN') {
      fetchLogs();
      fetchHealth();
      
      const interval = setInterval(fetchHealth, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user.role !== 'ADMIN') {
    return (
      <div className="glass-card rounded-[2.5rem] p-12 text-center text-slate-500 font-bold border border-slate-100 italic">
        Section restricted to System Administrators.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">System Oversight</h1>
          <p className="text-slate-500 mt-1 font-bold italic opacity-70 tracking-tight uppercase text-[10px]">Monitor core system performance and operational integrity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { fetchLogs(); fetchHealth(); }}
            className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-[10px]"
          >
            <Clock className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
          <button 
            onClick={handleRunAudit}
            disabled={auditLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-[10px]"
          >
            {auditLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Security Audit
          </button>
        </div>
      </div>

      {/* System Heartbeat Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Database Status', value: systemStatus.db, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'API Latency', value: systemStatus.api, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Terminals', value: systemStatus.terminal, icon: Server, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'System Uptime', value: systemStatus.uptime, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-6 border border-slate-100 bg-white flex items-center gap-4 shadow-sm"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-slate-900 italic uppercase tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl bg-white/40">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-black text-slate-900 uppercase italic tracking-tighter">Access & Activity Logs</h3>
          <div className="flex items-center gap-4 bg-white/80 border border-slate-100 px-6 py-2 rounded-2xl shadow-sm">
            <Search className="w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Filter operational events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-[10px] font-black w-48 italic placeholder:text-slate-300 uppercase tracking-widest" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">User Entity</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Operation</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Network Node</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-right font-primary text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Synthesizing operational data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center text-slate-400 font-extrabold italic uppercase text-[10px] tracking-widest opacity-50">No operational entries found.</td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/40 transition-all group border-b border-transparent hover:border-slate-100">
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black text-slate-400 italic font-mono">{new Date(log.timestamp).toLocaleString().toUpperCase()}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-900 border-4 border-slate-100 text-white rounded-2xl flex items-center justify-center text-[11px] font-black shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
                        {log.user.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-black text-slate-900 tracking-tight uppercase italic">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight italic flex items-center gap-2">
                        <Activity className="w-3 h-3 text-primary-500" />
                        {log.action}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold italic uppercase tracking-tighter opacity-80">{log.description}</p>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-primary-600">
                      <Zap className="w-3 h-3" />
                      <span className="text-[10px] font-bold font-mono tracking-widest">{log.ip_address || '127.0.0.1'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-emerald-100/50 shadow-sm shadow-emerald-50">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 
                      SECURE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Modal */}
      <AnimatePresence>
        {showAuditModal && auditResults && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowAuditModal(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-400 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="p-5 bg-primary-50 rounded-3xl w-fit"><ShieldAlert className="w-10 h-10 text-primary-600" /></div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Score</p>
                    <p className={`text-4xl font-black italic ${auditResults.score > 80 ? 'text-emerald-500' : auditResults.score > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {auditResults.score}%
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Institutional Security Audit</h2>
                  <p className="text-slate-500 font-bold italic opacity-70 tracking-tight uppercase text-[10px] mt-1">Audit synchronized at {new Date(auditResults.timestamp).toLocaleString().toUpperCase()}</p>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {auditResults.audit_results.length === 0 ? (
                    <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl flex flex-col items-center gap-3 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">No Security Vulnerabilities Detected</p>
                      <p className="text-[10px] text-emerald-600 font-bold italic">The biometric ecosystem is operating within optimal security parameters.</p>
                    </div>
                  ) : auditResults.audit_results.map((item, idx) => (
                    <div key={idx} className={`p-6 rounded-3xl border flex items-start gap-4 transition-all ${
                      item.severity === 'CRITICAL' ? 'bg-red-50 border-red-100' : 
                      item.severity === 'HIGH' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="mt-1">
                        {item.severity === 'CRITICAL' ? <ShieldAlert className="w-6 h-6 text-red-500" /> : 
                         item.severity === 'HIGH' ? <TriangleAlert className="w-6 h-6 text-amber-500" /> :
                         <Info className="w-6 h-6 text-slate-400" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${
                            item.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                            item.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                          }`}>{item.severity}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                        </div>
                        <p className="text-xs font-black text-slate-900 italic leading-snug">{item.issue}</p>
                        <button 
                          onClick={() => handleMitigation(item.action)}
                          className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 uppercase tracking-widest pt-1 hover:gap-2 transition-all"
                        >
                          {item.action} <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setShowAuditModal(false)}
                    className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] text-xs italic"
                  >
                    Acknowledge & Sync
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
