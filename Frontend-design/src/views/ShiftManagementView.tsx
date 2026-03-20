import React from 'react';
import { Clock, Plus, Users, ChevronRight, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../api/client';
import { User } from '../types';

export const ShiftManagementView = ({ user }: { user: User }) => {
  const [shifts, setShifts] = React.useState<any[]>([]);
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAssignModal, setShowAssignModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    user_id: '',
    shift_id: '',
    from_date: '',
    to_date: ''
  });

  const fetchData = async () => {
    try {
      if (user.role === 'ADMIN' || user.role === 'HR_OFFICER') {
        const [shiftRes, assignRes, userRes] = await Promise.all([
          apiRequest('/api/scheduling/shifts/'),
          apiRequest('/api/scheduling/assignments/'),
          apiRequest('/accounts/api/users/')
        ]);
        if (shiftRes.success) setShifts(shiftRes.shifts);
        if (assignRes.success) setAssignments(assignRes.assignments);
        if (userRes.success) setUsers(userRes.users);
      } else {
        const res = await apiRequest('/api/scheduling/my-assignments/');
        if (res.success) setAssignments(res.assignments);
      }
    } catch (err) {
      console.error("Failed to fetch scheduling data", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/api/scheduling/assignments/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setShowAssignModal(false);
        fetchData();
        alert("Shift assigned successfully!");
      }
    } catch (err: any) {
      alert(err.message || "Assignment failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {user.role === 'EMPLOYEE' ? 'My Schedule' : 'Shift Management'}
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            {user.role === 'EMPLOYEE' ? 'View your upcoming work shifts.' : 'Manage employee work schedules and shift rotations.'}
          </p>
        </div>
        {(user.role === 'ADMIN' || user.role === 'HR_OFFICER') && (
          <button 
            onClick={() => setShowAssignModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs"
          >
            <Plus className="w-4 h-4" />
            Assign Shift
          </button>
        )}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase italic">Assign Shift</h2>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Employee</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.user_id}
                  onChange={e => setFormData({...formData, user_id: e.target.value})}
                >
                  <option value="">Select Employee</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Shift</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.shift_id}
                  onChange={e => setFormData({...formData, shift_id: e.target.value})}
                >
                  <option value="">Select Shift</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">From Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none"
                    value={formData.from_date}
                    onChange={e => setFormData({...formData, from_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">To Date</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none"
                    value={formData.to_date}
                    onChange={e => setFormData({...formData, to_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 bg-slate-100 font-black text-slate-500 py-4 rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 bg-primary-600 font-black text-white py-4 rounded-2xl">Confirm</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-[2.5rem] p-12 text-center text-slate-400 font-bold border border-slate-100 italic">
          Syncing with schedule manager...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {assignments.length === 0 ? (
            <div className="glass-card rounded-[2.5rem] p-12 text-center text-slate-500 font-bold border border-slate-100 bg-slate-50/50">
              No shifts assigned yet.
            </div>
          ) : assignments.map((assign) => (
            <motion.div 
              key={assign.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-[2.5rem] p-8 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-xl transition-all bg-white/40"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{assign.shift}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-tighter italic">Active Shift</span>
                    {user.role !== 'EMPLOYEE' && <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{assign.user}</span>}
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Slot</p>
                  <p className="text-sm font-black text-slate-700 italic">{assign.time || '09:00 AM - 05:00 PM'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                  <p className="text-sm font-black text-slate-700">{assign.from_date} to {assign.to_date || 'N/A'}</p>
                </div>
              </div>

              {(user.role === 'ADMIN' || user.role === 'HR_OFFICER') && (
                <button 
                  onClick={async () => {
                    if (confirm("Delete this assignment?")) {
                      await apiRequest(`/api/scheduling/assignments/${assign.id}/`, { method: 'DELETE' });
                      fetchData();
                    }
                  }}
                  className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
