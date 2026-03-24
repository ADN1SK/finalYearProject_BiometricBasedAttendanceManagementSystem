import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Download, MoreVertical, Calendar, Clock, RefreshCw, CheckCircle2, ShieldCheck, ShieldAlert, Trash2, Shield, X, ChevronDown, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiRequest } from '../api/client';
import { AttendanceRecord } from '../types';

export const AttendanceRecordsView = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filter States
  const [filterType, setFilterType] = useState('ALL');
  const [filterVerification, setFilterVerification] = useState('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const menuRef = useRef<HTMLDivElement>(null);

  const fetchAllRecords = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/attendance/all/');
      if (res.success) {
        setRecords(res.records);
      }
    } catch (err) {
      console.error("Failed to fetch all attendance records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRecords();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateVerification = async (recordId: string, status: string) => {
    setActiveMenu(null);
    try {
      const res = await apiRequest(`/api/attendance/${recordId}/verify/`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      if (res.success) {
        setRecords(records.map(r => r.id === recordId ? { ...r, verification: res.new_status } : r));
      }
    } catch (err) {
      console.error("Failed to update verification", err);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    setActiveMenu(null);
    if (!window.confirm("Are you sure you want to permanently delete this attendance record? This action cannot be undone.")) return;
    
    try {
      const res = await apiRequest(`/api/attendance/${recordId}/delete/`, {
        method: 'DELETE'
      });
      if (res.success) {
        setRecords(records.filter(r => r.id !== recordId));
      }
    } catch (err) {
      console.error("Failed to delete record", err);
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    
    const headers = ['Date', 'Time', 'Staff Member', 'Type', 'Verification', 'Status'];
    const rows = filteredRecords.map(r => [
      r.date,
      r.time,
      r.username,
      r.type,
      r.verification || 'System Logged',
      r.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'ALL' || r.type.toUpperCase() === filterType;
    const matchesVerif = filterVerification === 'ALL' || (r.verification && r.verification.toUpperCase().includes(filterVerification) && (filterVerification !== 'VERIFIED' || !r.verification.toUpperCase().includes('UNVERIFIED')));
    
    // Simple date string comparison for YYYY-MM-DD
    const recDate = new Date(r.timestamp).toISOString().split('T')[0];
    const matchesDate = (!dateRange.start || recDate >= dateRange.start) && 
                        (!dateRange.end || recDate <= dateRange.end);

    return matchesSearch && matchesType && matchesVerif && matchesDate;
  });

  const clearFilters = () => {
    setFilterType('ALL');
    setFilterVerification('ALL');
    setDateRange({ start: '', end: '' });
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Attendance Oversight</h1>
          <p className="text-slate-500 mt-1 font-bold italic opacity-70 italic tracking-tight uppercase text-[10px]">Complete history of all biometric attendance logs across the institution.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={filteredRecords.length === 0}
          className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-xs shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Quick search by name or status..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-4 rounded-2xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs shadow-sm font-black border ${
              showFilters ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
        </div>

        {/* Advanced Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-[2rem] p-8 border border-slate-100 bg-white/60 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Log Type</label>
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-[10px] font-black uppercase italic outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ALL">All Entries</option>
                    <option value="IN">Check-Ins</option>
                    <option value="OUT">Check-Outs</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Verification Status</label>
                  <select 
                    value={filterVerification}
                    onChange={(e) => setFilterVerification(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-[10px] font-black uppercase italic outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ALL">All States</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="BYPASS">System Bypass</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range Selection</label>
                    <button onClick={clearFilters} className="text-[9px] font-black text-primary-600 uppercase hover:underline">Reset All</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="flex-1 bg-white border border-slate-100 rounded-xl py-3 px-4 text-[10px] font-black outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-slate-300 font-black">TO</span>
                    <input 
                      type="date" 
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="flex-1 bg-white border border-slate-100 rounded-xl py-3 px-4 text-[10px] font-black outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Log Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Security Vector</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-900 italic">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          {record.date}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          {record.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 font-black text-slate-400">
                          {record.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-black text-slate-800 italic uppercase tracking-tight">{record.username}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        record.type.toLowerCase().includes('in') ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                          record.verification?.includes('Verified') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                          record.verification?.includes('Bypass') ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-500'
                        }`}>
                          {record.verification?.includes('Verified') ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          <span className="text-[10px] font-black uppercase tracking-widest italic">{record.verification || 'System Logged'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        record.status.toLowerCase().includes('on time') ? 'bg-emerald-100 text-emerald-700' :
                        record.status.toLowerCase().includes('late') ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === record.id ? null : record.id)}
                        className={`p-2 rounded-xl transition-all ${activeMenu === record.id ? 'bg-primary-50 text-primary-600' : 'text-slate-300 hover:text-slate-900 hover:bg-slate-100'}`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      <AnimatePresence>
                        {activeMenu === record.id && (
                          <motion.div 
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-8 top-16 z-50 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden"
                          >
                            <div className="p-2 mb-1 border-b border-slate-50">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left px-2">Administrative Actions</p>
                            </div>
                            
                            <button 
                              onClick={() => handleUpdateVerification(record.id, 'VERIFIED')}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors text-[10px] font-black uppercase tracking-tight italic"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Mark as Verified
                            </button>
                            <button 
                              onClick={() => handleUpdateVerification(record.id, 'PENDING')}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors text-[10px] font-black uppercase tracking-tight italic"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              Flag for Review
                            </button>
                            <button 
                              onClick={() => handleUpdateVerification(record.id, 'UNVERIFIED')}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors text-[10px] font-black uppercase tracking-tight italic"
                            >
                              <Shield className="w-4 h-4" />
                              Mark as Unverified
                            </button>
                            
                            <div className="my-1 border-t border-slate-50 h-px" />
                            
                            <button 
                              onClick={() => handleDeleteRecord(record.id)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-700 transition-colors text-[10px] font-black uppercase tracking-tight italic"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete record
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <ShieldAlert className="w-12 h-12 opacity-20" />
                        <p className="font-black text-xs uppercase tracking-[0.2em] italic">No attendance records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
