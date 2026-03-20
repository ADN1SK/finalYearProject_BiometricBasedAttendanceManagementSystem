import React from 'react';
import { Settings, Shield, Clock, Calendar, AlertCircle, ChevronRight, Save, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export const PolicyConfigurationView = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Policy Configuration</h1>
          <p className="text-slate-500 mt-1 font-medium">Configure attendance, leave, and system-wide policies.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary-600" />
                Attendance Rules
              </h3>
              <button className="text-primary-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                Reset Defaults <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-900">Late Arrival Threshold</p>
                  <p className="text-xs text-slate-500 font-medium">Minutes after shift start to mark as late.</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={15} className="w-20 bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">MIN</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-900">Overtime Calculation</p>
                  <p className="text-xs text-slate-500 font-medium">Enable automatic overtime calculation.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-900">Grace Period</p>
                  <p className="text-xs text-slate-500 font-medium">Time allowed for check-in before penalty.</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={5} className="w-20 bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">MIN</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-600" />
                Leave Policies
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Annual Leave</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Days per year</span>
                  <input type="number" defaultValue={21} className="w-16 bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-900 text-center" />
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Sick Leave</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Days per year</span>
                  <input type="number" defaultValue={10} className="w-16 bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-900 text-center" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-8 border border-slate-100 bg-primary-50 space-y-4">
            <div className="flex items-center gap-3 text-primary-700">
              <Shield className="w-6 h-6" />
              <h3 className="font-black text-lg">System Security</h3>
            </div>
            <p className="text-xs text-primary-600/80 font-medium leading-relaxed">
              These policies govern how biometric data is handled and stored within the EAMS system.
            </p>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-primary-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Encryption Active</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-primary-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Audit Logging Enabled</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-8 border border-slate-100 space-y-4">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Policy History
            </h4>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-900">Updated Attendance Rules</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">March 05, 2026</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full text-primary-600 text-[10px] font-black uppercase tracking-widest hover:underline pt-2">View Full Log</button>
          </div>
        </div>
      </div>
    </div>
  );
};
