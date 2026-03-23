/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { apiRequest } from './api/client';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Views
import { LoginView } from './views/LoginView';
import { OverviewView } from './views/OverviewView';
import { BiometricEnrollmentView } from './views/BiometricEnrollmentView';
import { LeaveApprovalView } from './views/LeaveApprovalView';
import { ShiftManagementView } from './views/ShiftManagementView';
import { ProfileManagementView } from './views/ProfileManagementView';
import { ReportGenerationView } from './views/ReportGenerationView';
import { UserManagementView } from './views/UserManagementView';
import { PolicyConfigurationView } from './views/PolicyConfigurationView';
import { SystemSetupView } from './views/SystemSetupView';
import { AuditMonitoringView } from './views/AuditMonitoringView';
import { AttendanceRecordsView } from './views/AttendanceRecordsView';
import { LeaveManagementView } from './views/LeaveManagementView';
import { NotificationsView } from './views/NotificationsView';
import { ExternalIntegrationView } from './views/ExternalIntegrationView';
import { AboutProjectView } from './views/AboutProjectView';
import { Shield, XCircle } from 'lucide-react';

const PasswordChangeModal = ({ onPasswordChanged }: { onPasswordChanged: () => void }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    setIsChanging(true);
    setError('');

    try {
      const res = await apiRequest('/accounts/api/change-password/', {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword })
      });
      if (res.success) {
        alert("Password changed successfully. Please log in again with your new password.");
        onPasswordChanged();
      } else {
        setError(res.error || "Failed to change password.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative"
      >
        <h2 className="text-2xl font-black text-slate-900 mb-2">Change Your Password</h2>
        <p className="text-slate-500 text-sm mb-6">For security, you must change the default password before proceeding.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500"
          />
          <input 
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500"
          />
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          <button 
            type="submit"
            disabled={isChanging}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl mt-4"
          >
            {isChanging ? 'Saving...' : 'Set New Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eams_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('eams_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('eams_user');
    setUser(null);
  };

  const handlePasswordChanged = () => {
    handleLogout();
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  if (user.must_change_password) {
    return <PasswordChangeModal onPasswordChanged={handlePasswordChanged} />;
  }

  return (
    <BrowserRouter>
      <DashboardLayout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<OverviewView user={user} />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/biometricenrollmentview" element={<BiometricEnrollmentView />} />
          <Route path="/leaveapproval" element={<LeaveApprovalView user={user} />} />
          <Route path="/shiftmanagement" element={<ShiftManagementView user={user} />} />
          <Route path="/profilemanagement" element={<ProfileManagementView />} />
          <Route path="/reports" element={<ReportGenerationView user={user} />} />
          <Route path="/usermanagement" element={<UserManagementView />} />
          <Route path="/attendancerecords" element={<AttendanceRecordsView />} />
          <Route path="/leavemanagement" element={<LeaveManagementView user={user} />} />
          <Route path="/notifications" element={<NotificationsView />} />
          <Route path="/policies" element={<PolicyConfigurationView user={user} />} />
          <Route path="/systemsetup" element={<SystemSetupView />} />
          <Route path="/auditlogs" element={<AuditMonitoringView user={user} />} />
          <Route path="/integrations" element={<ExternalIntegrationView />} />
          <Route path="/about" element={<AboutProjectView />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}
