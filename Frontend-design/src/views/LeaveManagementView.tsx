import React from 'react';
import { Calendar, Plus, Search, Filter, Download, User as UserIcon, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';
import { apiRequest } from '../api/client';

export const LeaveManagementView = ({ user }: { user: User }) => {
  const [leaves, setLeaves] = React.useState<any[]>([]);
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    leave_type: 'ANNUAL',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const fetchLeaves = async () => {
    try {
      const res = await apiRequest('/api/leave/api/my/');
      if (res.success) {
        setLeaves(res.leave_requests);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/api/leave/api/request/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setShowRequestModal(false);
        fetchLeaves();
        alert("Leave request submitted successfully!");
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit request");
    }
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Request and track employee leave applications.</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Request Leave
        </button>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-6">Request Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Leave Type</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  value={formData.leave_type}
                  onChange={e => setFormData({...formData, leave_type: e.target.value})}
                >
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="MATERNITY">Maternity</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">End Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reason</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl transition-all"
                >
                  Submit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-2 bg-white/40">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Annual Leave</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{String(summary?.annual_left ?? '--').padStart(2, '0')}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Days Left</span>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-2 bg-white/40">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sick Leave</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{String(summary?.sick_left ?? '--').padStart(2, '0')}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Days Left</span>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-2 bg-white/40">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Requests</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-amber-600">{String(summary?.pending_count ?? '--').padStart(2, '0')}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active</span>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6 border border-slate-100 space-y-2 bg-white/40">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved Leaves</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-emerald-600">{String(summary?.approved_count ?? '--').padStart(2, '0')}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</span>
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
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold">Loading...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold">No leave requests found.</td></tr>
              ) : leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                        leave.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{leave.leave_type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">{leave.start_date} - {leave.end_date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-medium text-slate-500 truncate max-w-[200px] block">View Details</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                      leave.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
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
