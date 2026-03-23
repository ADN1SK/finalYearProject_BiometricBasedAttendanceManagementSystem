import React from 'react';
import { Settings, Shield, Clock, Calendar, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../api/client';
import { User } from '../types';

export const PolicyConfigurationView = ({ user }: { user: User }) => {
  const [policies, setPolicies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const fetchPolicies = async () => {
    try {
      const res = await apiRequest('/api/leave/api/policies/');
      if (res.success) setPolicies(res.policies);
    } catch (err) {
      console.error("Failed to fetch policies", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPolicies();
  }, []);

  const handleUpdate = async (id: string, updates: any) => {
    try {
      setSaving(true);
      const res = await apiRequest(`/api/leave/api/policies/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (res.success) {
        fetchPolicies();
      }
    } catch (err: any) {
      alert(err.message || "Failed to update policy");
    } finally {
      setSaving(false);
    }
  };

  if (user.role === 'EMPLOYEE') {
    return (
      <div className="glass-card rounded-[2.5rem] p-12 text-center text-slate-500 font-bold border border-slate-100">
        You do not have permission to configure policies.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Policy Configuration</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Configure attendance, leave, and system-wide policies.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchPolicies}
            className="bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm text-slate-600 font-black flex items-center gap-2 uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-[2.5rem] p-12 text-center text-slate-400 font-bold italic border border-slate-100">
          Syncing with policy engine...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8 bg-white/40">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary-600" />
                  Active System Policies
                </h3>
              </div>

              <div className="space-y-6">
                {policies.length === 0 ? (
                  <p className="text-center text-slate-400 font-bold italic py-10">No policies defined.</p>
                ) : policies.map(policy => (
                  <div key={policy.id} className="p-6 bg-white/60 rounded-3xl border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900">{policy.name}</p>
                      <p className="text-xs text-slate-500 font-medium italic">{policy.description}</p>
                    </div>
                    <div className="flex items-center gap-6">
                       <input 
                        type="text" 
                        defaultValue={policy.value} 
                        onBlur={(e) => handleUpdate(policy.id, { value: e.target.value })}
                        className="w-24 bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm font-bold text-slate-900 text-center focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={policy.is_active} 
                          onChange={(e) => handleUpdate(policy.id, { is_active: e.target.checked })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-[2rem] p-8 border border-slate-100 bg-primary-50 space-y-4 shadow-inner">
              <div className="flex items-center gap-3 text-primary-700">
                <Shield className="w-6 h-6" />
                <h3 className="font-black text-lg font-primary italic">Security Context</h3>
              </div>
              <p className="text-xs text-primary-600/80 font-medium leading-relaxed italic">
                These rules govern the core operational logic of the attendance system, including biometric thresholds and grace periods.
              </p>
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-primary-100 shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Biometric Lock Active</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-primary-100 shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Real-time Validation</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-8 border border-slate-100 space-y-4">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                System Configuration
              </h4>
              <p className="text-xs text-slate-400 font-bold italic leading-relaxed">
                Changes to these policies are logged and applied immediately across all terminal synchronization cycles.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
