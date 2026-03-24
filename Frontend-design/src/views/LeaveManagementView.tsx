import React from 'react';
import { Calendar, Download, CheckCircle2, XCircle, Clock, Users, UserCheck, AlertTriangle, BarChart3, RefreshCw, Settings, Save, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiRequest } from '../api/client';

const QUOTA_TYPES = [
  { key: 'annual', label: 'Annual Leave', keyword: 'annual', color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-100' },
  { key: 'sick', label: 'Medical / Sick Leave', keyword: 'medical', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { key: 'compassionate', label: 'Compassionate Leave', keyword: 'bereavement', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  { key: 'emergency', label: 'Emergency Absence', keyword: 'emergency', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
];

export const LeaveManagementView = () => {
  const [leaves, setLeaves] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [policies, setPolicies] = React.useState<any[]>([]);
  const [quotas, setQuotas] = React.useState<Record<string, number>>({});
  const [editingQuota, setEditingQuota] = React.useState<string | null>(null);
  const [savingQuota, setSavingQuota] = React.useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaveRes, policyRes] = await Promise.all([
        apiRequest('/api/leave/api/all/'),
        apiRequest('/api/leave/api/policies/')
      ]);
      if (leaveRes.success) setLeaves(leaveRes.leave_requests);
      if (policyRes.success) {
        setPolicies(policyRes.policies);
        const parsedQuotas: Record<string, number> = {};
        QUOTA_TYPES.forEach(qt => {
          const policy = policyRes.policies.find((p: any) =>
            p.name.toLowerCase().includes(qt.keyword)
          );
          if (policy) {
            const match = policy.value.match(/\d+/);
            parsedQuotas[qt.key] = match ? parseInt(match[0]) : 0;
            parsedQuotas[`${qt.key}_id`] = policy.id;
          }
        });
        setQuotas(parsedQuotas);
      }
    } catch (err) {
      console.error('Failed to fetch leave data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (leaves.length === 0) return;
    const headers = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status'];
    const rows = leaves.map(l => {
      const start = new Date(l.start_date);
      const end = new Date(l.end_date);
      const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      return [l.employee_name, l.leave_type, l.start_date, l.end_date, days, l.status];
    });
    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `leave_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  React.useEffect(() => { fetchData(); }, []);

  const handleSaveQuota = async (key: string, label: string) => {
    const policyId = quotas[`${key}_id`];
    if (!policyId) return;
    setSavingQuota(key);
    try {
      const res = await apiRequest(`/api/leave/api/policies/${policyId}/`, {
        method: 'PUT',
        body: JSON.stringify({ value: `${quotas[key]} Days` })
      });
      if (res.success) setEditingQuota(null);
    } catch (err) {
      console.error('Failed to save quota', err);
    } finally {
      setSavingQuota(null);
    }
  };

  const pending = leaves.filter(l => l.status === 'Pending').length;
  const approved = leaves.filter(l => l.status === 'Approved').length;
  const rejected = leaves.filter(l => l.status === 'Rejected').length;

  const typeBreakdown = leaves.reduce((acc: any, l) => {
    acc[l.leave_type] = (acc[l.leave_type] || 0) + 1;
    return acc;
  }, {});

  const summaryCards = [
    { label: 'Total Submissions', value: leaves.length, color: 'text-slate-900', bg: 'bg-slate-50', border: 'border-slate-100', icon: <Users className="w-5 h-5 text-slate-400" /> },
    { label: 'Awaiting HR Review', value: pending, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <Clock className="w-5 h-5 text-amber-400" /> },
    { label: 'Approved Grants', value: approved, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <UserCheck className="w-5 h-5 text-emerald-400" /> },
    { label: 'Denied Applications', value: rejected, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: <AlertTriangle className="w-5 h-5 text-red-400" /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Leave Administration</h1>
          <p className="text-slate-500 mt-1 font-bold italic opacity-70 tracking-tight uppercase text-[10px]">Institutional leave oversight, quota governance, and statistical analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm" title="Refresh data">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-600' : ''}`} />
          </button>
          <button
            onClick={handleExportReport}
            disabled={leaves.length === 0}
            className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-xs shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Institutional Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`glass-card rounded-[2rem] p-6 border ${card.border} bg-white/60 flex items-center gap-4`}>
            <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center border ${card.border} flex-shrink-0`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] italic">{card.label}</p>
              <h3 className={`text-3xl font-black tracking-tighter ${card.color}`}>{String(card.value).padStart(2, '0')}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Leave Quota Configuration */}
        <div className="lg:col-span-2 glass-card rounded-[2rem] border border-slate-100 bg-white/60 overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-slate-100 bg-white/60">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100">
              <Settings className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight italic">Leave Quota Configuration</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60 italic">Per-employee annual allocations</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {QUOTA_TYPES.map(qt => (
              <div key={qt.key} className={`flex items-center justify-between p-4 rounded-2xl border ${qt.border} ${qt.bg} gap-4`}>
                <div className="flex-1">
                  <p className={`text-[9px] font-black uppercase tracking-[0.15em] italic ${qt.color} opacity-70`}>{qt.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {editingQuota === qt.key ? (
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={quotas[qt.key] ?? ''}
                        onChange={e => setQuotas(q => ({ ...q, [qt.key]: parseInt(e.target.value) || 0 }))}
                        className="w-20 text-lg font-black bg-white border border-slate-200 rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-primary-400"
                        autoFocus
                      />
                    ) : (
                      <span className={`text-2xl font-black tracking-tighter ${qt.color}`}>
                        {quotas[qt.key] ?? '—'}
                      </span>
                    )}
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Days / Year</span>
                  </div>
                </div>

                {editingQuota === qt.key ? (
                  <button
                    onClick={() => handleSaveQuota(qt.key, qt.label)}
                    disabled={savingQuota === qt.key}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all text-[9px] font-black uppercase tracking-widest italic shadow-sm disabled:opacity-50"
                  >
                    {savingQuota === qt.key ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingQuota(qt.key)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest italic shadow-sm"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leave Type Breakdown + Recent Log */}
        <div className="lg:col-span-3 space-y-6">
          {/* Type Breakdown */}
          <div className="glass-card rounded-[2rem] border border-slate-100 bg-white/60 overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-slate-100 bg-white/60">
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                <BarChart3 className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight italic">Institutional Leave Breakdown</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              {Object.entries(typeBreakdown).length === 0 ? (
                <p className="col-span-2 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest italic py-4">No applications on record</p>
              ) : Object.entries(typeBreakdown).map(([type, count]: any) => (
                <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight italic">{type}</span>
                  <span className="text-sm font-black text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications Log (read-only for admin) */}
          <div className="glass-card rounded-[2rem] border border-slate-100 bg-white/60 overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-slate-100 bg-white/60">
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight italic">Recent Applications Log</h3>
            </div>
            <div className="overflow-y-auto max-h-64">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary-600 opacity-30" />
                </div>
              ) : leaves.length === 0 ? (
                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest italic py-10">No applications on record</p>
              ) : leaves.slice(0, 10).map(l => (
                <div key={l.id} className="flex items-center justify-between px-6 py-3 border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-50 border border-primary-100 rounded-lg flex items-center justify-center font-black text-primary-500 text-xs">
                      {(l.employee_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-800 italic uppercase tracking-tight">{l.employee_name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase opacity-60">{l.leave_type} · {l.start_date}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                    l.status === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                    l.status === 'Pending' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                    'bg-red-50 border-red-100 text-red-700'
                  }`}>
                    {l.status === 'Approved' ? <CheckCircle2 className="w-2.5 h-2.5" /> :
                     l.status === 'Pending' ? <Clock className="w-2.5 h-2.5" /> :
                     <XCircle className="w-2.5 h-2.5" />}
                    <span className="text-[8px] font-black uppercase tracking-widest italic">{l.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
