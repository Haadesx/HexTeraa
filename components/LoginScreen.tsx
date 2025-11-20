
import React, { useState } from 'react';
import { MapPin, PlayCircle, Crosshair, Loader2, AlertTriangle } from 'lucide-react';
import { loginWithProvider } from '../services/auth';
import { auth } from '../services/firebase';

interface LoginScreenProps {
  onLogin: (name: string, mode: 'GPS' | 'SIMULATION') => void;
}

// Simple SVG Icons for authenticity
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      className="text-blue-500" 
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      className="text-green-500"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      className="text-yellow-500"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      className="text-red-500"
    />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.08-.74 3.49-.74c1.36 0 2.71.65 3.38 1.65-3.14 1.57-2.6 5.71.54 6.9-.69 1.68-1.64 3.33-2.49 4.42zM13.03 5.66c.6-1.57 2.62-2.45 2.44.06-.16 1.77-2.27 2.6-3.02 2.52-.13-1.5.5-2.28.58-2.58z" />
  </svg>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleStart = (mode: 'GPS' | 'SIMULATION') => {
    if (!name.trim()) {
      setError("Callsign required to initialize.");
      return;
    }
    onLogin(name, mode);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError(null);
    setIsAuthenticating(true);
    try {
      const result = await loginWithProvider(provider);
      if (result.success && result.user) {
        // Default to GPS mode for social login as it implies real usage
        onLogin(result.user.name, 'GPS'); 
      } else if (result.error) {
        setError(result.error);
      }
    } catch (e) {
      setError("An unexpected system error occurred.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[2000] bg-slate-900 flex flex-col items-center justify-center p-6 text-white bg-[url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-5xl font-bold brand-font tracking-tighter">
            HEX<span className="text-blue-500">TERRA</span>
          </h1>
          <p className="text-slate-400 tracking-widest uppercase text-sm">Territory Control Protocol</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 animate-pulse">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-red-400 text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Social Login Section */}
        <div className="space-y-3">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 hover:bg-slate-100 font-semibold p-3 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? <Loader2 className="animate-spin text-slate-500" size={20} /> : <GoogleIcon />}
            <span>Sign in with Google</span>
          </button>

          <button
            onClick={() => handleSocialLogin('apple')}
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-3 bg-black text-white hover:bg-slate-900 font-semibold p-3 rounded-xl border border-slate-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? <Loader2 className="animate-spin" size={20} /> : <AppleIcon />}
            <span>Sign in with Apple</span>
          </button>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-widest">Or Guest Access</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        {/* Guest Login */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-md shadow-2xl space-y-4">
          <div>
            <label className="block text-xs font-bold text-blue-400 uppercase mb-2">
              Guest Callsign
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Runner_01"
              className="w-full bg-slate-900/80 border-2 border-slate-600 focus:border-blue-500 rounded-xl px-4 py-3 text-lg text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleStart('GPS')}
              className="group relative flex flex-col items-center justify-center p-4 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/20"
            >
              <div className="mb-2 p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                <MapPin className="text-white" size={24} />
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">Deploy GPS</div>
              </div>
              <Crosshair className="absolute top-2 right-2 text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4" />
            </button>

            <button
              onClick={() => handleStart('SIMULATION')}
              className="group relative flex flex-col items-center justify-center p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl transition-all"
            >
               <div className="mb-2 p-2 bg-slate-600 rounded-lg group-hover:scale-110 transition-transform">
                <PlayCircle className="text-emerald-400" size={24} />
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">Training Sim</div>
              </div>
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-[10px] mt-2 leading-relaxed max-w-xs mx-auto">
          Firebase Config status: {auth?.app?.options?.apiKey?.toString().includes("REPLACE") ? <span className="text-red-400 font-bold">PENDING SETUP</span> : <span className="text-emerald-400 font-bold">LINKED</span>}
        </p>
      </div>
    </div>
  );
};
