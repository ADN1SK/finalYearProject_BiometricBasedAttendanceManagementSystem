import React, { useState, useRef } from 'react';
import { Fingerprint, CheckCircle2, Clock, LogOut, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';
import { apiRequest } from '../api/client';

interface AttendanceTerminalProps {
  onAttendanceMarked: (user: User, type: 'IN' | 'OUT') => void;
}

export const AttendanceTerminal = ({ onAttendanceMarked }: AttendanceTerminalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [identifiedUser, setIdentifiedUser] = useState<User | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScan = async () => {
    setIsScanning(true);
    setScanStatus('SCANNING');
    setIdentifiedUser(null);
    setErrorMessage('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Wait 2 seconds for camera to stabilize, then capture
      setTimeout(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg', 0.8);

          try {
            const response = await apiRequest('/api/attendance/mark/', {
              method: 'POST',
              body: JSON.stringify({ image: imageData }),
            });

            if (response.success) {
              const user: User = {
                id: response.id || 'unknown',
                name: response.username,
                email: `${response.username}@hu-iot.edu`,
                role: 'EMPLOYEE', // Default for terminal identification
                department: 'Computer Science', // Mock or fetch real dept later
              };
              
              setIdentifiedUser(user);
              setScanStatus('SUCCESS');
              
              // Stop camera
              stream.getTracks().forEach(track => track.stop());

              setTimeout(() => {
                onAttendanceMarked(user, response.type === 'CHECK_IN' ? 'IN' : 'OUT');
                setScanStatus('IDLE');
                setIsScanning(false);
              }, 3000);
            } else {
              throw new Error(response.error || 'Identity not recognized');
            }
          } catch (err: any) {
            setErrorMessage(err.message || 'Scan Failed');
            setScanStatus('ERROR');
            stream.getTracks().forEach(track => track.stop());
            setTimeout(() => {
              setIsScanning(false);
              setScanStatus('IDLE');
            }, 4000);
          }
        }
      }, 2000);

    } catch (err) {
      console.error("Camera access denied", err);
      setScanStatus('ERROR');
      setErrorMessage('Camera access denied');
      setTimeout(() => setIsScanning(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {!isScanning ? (
        <div className="text-center space-y-6 py-4">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center mx-auto border-4 border-primary-100 animate-pulse">
              <Fingerprint className="w-16 h-16 text-primary-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Attendance Terminal</h2>
            <p className="text-slate-500 text-sm mt-1">Position yourself in front of the camera</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={startScan}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 flex flex-col items-center gap-2 transition-all"
            >
              <Clock className="w-6 h-6" />
              <span>Check In</span>
            </button>
            <button 
              onClick={startScan}
              className="bg-white border-2 border-slate-100 hover:border-primary-200 text-slate-700 font-bold py-4 rounded-2xl flex flex-col items-center gap-2 transition-all"
            >
              <LogOut className="w-6 h-6 rotate-180" />
              <span>Check Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden bg-black aspect-square max-w-sm mx-auto shadow-2xl">
          {scanStatus === 'SCANNING' && (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 border-[3px] border-primary-500/50 m-12 rounded-full animate-pulse" />
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan" />
              <div className="absolute inset-x-0 bottom-8 text-center">
                <p className="text-white text-sm font-bold tracking-widest uppercase animate-pulse">Scanning Face...</p>
              </div>
            </>
          )}

          {scanStatus === 'SUCCESS' && identifiedUser && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-emerald-600 flex flex-col items-center justify-center text-white p-6 text-center"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold">Access Granted</h3>
              <p className="mt-2 opacity-90">Welcome, {identifiedUser.name}</p>
              <p className="text-xs mt-1 opacity-75">{identifiedUser.department}</p>
              <div className="mt-6 px-4 py-2 bg-white/10 rounded-xl text-sm font-mono">
                {new Date().toLocaleTimeString()}
              </div>
            </motion.div>
          )}

          {scanStatus === 'ERROR' && (
            <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center text-white p-6 text-center">
              <XCircle className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-bold">Scan Failed</h3>
              <p className="mt-2 text-sm opacity-90">{errorMessage || 'Face not recognized. Please try again or contact HR.'}</p>
            </div>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
