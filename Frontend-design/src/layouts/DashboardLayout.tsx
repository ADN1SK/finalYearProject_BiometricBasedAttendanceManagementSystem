import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { apiRequest } from '../api/client';

import { SidebarItem } from '../components/SidebarItem';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DashboardLayout = ({ user, onLogout, children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [timeoutMinutes, setTimeoutMinutes] = useState(60);
  
  const [globalSearch, setGlobalSearch] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch Global Configuration for Timeout
  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await apiRequest('/api/reporting/global-config/');
        if (res.success && res.config.session_timeout_minutes) {
          setTimeoutMinutes(res.config.session_timeout_minutes);
        }
      } catch (e) {
        console.warn("Could not fetch timeout config", e);
      }
    };
    fetchConfig();
  }, []);

  // Idle Timer Enforcer
  React.useEffect(() => {
    let lastActivity = Date.now();

    const updateActivity = () => {
      lastActivity = Date.now();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('click', updateActivity);

    const interval = setInterval(() => {
      const timeoutMs = timeoutMinutes * 60 * 1000;
      if (Date.now() - lastActivity >= timeoutMs) {
        alert("Session expired due to inactivity. For your security, you have been logged out.");
        onLogout();
      }
    }, 15000); // Check every 15 seconds

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(interval);
    };
  }, [timeoutMinutes, onLogout]);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await apiRequest('/api/reporting/my-notifications/');
      if (res.success) setNotifications(res.notifications);
    } catch (e) {
      console.warn("Could not fetch notifications", e);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'overview', path: '/', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { id: 'overview', path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['HR_OFFICER', 'EMPLOYEE'] },
    { id: 'usermanagement', path: '/usermanagement', label: 'User & Role Management', icon: Users, roles: ['ADMIN', 'HR_OFFICER'] },
    { id: 'biometricenrollmentview', path: '/biometricenrollmentview', label: 'Biometric Enrollment', icon: Fingerprint, roles: ['ADMIN'] },
    { id: 'leaveapproval', path: '/leaveapproval', label: 'Leave Approval', icon: Calendar, roles: ['HR_OFFICER'] },
    { id: 'shiftmanagement', path: '/shiftmanagement', label: 'Shift Management', icon: Clock, roles: ['HR_OFFICER'] },
    { id: 'profilemanagement', path: '/profilemanagement', label: 'Profile Management', icon: UserIcon, roles: ['HR_OFFICER'] },
    { id: 'policies', path: '/policies', label: 'Policy Configuration', icon: Settings, roles: ['ADMIN'] },
    { id: 'systemsetup', path: '/systemsetup', label: 'Workflow & Setup', icon: FileText, roles: ['ADMIN'] },
    { id: 'integrations', path: '/integrations', label: 'External Integrations', icon: Shield, roles: ['ADMIN'] },
    { id: 'auditlogs', path: '/auditlogs', label: 'System Oversight', icon: AlertCircle, roles: ['ADMIN'] },
    { id: 'attendance', path: '/attendancerecords', label: 'Attendance Record', icon: Clock, roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'leaves', path: '/leavemanagement', label: 'Leave Management', icon: Calendar, roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'notifications', path: '/notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'about', path: '/about', label: 'About Project', icon: FileText, roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Handle outside click for notifications
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlobalSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      navigate(`/attendancerecords?search=${encodeURIComponent(globalSearch)}`);
      setGlobalSearch('');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Reverted to Professional White/Blue Theme */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
              {filteredMenu.map((item, index) => (
                <SidebarItem
                  key={`${item.id}-${index}`}
                  icon={item.icon}
                  label={item.label}
                  active={isActive(item.path)}
                  onClick={() => navigate(item.path)}
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
              <input 
                type="text" 
                placeholder="Search records..." 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleGlobalSearch}
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder:text-primary-200" 
              />
            </div>
            
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => n.status === 'unread') && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-primary-600"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-30"
                  >
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
                      <button className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase">Mark All Read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n, idx) => (
                          <div key={n.id || idx} className="p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                            <div className="flex items-start gap-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                n.type === 'alert' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
                              }`}>
                                <AlertCircle className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800 leading-relaxed mb-1">{n.message}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{n.time_ago || 'Just now'}</p>
                              </div>
                              {n.status === 'unread' && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0" />}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center">
                          <Bell className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">All caught up!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
