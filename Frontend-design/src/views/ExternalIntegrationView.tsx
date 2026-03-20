import React from 'react';
import { Shield, Globe, Database, Cpu, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, Wifi, Link } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_INTEGRATIONS } from '../mockData';

export const ExternalIntegrationView = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">External Integrations</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage connections with external HR, payroll, and security systems.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs">
          <Link className="w-4 h-4" />
          Add New Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_INTEGRATIONS.map((integration) => (
          <motion.div 
            key={integration.id}
            whileHover={{ y: -5 }}
            className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-4 bg-primary-50 text-primary-600 rounded-3xl w-fit">
                {integration.type === 'HR_SYSTEM' ? <Globe className="w-8 h-8" /> : 
                 integration.type === 'PAYROLL' ? <Database className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                integration.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {integration.status === 'CONNECTED' ? <Wifi className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {integration.status}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">{integration.name}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                Last synchronized: <span className="text-slate-900 font-bold">{integration.lastSync}</span>
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Data Health</span>
                <span className="text-emerald-600">98%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                Configure <ChevronRight className="w-3 h-3" />
              </button>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
