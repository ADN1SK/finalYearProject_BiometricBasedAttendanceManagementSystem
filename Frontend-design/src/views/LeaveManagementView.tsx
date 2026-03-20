import React from 'react';
import { Calendar, Plus, Search, Filter, Download, User as UserIcon, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_LEAVES, MOCK_USERS } from '../mockData';

export const LeaveManagementView = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Request and track employee leave applications.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs">
          <Plus className="w-4 h-4" />
          Request Leave
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Annual Leave</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">14</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Days Left</span>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sick Leave</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">08</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Days Left</span>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Requests</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-amber-600">02</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active</span>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved Leaves</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-emerald-600">05</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">This Year</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-black text-slate-900">Your Leave History</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_LEAVES.slice(0, 5).map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 
                        leave.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{leave.type} Leave</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">{leave.startDate} - {leave.endDate}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">3 Days</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-medium text-slate-500 truncate max-w-[200px] block">{leave.reason}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                      leave.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {leave.status}
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
