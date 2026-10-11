import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  GateLogo,
} from '../components/common/GateLogo';
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/app/overview';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; general?: string }>({});
  const [isConnectingPhantom, setIsConnectingPhantom] = useState(false);

  const { loginAsGuest, loginWithEmail, loginWithPhantom } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && !name.trim()) {
      errs.name = 'Name is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    loginWithEmail(email, name);
    showToast({
      type: 'success',
      title: isSignUp ? 'Account Created' : 'Signed In',
      message: `Welcome, ${name || email}! Local demo session activated.`,
    });
    navigate(redirectUrl);
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    showToast({
      type: 'info',
      title: 'Guest Session Started',
      message: 'Browsing Tollkeeper in guest mode.',
    });
    navigate(redirectUrl);
  };

  const handlePhantomLogin = async () => {
    setIsConnectingPhantom(true);
    setErrors({});
    const res = await loginWithPhantom();
    setIsConnectingPhantom(false);

    if (res.success) {
      showToast({
        type: 'success',
        title: 'Phantom Connected',
        message: 'Authenticated via Solana wallet public key.',
      });
      navigate(redirectUrl);
    } else {
      setErrors({ general: res.error });
      showToast({
        type: 'error',
        title: 'Wallet Connection Failed',
        message: res.error,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#FAF8F5] dark:bg-[#0B101B] bg-arena-pattern text-stone-900 dark:text-stone-100">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <GateLogo className="w-9 h-9 text-amber-600 dark:text-amber-400 group-hover:rotate-6 transition-transform" />
            <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Tollkeeper
            </span>
          </Link>
          <h1 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
            {isSignUp ? 'Create your Tollkeeper session' : 'Sign in to Tollkeeper'}
          </h1>
          <p className="text-xs text-stone-500">
            Access your persistent audit history, custom thresholds, and watchlists.
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
          {/* General error banner */}
          {errors.general && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Quick Connect Options */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handlePhantomLogin}
              disabled={isConnectingPhantom}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] rounded-xl shadow-md border border-[#D8B468]/60 uppercase tracking-wider transition-all active:scale-95"
            >
              <div className="w-4 h-4 rounded-full bg-[#181109]/15 flex items-center justify-center text-[10px] text-[#181109] font-bold">
                P
              </div>
              <span>{isConnectingPhantom ? 'Connecting...' : 'Connect Phantom Wallet'}</span>
            </button>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-cinzel font-semibold text-[#3B2C1C] dark:text-[#E7C77E] hover:text-[#181109] dark:hover:text-[#FAF6EE] bg-[#FAF6EE] dark:bg-[#15231B] hover:bg-[#F3ECE0] rounded-xl border border-[#D8B468]/60 transition-all uppercase tracking-wider active:scale-95"
            >
              <span>Continue as Guest</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-stone-300 dark:text-stone-700 select-none">
            <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
            <span className="text-[11px] font-mono uppercase text-stone-400">or with email</span>
            <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Gatekeeper"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent.supervisor@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
              {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 text-xs font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] rounded-xl shadow-md border border-[#D8B468]/60 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>{isSignUp ? 'Create Session' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Sign in / Sign up */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-xs text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
            >
              {isSignUp ? 'Already have a session? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Honest Demo Disclaimer in small text */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-center">
            <p className="text-[10px] text-stone-400 leading-relaxed">
              <strong>Notice:</strong> This is demo authentication stored locally in your browser.
              No credentials or private keys are ever transmitted to any external server.
            </p>
          </div>
        </div>

        {/* Return to home link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors"
          >
            &larr; Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
