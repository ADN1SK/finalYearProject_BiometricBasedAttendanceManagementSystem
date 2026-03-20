import React from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_LEAVES, MOCK_USERS } from '../mockData';

export const LeaveApprovalView = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leave Approval</h1>
          <p className="text-slate-500 mt-1 font-medium">Review and manage employee leave requests.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Requests</span>
            <span className="text-sm font-black text-amber-600">{MOCK_LEAVES.filter(l => l.status === 'PENDING').length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_LEAVES.map((leave) => {
          const emp = MOCK_USERS.find(u => u.id === leave.userId);
          return (
            <motion.div 
              key={leave.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-slate-900">{emp?.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp?.department}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                  <p className="text-sm font-bold text-slate-700">{leave.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                  <p className="text-sm font-bold text-slate-700">{leave.startDate} - {leave.endDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</p>
                  <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{leave.reason}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                    leave.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {leave.status}
                  </span>
                </div>
              </div>

              {leave.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <button className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
