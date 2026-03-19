import React, { useState, useEffect } from 'react';
import { Plus, Calendar, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import api from '../api';

const Leave = () => {
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/api/leave/my-requests/');
      if (res.data.success) {
        setRequests(res.data.leave_requests);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) return alert('Dates are required');
    try {
      const res = await api.post('/api/leave/submit/', {
        leave_type: leaveType.toUpperCase().replace(' ', '_'),
        start_date: startDate,
        end_date: endDate,
        reason: reason
      });
      if (res.data.success) {
        alert('Request submitted successfully!');
        setShowForm(false);
        setReason('');
        fetchRequests(); // reload
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Approved': return { color: 'var(--success)', icon: <CheckCircle2 size={16} /> };
      case 'Pending': return { color: 'var(--warning)', icon: <Clock size={16} /> };
      case 'Rejected': return { color: 'var(--danger)', icon: <XCircle size={16} /> };
      default: return { color: 'var(--text-secondary)', icon: <FileText size={16} /> };
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--warning)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>Leave Management</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Submit and track your digital leave requests.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px' }}
          >
            {showForm ? <XCircle size={18} /> : <Plus size={18} />}
            <span>{showForm ? 'Cancel' : 'Request Leave'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr' : '1fr', gap: '2rem' }}>
        {showForm && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', border: '1px solid var(--accent-glow)' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="var(--accent-primary)" />
                New Leave Request
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Leave Type</label>
                <select 
                  value={leaveType} 
                  onChange={e => setLeaveType(e.target.value)} 
                  style={{ width: '100%', padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                >
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Unpaid Leave</option>
                  <option>Maternity Leave</option>
                  <option>Paternity Leave</option>
                </select>
              </div>
              <div>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Start Date</label>
                 <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }} />
              </div>
              <div>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>End Date</label>
                 <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Reason / Additional Notes</label>
                 <textarea 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    placeholder="Briefly describe the reason for your leave..."
                    style={{ width: '100%', padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', minHeight: '100px', resize: 'vertical' }} 
                 />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-secondary)', padding: '0.75rem 1.5rem' }}>Cancel</button>
                <button 
                    onClick={handleSubmit} 
                    className="btn-primary"
                    style={{ padding: '0.75rem 2rem', borderRadius: '10px' }}
                >
                    Submit Request
                </button>
            </div>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Calendar size={20} color="var(--text-secondary)" />
              <h3 style={{ margin: 0 }}>Request History</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.9rem' }}>Leave Type</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.9rem' }}>Start Date</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.9rem' }}>End Date</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.9rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center' }}><RefreshCw className="spin" /></td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No leave requests found.</td></tr>
                ) : requests.map(req => {
                  const info = getStatusInfo(req.status);
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{ fontWeight: '500' }}>{req.leave_type}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{req.start_date}</td>
                      <td style={{ padding: '1rem' }}>{req.end_date}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: info.color, 
                          background: `rgba(${req.status === 'Approved' ? '16, 185, 129' : req.status === 'Rejected' ? '239, 68, 68' : '245, 158, 11'}, 0.1)`, 
                          padding: '0.4rem 0.85rem', 
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          width: 'fit-content'
                        }}>
                          {info.icon}
                          {req.status}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leave;
