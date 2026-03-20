import React, { useState, useRef, useEffect } from 'react';
import { Fingerprint, User as UserIcon, Shield, CheckCircle2, AlertCircle, Camera, RefreshCw, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiRequest } from '../api/client';
import { User } from '../types';

export const BiometricEnrollmentView = () => {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (step === 1) {
      setLoading(true);
      apiRequest('/accounts/api/users/')
        .then(res => {
          if (res.success) setEmployees(res.users);
        })
        .finally(() => setLoading(false));
    }
  }, [step]);

  const startCamera = async () => {
    setIsScanning(true);
    setScanStatus('IDLE');
    setErrorMessage('');
    
    try {
      // Ensure we have a valid CSRF session before starting
      await apiRequest('/accounts/api/csrf/');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      // Initial challenge
      setCurrentChallenge({ type: 'center', text: 'Look Straight', instruction: 'Align your face' });

    } catch (err) {
      console.error("Camera access error:", err);
      setScanStatus('ERROR');
      setErrorMessage('Camera access denied');
      setIsScanning(false);
    }
  };


  const [stableCount, setStableCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const capturingRef = useRef(false);

  useEffect(() => {
    let interval: any;
    if (step === 2 && isScanning && !isTransitioning) {
      interval = setInterval(async () => {
        if (capturingRef.current || isTransitioning) return;
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        // Important: Wait for video to be properly initialized with metadata
        if (!canvas || !video || video.videoWidth === 0) return;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            canvas.width = 320;
            canvas.height = 240;
            ctx.drawImage(video, 0, 0, 320, 240);
            const frame = canvas.toDataURL('image/jpeg', 0.4);
            
            try {
                const res = await apiRequest('/accounts/face/check/', {
                    method: 'POST',
                    body: JSON.stringify({ frame })
                });
                if (res.face) {
                    setStableCount(prev => {
                        const next = prev + 1;
                        if (next > 2) {
                            // Trigger the actual burst capture
                            captureFrame();
                            return 0; 
                        }
                        return next;
                    });
                } else {
                    setStableCount(0);
                }
            } catch (err) {
                console.error("Auto-check failed", err);
            }
        }
      }, 900); // 900ms matched from capture.html
    }
    return () => clearInterval(interval);
  }, [step, isScanning, currentChallenge]); // Add currentChallenge to re-init if it changes


  const captureFrame = async () => {
    if (capturingRef.current || !videoRef.current || !canvasRef.current || !selectedEmployee) return;
    if (videoRef.current.videoWidth === 0) return; // Wait for video feed
    
    capturingRef.current = true;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    
    setScanStatus('PROCESSING');
    setErrorMessage('');

    const capturedFrames: string[] = [];
    const captureInterval = 200;
    const totalFrames = 8;

    for (let i = 0; i < totalFrames; i++) {
        if (ctx) {
            ctx.drawImage(video, 0, 0, 320, 240);
            capturedFrames.push(canvas.toDataURL('image/jpeg', 0.6));
        }
        await new Promise(resolve => setTimeout(resolve, captureInterval));
    }

    try {
      const response = await apiRequest(`/accounts/user/${selectedEmployee.id}/capture/`, {
        method: 'POST',
        body: JSON.stringify({ 
          frames: capturedFrames,
          challenge: currentChallenge?.type,
          step: currentChallenge?.type === 'center' ? 0 : 
                currentChallenge?.type === 'left' ? 1 : 2
        })
      });

      if (response.success) {
        if (response.can_verify) {
          // New: All capture steps done, now trigger final verification
          setScanStatus('PROCESSING'); // Keep processing status
          try {
            const verifyRes = await apiRequest(`/accounts/user/${selectedEmployee.id}/verify/`, {
              method: 'POST'
            });
            
            if (verifyRes.success && verifyRes.completed) {
              setScanStatus('SUCCESS');
              stopCamera();
              setTimeout(() => {
                setStep(3);
                setEnrollmentStatus('SUCCESS');
              }, 1500);
            } else {
              setScanStatus('IDLE');
              setErrorMessage(verifyRes.error || 'Verification failed. Please try again.');
              setStableCount(0);
            }
          } catch (err: any) {
            setErrorMessage(err.message || 'Verification process failed');
            setScanStatus('ERROR');
          }
        } else {
          // Standard next step transition
          setScanStatus('IDLE');
          setCurrentChallenge(response.next_challenge);
          setIsTransitioning(true);
          setStableCount(0);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 4000);
        }
      } else {
        setScanStatus('IDLE');
        setErrorMessage(response.error || 'Face stability check failed. Trying again...');
        setStableCount(0);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Capture failed');
      setScanStatus('ERROR');
    } finally {
      capturingRef.current = false;
    }
  };

  const stopCamera = () => {
    capturingRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Biometric Enrollment</h1>
          <p className="text-slate-500 mt-1 font-medium">Register new employee biometric data for the EAMS system.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <div className={`w-2 h-2 rounded-full ${enrollmentStatus === 'SCANNING' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">System Ready</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-12 relative">
        <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 ${
              step >= s ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-white text-slate-300 border-2 border-slate-100'
            }`}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-primary-600' : 'text-slate-400'}`}>
              {s === 1 ? 'Select Employee' : s === 2 ? 'Face Scan' : 'Complete'}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-[2.5rem] p-10 space-y-8"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900">Select Employee for Enrollment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-2 text-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-2" />
                    <p className="text-sm font-bold text-slate-400">Loading employees...</p>
                  </div>
                ) : employees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 text-left group ${
                      selectedEmployee?.id === emp.id 
                        ? 'border-primary-600 bg-primary-50 shadow-lg shadow-primary-100' 
                        : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      selectedEmployee?.id === emp.id ? 'bg-primary-600 text-white' : 'bg-white text-slate-400 group-hover:text-primary-600'
                    }`}>
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{emp.department}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!selectedEmployee}
              onClick={() => { 
                const backendUrl = `http://${window.location.hostname}:8000/accounts/user/${selectedEmployee.id}/capture/`;
                window.location.assign(backendUrl); 
              }}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              <span>Continue to Secure Enrollment</span>
              <Shield className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-8"
          >
            <div className="w-full max-w-sm">
              {/* Internal Diagnostic Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    Admin Oversight
                  </div>
                  <div className={`px-3 py-1 ${isScanning ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {isScanning ? 'Stream Active' : 'Sensor Idle'}
                  </div>
                </div>
                {isScanning && (
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     Phase {currentChallenge?.type === 'center' ? '1' : currentChallenge?.type === 'left' ? '2' : '3'} / 3
                  </div>
                )}
              </div>

              {/* Viewfinder Area */}
              <div className="relative aspect-[4/3] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group">
                {isScanning ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover mirror scale-x-[-1]"
                    />
                    
                    {/* Guidance Overlay Pattern */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                       {/* Face Positioning Silhouette */}
                       <svg className={`w-3/4 h-3/4 transition-all duration-700 ${stableCount > 0 ? 'text-emerald-400/40 scale-105' : 'text-white/20'}`} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 180C130 180 160 150 160 110C160 70 145 30 100 30C55 30 40 70 40 110C40 150 70 180 100 180Z" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                          <circle cx="75" cy="90" r="5" fill="currentColor" opacity="0.5" />
                          <circle cx="125" cy="90" r="5" fill="currentColor" opacity="0.5" />
                          <path d="M80 140C90 145 110 145 120 140" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                       </svg>

                       {/* Interactive Scanning HUD */}
                       {scanStatus === 'PROCESSING' && (
                         <motion.div 
                           initial={{ top: '10%' }}
                           animate={{ top: '90%' }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                           className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_20px_rgba(96,165,250,0.8)]"
                         />
                       )}
                    </div>

                    {/* Pro Corner Markers */}
                    <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-white/40 rounded-tl-2xl" />
                    <div className="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-white/40 rounded-tr-2xl" />
                    <div className="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-white/40 rounded-bl-2xl" />
                    <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-white/40 rounded-br-2xl" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-50">
                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl border border-slate-100">
                      <Camera className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Sensor Initialization...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 w-full max-w-md">
              <div className="text-center space-y-2">
                <h3 className={`text-3xl font-black transition-all duration-300 ${scanStatus === 'PROCESSING' ? 'text-primary-600 scale-105' : 'text-slate-900'}`}>
                  {currentChallenge?.text || 'Identity Enrollment'}
                </h3>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-80">
                  {currentChallenge?.instruction || 'Position face within the guidance markers.'}
                </p>
              </div>
              
              <AnimatePresence>
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 p-5 rounded-[2rem] text-xs font-black border-2 border-red-100 flex items-center gap-4 text-left"
                  >
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4 flex flex-col gap-4">
                {!isScanning ? (
                  <button
                    onClick={startCamera}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-primary-200 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm"
                  >
                    <Camera className="w-6 h-6" />
                    <span>Engage Sensor Array</span>
                  </button>
                ) : (
                  <div className="w-full space-y-4">
                     <div className="p-6 bg-white rounded-[2.5rem] border-4 border-slate-50 flex flex-col items-center gap-5 shadow-inner">
                        <div className="flex items-center gap-5">
                           {scanStatus === 'PROCESSING' ? (
                             <RefreshCw className="w-7 h-7 animate-spin text-primary-600" />
                           ) : (
                             <div className="flex gap-2">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className={`w-4 h-4 rounded-full transition-all duration-500 ${stableCount >= i ? 'bg-emerald-500 scale-125 shadow-lg shadow-emerald-200' : 'bg-slate-100 shadow-inner'}`} />
                                ))}
                             </div>
                           )}
                           <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-900">
                             {scanStatus === 'PROCESSING' ? 'Acquiring Vectors...' : 
                              isTransitioning ? 'Preparing Next Phase...' : 
                               stableCount > 0 ? 'Face detected' : 'Show your face'}
                           </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60 italic">
                           {scanStatus === 'PROCESSING' ? 'Executing 8-frame biometric burst' : 
                            isTransitioning ? 'Prepare for secondary challenge mode' :
                            'Maintain absolute stability within markers'}
                        </p>
                     </div>
                  </div>
                )}
                <button
                  onClick={() => { stopCamera(); setStep(1); }}
                  className="w-full bg-slate-100/50 text-slate-400 font-black py-4 rounded-[1.5rem] transition-all hover:bg-red-50 hover:text-red-400 uppercase tracking-widest text-[9px]"
                >
                  Abort Enrollment Sequence
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[2.5rem] p-12 text-center space-y-10"
          >
            <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-100 rotate-6 border-4 border-white">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            <div className="space-y-3">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">Access Granted</h3>
              <p className="text-slate-500 font-bold text-lg">
                Biometric profile for <span className="text-primary-600 underline underline-offset-8">{selectedEmployee?.name}</span> is finalized.
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-8 border-2 border-slate-50 text-left space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Signature</span>
                <span className="text-xs font-black text-slate-900 tracking-wider">SEC_BIO_{selectedEmployee?.id?.substring(0,8).toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Status</span>
                <span className="text-xs font-black text-emerald-600 uppercase">Authenticated</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encryption Level</span>
                <span className="text-xs font-black text-primary-600 uppercase">AES-256-GCM</span>
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setSelectedEmployee(null);
                setEnrollmentStatus('IDLE');
              }}
              className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-slate-300 uppercase tracking-[0.2em] text-sm hover:scale-[1.02]"
            >
              Register New Identity
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas ref={canvasRef} width="320" height="240" className="hidden" />
    </div>
  );
};
