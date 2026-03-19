import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { RefreshCw, Shield, BarChart3, Users, Clock, Bell, FileText } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ shifts: 0, leaves: 0, attendance: null });
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [shiftRes, leaveRes, historyRes, statsRes, notifyRes] = await Promise.all([
          api.get('/api/scheduling/my-assignments/'),
          api.get('/api/leave/my-requests/'),
          api.get('/api/attendance/my-history/'),
          api.get('/api/attendance/my-stats/'),
          api.get('/api/reporting/my-notifications/')
        ]);
        
        setStats({
          shifts: shiftRes.data.success ? shiftRes.data.assignments.length : 0,
          leaves: leaveRes.data.success ? leaveRes.data.leave_requests.length : 0,
          attendance: statsRes.data.success ? statsRes.data.stats : null
        });
        
        if (historyRes.data.success) setHistory(historyRes.data.records);
        if (notifyRes.data.success) setNotifications(notifyRes.data.notifications);

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleSync = async () => {
    try {
      const resp = await api.get('/api/attendance/reload-embeddings/');
      alert(resp.data.message || "Terminal synchronization successful.");
    } catch (err) {
      alert("Failed to synchronize terminal. Please check server logs.");
    }
  };

  const renderAdminDashboard = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Users color="var(--accent-primary)" size={24} />
            <h3 style={{ margin: 0 }}>Total Users</h3>
        </div>
        <p style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>Active System</p>
      </div>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Shield color="var(--success)" size={24} />
            <h3 style={{ margin: 0 }}>System Status</h3>
        </div>
        <p style={{ color: 'var(--success)', fontSize: '1.5rem', fontWeight: 'bold' }}>All Modules Online</p>
      </div>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <BarChart3 color="var(--warning)" size={24} />
            <h3 style={{ margin: 0 }}>Pending Audits</h3>
        </div>
        <p style={{ color: 'var(--warning)', fontSize: '1.5rem', fontWeight: 'bold' }}>0 New Logs</p>
      </div>
    </div>
  );

  const renderHRDashboard = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Users color="var(--accent-primary)" size={24} />
            <h3 style={{ margin: 0 }}>Enrollment Status</h3>
        </div>
        <p style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>Ready for Capture</p>
      </div>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Clock color="var(--warning)" size={24} />
            <h3 style={{ margin: 0 }}>Leave Requests</h3>
        </div>
        <p style={{ color: 'var(--warning)', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.leaves} Pending</p>
      </div>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <RefreshCw color="var(--success)" size={24} />
                <h3 style={{ margin: 0 }}>Terminal Data</h3>
            </div>
            <button 
                onClick={handleSync}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                title="Sync Terminal Cache"
            >
                <RefreshCw size={20} />
                Sync
            </button>
        </div>
        <p style={{ color: 'var(--success)', fontSize: '1.5rem', fontWeight: 'bold' }}>Connected</p>
      </div>
    </div>
  );

  const renderEmployeeDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Mini Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderBottom: '3px solid var(--success)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Days Present ({stats.attendance?.month_name || 'Month'})</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.attendance?.present_days || 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderBottom: '3px solid var(--warning)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Late Arrivals</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--warning)' }}>{stats.attendance?.late_count || 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderBottom: '3px solid var(--accent-primary)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Hours Worked</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{stats.attendance?.total_hours || 0}h</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderBottom: '3px solid var(--danger)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Early Exits</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--danger)' }}>{stats.attendance?.early_exit_count || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Attendance History */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Recent Activities</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last 20 records</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Date</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Type</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Time</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent activity.</td></tr>
                ) : history.map((record) => (
                  <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem' }}>{record.date}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: record.type_code === 'CHECK_IN' ? 'var(--success)' : 'var(--accent-primary)', fontWeight: '500' }}>
                        {record.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{record.time}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        background: record.status_code === 'ON_TIME' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: record.status_code === 'ON_TIME' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Bell size={20} color="var(--accent-primary)" />
                <h3 style={{ margin: 0 }}>System Notifications</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No new system notifications.</p>
                ) : notifications.map(n => (
                    <div key={n.id} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.2rem' }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{n.time_ago}</div>
                    </div>
                ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Clock size={20} color="var(--accent-primary)" />
                <h3 style={{ margin: 0 }}>Upcoming Shifts</h3>
            </div>
            <p style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.shifts} Active</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please adhere to assigned schedules.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <FileText size={20} color="var(--warning)" />
                <h3 style={{ margin: 0 }}>Leave Status</h3>
            </div>
            <p style={{ color: 'var(--warning)', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.leaves} Pending</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Requests awaiting approval.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-overview animate-fade-in">
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h2 style={{ fontSize: '1.8rem' }}>Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Welcome back, <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{user?.username}</span> • {user?.role}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>System Local Time</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <RefreshCw className="spin" size={32} color="var(--accent-primary)" />
        </div>
      ) : (
        user?.role === 'Administrator' ? renderAdminDashboard() : 
        user?.role === 'HR Officer' ? renderHRDashboard() : 
        renderEmployeeDashboard()
      )}
    </div>
  );
};

export default Dashboard;
