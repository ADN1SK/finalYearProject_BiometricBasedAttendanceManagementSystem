import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, Calendar, Clock, BarChart3, Fingerprint } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  const getNavLinks = () => {
    const role = user?.role;
    
    if (role === 'Administrator') {
      return [
        { path: '/dashboard', label: 'Overview', icon: BarChart3 },
        { path: 'http://localhost:8000/admin/accounts/employeedetail/', label: 'Enroll Face (Admin)', icon: Fingerprint, external: true },
        { path: '/dashboard/users', label: 'User Management', icon: UserIcon },
        { path: '/dashboard/policies', label: 'Policy Config', icon: Clock },
        { path: '/dashboard/setup', label: 'System Setup', icon: Fingerprint },
        { path: '/dashboard/audit', label: 'Audit Logs', icon: BarChart3 },
      ];
    }
    
    if (role === 'HR Officer') {
      return [
        { path: '/dashboard', label: 'Overview', icon: BarChart3 },
        { path: 'http://localhost:8000/admin/accounts/employeedetail/', label: 'Enroll Face (Admin)', icon: Fingerprint, external: true },
        { path: '/dashboard/leaves/manage', label: 'Leave Approval', icon: Calendar },
        { path: '/dashboard/profiles', label: 'Profile Management', icon: UserIcon },
        { path: '/dashboard/reports', label: 'Report Generation', icon: BarChart3 },
      ];
    }
    
    // Default to Employee
    return [
      { path: '/dashboard', label: 'Overview', icon: BarChart3 },
      { path: '/dashboard/history', label: 'Personal Tracking', icon: Clock },
      { path: '/dashboard/leave', label: 'Leave Submission', icon: Calendar },
    ];
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <Fingerprint size={28} color="var(--accent-primary)" />
          <h2>BBEAMS</h2>
        </div>
        
        <nav className="sidebar-nav">
          {getNavLinks().map(({ path, label, icon: Icon, external }) => (
            external ? (
              <a 
                key={path} 
                href={path} 
                target="_blank" 
                rel="noopener noreferrer"
                className="nav-link"
              >
                <Icon size={20} />
                <span>{label}</span>
              </a>
            ) : (
              <NavLink 
                key={path} 
                to={path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={path === '/dashboard'}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            )
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">
              <UserIcon size={20} />
            </div>
            <div className="user-details">
              <p className="username">{user?.username}</p>
              <p className="role">{user?.role}</p>
            </div>
          </div>
          <button className="logout-button" onClick={logout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <h1 className="page-title">Dashboard</h1>
          <div className="topbar-actions">
            {/* Additional actions like notifications could go here */}
          </div>
        </header>
        <div className="content-area animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
