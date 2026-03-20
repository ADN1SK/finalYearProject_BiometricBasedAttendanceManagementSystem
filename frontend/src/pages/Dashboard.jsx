import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import {
  ShieldCheck, BarChart3, Users, Clock, Bell, FileText,
  Briefcase, UserCheck, Settings, Activity, LogOut,
  RefreshCw, CheckCircle, AlertCircle, Calendar, User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Helper Components ---
const StatCard = ({ icon, label, value, color, link }) => (
  <Link to={link || '#'} className="stat-card glass-panel" style={{ '--card-color': `var(--${color})` }}>
    <div className="stat-card-icon">{icon}</div>
    <div className="stat-card-info">
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value}</span>
    </div>
  </Link>
);

const RecentActivityItem = ({ record }) => (
  <tr className="activity-item">
    <td>{record.date}</td>
    <td>
      <span className={`type-pill ${record.type_code.toLowerCase()}`}>
        {record.type}
      </span>
    </td>
    <td>{record.time}</td>
    <td>
      <span className={`status-pill ${record.status_code.toLowerCase()}`}>
        {record.status}
      </span>
    </td>
  </tr>
);

const NotificationItem = ({ notification }) => (
  <div className="notification-item">
    <div className="notification-icon"><Bell size={18} /></div>
    <div className="notification-content">
      <p>{notification.message}</p>
      <small>{notification.time_ago}</small>
    </div>
  </div>
);

// --- Role-Specific Dashboards ---

const AdminDashboard = () => (
  <div className="dashboard-grid">
    <StatCard icon={<Users size={28} />} label="User Management" value="Assign Roles" color="blue" link="/dashboard/users" />
    <StatCard icon={<Briefcase size={28} />} label="Policy Configuration" value="Set Rules" color="yellow" link="/dashboard/policies" />
    <StatCard icon={<Settings size={28} />} label="System Setup" value="Configure Devices" color="green" link="/dashboard/setup" />
    <StatCard icon={<Activity size={28} />} label="Audit Monitoring" value="Track Logs" color="red" link="/dashboard/audit" />
  </div>
);

const HRDashboard = ({ stats, handleSync }) => (
  <div className="dashboard-grid">
    <StatCard icon={<UserCheck size={28} />} label="Biometric Enrollment" value="Register Users" color="blue" link="http://localhost:8000/admin/accounts/employeedetail/" />
    <StatCard icon={<Calendar size={28} />} label="Leave Approval" value={`${stats.leaves} Pending`} color="yellow" link="/dashboard/leaves/manage" />
    <StatCard icon={<User size={28} />} label="Profile Management" value="Update Details" color="green" link="/dashboard/profiles" />
    <StatCard icon={<BarChart3 size={28} />} label="Report Generation" value="Analyze Data" color="red" link="/dashboard/reports" />
    <div className="glass-panel sync-widget">
      <h3>Terminal Sync</h3>
      <p>Ensure all biometric terminals have the latest user data.</p>
      <button onClick={handleSync} className="btn-sync">
        <RefreshCw size={16} />
        <span>Sync Now</span>
      </button>
    </div>
  </div>
);

const EmployeeDashboard = ({ stats, history, notifications }) => (
  <>
    {/* Mini Stats Bar */}
    <div className="mini-stats-bar">
      <div className="mini-stat">
        <span>Days Present ({stats.attendance?.month_name || 'Month'})</span>
        <strong style={{ color: 'var(--blue)' }}>{stats.attendance?.present_days || 0}</strong>
      </div>
      <div className="mini-stat">
        <span>Late Arrivals</span>
        <strong style={{ color: 'var(--yellow)' }}>{stats.attendance?.late_count || 0}</strong>
      </div>
      <div className="mini-stat">
        <span>Hours Worked</span>
        <strong style={{ color: 'var(--green)' }}>{stats.attendance?.total_hours || 0}h</strong>
      </div>
      <div className="mini-stat">
        <span>Early Exits</span>
        <strong style={{ color: 'var(--red)' }}>{stats.attendance?.early_exit_count || 0}</strong>
      </div>
    </div>

    <div className="dashboard-columns">
      {/* Left Column: Recent Activity */}
      <div className="glass-panel activity-panel">
        <h3>Recent Activity</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map(rec => <RecentActivityItem key={rec.id} record={rec} />)
              ) : (
                <tr><td colSpan="4" className="empty-state">No recent activity.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Notifications & Quick Links */}
      <div className="right-sidebar">
        <div className="glass-panel notifications-panel">
          <h3>Notifications</h3>
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map(n => <NotificationItem key={n.id} notification={n} />)
            ) : (
              <p className="empty-state">No new notifications.</p>
            )}
          </div>
        </div>
        <div className="glass-panel quick-links-panel">
          <h3>Quick Links</h3>
          <Link to="/dashboard/leave" className="quick-link">
            <Calendar size={18} />
            <span>Submit Leave Request</span>
          </Link>
          <Link to="/dashboard/history" className="quick-link">
            <Clock size={18} />
            <span>View Full History</span>
          </Link>
        </div>
      </div>
    </div>
  </>
);

// --- Main Dashboard Component ---

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ shifts: 0, leaves: 0, attendance: null });
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const endpoints = {
          employee: [
            '/api/scheduling/my-assignments/',
            '/api/leave/my-requests/',
            '/api/attendance/my-history/',
            '/api/attendance/my-stats/',
            '/api/reporting/my-notifications/'
          ],
          hr: [
            '/api/leave/manage/all/?status=PENDING', // Example for pending leaves
          ],
          admin: []
        };

        const role = user?.role === 'HR Officer' ? 'hr' : user?.role === 'Administrator' ? 'admin' : 'employee';
        const roleEndpoints = endpoints[role];

        if (roleEndpoints.length > 0) {
          const responses = await Promise.all(roleEndpoints.map(url => api.get(url)));
          
          if (role === 'employee') {
            const [shiftRes, leaveRes, historyRes, statsRes, notifyRes] = responses;
            setStats({
              shifts: shiftRes.data.success ? shiftRes.data.assignments.length : 0,
              leaves: leaveRes.data.success ? leaveRes.data.leave_requests.length : 0,
              attendance: statsRes.data.success ? statsRes.data.stats : null
            });
            if (historyRes.data.success) setHistory(historyRes.data.records);
            if (notifyRes.data.success) setNotifications(notifyRes.data.notifications);
          } else if (role === 'hr') {
            const [leaveRes] = responses;
            setStats(prev => ({ ...prev, leaves: leaveRes.data.success ? leaveRes.data.leave_requests.length : 0 }));
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const handleSync = async () => {
    try {
      const resp = await api.get('/api/attendance/reload-embeddings/');
      alert(resp.data.message || "Terminal synchronization successful.");
    } catch (err) {
      alert("Failed to synchronize terminal. Please check server logs.");
    }
  };

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'Administrator':
        return <AdminDashboard />;
      case 'HR Officer':
        return <HRDashboard stats={stats} handleSync={handleSync} />;
      case 'Employee':
      default:
        return <EmployeeDashboard stats={stats} history={history} notifications={notifications} />;
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h2>Welcome, {user?.username}</h2>
          <p>Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <RefreshCw className="spin" size={32} />
          <p>Loading Dashboard...</p>
        </div>
      ) : (
        renderDashboardByRole()
      )}
    </div>
  );
};

export default Dashboard;
