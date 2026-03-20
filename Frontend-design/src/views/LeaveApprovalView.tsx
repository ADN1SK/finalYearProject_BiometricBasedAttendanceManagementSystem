import React from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../api/client';
import { User } from '../types';

export const LeaveApprovalView = ({ user }: { user: User }) => {
  const [leaveRequests, setLeaveRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchLeaveRequests = async () => {
    try {
      // Fetch only pending requests for initial view
      const res = await apiRequest('/api/leave/api/all/?status=PENDING');
      if (res.success) setLeaveRequests(res.leave_requests);
    } catch (err) {
      console.error("Failed to fetch leave requests", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await apiRequest(`/api/leave/api/manage/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (res.success) {
        alert(`Request ${status.toLowerCase()} successfully!`);
        fetchLeaveRequests();
      }
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };
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
            <span className="text-sm font-black text-amber-600">{leaveRequests.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="glass-card rounded-3xl p-10 text-center text-slate-400 font-bold border border-slate-100 italic">
            Fetching pending leave requests...
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center text-slate-400 font-bold border border-slate-100 italic">
            No pending leave requests to review.
          </div>
        ) : leaveRequests.map((leave) => (
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
                <p className="font-black text-slate-900">{leave.employee_name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Employee</p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                <p className="text-sm font-bold text-slate-700">{leave.leave_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                <p className="text-sm font-bold text-slate-700">{leave.start_date} - {leave.end_date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</p>
                <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">View Details</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                  leave.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {leave.status}
                </span>
              </div>
            </div>

            {leave.status === 'Pending' && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAction(leave.id, 'APPROVED')}
                  className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors tooltip"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleAction(leave.id, 'REJECTED')}
                  className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors tooltip"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
