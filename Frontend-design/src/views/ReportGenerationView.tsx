import React from 'react';
import { FileText, Download, Filter, Calendar, Users, Clock, ChevronRight, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export const ReportGenerationView = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Report Generation</h1>
          <p className="text-slate-500 mt-1 font-medium">Generate and export comprehensive attendance and HR reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-xs">
            <Filter className="w-4 h-4" />
            Filter Data
          </button>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs">
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="glass-card rounded-3xl p-6 border border-slate-100 space-y-4 hover:shadow-lg transition-all">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900">Attendance Summary</h3>
          <p className="text-xs text-slate-500 font-medium">Daily, weekly, and monthly attendance trends.</p>
          <button className="w-full mt-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            Generate Report <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card rounded-3xl p-6 border border-slate-100 space-y-4 hover:shadow-lg transition-all">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
            <PieChart className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900">Leave Analytics</h3>
          <p className="text-xs text-slate-500 font-medium">Leave distribution and balance reports.</p>
          <button className="w-full mt-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            Generate Report <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card rounded-3xl p-6 border border-slate-100 space-y-4 hover:shadow-lg transition-all">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900">Late Arrivals</h3>
          <p className="text-xs text-slate-500 font-medium">Punctuality analysis and late-comer reports.</p>
          <button className="w-full mt-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            Generate Report <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card rounded-3xl p-6 border border-slate-100 space-y-4 hover:shadow-lg transition-all">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900">Departmental Stats</h3>
          <p className="text-xs text-slate-500 font-medium">Comparative analysis across departments.</p>
          <button className="w-full mt-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            Generate Report <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <h3 className="text-xl font-black text-slate-900">Recent Reports Generated</h3>
          <button className="text-primary-600 text-xs font-black uppercase tracking-widest hover:underline">View All</button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Monthly_Attendance_Report_Feb_2026.pdf</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Generated on: March 01, 2026</p>
                </div>
              </div>
              <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
