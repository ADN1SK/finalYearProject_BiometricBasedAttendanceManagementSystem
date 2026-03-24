import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Clock, AlertCircle, RefreshCw, X, Check, Trash2, Edit2, Save, Plus, 
  ShieldCheck, Lock, Activity, Scale, Trophy, Globe, Plane, AlertTriangle, Coffee, Info,
  Fingerprint, Bell, DollarSign, ShieldAlert, HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiRequest } from '../api/client';
import { User } from '../types';

export const PolicyConfigurationView = ({ user }: { user: User }) => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ 
    name: '', 
    category: 'ATTENDANCE',
    urgency: 'MEDIUM',
    description: '', 
    value: '0', 
    is_active: true, 
    rules: [] as string[] 
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [globalConfig, setGlobalConfig] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');

  const URGENCY_MAP: any = {
    EXTREME: { color: 'bg-rose-600 animate-pulse', text: 'text-white', label: 'Extreme', icon: AlertTriangle },
    CRITICAL: { color: 'bg-red-500', text: 'text-white', label: 'Critical', icon: Lock },
    HIGH: { color: 'bg-orange-500', text: 'text-white', label: 'High', icon: AlertCircle },
    MEDIUM: { color: 'bg-blue-500', text: 'text-white', label: 'Standard', icon: Info },
    LOW: { color: 'bg-slate-400', text: 'text-white', label: 'Low', icon: Check },
    OPTIONAL: { color: 'bg-emerald-400', text: 'text-white', label: 'Optional', icon: Coffee },
  };

  const CATEGORY_MAP: any = {
    ATTENDANCE: { icon: Clock, label: 'Attendance' },
    BIOMETRIC: { icon: Fingerprint, label: 'Biometric Enrollment' },
    NOTIFICATION: { icon: Bell, label: 'Notification' },
    LEAVE: { icon: ShieldCheck, label: 'Leave' },
    HR_ADMIN: { icon: Settings, label: 'HR Admin' },
    PAY_BENEFITS: { icon: DollarSign, label: 'Pay/Benefits' },
    SAFETY: { icon: ShieldAlert, label: 'Safety' },
    HEALTH_WELFARE: { icon: HeartPulse, label: 'Health & Welfare' },
    ETHICS: { icon: Scale, label: 'Ethics' },
  };

  const fetchPolicies = async () => {
    try {
      const res = await apiRequest('/api/leave/api/policies/');
      if (res.success) setPolicies(res.policies);
    } catch (err) {
      console.error("Failed to fetch policies", err);
    }
  };

  const fetchGlobalConfig = async () => {
    try {
      const res = await apiRequest('/api/reporting/global-config/');
      if (res.success) setGlobalConfig(res.config);
    } catch (err) {
      console.error("Failed to fetch global config", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPolicies(),
      fetchGlobalConfig()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
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

  const handleCreateSubmit = async () => {
    if (!newPolicy.name.trim()) return alert("Policy name is required.");
    try {
      setSaving(true);
      const res = await apiRequest(`/api/leave/api/policies/`, {
        method: 'POST',
        body: JSON.stringify(newPolicy)
      });
      if (res.success) {
        setIsCreating(false);
        setNewPolicy({ name: '', description: '', value: '0', is_active: false });
        fetchPolicies();
      }
    } catch (err: any) {
      alert(err.message || "Failed to create policy");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    try {
      setSaving(true);
      const res = await apiRequest(`/api/leave/api/policies/${id}/`, {
        method: 'DELETE'
      });
      if (res.success || res.status === 200) {
        fetchPolicies();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete policy");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (id: string) => {
    await handleUpdate(id, editForm);
    setEditingId(null);
  };

  const addRuleToNew = () => {
    if (!newRuleInput.trim()) return;
    setNewPolicy({ ...newPolicy, rules: [...newPolicy.rules, newRuleInput.trim()] });
    setNewRuleInput('');
  };

  const removeRuleFromNew = (index: number) => {
    const updated = [...newPolicy.rules];
    updated.splice(index, 1);
    setNewPolicy({ ...newPolicy, rules: updated });
  };

  const renderRulesFormal = (rules: any) => {
    if (!rules) return <p className="text-xs text-slate-400 italic">No specific rules defined.</p>;
    
    // Handle Case where rules is an array
    if (Array.isArray(rules)) {
      if (rules.length === 0) return <p className="text-xs text-slate-400 italic">No specific rules defined.</p>;
      return (
        <ul className="space-y-2">
          {rules.map((rule: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-slate-700 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1 shrink-0" />
              {rule}
            </li>
          ))}
        </ul>
      );
    }

    // Handle Case where rules is an object (Key-Value)
    return (
      <div className="space-y-2">
        {Object.entries(rules).map(([key, val]: [string, any], i: number) => (
          <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
            <span className="text-xs font-bold text-primary-700">{String(val)}</span>
          </div>
        ))}
      </div>
    );
  };

  const handleUpdateGlobalConfig = async (updates: any) => {
    // Safety check for critical toggles
    if (updates.hasOwnProperty('biometric_lock_active') && !updates.biometric_lock_active) {
      if (!window.confirm("CRITICAL SECURITY WARNING: Deactivating the Biometric Lock will allow check-ins WITHOUT facial verification. This should only be done for maintenance. Do you wish to proceed?")) {
        return;
      }
    }

    try {
      setSaving(true);
      const res = await apiRequest('/api/reporting/global-config/update/', {
        method: 'POST',
        body: JSON.stringify(updates)
      });
      if (res.success) {
        fetchGlobalConfig();
      }
    } catch (err: any) {
      alert(err.message || "Failed to update global config");
    } finally {
      setSaving(false);
    }
  };

  const getSecurityPulse = () => {
    if (!globalConfig) return { color: 'bg-slate-300', label: 'Offline', score: 0 };
    const activeCount = [globalConfig.biometric_lock_active, globalConfig.real_time_validation].filter(Boolean).length;
    if (activeCount === 2) return { color: 'bg-emerald-500', label: 'Maximum Protection', score: 100 };
    if (activeCount === 1) return { color: 'bg-amber-500', label: 'Elevated Risk', score: 50 };
    return { color: 'bg-rose-500', label: 'Vulnerable', score: 10 };
  };

  const secPulse = getSecurityPulse();

  const filteredPolicies = (policies || []).filter(p => {
    const catMatch = filterCategory === 'ALL' || p.category === filterCategory;
    const urgMatch = filterUrgency === 'ALL' || p.urgency === filterUrgency;
    return catMatch && urgMatch;
  });

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
            onClick={() => setIsCreating(true)}
            disabled={saving || isCreating}
            className="bg-primary-600 border border-primary-500 px-6 py-3 rounded-2xl shadow-sm text-white font-black flex items-center gap-2 uppercase tracking-widest text-[10px] hover:bg-primary-700 transition-all disabled:opacity-50"
          >
            + Add Policy
          </button>
          <button 
            onClick={loadData}
            disabled={loading}
            className="bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm text-slate-600 font-black flex items-center gap-2 uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white/50 p-4 rounded-3xl border border-slate-100 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Type:</span>
            <div className="flex gap-1.5 flex-wrap">
              {['ALL', ...Object.keys(CATEGORY_MAP)].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                >
                  {cat === 'ALL' ? 'Show All' : CATEGORY_MAP[cat]?.label || cat}
                </button>
              ))}
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority:</span>
            <div className="flex gap-1.5 flex-wrap">
              {['ALL', ...Object.keys(URGENCY_MAP)].map(urg => (
                <button 
                  key={urg}
                  onClick={() => setFilterUrgency(urg)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filterUrgency === urg ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                >
                  {urg === 'ALL' ? 'Any' : URGENCY_MAP[urg]?.label || urg}
                </button>
              ))}
            </div>
          </div>
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
                <AnimatePresence>
                  {isCreating && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      className="p-6 bg-white rounded-3xl border-2 border-primary-200 shadow-xl"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">New Policy</h4>
                          <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Basic Information */}
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Basic Info</h5>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Policy Name</label>
                              <input 
                                type="text" 
                                value={newPolicy.name} 
                                onChange={(e) => setNewPolicy({...newPolicy, name: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-900 w-full focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="e.g. Standard Shift"
                                autoFocus
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Policy Value / Threshold</label>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="text" 
                                  value={newPolicy.value} 
                                  onChange={(e) => setNewPolicy({...newPolicy, value: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                  placeholder="e.g. 8.5 Hours or 15 Mins"
                                />
                                <div className="flex items-center gap-3 shrink-0 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</span>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={newPolicy.is_active} 
                                      onChange={(e) => setNewPolicy({...newPolicy, is_active: e.target.checked})}
                                      className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                <select 
                                  value={newPolicy.category} 
                                  onChange={(e) => setNewPolicy({...newPolicy, category: e.target.value})}
                                  className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 w-full focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                >
                                  {Object.entries(CATEGORY_MAP).map(([key, val]: any) => (
                                    <option key={key} value={key}>{val.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Urgency</label>
                                <select 
                                  value={newPolicy.urgency} 
                                  onChange={(e) => setNewPolicy({...newPolicy, urgency: e.target.value})}
                                  className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 w-full focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                >
                                  {Object.entries(URGENCY_MAP).map(([key, val]: any) => (
                                    <option key={key} value={key}>{val.label} Priority</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                              <textarea 
                                value={newPolicy.description} 
                                onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-500 italic w-full h-24 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                                placeholder="Define the purpose and scope of this policy..."
                              />
                            </div>
                          </div>

                          {/* Governing Rules */}
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Policy Execution Rules</h5>
                            <div className="space-y-3">
                               <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                                 Add formal constraints that govern how this policy is calculated or applied to employees.
                               </p>
                               <div className="flex gap-2">
                                 <input 
                                   type="text" 
                                   value={newRuleInput}
                                   onChange={(e) => setNewRuleInput(e.target.value)}
                                   onKeyDown={(e) => e.key === 'Enter' && addRuleToNew()}
                                   placeholder="Add a new rule (e.g. Max 3 late entries)"
                                   className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                                 />
                                 <button 
                                   onClick={addRuleToNew}
                                   className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-primary-200/50 hover:bg-primary-700 hover:-translate-y-0.5 transition-all uppercase tracking-widest text-[9px] flex items-center gap-2"
                                 >
                                   <Plus className="w-3.5 h-3.5" /> Add Rule
                                 </button>
                               </div>

                               <div className="space-y-2 h-[155px] overflow-y-auto pr-1 mt-3 custom-scrollbar">
                                 {newPolicy.rules.length === 0 ? (
                                   <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                                     <AlertCircle className="w-5 h-5 text-slate-200 mb-2" />
                                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No Clauses Defined</span>
                                   </div>
                                 ) : newPolicy.rules.map((rule, i) => (
                                   <div key={i} className="flex items-center justify-between bg-white text-slate-700 py-3 px-4 rounded-xl text-[11px] font-bold border border-slate-100 group animate-in slide-in-from-right-2 shadow-sm">
                                     <span className="flex items-center gap-3">
                                       <div className="w-1.5 h-1.5 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                       {rule}
                                     </span>
                                     <button onClick={() => removeRuleFromNew(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                                       <X className="w-4 h-4" />
                                     </button>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-8 mt-6 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-2xl">
                              <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-900 font-black uppercase tracking-[0.15em]">Security Validation Passed</p>
                              <p className="text-[9px] text-slate-400 font-bold italic">Policy will be synchronized across all biometric terminals.</p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <button 
                              onClick={() => setIsCreating(false)}
                              className="px-6 py-3 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                            >
                              Discard
                            </button>
                            <button 
                              onClick={handleCreateSubmit}
                              disabled={saving}
                              className="bg-slate-900 text-white px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 hover:-translate-y-1 active:translate-y-0"
                            >
                              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                              Authorize & Deploy
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isCreating && filteredPolicies.length === 0 ? (
                  <p className="text-center text-slate-400 font-bold italic py-10">No policies match your filters.</p>
                ) : filteredPolicies.map(policy => {
                  const isEditing = editingId === policy.id;
                  const isExpanded = expandedId === policy.id;
                  
                  return (
                  <div key={policy.id} className="overflow-hidden bg-white/60 rounded-3xl border border-slate-100 hover:shadow-lg transition-all">
                    <div 
                      onClick={() => !isEditing && setExpandedId(isExpanded ? null : policy.id)}
                      className={`p-6 flex items-center justify-between cursor-pointer ${isExpanded ? 'bg-primary-50/30' : ''}`}
                    >
                      <div className="space-y-2 flex-1 mr-6">
                        {isEditing ? (
                          <div onClick={(e) => e.stopPropagation()} className="space-y-2">
                            <input 
                              type="text" 
                              value={editForm.name} 
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="bg-slate-50 border border-slate-200 focus:border-primary-500 py-1 px-2 rounded-lg w-full text-sm font-black text-slate-900 outline-none"
                            />
                            <input 
                              type="text" 
                              value={editForm.description} 
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              className="bg-slate-50 border border-slate-200 focus:border-primary-500 py-1 px-2 rounded-lg w-full text-xs text-slate-500 font-medium italic outline-none mt-1"
                            />
                          </div>
                        ) : (
                            <div className="flex items-center gap-3">
                              {(() => {
                                const CatInfo = CATEGORY_MAP[policy.category] || CATEGORY_MAP.ATTENDANCE;
                                const Icon = CatInfo.icon;
                                return (
                                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-primary-50 transition-colors">
                                    <Icon className="w-4 h-4 text-slate-500" />
                                  </div>
                                );
                              })()}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-black text-slate-900">{policy.name}</p>
                                  {policy.urgency && (
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${URGENCY_MAP[policy.urgency]?.color} ${URGENCY_MAP[policy.urgency]?.text}`}>
                                      {URGENCY_MAP[policy.urgency]?.label}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium italic">{policy.description}</p>
                              </div>
                            </div>
                        )}
                      </div>
                      <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                        {isEditing ? (
                           <input 
                            type="text" 
                            value={editForm.value} 
                            onChange={(e) => setEditForm({...editForm, value: e.target.value})}
                            className="w-20 bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-sm font-bold text-slate-900 text-center focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                        ) : (
                           <div className="min-w-[5rem] py-2 px-3 text-sm font-bold text-slate-900 text-center bg-slate-100 rounded-xl border border-slate-200">
                             {policy.value}
                           </div>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isEditing ? editForm.is_active : policy.is_active} 
                            onChange={(e) => {
                              if (isEditing) setEditForm({...editForm, is_active: e.target.checked})
                              else handleUpdate(policy.id, { is_active: e.target.checked })
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>

                        <div className="flex items-center gap-2 border-l border-slate-200 pl-6 ml-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(policy.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors" title="Save">
                                <Save className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors" title="Cancel">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingId(policy.id); setEditForm({...policy}); }} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(policy.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && !isEditing && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100 bg-slate-50/50"
                        >
                          <div className="p-6 grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy UUID</span>
                                <p className="text-xs font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-100">{policy.id}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Department</span>
                                <p className="text-xs font-bold text-slate-900 bg-white p-2 rounded-lg border border-slate-100">
                                  {policy.departmentId ? `Dept ID: ${policy.departmentId}` : 'Global Policy (All Departments)'}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Governing Rules & Constraints</span>
                              <div className="h-32 overflow-y-auto pr-2 custom-scrollbar">
                                {renderRulesFormal(policy.rules)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )})}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Security Context */}
          <div className="space-y-6 lg:sticky lg:top-8">
            {/* Security Health Gauge */}
            <div className="glass-card rounded-[2rem] p-8 border border-slate-100 bg-white/40 space-y-6 shadow-sm overflow-hidden relative transition-all">
              <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 ${secPulse.color}`} />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${secPulse.color.replace('bg-', 'bg-').replace('animate-pulse', '')} bg-opacity-10`}>
                    <Shield className={`w-6 h-6 ${secPulse.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 leading-none">Security Health</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${secPulse.color.replace('bg-', 'text-')}`}>
                      {secPulse.label}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">{secPulse.score}%</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${secPulse.score}%` }}
                  className={`h-full ${secPulse.color.replace(' animate-pulse', '')} transition-all duration-1000`}
                />
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-4 py-1">
                Authorized override for biometric hardware constraints and real-time engine synchronization.
              </p>

              <div className="space-y-3 pt-2">
                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${globalConfig?.biometric_lock_active ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 ${globalConfig?.biometric_lock_active ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'} rounded-full`} />
                    <div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">Biometric Lock</span>
                      <span className="text-[9px] text-slate-400 font-bold italic">{globalConfig?.biometric_lock_active ? 'Strict Enforcement' : 'Maintenance Bypass'}</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={globalConfig?.biometric_lock_active || false} 
                      onChange={(e) => handleUpdateGlobalConfig({ biometric_lock_active: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-inner"></div>
                  </label>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${globalConfig?.real_time_validation ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 ${globalConfig?.real_time_validation ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-300'} rounded-full`} />
                    <div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">Real-time Validation</span>
                      <span className="text-[9px] text-slate-400 font-bold italic">{globalConfig?.real_time_validation ? 'Live Sync Active' : 'Deferred Processing'}</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={globalConfig?.real_time_validation || false} 
                      onChange={(e) => handleUpdateGlobalConfig({ real_time_validation: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-inner"></div>
                  </label>
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Intelligence</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                  System monitors all configuration changes for audit trails. Deactivating core locks generates an immediate security log.
                </p>
              </div>
            </div>

            {/* Sync Status Card */}
            <div className="glass-card rounded-[2rem] p-8 border border-slate-100 bg-primary-900 text-white space-y-4 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
               <div className="relative z-10 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                      <RefreshCw className="w-5 h-5 text-primary-200" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black tracking-tight uppercase">System Sync</h4>
                      <p className="text-[9px] text-primary-200 font-bold opacity-80 uppercase tracking-widest">Global State Master</p>
                    </div>
                 </div>
                 <Check className="w-6 h-6 text-emerald-400" />
               </div>
               <p className="relative z-10 text-[11px] text-primary-100 font-medium leading-relaxed italic">
                 Your security settings are synchronized across all biometric terminals and centralized management hubs in real-time.
               </p>
            </div>

            {/* Operational Parameters */}
            <div className="glass-card rounded-[2rem] p-8 border border-slate-100 bg-white/40 space-y-4 shadow-sm">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                System Configuration
              </h4>
              <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed">
                Changes to these parameters are logged and applied immediately across all terminal synchronization cycles.
              </p>
              
              {globalConfig && (
                <div className="pt-2 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Timeout (Mins)</label>
                    <input 
                      type="number" 
                      defaultValue={globalConfig.session_timeout_minutes} 
                      onBlur={(e) => handleUpdateGlobalConfig({ session_timeout_minutes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max Login Attempts</label>
                    <input 
                      type="number" 
                      defaultValue={globalConfig.max_login_attempts} 
                      onBlur={(e) => handleUpdateGlobalConfig({ max_login_attempts: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
