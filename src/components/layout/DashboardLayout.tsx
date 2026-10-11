import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Activity,
  History as HistoryIcon,
  Bookmark,
  FileCode,
  Settings as SettingsIcon,
  Bot,
  Search,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  BookOpen,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { GateLogo } from '../common/GateLogo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CommandPalette } from '../common/CommandPalette';
import { PhantomConnectButton } from '../common/PhantomConnectButton';
import { SupportChatbot } from '../common/SupportChatbot';

export function DashboardLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  // Keyboard shortcut "/" to focus search / open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if (e.key === '/') {
        e.preventDefault();
        setIsCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Overview', path: '/app/overview', icon: Activity },
    { label: 'Check Address', path: '/app/check', icon: ShieldCheck },
    { label: 'Threat Radar', path: '/app/threats', icon: ShieldAlert },
    { label: 'Agent Simulator', path: '/app/demo', icon: Bot },
    { label: 'Audit History', path: '/app/history', icon: HistoryIcon },
    { label: 'Watchlist', path: '/app/watchlist', icon: Bookmark },
    { label: 'Security Academy', path: '/app/academy', icon: BookOpen },
    { label: 'Ecosystem Directory', path: '/app/ecosystem', icon: Layers },
    { label: 'AI Support Hub', path: '/app/support', icon: HelpCircle },
    { label: 'API Docs', path: '/app/docs', icon: FileCode },
    { label: 'Settings', path: '/app/settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] dark:bg-[#0B101B] text-stone-900 dark:text-stone-100">
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
      <SupportChatbot />

      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#F5F2EB] dark:bg-[#0D1424] border-r border-stone-200/80 dark:border-stone-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto flex-1">
          {/* Brand Wordmark */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-stone-200/80 dark:border-stone-800/80">
            <Link to="/" className="flex items-center gap-2.5 group">
              <GateLogo className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:rotate-6 transition-transform" />
              <span className="font-serif text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Tollkeeper
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-md"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search trigger */}
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={() => setIsCmdOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-stone-500 dark:text-stone-400 bg-stone-200/60 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-lg hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>Search or jump to...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-stone-500">
                /
              </kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-amber-400/20 text-amber-900 dark:text-amber-300 font-semibold border border-amber-400/30'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-900/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                {user?.name || (isAuthenticated ? 'Gatekeeper User' : 'Guest Session')}
              </p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono capitalize">
                {user?.type === 'phantom'
                  ? 'Phantom Connected'
                  : user?.type ? `${user.type} auth` : 'Local mode'}
              </p>
            </div>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="p-1.5 text-stone-400 hover:text-rose-500 rounded-md transition-colors"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                Sign in
              </Link>
            )}
          </div>

          <div className="pt-1">
            <PhantomConnectButton className="w-full justify-center" />
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#FAF8F5]/90 dark:bg-[#0B101B]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb info */}
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <Link to="/app/overview" className="hover:text-stone-800 dark:hover:text-stone-200">
                Tollkeeper
              </Link>
              <span>/</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 capitalize">
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'overview'}
              </span>
            </div>
          </div>

          {/* Top Actions & Wallet */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCmdOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-stone-500 dark:text-stone-400 bg-stone-200/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-lg hover:border-amber-500/50 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search or jump...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-stone-500">
                ⌘K
              </kbd>
            </button>

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
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
