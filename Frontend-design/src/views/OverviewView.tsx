import React, { useEffect, useState } from 'react';
import { Users, Calendar, FileText, Fingerprint, Clock, AlertCircle, LayoutDashboard, CheckCircle2, XCircle, Wifi, Zap, Activity, Shield, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';
import { StatCard } from '../components/StatCard';
import { apiRequest } from '../api/client';

interface OverviewViewProps {
  user: User;
}

export const OverviewView = ({ user }: OverviewViewProps) => {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let statsEndpoint = '/api/attendance/my-stats/';
        if (user.role === 'ADMIN') statsEndpoint = '/api/attendance/admin-stats/';
        else if (user.role === 'HR_OFFICER') statsEndpoint = '/api/attendance/hr-stats/';

        const [statsRes, historyRes] = await Promise.all([
          apiRequest(statsEndpoint),
          user.role === 'EMPLOYEE' ? apiRequest('/api/attendance/my-history/') : Promise.resolve({ success: true, records: [] })
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (historyRes.success) setHistory(historyRes.records);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, user.role]);

  const renderAdminView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Staff" value={String(stats?.totalEmployees || 0)} icon={Users} colorClass="bg-blue-100 text-blue-600" delay={0.1} />
        <StatCard title="Present Today" value={String(stats?.presentToday || 0)} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" delay={0.2} />
        <StatCard title="Absent" value={String(stats?.absentToday || 0)} icon={XCircle} colorClass="bg-red-100 text-red-600" delay={0.3} />
        <StatCard title="Late Arrivals" value={String(stats?.lateToday || 0)} icon={Clock} colorClass="bg-amber-100 text-amber-600" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 bg-white/40 space-y-6 shadow-sm hover:shadow-xl transition-all">
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight border-b border-slate-100 pb-4">Core Pillars</h3>
          <div className="grid grid-cols-2 gap-4">
             {[
               { name: 'System Oversight', label: 'Monitor Performance', icon: Activity, color: 'text-primary-600', bg: 'bg-primary-50' },
               { name: 'User & Role Mgmt', label: 'Assign Permissions', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
               { name: 'Policy Config', label: 'Attendance Rules', icon: Settings, color: 'text-emerald-600', bg: 'bg-emerald-50' },
               { name: 'Workflow Mgmt', label: 'Execute Processes', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
             ].map((node, idx) => (
               <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-50 flex flex-col gap-3 group hover:border-primary-100 transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${node.bg} ${node.color} flex items-center justify-center`}>
                    <node.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{node.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold italic">{node.label}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-10 border border-primary-100 bg-primary-50/50 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 mb-2 italic">Operational Integrity</h3>
            <p className="text-slate-500 font-bold mb-8 italic text-sm">Real-time status of biometric terminals and synchronization nodes.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white p-5 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Terminal Grid</p>
                    <p className="text-xs font-black text-slate-900 italic">4 NODES ACTIVE</p>
                  </div>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">API Engine</p>
                    <p className="text-xs font-black text-slate-900 italic">OPTIMAL - 18ms</p>
                  </div>
               </div>
            </div>
            <button className="w-full mt-6 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-200 transition-all hover:bg-primary-700">
              Run Full Diagnostic
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHRView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Employees" value={String(stats?.totalEmployees || 0)} icon={Users} colorClass="bg-indigo-100 text-indigo-600" delay={0.1} />
        <StatCard title="Pending Leaves" value={String(stats?.pendingLeaves || 0)} icon={FileText} colorClass="bg-purple-100 text-purple-600" delay={0.2} />
        <StatCard title="Attendance Today" value={String(stats?.presentToday || 0)} icon={Clock} colorClass="bg-pink-100 text-pink-600" delay={0.3} />
        <StatCard title="Active Shifts" value={String(stats?.activeShifts || 0)} icon={LayoutDashboard} colorClass="bg-cyan-100 text-cyan-600" delay={0.4} />
      </div>
      <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 bg-white/40">
        <h3 className="text-xl font-black text-slate-900 mb-6 uppercase italic tracking-tight">Today's HR Summary</h3>
        <p className="text-slate-500 font-bold italic">Monitor critical staffing metrics and pending approvals at a glance.</p>
      </div>
    </div>
  );

  const renderEmployeeView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Present Days" value={String(stats?.present_days || 0)} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" delay={0.1} />
        <StatCard title="Total Hours" value={`${stats?.total_hours || 0}h`} icon={Clock} colorClass="bg-blue-100 text-blue-600" delay={0.2} />
        <StatCard title="Late Arrivals" value={String(stats?.late_count || 0)} icon={AlertCircle} colorClass="bg-amber-100 text-amber-600" delay={0.3} />
        <StatCard title="Early Exits" value={String(stats?.early_exit_count || 0)} icon={Calendar} colorClass="bg-purple-100 text-purple-600" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm bg-white/40">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-900 uppercase italic tracking-tight">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold italic">No recent activity found.</td>
                  </tr>
                ) : history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm text-slate-600 font-bold italic">{record.date}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        record.status_code === 'ON_TIME' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-black uppercase tracking-tighter">{record.type}</td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-mono font-bold">{record.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="glass-card rounded-[2.5rem] p-10 border border-primary-100 bg-primary-600 text-white shadow-2xl shadow-primary-200 relative overflow-hidden group">
           <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10">
              <Clock className="w-8 h-8 mb-6 text-primary-200" />
              <h3 className="text-2xl font-black mb-1 italic">Active Insight</h3>
              <p className="text-primary-100 text-sm font-bold mb-8 italic opacity-80">System synchronized at {stats?.month_name || 'peak efficiency'}.</p>
              <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Focus Zone</p>
                <p className="text-xl font-black italic">Attendance Fidelity</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
            {loading ? 'Initializing Core...' : `Welcome, ${user.name}!`}
          </h1>
          <p className="text-slate-500 mt-1 font-bold italic">
            Dashboard level: <span className="text-primary-600 uppercase tracking-widest ml-1">{user.role.replace('_', ' ')}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-[2.5rem] p-12 text-center text-slate-400 font-bold italic border border-slate-100">
          Fetching real-time neural stats...
        </div>
      ) : (
        <>
          {user.role === 'ADMIN' && renderAdminView()}
          {user.role === 'HR_OFFICER' && renderHRView()}
          {user.role === 'EMPLOYEE' && renderEmployeeView()}
        </>
      )}
    </div>
  );
};
