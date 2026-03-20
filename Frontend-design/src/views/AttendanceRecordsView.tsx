import React from 'react';
import { Clock, Search, Filter, Download, User as UserIcon, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_ATTENDANCE, MOCK_USERS } from '../mockData';

export const AttendanceRecordsView = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Records</h1>
          <p className="text-slate-500 mt-1 font-medium">View and manage comprehensive attendance logs for all employees.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-xs">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs">
            <Calendar className="w-4 h-4" />
            Monthly Report
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by employee name or ID..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm"
          />
        </div>
        <button className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-4 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-xs shadow-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_ATTENDANCE.map((record) => {
                const user = MOCK_USERS.find(u => u.id === record.userId);
                return (
                  <tr key={record.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center font-black text-sm">
                          {user?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{user?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        <span className="text-xs font-bold text-slate-600">{record.date}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <span className="text-xs font-bold text-slate-600 font-mono">{record.checkIn}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <span className="text-xs font-bold text-slate-600 font-mono">{record.checkOut}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        record.status === 'ON_TIME' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {MOCK_ATTENDANCE.length} records</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-400 hover:text-primary-600 transition-all">Previous</button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-black shadow-lg shadow-primary-100">1</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-400 hover:text-primary-600 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
