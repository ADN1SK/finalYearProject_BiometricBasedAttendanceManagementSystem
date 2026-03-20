import React from 'react';
import { FileText, Users, Shield, Fingerprint, Globe, Database, Cpu, ChevronRight, CheckCircle2, Info, Github, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_PROJECT_MEMBERS } from '../mockData';

export const AboutProjectView = () => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-primary-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary-200 rotate-6 hover:rotate-0 transition-transform duration-500">
          <Fingerprint className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">HU-IoT Biometric EAMS</h1>
          <p className="text-primary-600 font-black uppercase tracking-[0.3em] text-xs">Hawassa University Institute of Technology</p>
        </div>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          A state-of-the-art Biometric Attendance Management System designed to streamline HR operations, 
          ensure security, and provide real-time attendance tracking for the Institute of Technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-4 text-center">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl w-fit mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Secure Biometrics</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Advanced facial recognition and fingerprint data encryption.</p>
        </div>
        <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-4 text-center">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl w-fit mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Real-time Tracking</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Instant attendance logging and automated reporting.</p>
        </div>
        <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-4 text-center">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-3xl w-fit mx-auto">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">HR Integration</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Seamless integration with university HR and payroll systems.</p>
        </div>
      </div>

      <div className="glass-card rounded-[3rem] p-12 border border-slate-100 shadow-sm space-y-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-8">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            Project Development Team
          </h3>
          <button className="text-primary-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
            View Contributions <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_PROJECT_MEMBERS.map((member) => (
            <div key={member.id} className="flex flex-col items-center text-center space-y-4 group">
              <div className="relative">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-xl shadow-slate-100 group-hover:scale-105 transition-transform duration-500">
                  <span className="text-2xl font-black text-slate-300">{member.name.charAt(0)}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-50">
                  <Github className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div>
                <h4 className="font-black text-slate-900">{member.name}</h4>
                <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mt-1">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8">
        <div className="flex items-center gap-3 text-slate-400">
          <Info className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Version 2.4.1 (Stable)</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <Globe className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">HU-IoT Internal Network</span>
        </div>
        <button className="flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-xs hover:underline">
          <ExternalLink className="w-4 h-4" />
          Project Documentation
        </button>
      </div>
    </div>
  );
};
