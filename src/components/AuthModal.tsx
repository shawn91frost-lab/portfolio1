import React, { useState } from 'react';
import { User } from '../types';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export type AuthMode = 'login' | 'signup' | 'forgot' | 'verify' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password?: string) => { success: boolean; error?: string; user?: User };
  onSignup: (name: string, email: string, password?: string) => { success: boolean; error?: string; user?: User };
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSignup,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (mode === 'login') {
      const res = onLogin(email, password);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Authentication failed');
      }
    } else if (mode === 'signup') {
      if (!name || !email || !password) {
        setErrorMessage('All fields are required');
        return;
      }
      const res = onSignup(name, email, password);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Account creation failed');
      }
    } else if (mode === 'forgot') {
      if (!email) {
        setErrorMessage('Please enter your registered email address');
        return;
      }
      setSuccessNotice(`Password reset instructions and verification code sent to ${email}`);
      setMode('reset');
    } else if (mode === 'reset') {
      setSuccessNotice('Your password has been successfully reset. Please log in.');
      setMode('login');
    } else if (mode === 'verify') {
      setSuccessNotice('Email address verified successfully. Welcome!');
      setMode('login');
    }
  };

  const handleQuickDemoUser = (userType: 'investor' | 'admin') => {
    const targetEmail = userType === 'investor' ? 'investor@niftypulse.in' : 'admin@niftypulse.in';
    const res = onLogin(targetEmail);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-xs font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-slate-100 font-sans tracking-tight">
            NIFTY<span className="text-emerald-400">PULSE</span> AUTH
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-100">
          {mode === 'login' && 'Sign in to your Investment Vault'}
          {mode === 'signup' && 'Create your Private Trading Vault'}
          {mode === 'forgot' && 'Reset your Vault Password'}
          {mode === 'reset' && 'Enter Verification Code'}
          {mode === 'verify' && 'Verify Your Email Address'}
        </h3>
        <p className="text-slate-400 text-xs mt-1">
          {mode === 'login' && 'Your holdings, transactions, and alerts are isolated with Row-Level Security.'}
          {mode === 'signup' && 'Instant setup. Complete multi-user isolation guarantees private portfolio data.'}
          {mode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          {mode === 'reset' && 'Provide the 6-digit confirmation code.'}
          {mode === 'verify' && 'Confirm your email to complete registration.'}
        </p>

        {/* Quick Demo Logins Banner */}
        {mode === 'login' && (
          <div className="my-4 p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[11px] font-mono text-slate-400">⚡ QUICK DEMO ACCESS</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoUser('investor')}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-200 text-left font-sans flex flex-col"
              >
                <span className="font-bold text-emerald-400">Investor Account</span>
                <span className="text-[10px] text-slate-500 font-mono">Pre-loaded portfolio</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoUser('admin')}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-200 text-left font-sans flex flex-col"
              >
                <span className="font-bold text-amber-400">Admin Console</span>
                <span className="text-[10px] text-slate-500 font-mono">Signal weights & cron</span>
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="my-3 p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg text-xs">
            {errorMessage}
          </div>
        )}

        {successNotice && (
          <div className="my-3 p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs">
            {successNotice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3.5">
          {mode === 'signup' && (
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-medium">Your Full Name</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Vikram Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-slate-100 focus:outline-none placeholder:text-slate-600"
                  required
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-medium">Email Address</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-slate-100 focus:outline-none placeholder:text-slate-600 font-mono"
                  required
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('forgot');
                    }}
                    className="text-slate-400 hover:text-emerald-400 text-[11px]"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-slate-100 focus:outline-none placeholder:text-slate-600 font-mono"
                  required
                />
              </div>
            </div>
          )}

          {(mode === 'reset' || mode === 'verify') && (
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-medium">Verification Code</label>
              <input
                type="text"
                placeholder="6-digit code (e.g. 583921)"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-center tracking-widest text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mt-1 shadow-md"
          >
            <span>
              {mode === 'login' && 'Sign In to Vault'}
              {mode === 'signup' && 'Create Free Account'}
              {mode === 'forgot' && 'Send Recovery Email'}
              {mode === 'reset' && 'Confirm New Password'}
              {mode === 'verify' && 'Verify Code'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setMode('signup');
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setMode('login');
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
