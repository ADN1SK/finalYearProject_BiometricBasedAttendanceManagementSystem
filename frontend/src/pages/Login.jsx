import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Key, User, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Login.css'; // We will create this next or use inline styles for now.

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const success = await login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-box glass-panel">
        <div className="login-header">
          <div className="logo-icon">
            <LogIn size={32} color="var(--accent-primary)" />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access the Attendance System</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Key className="input-icon" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Need to check in or out?</p>
          <Link to="/attendance" className="terminal-link" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem', 
            color: 'var(--accent-primary)', 
            fontWeight: '600',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--accent-primary)',
            transition: 'all 0.2s'
          }}>
            <Fingerprint size={20} />
            <span>Open Attendance Terminal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
