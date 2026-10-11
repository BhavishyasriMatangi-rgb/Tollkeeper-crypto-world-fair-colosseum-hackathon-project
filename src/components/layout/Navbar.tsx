import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GateLogo } from '../common/GateLogo';
import { PhantomConnectButton } from '../common/PhantomConnectButton';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, ArrowRight, ShieldAlert, BookOpen, Layers } from 'lucide-react';

export function Navbar() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 dark:bg-[#0B101B]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-stone-900 dark:text-stone-100 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 group"
        >
          <GateLogo className="w-7 h-7 text-amber-600 dark:text-amber-400 group-hover:rotate-6 transition-transform duration-300" />
          <span className="font-serif text-xl tracking-tight font-bold">
            Tollkeeper
          </span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
          <Link
            to="/app/check"
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Inspector
          </Link>
          <Link
            to="/app/threats"
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Threat Radar</span>
          </Link>
          <Link
            to="/app/demo"
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Agent Demo
          </Link>
          <Link
            to="/app/academy"
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Academy
          </Link>
          <Link
            to="/app/ecosystem"
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Ecosystem
          </Link>
          <Link
            to="/app/docs"
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            API Docs
          </Link>
        </nav>

        {/* Zone 3: Actions, Phantom Connect, and Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Phantom Wallet Connect Button */}
          <PhantomConnectButton />

          <button
            onClick={toggleTheme}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
            aria-label="Toggle color theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/app/overview')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] rounded-xl shadow-md border border-[#D8B468]/60 uppercase tracking-wider transition-all whitespace-nowrap shrink-0 active:scale-95"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              to="/auth"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] rounded-xl shadow-md border border-[#D8B468]/60 uppercase tracking-wider transition-all whitespace-nowrap shrink-0 active:scale-95"
            >
              <span>Sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
