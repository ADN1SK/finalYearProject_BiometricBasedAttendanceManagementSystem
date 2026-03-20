import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  Settings, 
  LogOut, 
  Bell, 
  Fingerprint,
  User as UserIcon,
  Search,
  Menu,
  Shield,
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

import { SidebarItem } from '../components/SidebarItem';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardLayout = ({ user, onLogout, children, activeTab, setActiveTab }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'user-management', label: 'User Management', icon: Users, roles: ['ADMIN'] },
    { id: 'biometric-enrollment', label: 'Biometric Enrollment', icon: Fingerprint, roles: ['HR_OFFICER'] },
    { id: 'leave-approval', label: 'Leave Approval', icon: Calendar, roles: ['HR_OFFICER'] },
    { id: 'shift-management', label: 'Shift Management', icon: Clock, roles: ['HR_OFFICER'] },
    { id: 'profile-management', label: 'Profile Management', icon: UserIcon, roles: ['HR_OFFICER'] },
    { id: 'policies', label: 'Policy Configuration', icon: Settings, roles: ['ADMIN'] },
    { id: 'system-setup', label: 'System Setup', icon: FileText, roles: ['ADMIN'] },
    { id: 'integrations', label: 'External Integrations', icon: Shield, roles: ['ADMIN'] },
    { id: 'audit', label: 'Audit Monitoring', icon: AlertCircle, roles: ['ADMIN'] },
    { id: 'attendance', label: 'Attendance Record', icon: Clock, roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'leaves', label: 'Leave Management', icon: Calendar, roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'about', label: 'About Project', icon: FileText, roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Reverted to Professional White/Blue Theme */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 fixed inset-y-0 lg:relative shadow-sm"
          >
            <div className="p-6 text-center border-b border-slate-100">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-200">
                <Fingerprint className="w-7 h-7 text-white" />
              </div>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">HU-IoT EAMS</p>
              
              <div className="mt-6 mb-4">
                <div className="w-20 h-20 bg-primary-50 rounded-full mx-auto flex items-center justify-center border-2 border-primary-100">
                  <UserIcon className="w-10 h-10 text-primary-600" />
                </div>
              </div>
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">{user.role.replace('_', ' ')}</p>
            </div>

            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
              {filteredMenu.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                />
              ))}
            </nav>

            <div className="p-4 space-y-2 border-t border-slate-100">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
                <Shield className="w-5 h-5 text-slate-400" />
                <span className="text-sm">Help Center</span>
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Blue Primary Theme */}
        <header className="h-20 bg-primary-600 text-white px-8 flex items-center justify-between sticky top-0 z-10 shadow-lg shadow-primary-100/20">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-xl transition-all text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight">HU-IoT Biometric EAMS</h1>
              <p className="text-[10px] text-primary-100 font-bold uppercase tracking-wider">Attendance Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white/10 rounded-xl px-4 py-2 w-64 border border-white/10 backdrop-blur-sm">
              <Search className="w-4 h-4 text-primary-100 mr-2" />
              <input type="text" placeholder="Search records..." className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder:text-primary-200" />
            </div>
            <button className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-primary-600"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
