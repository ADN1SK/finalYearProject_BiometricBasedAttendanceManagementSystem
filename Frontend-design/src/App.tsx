/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveTab('overview');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('overview');
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {activeTab === 'overview' && <OverviewView user={user} />}
          {activeTab === 'biometric-enrollment' && <BiometricEnrollmentView />}
          {activeTab === 'leave-approval' && <LeaveApprovalView user={user} />}
          {activeTab === 'shift-management' && <ShiftManagementView user={user} />}
          {activeTab === 'profile-management' && <ProfileManagementView />}
          {activeTab === 'reports' && <ReportGenerationView user={user} />}
          {activeTab === 'user-management' && <UserManagementView />}
          {activeTab === 'attendance-records' && <AttendanceRecordsView />}
          {activeTab === 'leave-management' && <LeaveManagementView user={user} />}
          {activeTab === 'notifications' && <NotificationsView />}
          {activeTab === 'policies' && <PolicyConfigurationView user={user} />}
          {activeTab === 'system-setup' && <SystemSetupView />}
          {activeTab === 'audit-logs' && <AuditMonitoringView user={user} />}
          {activeTab === 'integrations' && <ExternalIntegrationView />}
          {activeTab === 'about' && <AboutProjectView />}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
