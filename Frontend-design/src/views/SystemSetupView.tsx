import React from 'react';
import { FileText, Settings, Shield, Globe, Database, Cpu, ChevronRight, RefreshCw, CheckCircle2, Zap, PlayCircle, Trash2, Download, Wifi, Activity, Plus, Edit2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiRequest } from '../api/client';

export const SystemSetupView = () => {
  const [processing, setProcessing] = React.useState<string | null>(null);
  const [health, setHealth] = React.useState<any>(null);
  
  // Custom Workflows State
  const [workflows, setWorkflows] = React.useState<any[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [workflowName, setWorkflowName] = React.useState('');
  const [workflowSteps, setWorkflowSteps] = React.useState('[]');
  const [expandedWorkflowId, setExpandedWorkflowId] = React.useState<string | null>(null);

  // Global Config State
  const [globalConfig, setGlobalConfig] = React.useState({
    session_timeout_minutes: 60,
    strict_mode: false,
    max_login_attempts: 3
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [savingConfig, setSavingConfig] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Live Idle Countdown Timer State
  const [secondsLeft, setSecondsLeft] = React.useState(0);
  const lastActivityRef = React.useRef(Date.now());

  // Reset countdown when the configured timeout changes
  React.useEffect(() => {
    const totalSeconds = globalConfig.session_timeout_minutes * 60;
    setSecondsLeft(totalSeconds);
    lastActivityRef.current = Date.now();
  }, [globalConfig.session_timeout_minutes]);

  // Activity listeners to reset idle clock
  React.useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // Count-down tick every second
  React.useEffect(() => {
    const ticker = setInterval(() => {
      const elapsedMs = Date.now() - lastActivityRef.current;
      const totalMs = globalConfig.session_timeout_minutes * 60 * 1000;
      const remaining = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
      setSecondsLeft(remaining);
    }, 1000);
    return () => clearInterval(ticker);
  }, [globalConfig.session_timeout_minutes]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const countdownPercent = globalConfig.session_timeout_minutes > 0
    ? (secondsLeft / (globalConfig.session_timeout_minutes * 60)) * 100
    : 0;

  // Professional Toast Notification State
  const [toast, setToast] = React.useState<{message: string, type: 'success' | 'error'} | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); // auto-hide after 4 seconds
  };

  const fetchHealth = async (silent: boolean = true) => {
    try {
      setIsRefreshing(true);
      const startTime = performance.now();
      const res = await apiRequest('/api/reporting/system-health/');
      const endTime = performance.now();
      
      if (res.success) {
        setHealth({
           ...res.health,
           api_latency: `${Math.round(endTime - startTime)}ms`
        });
        if (!silent) showToast("System telemetry synchronized successfully.", "success");
      }
    } catch (err) {
      console.error("Failed to fetch system health", err);
      showToast("Critical: Failed to communicate with engine.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const res = await apiRequest('/accounts/api/workflows/');
      if (res.success) setWorkflows(res.workflows);
    } catch (err) {
      console.error("Failed to fetch custom workflows", err);
    }
  };

  const fetchGlobalConfig = async () => {
    try {
      const res = await apiRequest('/api/reporting/global-config/');
      if (res.success) {
        setGlobalConfig(res.config);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error("Failed to fetch global config", err);
    }
  };

  React.useEffect(() => {
    fetchHealth(true);
    fetchWorkflows();
    fetchGlobalConfig();
  }, []);

  const handleConfigChange = (key: string, value: any) => {
    setGlobalConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveGlobalConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await apiRequest('/api/reporting/global-config/update/', {
        method: 'POST',
        body: JSON.stringify(globalConfig)
      });
      if (res.success) {
        setHasUnsavedChanges(false);
        showToast("Global configurations applied efficiently.", "success");
      } else {
        showToast(res.error || "Failed to save configuration.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving global configuration.", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const runWorkflow = async (name: string, endpoint: string) => {
    setProcessing(name);
    try {
      const res = await apiRequest(endpoint, { method: 'POST' });
      if (res.success) {
        showToast(res.message, "success");
        fetchHealth(true);
      } else {
        showToast(res.error || "Execution failed.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Process execution failed", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleSaveWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    let parsedSteps = [];
    try {
      parsedSteps = JSON.parse(workflowSteps);
    } catch (e) {
      showToast("Invalid JSON format for steps. Must be a valid array [].", "error");
      setIsSaving(false);
      return;
    }

    try {
      const endpoint = editingId 
        ? `/accounts/api/workflows/${editingId}/update/`
        : '/accounts/api/workflows/create/';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await apiRequest(endpoint, {
        method,
        body: JSON.stringify({ name: workflowName, steps: parsedSteps })
      });
      
      if (res.success) {
        fetchWorkflows();
        closeModal();
        showToast("Custom workflow definition saved.", "success");
      } else {
        showToast(res.error || "Failed to save workflow.", "error");
      }
    } catch (err) {
      showToast("Error saving workflow context.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkflow = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete workflow "${name}"?`)) {
      try {
        const res = await apiRequest(`/accounts/api/workflows/${id}/delete/`, { method: 'DELETE' });
        if (res.success) {
          fetchWorkflows();
          showToast("Workflow successfully purged.", "success");
        } else {
          showToast(res.error || "Failed to delete workflow.", "error");
        }
      } catch (err) {
        showToast("Error deleting workflow.", "error");
      }
    }
  };

  const openEditModal = (wf: any) => {
    setEditingId(wf.id);
    setWorkflowName(wf.name);
    setWorkflowSteps(JSON.stringify(wf.steps, null, 2));
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setWorkflowName('');
    setWorkflowSteps('[\n  {"action": "EMAIL_HR"}\n]');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Workflow & Setup</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Configure core parameters and execute system-wide operational workflows.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={openCreateModal}
            className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-[10px]"
          >
            <Plus className="w-4 h-4" />
            Add Custom Workflow
          </button>
          <button 
            onClick={() => fetchHealth(false)}
            disabled={isRefreshing}
            className={`${isRefreshing ? 'bg-slate-100 opacity-80' : 'bg-white hover:bg-slate-50'} border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all flex items-center gap-2 uppercase tracking-widest text-[10px]`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-500' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Check Engine Updates'}
          </button>
          <button 
            onClick={handleSaveGlobalConfig}
            disabled={savingConfig || !hasUnsavedChanges}
            className={`${hasUnsavedChanges ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 animate-pulse' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200'} text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg flex items-center gap-2 uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:animate-none`}
          >
            {savingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
            Save Global Config
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workflow controls */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8 bg-white/40">
           <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight border-b border-slate-100 pb-4">Operational Workflows</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Biometric Sync', icon: Zap, desc: 'Synchronize facial embeddings across all active nodes.', endpoint: '/api/reporting/sync-biometrics/', color: 'text-amber-600', bg: 'bg-amber-50' },
                { name: 'Database Maintenance', icon: Database, desc: 'Optimize database indexes and clear temporary caches.', endpoint: '/api/reporting/system-operation/db_maintenance/', color: 'text-primary-600', bg: 'bg-primary-50' },
                { name: 'Log Sanitization', icon: Trash2, desc: 'Archive and clear audit logs older than 90 days.', endpoint: '/api/reporting/sanitize-logs/', color: 'text-red-600', bg: 'bg-red-50' },
                { name: 'System Backup', icon: Download, desc: 'Generate a full encrypted backup of current state.', endpoint: '/api/reporting/system-operation/system_backup/', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((wf, idx) => (
                <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl transition-all group">
                   <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${wf.bg} ${wf.color}`}>
                        <wf.icon className="w-6 h-6" />
                      </div>
                      <button 
                        disabled={!!processing}
                        onClick={() => runWorkflow(wf.name, wf.endpoint)}
                        className={`p-2 rounded-xl transition-all ${processing === wf.name ? 'bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-100'}`}
                      >
                        {processing === wf.name ? <RefreshCw className="w-5 h-5 animate-spin text-slate-400" /> : <PlayCircle className="w-5 h-5" />}
                      </button>
                   </div>
                   <h4 className="font-black text-slate-900 mb-1 italic">{wf.name}</h4>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">{wf.desc}</p>
                </div>
              ))}
           </div>

           <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight border-b border-slate-100 pb-4 mt-12">Engine Parameters</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-slate-100 rounded-[2rem] col-span-1 md:col-span-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Session Timeout (Minutes)</label>
                 <input 
                   type="number"
                   value={globalConfig.session_timeout_minutes}
                   onChange={e => handleConfigChange('session_timeout_minutes', parseInt(e.target.value))}
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none font-bold text-slate-800 mb-4"
                 />
                 {/* Live Idle Countdown Display */}
                 <div className="flex items-center gap-4 mt-2">
                   {/* Circular progress arc */}
                   <div className="relative w-14 h-14 flex-shrink-0">
                     <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                       <circle cx="28" cy="28" r="24" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                       <circle
                         cx="28" cy="28" r="24" fill="none"
                         stroke={countdownPercent > 30 ? '#10b981' : countdownPercent > 10 ? '#f59e0b' : '#ef4444'}
                         strokeWidth="5"
                         strokeLinecap="round"
                         strokeDasharray={`${2 * Math.PI * 24}`}
                         strokeDashoffset={`${2 * Math.PI * 24 * (1 - countdownPercent / 100)}`}
                         style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                       />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className={`w-2 h-2 rounded-full ${countdownPercent > 30 ? 'bg-emerald-500' : countdownPercent > 10 ? 'bg-amber-500' : 'bg-red-500 animate-ping'}`} />
                     </div>
                   </div>
                   <div>
                     <p className={`text-2xl font-black tabular-nums tracking-tight ${countdownPercent > 30 ? 'text-emerald-600' : countdownPercent > 10 ? 'text-amber-500' : 'text-red-500'}`}>
                       {formatCountdown(secondsLeft)}
                     </p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       {countdownPercent > 30 ? 'Session Active' : countdownPercent > 10 ? 'Idle Warning' : 'Locking Soon'}
                     </p>
                   </div>
                 </div>
              </div>
              
              <div className="p-6 bg-white border border-slate-100 rounded-[2rem]">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Max Login Attempts</label>
                 <input 
                   type="number"
                   value={globalConfig.max_login_attempts}
                   onChange={e => handleConfigChange('max_login_attempts', parseInt(e.target.value))}
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none font-bold text-slate-800"
                 />
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col justify-center">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 flex items-center justify-between">
                   Strict Mode Enforcement
                 </label>
                 <button 
                   onClick={() => handleConfigChange('strict_mode', !globalConfig.strict_mode)}
                   className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${globalConfig.strict_mode ? 'bg-emerald-500' : 'bg-slate-200'}`}
                 >
                   <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${globalConfig.strict_mode ? 'translate-x-9' : 'translate-x-1'}`} />
                 </button>
              </div>
           </div>

           <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight border-b border-slate-100 pb-4 mt-12">Custom Workflows</h3>
           {workflows.length === 0 ? (
             <div className="text-center py-8 text-slate-400 italic font-bold">No custom workflows defined.</div>
           ) : (
              <div className="space-y-4">
                {workflows.map(wf => {
                  const isExpanded = expandedWorkflowId === wf.id;
                  return (
                    <div key={wf.id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-lg transition-all">
                      {/* Header Row — always visible, clickable */}
                      <div 
                        className="p-6 flex items-center justify-between cursor-pointer group"
                        onClick={() => setExpandedWorkflowId(isExpanded ? null : wf.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl transition-colors ${isExpanded ? 'bg-primary-50' : 'bg-slate-50'}`}>
                            <FileText className={`w-5 h-5 transition-colors ${isExpanded ? 'text-primary-600' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 italic">{wf.name}</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                              {wf.steps.length} Step{wf.steps.length !== 1 ? 's' : ''} Defined
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={e => { e.stopPropagation(); openEditModal(wf); }}
                              className="p-3 bg-slate-50 hover:bg-primary-50 text-slate-500 hover:text-primary-600 rounded-2xl transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={e => { e.stopPropagation(); handleDeleteWorkflow(wf.id, wf.name); }}
                              className="p-3 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-2xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Expandable Steps Panel */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="steps"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 border-t border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pt-4">Workflow Steps</p>
                              <div className="space-y-3">
                                {wf.steps.length === 0 ? (
                                  <p className="text-sm text-slate-400 italic">No steps configured.</p>
                                ) : (
                                  wf.steps.map((step: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4">
                                      {/* Step Number Badge */}
                                      <div className="w-8 h-8 bg-primary-50 text-primary-700 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                                        {idx + 1}
                                      </div>
                                      <div className="flex-1 bg-slate-50 rounded-2xl px-4 py-3">
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-wide">{step.action || 'UNDEFINED_ACTION'}</p>
                                        {step.parameters && Object.keys(step.parameters).length > 0 && (
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            {Object.entries(step.parameters).map(([k, v]) => (
                                              <span key={k} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest">
                                                {k}: <span className="text-primary-600">{String(v)}</span>
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}</div>
           )}
        </div>

        {/* Right status panel */}
        <div className="glass-card rounded-[2.5rem] p-10 border border-primary-100 bg-primary-50/50 relative overflow-hidden group">
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl" />
           <div className="relative z-10">
              <h3 className="text-2xl font-black text-slate-900 mb-2 italic">System Status</h3>
              <p className="text-slate-500 font-bold mb-8 italic text-sm opacity-80">Real-time engine telemetry and heartbeats.</p>
              
              <div className="space-y-4">
                 {[
                   { label: 'Database Grid', value: health?.db_status || 'Checking...', icon: Database },
                   { label: 'API Response', value: health?.api_latency || '...', icon: Zap },
                   { label: 'Terminal Grid', value: health?.active_terminals || '...', icon: Wifi },
                   { label: 'Engine Uptime', value: health?.uptime || '...', icon: Activity },
                 ].map((stat, idx) => (
                   <div key={idx} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-primary-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                            <stat.icon className="w-4 h-4" />
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 italic uppercase">
                        {stat.value === 'Checking...' ? <RefreshCw className="w-3 h-3 animate-spin text-primary-600"/> : stat.value}
                      </span>
                   </div>
                 ))}
              </div>

              <div className="mt-8 pt-8 border-t border-primary-100">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Sync Status</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Stable</span>
                 </div>
                 <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      className="h-full bg-primary-600"
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative"
             >
                <button 
                  onClick={closeModal}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-black text-slate-900 mb-6 italic">{editingId ? 'Edit Custom Workflow' : 'Create Custom Workflow'}</h2>
                
                <form onSubmit={handleSaveWorkflow} className="space-y-5">
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Workflow Name</label>
                     <input 
                       required
                       value={workflowName}
                       onChange={e => setWorkflowName(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                       placeholder="e.g. End of Month Processing"
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Workflow Steps (JSON format)</label>
                     <textarea 
                       required
                       value={workflowSteps}
                       onChange={e => setWorkflowSteps(e.target.value)}
                       rows={6}
                       className="w-full bg-slate-900 text-emerald-400 font-mono border border-slate-800 rounded-2xl py-4 px-4 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                     />
                   </div>
                   <button 
                     disabled={isSaving}
                     className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-3xl mt-6 transition-all shadow-xl shadow-primary-100 flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                   >
                     {isSaving ? <RefreshCw className="w-5 h-5 animate-spin"/> : <span>Save Workflow Configuration</span>}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Global Toast Notification Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-black tracking-widest uppercase border ${toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 bg-emerald-600 rounded-full" /> : <XCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
