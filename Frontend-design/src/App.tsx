/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';

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

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
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
