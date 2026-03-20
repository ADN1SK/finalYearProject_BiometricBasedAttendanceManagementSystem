import React from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Shield, CheckCircle2, AlertCircle, Camera, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_USERS } from '../mockData';

export const ProfileManagementView = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Update and manage employee personal and professional profiles.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Profile Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6 border border-slate-100 shadow-sm">
            <div className="relative group">
              <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl shadow-primary-100 overflow-hidden">
                <UserIcon className="w-16 h-16 text-primary-600" />
              </div>
              <button className="absolute bottom-0 right-0 p-3 bg-primary-600 text-white rounded-2xl shadow-lg hover:bg-primary-700 transition-all border-4 border-white">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Elisha Arba</h3>
              <p className="text-xs text-primary-600 font-bold uppercase tracking-widest mt-1">HR Officer</p>
            </div>
            <div className="w-full pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-widest">Employee ID</span>
                <span className="text-slate-900">HU-IOT-002</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-widest">Status</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Active</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-8 border border-slate-100 space-y-4">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-600" />
              Security Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Biometrics Verified</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">2FA Enabled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <h3 className="text-xl font-black text-slate-900">Personal Information</h3>
              <button className="text-primary-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                Edit <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">Elisha Arba</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">elisha.arba@hu.edu.et</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">+251 911 223344</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Office Location</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">IoT Admin Block, Room 204</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-6">
              <h3 className="text-xl font-black text-slate-900">Professional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">Human Resources</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Joining Date</label>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">January 15, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
