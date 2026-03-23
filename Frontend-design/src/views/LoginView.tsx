import React, { useState, useEffect } from 'react';
import { Fingerprint, Shield, ChevronRight, User as UserIcon, Settings, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole } from '../types';
import { AttendanceTerminal } from '../components/AttendanceTerminal';
import { apiRequest, ensureCsrf } from '../api/client';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView = ({ onLogin }: LoginViewProps) => {
  const [view, setView] = useState<'TERMINAL' | 'LOGIN'>('TERMINAL');
  const [selectedRole, setSelectedRole] = useState<UserRole>('EMPLOYEE');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ensure CSRF cookie is set when the login view is mounted
    ensureCsrf().catch(err => console.error("CSRF initialization failed", err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoggingIn(true);
    setError('');

    try {
      const response = await apiRequest('/accounts/api/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password, role: selectedRole }),
      });

      if (response.success) {
        // Map backend user to frontend User type
        const loggedInUser: User = {
          id: response.user.id,
          name: response.user.username, // Using username as name for now
          email: `${response.user.username}@hu-iot.edu`, // Fallback email
          role: response.user.role === 'Administrator' ? 'ADMIN' : 
                response.user.role === 'HR Officer' ? 'HR_OFFICER' : 'EMPLOYEE',
          department: 'IT Administration', // Fallback department
          must_change_password: response.user.must_change_password,
        };
        onLogin(loggedInUser);
      } else {
        setError(response.error || 'Invalid credentials');
        setIsLoggingIn(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Institutional Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary-600" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-50 rounded-full opacity-50 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-50 rounded-full opacity-50 blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card rounded-[2.5rem] p-10 shadow-2xl shadow-primary-100/50 relative z-10 border border-white"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-200 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Fingerprint className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">BBE AMS-HU IOT</h1>
          <div className="flex flex-col mt-2">
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Hawassa University</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Institute of Technology</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'TERMINAL' ? (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AttendanceTerminal onAttendanceMarked={(user) => console.log("Attendance marked for", user.name)} />
              <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portal Access</p>
                <button 
                  onClick={() => setView('LOGIN')}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Staff & Admin Login
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleLogin} 
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-800">Staff Portal</h2>
                <button type="button" onClick={() => setView('TERMINAL')} className="text-xs text-primary-600 font-black hover:underline flex items-center gap-1 uppercase tracking-wider">
                  <ChevronRight className="w-3 h-3 rotate-180" /> Terminal
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setError('');
                    }}
                    className={`py-3 px-1 rounded-2xl border-2 transition-all text-[9px] font-black text-center flex flex-col items-center gap-1 uppercase tracking-tighter ${
                      selectedRole === role 
                        ? 'border-primary-600 bg-primary-50 text-primary-700' 
                        : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-400'
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        
        <div className="mt-10 flex flex-col items-center gap-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            &copy; 2026 Hawassa University
          </p>
          <div className="flex gap-4">
            <button className="text-[9px] font-bold text-primary-600/50 hover:text-primary-600 uppercase tracking-widest">Privacy Policy</button>
            <button className="text-[9px] font-bold text-primary-600/50 hover:text-primary-600 uppercase tracking-widest">Help Center</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
