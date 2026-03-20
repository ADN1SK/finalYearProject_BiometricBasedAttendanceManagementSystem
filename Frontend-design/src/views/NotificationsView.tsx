import React from 'react';
import { Bell, Clock, CheckCircle2, AlertCircle, Info, MoreVertical, Search, Filter, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../api/client';
export const NotificationsView = () => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest('/api/reporting/my-notifications/');
      if (res.success) setNotifications(res.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Stay updated with the latest system alerts and messages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchNotifications}
            className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm"
          />
        </div>
        <button className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-4 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-xs shadow-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="glass-card rounded-[2.5rem] p-12 text-center text-slate-400 font-bold italic border border-slate-100">
            Fetching system alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] p-12 text-center text-slate-400 font-bold italic border border-slate-100">
            No new notifications.
          </div>
        ) : notifications.map((notification) => (
          <motion.div 
            key={notification.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card rounded-3xl p-6 border border-slate-100 flex items-start gap-6 hover:shadow-lg transition-all ${
              notification.status === 'UNREAD' ? 'bg-primary-50/30 border-primary-100' : ''
            }`}
          >

            <div className={`p-3 rounded-2xl ${
              notification.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 
              notification.type === 'WARNING' ? 'bg-amber-100 text-amber-600' : 
              notification.type === 'ERROR' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {notification.type === 'SUCCESS' ? <CheckCircle2 className="w-6 h-6" /> : 
               notification.type === 'WARNING' ? <AlertCircle className="w-6 h-6" /> : 
               notification.type === 'ERROR' ? <AlertCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-slate-900">{notification.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {notification.timestamp}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{notification.message}</p>
            </div>

            <button className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
              <MoreVertical className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
