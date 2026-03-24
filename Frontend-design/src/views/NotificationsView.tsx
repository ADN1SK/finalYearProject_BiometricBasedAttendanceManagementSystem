import React from 'react';
import { Bell, Clock, CheckCircle2, AlertCircle, Info, MoreVertical, Search, Filter, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiRequest } from '../api/client';

const typeConfig: Record<string, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
  SUCCESS: { icon: <CheckCircle2 className="w-5 h-5" />, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
  WARNING: { icon: <AlertCircle className="w-5 h-5" />, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
  ERROR: { icon: <ShieldAlert className="w-5 h-5" />, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600' },
  INFO: { icon: <Info className="w-5 h-5" />, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
};

export const NotificationsView = () => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('ALL');
  const [search, setSearch] = React.useState('');
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [markingAll, setMarkingAll] = React.useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/reporting/my-notifications/');
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unread_count ?? 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await apiRequest(`/api/reporting/notifications/${id}/read/`, { method: 'POST' });
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
        setUnreadCount(c => Math.max(0, c - 1));
      }
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await apiRequest('/api/reporting/notifications/mark-all-read/', { method: 'POST' });
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
        setUnreadCount(0);
      }
    } catch (err) { console.error(err); }
    finally { setMarkingAll(false); }
  };

  const filtered = notifications.filter(n => {
    const matchesFilter = filter === 'ALL' || (filter === 'UNREAD' ? n.status === 'UNREAD' : n.type === filter);
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Notifications</h1>
          <p className="text-slate-500 mt-1 font-bold italic opacity-70 tracking-tight uppercase text-[10px]">
            Institutional alerts and system event feed.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[9px] font-black uppercase tracking-widest">
                {unreadCount} Unread
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-600' : ''}`} />
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markingAll}
            className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-xs shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {markingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Mark All Read
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'UNREAD', 'SUCCESS', 'WARNING', 'ERROR', 'INFO'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all border ${
                filter === f
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card rounded-[2.5rem] p-16 flex items-center justify-center border border-slate-100">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600 opacity-30" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] p-16 text-center border border-slate-100">
            <Bell className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p className="font-black text-[10px] uppercase tracking-[0.2em] italic text-slate-300">No notifications found</p>
          </div>
        ) : filtered.map((n, i) => {
          const cfg = typeConfig[n.type] || typeConfig.INFO;
          const isUnread = n.status === 'UNREAD';
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass-card rounded-3xl p-6 border flex items-start gap-5 transition-all hover:shadow-md group ${
                isUnread ? 'bg-primary-50/20 border-primary-100' : 'border-slate-100 bg-white/60'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0 ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                {cfg.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    {isUnread && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                    <h3 className={`font-black text-sm italic uppercase tracking-tight truncate ${isUnread ? 'text-slate-900' : 'text-slate-500'}`}>
                      {n.title}
                    </h3>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" /> {n.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{n.message}</p>
              </div>

              {isUnread && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  title="Mark as read"
                  className="p-2 rounded-xl text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
