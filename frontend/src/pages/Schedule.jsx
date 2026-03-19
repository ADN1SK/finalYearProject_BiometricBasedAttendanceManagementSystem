import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, RefreshCw } from 'lucide-react';
import api from '../api';

const Schedule = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await api.get('/api/scheduling/my-assignments/');
        if (res.data.success) {
          setShifts(res.data.assignments);
        }
      } catch (err) {
        console.error('Failed to fetch shifts', err);
      }
      setLoading(false);
    };
    fetchShifts();
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>My Work Schedule</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>View your assigned shifts and departmental rotations.</p>
          </div>
          <Calendar size={32} color="var(--accent-primary)" style={{ opacity: 0.5 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <RefreshCw className="spin" size={32} color="var(--accent-primary)" />
          </div>
        ) : shifts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>No active shift assignments found for your account.</p>
          </div>
        ) : shifts.map(shift => (
          <div key={shift.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem 2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ background: 'var(--accent-glow)', padding: '1rem', borderRadius: '14px', color: 'var(--accent-primary)' }}>
                    <Clock size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.25rem' }}>{shift.shift}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} />
                        {shift.from_date} {shift.to_date ? `— ${shift.to_date}` : '(Ongoing)'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} />
                        Main Office
                    </span>
                  </div>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    color: 'var(--accent-primary)', 
                    padding: '0.6rem 1.25rem', 
                    borderRadius: '12px', 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    letterSpacing: '0.5px',
                    border: '1px solid var(--accent-glow)'
                }}>
                  {shift.time}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: '500' }}>
                    Punctuality Required
                </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '3rem', textAlign: 'center', opacity: 0.8 }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Need to change your shift? Please contact your <span style={{ color: 'var(--accent-primary)' }}>Department Head</span> or HR Officer.
        </p>
      </div>
    </div>
  );
};

export default Schedule;
