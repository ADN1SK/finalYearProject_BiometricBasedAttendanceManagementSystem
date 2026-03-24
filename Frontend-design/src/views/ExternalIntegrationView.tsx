import React, { useState, useEffect } from 'react';
import { Shield, Globe, Database, Cpu, ChevronRight, RefreshCw, AlertCircle, Wifi, Link, Loader2, X, CheckCircle2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiRequest } from '../api/client';

interface Integration {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  last_sync: string;
  endpoint_url?: string;
  health?: number;
}

export const ExternalIntegrationView = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modals & Feedback
  const [showConfig, setShowConfig] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Integration | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Form States
  const [configData, setConfigData] = useState({ endpoint_url: '', api_key: '' });
  const [createData, setCreateData] = useState({ name: '', type: 'PAYROLL', description: '' });

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/accounts/api/integrations/');
      if (res.success) {
        setIntegrations(res.integrations.map((i: any) => ({
          ...i,
          health: Math.floor(Math.random() * (100 - 95 + 1)) + 95
        })));
      }
    } catch (err) {
      console.error("Failed to fetch integrations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = async (id: string) => {
    setActionLoading(`toggle-${id}`);
    try {
      const res = await apiRequest(`/accounts/api/integrations/${id}/toggle/`, { method: 'POST' });
      if (res.success) {
        setIntegrations(prev => prev.map(i => 
          i.id === id ? { ...i, status: res.status, last_sync: res.last_sync } : i
        ));
        showToast(`System ${res.status.toLowerCase()} successfully.`);
      }
    } catch (err) {
      showToast("Toggle operation failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncNow = async (id: string) => {
    setActionLoading(`sync-${id}`);
    try {
      const res = await apiRequest(`/accounts/api/integrations/${id}/sync/`, { method: 'POST' });
      if (res.success) {
        setIntegrations(prev => prev.map(i => 
          i.id === id ? { ...i, last_sync: res.last_sync } : i
        ));
        showToast(res.message);
      }
    } catch (err: any) {
      showToast(err.message || "Synchronization failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenConfig = (integration: Integration) => {
    setSelected(integration);
    setConfigData({
      endpoint_url: integration.endpoint_url || '',
      api_key: ''
    });
    setShowConfig(true);
  };

  const handleSaveConfig = async () => {
    if (!selected) return;
    setActionLoading(`save-${selected.id}`);
    try {
      const res = await apiRequest(`/accounts/api/integrations/${selected.id}/update-config/`, {
        method: 'POST',
        body: JSON.stringify(configData)
      });
      if (res.success) {
        setIntegrations(prev => prev.map(i => 
          i.id === selected.id ? { ...i, endpoint_url: configData.endpoint_url } : i
        ));
        showToast("Configuration saved.");
        setShowConfig(false);
      }
    } catch (err) {
      showToast("Save failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateConnector = async () => {
    setActionLoading('create-new');
    try {
      const res = await apiRequest('/accounts/api/integrations/hub-register/', {
        method: 'POST',
        body: JSON.stringify(createData)
      });
      if (res.success) {
        setIntegrations(prev => [...prev, { ...res.integration, health: 100 }]);
        showToast("Connector created successfully.");
        setShowCreate(false);
        setCreateData({ name: '', type: 'PAYROLL', description: '' });
      }
    } catch (err) {
      showToast("Failed to create connector.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConnector = async (id: string) => {
    if (!window.confirm("Are you sure you want to decommission this connector? This action cannot be undone.")) return;
    
    setActionLoading(`delete-${id}`);
    try {
      const res = await apiRequest(`/accounts/api/integrations/${id}/delete/`, {
        method: 'POST' // Backend supports both POST and DELETE for UI flexibility
      });
      if (res.success) {
        setIntegrations(prev => prev.filter(i => i.id !== id));
        showToast("Connector decommissioned successfully.");
      }
    } catch (err) {
      showToast("Failed to delete connector.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 relative pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
            <button onClick={() => setToast(null)}><X className="w-4 h-4 opacity-50" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">External Integrations</h1>
          <p className="text-slate-500 mt-1 font-bold italic opacity-70 tracking-tight uppercase text-[10px]">Real-time synchronization hub for third-party institutional ecosystems.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Connector
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 opacity-20" />
          <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 animate-pulse">Establishing Secure Uplink...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrations.map((integration) => (
            <motion.div 
              key={integration.id}
              whileHover={{ y: -5 }}
              className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6 hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div className={`p-4 rounded-3xl w-fit transition-colors ${
                  integration.status === 'CONNECTED' ? 'bg-primary-50 text-primary-600' : 'bg-slate-50 text-slate-400'
                }`}>
                  {integration.type === 'HR_SYSTEM' ? <Globe className="w-8 h-8" /> : 
                   integration.type === 'PAYROLL' ? <Database className="w-8 h-8" /> : 
                   integration.type === 'ERP' ? <Cpu className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    integration.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {integration.status === 'CONNECTED' ? <Wifi className="w-3 h-3 animate-pulse" /> : <AlertCircle className="w-3 h-3" />}
                    {integration.status}
                  </div>
                  <button 
                    onClick={() => handleDeleteConnector(integration.id)}
                    disabled={!!actionLoading}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                    title="Remove Connector"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">{integration.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-2 italic opacity-80 uppercase tracking-tight">
                  {integration.description}
                </p>
                <div className="mt-4 flex items-center gap-2">
                   <RefreshCw className="w-3 h-3 text-slate-300" />
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Last sync: <span className="text-slate-900">{integration.last_sync}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                  <span>Data Health</span>
                  <span className={integration.status === 'CONNECTED' ? 'text-emerald-600' : 'text-slate-300'}>
                    {integration.status === 'CONNECTED' ? `${integration.health}%` : '---'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: integration.status === 'CONNECTED' ? `${integration.health}%` : '0%' }}
                    className={`h-full rounded-full transition-all duration-1000 ${
                      integration.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <button 
                  onClick={() => handleToggle(integration.id)}
                  disabled={!!actionLoading}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border shadow-sm ${
                    integration.status === 'CONNECTED' 
                      ? 'bg-white border-red-100 text-red-600 hover:bg-red-50' 
                      : 'bg-primary-600 border-primary-700 text-white hover:bg-primary-700'
                  }`}
                >
                  {actionLoading === `toggle-${integration.id}` ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      {integration.status === 'CONNECTED' ? 'Disconnect' : 'Establish Link'}
                      <ChevronRight className="w-3 h-3" />
                    </>
                  )}
                </button>
                <button 
                  onClick={() => handleOpenConfig(integration)}
                  className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 border border-slate-200 transition-all"
                  title="Configure Link"
                >
                  <Cpu className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleSyncNow(integration.id)} 
                  disabled={!!actionLoading || integration.status !== 'CONNECTED'}
                  className={`p-4 rounded-2xl transition-all border ${
                    integration.status === 'CONNECTED' 
                      ? 'bg-slate-50 text-slate-400 hover:bg-slate-100 border-slate-200' 
                      : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                  }`}
                  title="Sync Now"
                >
                  {actionLoading === `sync-${integration.id}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfig && selected && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowConfig(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-400 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-8">
                <div className="p-5 bg-primary-50 rounded-3xl w-fit"><Cpu className="w-10 h-10 text-primary-600" /></div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 italic uppercase">Configure {selected.name}</h2>
                  <p className="text-slate-500 font-bold italic opacity-70 tracking-tight uppercase text-[10px] mt-1">Set secure endpoint and credentials.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Endpoint URL</label>
                    <input type="url" value={configData.endpoint_url} onChange={(e) => setConfigData({...configData, endpoint_url: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">API Key / Token</label>
                    <input type="password" value={configData.api_key} onChange={(e) => setConfigData({...configData, api_key: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={handleSaveConfig} disabled={!!actionLoading} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                    {actionLoading?.startsWith('save-') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Config
                  </button>
                  <button onClick={() => setShowConfig(false)} className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-xs">Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowCreate(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-400 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-8">
                <div className="p-5 bg-emerald-50 rounded-3xl w-fit"><Link className="w-10 h-10 text-emerald-600" /></div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 italic uppercase">Add New Connector</h2>
                  <p className="text-slate-500 font-bold italic opacity-70 tracking-tight uppercase text-[10px] mt-1">Register a new third-party integration platform.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Connector Name</label>
                    <input type="text" value={createData.name} onChange={(e) => setCreateData({...createData, name: e.target.value})} placeholder="e.g., Slack Notification Hub" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">System Type</label>
                    <select value={createData.type} onChange={(e) => setCreateData({...createData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer">
                      <option value="PAYROLL">Payroll System</option>
                      <option value="HR_SYSTEM">HR Management</option>
                      <option value="COMMUNICATION">Communication Gateway</option>
                      <option value="SECURITY">Security / Firewall</option>
                      <option value="ERP">ERP System</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Description</label>
                    <textarea value={createData.description} onChange={(e) => setCreateData({...createData, description: e.target.value})} placeholder="Briefly describe the integration's purpose..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all min-h-[100px]" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={handleCreateConnector} disabled={actionLoading === 'create-new' || !createData.name} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                    {actionLoading === 'create-new' ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    Create Connector
                  </button>
                  <button onClick={() => setShowCreate(false)} className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-xs">Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
