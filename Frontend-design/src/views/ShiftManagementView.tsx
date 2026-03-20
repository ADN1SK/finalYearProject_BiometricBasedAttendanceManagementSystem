import React from 'react';
import { Clock, Calendar, Users, ChevronRight, Plus, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_SHIFTS } from '../mockData';

export const ShiftManagementView = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shift Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Configure and assign employee working shifts.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs">
          <Plus className="w-4 h-4" />
          Create New Shift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SHIFTS.map((shift) => (
          <motion.div 
            key={shift.id}
            whileHover={{ y: -5 }}
            className="glass-card rounded-[2rem] p-8 border border-slate-100 space-y-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">Active</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">{shift.name}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Working Hours</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start</p>
                <p className="text-sm font-bold text-slate-900 font-mono">{shift.startTime}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">End</p>
                <p className="text-sm font-bold text-slate-900 font-mono">{shift.endTime}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">42 Employees</span>
              </div>
              <button className="text-primary-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                Edit <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
