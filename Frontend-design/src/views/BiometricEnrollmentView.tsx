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
    setScanStatus('PROCESSING');
    setErrorMessage('');
    
    try {
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

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedEmployee) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    const frame = canvas.toDataURL('image/jpeg', 0.8);
    setScanStatus('PROCESSING');

    try {
      const response = await apiRequest(`/accounts/user/${selectedEmployee.id}/capture/`, {
        method: 'POST',
        body: JSON.stringify({ 
          frame, 
          step: currentChallenge?.type === 'center' ? 1 : 
                currentChallenge?.type === 'left' ? 2 : 3 
        })
      });

      if (response.success) {
        if (response.completed) {
          setScanStatus('SUCCESS');
          stopCamera();
          setTimeout(() => {
            setStep(3);
            setEnrollmentStatus('SUCCESS');
          }, 1500);
        } else {
          setScanStatus('IDLE');
          setCurrentChallenge(response.next_challenge);
        }
      } else {
        throw new Error(response.error || 'Feature extraction failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Capture failed');
      setScanStatus('ERROR');
    }
  };

  const stopCamera = () => {
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
              onClick={() => setStep(2)}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              <span>Continue to Face Recognition</span>
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
            <div className="w-full max-w-md aspect-square bg-slate-900 rounded-[3rem] relative overflow-hidden shadow-2xl border-8 border-white group">
              {isScanning ? (
                <div className="w-full h-full relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-[40px] border-slate-900/50 pointer-events-none" />
                  
                  {/* Scanning Animation Overlay */}
                  <motion.div 
                    initial={{ top: '10%' }}
                    animate={{ top: '90%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20"
                  />

                  {/* Recognition Frame */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
                    <div className="absolute w-48 h-48 border-2 border-primary-400/50 rounded-full" />
                  </div>

                  {/* Status Overlay */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full px-4">
                    <div className="bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center gap-2">
                       <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">{currentChallenge?.text || 'Ready'}</p>
                       <p className="text-white text-xs font-bold">{currentChallenge?.instruction || 'Wait...'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-12">
                  <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Camera className="w-12 h-12 text-white/50" />
                  </div>
                  <p className="text-white/70 font-bold text-sm">Position face within the frame</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-2">Ensure good lighting</p>
                </div>
              )}
            </div>

            <div className="space-y-4 w-full max-w-md">
              <h3 className="text-2xl font-black text-slate-900">{currentChallenge?.text || 'Facial Recognition'}</h3>
              <p className="text-slate-500 text-sm font-medium">{currentChallenge?.instruction || 'Capture employee facial biometric data for secure authentication.'}</p>
              
              {errorMessage && (
                <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-xs font-bold border border-red-100 mb-4">
                  {errorMessage}
                </div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                {!isScanning ? (
                  <button
                    onClick={startCamera}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Initiate Face Scan</span>
                  </button>
                ) : (
                  <button
                    onClick={captureFrame}
                    disabled={scanStatus === 'PROCESSING'}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                  >
                    {scanStatus === 'PROCESSING' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                         <span>Capture {currentChallenge?.type || '...'}</span>
                      </div>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-slate-50 text-slate-400 font-black py-4 rounded-3xl transition-all hover:bg-slate-100 uppercase tracking-widest text-[10px]"
                >
                  Back to Employee Selection
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
            className="glass-card rounded-[2.5rem] p-12 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-100 rotate-3">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900">Enrollment Successful!</h3>
              <p className="text-slate-500 font-medium">Biometric data for <span className="text-primary-600 font-bold">{selectedEmployee?.name}</span> has been securely registered.</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</span>
                <span className="text-sm font-bold text-slate-900">{selectedEmployee?.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</span>
                <span className="text-sm font-bold text-slate-900">{selectedEmployee?.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Date</span>
                <span className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setSelectedEmployee(null);
                setEnrollmentStatus('IDLE');
              }}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-sm"
            >
              Enroll Another Employee
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
