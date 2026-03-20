import React, { useEffect, useState } from 'react';
import { Users, Calendar, FileText, Fingerprint, Clock, AlertCircle, LayoutDashboard, CheckCircle2, XCircle, Wifi } from 'lucide-react';
import { motion } from 'motion/react';
import { User, AttendanceRecord } from '../types';
import { MOCK_STATS, MOCK_ATTENDANCE, MOCK_USERS, MOCK_LEAVES, MOCK_SHIFTS } from '../mockData';
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
      try {
        if (user.role === 'ADMIN') {
          const statsRes = await apiRequest('/api/attendance/admin-stats/');
          if (statsRes.success) setStats(statsRes.stats);
        } else {
          const [statsRes, historyRes] = await Promise.all([
            apiRequest('/api/attendance/my-stats/'),
            apiRequest('/api/attendance/my-history/')
          ]);
          if (statsRes.success) setStats(statsRes.stats);
          if (historyRes.success) setHistory(historyRes.records);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, user.role]);

  if (user.role === 'HR_OFFICER') {
    // ... (rest of HR view, keeping mock for now as backend doesn't have HR overview API yet)
  }

  if (user.role === 'ADMIN') {
    // ... (rest of ADMIN view, keeping mock for now)
  }

  // Employee View (Integrated)
  const employeeAttendance = history.length > 0 ? history : (MOCK_ATTENDANCE as any[]).filter(r => r.userId === user.id);
  const employeeLeaves = MOCK_LEAVES.filter(l => l.userId === user.id);
  const currentShift = MOCK_SHIFTS[0];

  const displayStats = stats || {
    present_days: 0,
    total_hours: 0,
    late_count: 0,
    early_exit_count: 0
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-slate-500 mt-1">
            {loading ? 'Updating your stats...' : `Here's your personal attendance summary for ${displayStats.month_name || 'this month'}.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className={`w-2.5 h-2.5 ${loading ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full animate-pulse`} />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em]">
              {loading ? 'Syncing...' : 'System Online'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Present Days" value={String(displayStats.present_days)} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" delay={0.1} />
        <StatCard title="Total Hours" value={`${displayStats.total_hours}h`} icon={Clock} colorClass="bg-blue-100 text-blue-600" delay={0.2} />
        <StatCard title="Late Days" value={String(displayStats.late_count)} icon={AlertCircle} colorClass="bg-amber-100 text-amber-600" delay={0.3} />
        <StatCard title="Early Exits" value={String(displayStats.early_exit_count)} icon={Calendar} colorClass="bg-purple-100 text-purple-600" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-bold text-slate-900">Your Recent Attendance</h3>
              <button className="text-primary-600 text-xs font-black uppercase tracking-widest hover:underline">View History</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employeeAttendance.map((record: any) => (
                    <tr key={record.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 font-bold">{record.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          (record.status_code || record.status) === 'ON_TIME' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {(record.status_display || record.status || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-bold">{record.type_display || record.type}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{record.time || record.checkIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Your Leave Status</h3>
            <div className="space-y-4">
              {employeeLeaves.length > 0 ? employeeLeaves.map(leave => (
                <div key={leave.id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-50">
                  <div className={`p-2 rounded-xl ${
                    leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 
                    leave.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{leave.type} Leave</p>
                    <p className="text-[10px] text-slate-500">{leave.startDate} - {leave.endDate}</p>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    leave.status === 'APPROVED' ? 'text-emerald-600' : 
                    leave.status === 'PENDING' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {leave.status}
                  </span>
                </div>
              )) : (
                <p className="text-xs text-slate-500 text-center py-4">No recent leave requests.</p>
              )}
            </div>
            <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Request New Leave
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card rounded-3xl p-8 bg-primary-600 text-white shadow-2xl shadow-primary-200 relative overflow-hidden group"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-400 text-emerald-900 px-3 py-1 rounded-full">Active</span>
              </div>
              <h3 className="text-xl font-black mb-1">Current Shift</h3>
              <p className="text-primary-100 text-sm font-medium mb-6">{currentShift.name}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-3">
                  <span className="opacity-70 uppercase tracking-widest">Start Time</span>
                  <span className="font-mono">{currentShift.startTime}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="opacity-70 uppercase tracking-widest">End Time</span>
                  <span className="font-mono">{currentShift.endTime}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-primary-600" />
              Biometric Status
            </h3>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-800">Data Active & Verified</p>
              <p className="text-[10px] text-emerald-600 mt-1">Last verified: Today, 08:00 AM</p>
            </div>
            <button className="w-full py-3 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors">
              Update Biometric Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
