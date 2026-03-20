import React from 'react';
import { FileText, Download, Filter, Calendar, Users, ChevronRight, BarChart3, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../api/client';
import { User } from '../types';

export const ReportGenerationView = ({ user }: { user: User }) => {
  const [reportData, setReportData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/api/reporting/attendance/?start_date=${filters.start_date}&end_date=${filters.end_date}`);
      if (res.success) setReportData(res.report);
    } catch (err) {
      console.error("Failed to generate report", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user.role === 'ADMIN' || user.role === 'HR_OFFICER') {
      generateReport();
    }
  }, []);

  if (user.role === 'EMPLOYEE') {
    return (
      <div className="glass-card rounded-[2.5rem] p-12 text-center text-slate-500 font-bold border border-slate-100">
        Personal reports are visible in your Overview. System reports are restricted to HR and Admin.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reporting Center</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Generate and export detailed attendance analytics.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 border border-slate-100 shadow-sm bg-white/40">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date"
                value={filters.start_date}
                onChange={e => setFilters({...filters, start_date: e.target.value})}
                className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date"
                value={filters.end_date}
                onChange={e => setFilters({...filters, end_date: e.target.value})}
                className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              />
            </div>
          </div>
          <button 
            onClick={generateReport}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-3.5 rounded-2xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs h-[46px]"
          >
            <Filter className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reportData.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] p-12 text-center text-slate-500 font-bold border border-slate-100 bg-slate-50/50 italic">
            {loading ? 'Synthesizing report data...' : 'No data found for the selected period.'}
          </div>
        ) : (
          reportData.map((data, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[2.5rem] p-8 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-xl transition-all bg-white"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 italic font-black text-xl">
                  {data.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{data.full_name || data.username}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID: {data.username}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present Days</p>
                  <p className="text-lg font-black text-slate-900 italic">{data.summary.total_days_present}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Hours</p>
                  <p className="text-lg font-black text-primary-600">{data.summary.total_work_hours}h</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Lates</p>
                  <p className="text-lg font-black text-red-600">{data.summary.late_arrivals}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Avg Hours</p>
                  <p className="text-lg font-black text-slate-900 underline decoration-slate-200">{data.summary.average_work_hours}h/d</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
