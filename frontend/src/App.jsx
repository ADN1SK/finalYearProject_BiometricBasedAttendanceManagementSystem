import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Schedule from './pages/Schedule';
import Leave from './pages/Leave';

const NotFound = () => <div style={{ padding: '2rem' }}><h1>404 - Not Found</h1></div>;

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Placeholder components for new features
const UserManagement = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>User Management</h2><p>Manage roles and permissions here.</p></div>;
const Policies = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Policy Configuration</h2><p>Define attendance rules and shifts.</p></div>;
const Setup = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>System Setup</h2><p>Configure biometric devices and workflows.</p></div>;
const Audit = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Audit Monitoring</h2><p>Track system logs and integrity.</p></div>;
const LeavesManage = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Leave Approval</h2><p>Review and process time-off requests.</p></div>;
const Profiles = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Profile Management</h2><p>Update employee details and departments.</p></div>;
const Reports = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Report Generation</h2><p>Analyze patterns and absenteeism.</p></div>;
const History = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Personal Tracking</h2><p>View your attendance history.</p></div>;

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>}
      />
      
      {/* Employee Routes */}
      <Route
        path="/dashboard/history"
        element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>}
      />

      <Route
        path="/dashboard/leave"
        element={<ProtectedRoute><Layout><Leave /></Layout></ProtectedRoute>}
      />

      {/* Admin Routes */}
      <Route
        path="/dashboard/users"
        element={<ProtectedRoute><Layout><UserManagement /></Layout></ProtectedRoute>}
      />
      <Route
        path="/dashboard/policies"
        element={<ProtectedRoute><Layout><Policies /></Layout></ProtectedRoute>}
      />
      <Route
        path="/dashboard/setup"
        element={<ProtectedRoute><Layout><Setup /></Layout></ProtectedRoute>}
      />
      <Route
        path="/dashboard/audit"
        element={<ProtectedRoute><Layout><Audit /></Layout></ProtectedRoute>}
      />

      {/* HR Routes */}
      <Route
        path="/dashboard/leaves/manage"
        element={<ProtectedRoute><Layout><LeavesManage /></Layout></ProtectedRoute>}
      />
      <Route
        path="/dashboard/profiles"
        element={<ProtectedRoute><Layout><Profiles /></Layout></ProtectedRoute>}
      />
      <Route
        path="/dashboard/reports"
        element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>}
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
