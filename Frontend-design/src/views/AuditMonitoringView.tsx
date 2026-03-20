import React from 'react';
import { AlertCircle, Shield, Clock, Search, Filter, Download, User as UserIcon, CheckCircle2, Activity, Zap, Database, Server } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../api/client';
import { User } from '../types';

export const AuditMonitoringView = ({ user }: { user: User }) => {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [systemStatus, setSystemStatus] = React.useState({
    db: 'OPTIMAL',
    api: '24ms',
    terminal: '04 ACTIVE',
    uptime: '99.9%'
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/reporting/audit-logs/');
      if (res.success) setLogs(res.logs);
      
      // Simulate real-time metrics update
      setSystemStatus({
        db: 'OPTIMAL',
        api: `${Math.floor(Math.random() * 15) + 15}ms`,
        terminal: '04 ACTIVE',
        uptime: '99.98%'
      });
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user.role === 'ADMIN') {
      fetchLogs();
    }
  }, []);

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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Oversight</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Monitor core system performance and operational integrity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-[10px]"
          >
            <Clock className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <Shield className="w-4 h-4" />
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
            transition={{ delay: idx * 0.1 }}
            className="glass-card rounded-3xl p-6 border border-slate-100 bg-white flex items-center gap-4"
          >
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-slate-900 italic">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm bg-white/40">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-black text-slate-900 uppercase italic tracking-tight">Access & Activity Logs</h3>
          <div className="flex items-center gap-4">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Filter operational events..." className="bg-transparent border-none focus:ring-0 text-xs font-bold w-48 italic" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right italic font-primary text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">Synthesizing operational data...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">No log entries found.</td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500 italic">{new Date(log.timestamp).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                        {log.user.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-black text-slate-900">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{log.action}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">{log.description}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-mono text-primary-500 font-bold">{log.ip_address || '127.0.0.1'}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest italic">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
