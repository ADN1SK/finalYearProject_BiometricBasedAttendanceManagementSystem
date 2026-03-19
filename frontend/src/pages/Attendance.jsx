import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Fingerprint, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Attendance = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, checking, success, error
  const [message, setMessage] = useState('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setStatus('idle');
      setMessage('');
    } catch (err) {
      console.error('Error accessing webcam', err);
      setStatus('error');
      setMessage('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  // Cleanup and Init on mount
  useEffect(() => {
    // Proactively refresh embeddings cache when terminal is opened
    api.get('/api/attendance/reload-embeddings/').catch(err => console.error("Cache refresh failed", err));
    
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const captureAndCheck = async () => {
    if (!videoRef.current) return;
    
    setStatus('checking');
    setMessage('Verifying identity, please stay still...');

    // Wait a brief moment for user to stabilize after clicking
    await new Promise(r => setTimeout(r, 500));

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Using 480x360 to match enrollment aspect ratio and scale
    canvas.width = 480;
    canvas.height = 360;
    
    // Draw mirrored to match video display if needed, but DeepFace handles it.
    // However, for consistency with enrollment which is 320x240:
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Use 0.6 quality to match enrollment compression
    const frameBase64 = canvas.toDataURL('image/jpeg', 0.6);

    try {
      const response = await api.post('/api/attendance/mark/', { image: frameBase64 });
      if (response.data.success) {
        setStatus('success');
        setMessage(`Identity Verified! ${response.data.username} successfully ${response.data.type === 'CHECK_IN' ? 'Checked In' : 'Checked Out'}.`);
        stopCamera();
        
        // Auto-reset after 5 seconds to allow next person
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(response.data.error || 'Verification failed.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      background: 'var(--bg-main)'
    }}>
      <div className="glass-panel" style={{ 
        padding: '3rem', 
        textAlign: 'center', 
        maxWidth: '700px', 
        width: '100%',
        borderTop: '4px solid var(--accent-primary)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={18} />
            <span>Staff Portal</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Fingerprint size={24} color="var(--accent-primary)" />
             <span style={{ fontWeight: 'bold' }}>BBEAMS TERMINAL</span>
          </div>
        </div>

        <h2>Biometric Attendance</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Stand in front of the camera to automatically check in or check out.
        </p>

        <div style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: '500px', 
          margin: '0 auto 2.5rem', 
          background: '#000', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          aspectRatio: '1/1',
          border: '3px solid var(--border-color)',
          boxShadow: 'var(--accent-glow) 0 0 30px'
        }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: stream ? 'block' : 'none', transform: 'scaleX(-1)' }}
          />
          
          {stream && (
            <>
              {/* Professional Face Guide Overlay */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <mask id="face-mask">
                      <rect width="100" height="100" fill="white" />
                      <ellipse cx="50" cy="48" rx="28" ry="38" fill="black" />
                    </mask>
                  </defs>
                  <rect width="100" height="100" fill="rgba(0,0,0,0.6)" mask="url(#face-mask)" />
                  <ellipse cx="50" cy="48" rx="28" ry="38" fill="none" stroke={status === 'success' ? 'var(--success)' : status === 'error' ? 'var(--danger)' : 'var(--accent-primary)'} strokeWidth="0.5" strokeDasharray={status === 'checking' ? "2 1" : "none"} />
                </svg>
              </div>

              {/* Scanning Line Animation during check */}
              {status === 'checking' && (
                <div style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '2px', 
                  background: 'linear-gradient(to right, transparent, var(--accent-primary), transparent)',
                  boxShadow: '0 0 15px var(--accent-primary)',
                  top: '0%',
                  zIndex: 10,
                  animation: 'scan 2s linear infinite'
                }} />
              )}
            </>
          )}

          {!stream && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%' }}>
                <Camera size={64} color="var(--text-tertiary)" />
              </div>
              <button 
                onClick={startCamera}
                className="btn-primary"
                style={{ 
                  padding: '1rem 2.5rem', 
                  borderRadius: '12px', 
                  fontWeight: '600',
                  fontSize: '1.2rem',
                }}
              >
                Initialize Terminal
              </button>
            </div>
          )}
          {status === 'checking' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
               {/* Center highlight during scan */}
            </div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {stream && status !== 'success' && status !== 'checking' && (
          <button 
            onClick={captureAndCheck}
            style={{ 
              background: 'white', 
              color: 'black', 
              padding: '1.25rem 2.5rem', 
              borderRadius: '12px', 
              fontWeight: '700',
              fontSize: '1.2rem',
              transition: 'transform 0.2s',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Mark Attendance Now
          </button>
        )}

        {(status === 'success' || status === 'error' || status === 'checking') && (
          <div style={{ 
            background: status === 'success' ? 'rgba(16, 185, 129, 0.1)' : status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)', 
            color: status === 'success' ? 'var(--success)' : status === 'error' ? 'var(--danger)' : 'var(--accent-primary)', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem',
            marginTop: '1rem',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            {status === 'success' ? <CheckCircle size={24} /> : status === 'error' ? <AlertCircle size={24} /> : null}
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
