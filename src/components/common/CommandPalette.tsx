import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Shield,
  Activity,
  History as HistoryIcon,
  Bookmark,
  FileCode,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  ArrowRight,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { validateSolanaAddress } from '../../lib/solana';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent can toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (action: () => void) => {
    action();
    onClose();
    setQuery('');
  };

  const isSolanaAddress = validateSolanaAddress(query.trim()).isValid;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 dark:border-stone-800">
          <Search className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, page name, or paste a Solana address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono font-medium text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Command Options */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {/* Direct Address Check Action if valid Base58 */}
          {isSolanaAddress && (
            <button
              onClick={() =>
                handleSelect(() =>
                  navigate(`/app/check?address=${encodeURIComponent(query.trim())}`)
                )
              }
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-left hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                  Inspect address: <span className="font-mono">{query.trim()}</span>
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            </button>
          )}

          {/* Navigation group */}
          <div className="px-2 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-stone-400 select-none">
            Navigation
          </div>

          <button
            onClick={() => handleSelect(() => navigate('/app/check'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <Shield className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Check Solana Address</span>
          </button>

          <button
            onClick={() => handleSelect(() => navigate('/app/overview'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <Activity className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => handleSelect(() => navigate('/app/demo'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <Activity className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Autonomous Agent Simulator</span>
          </button>

          <button
            onClick={() => handleSelect(() => navigate('/app/history'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <HistoryIcon className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Audit History</span>
          </button>

          <button
            onClick={() => handleSelect(() => navigate('/app/watchlist'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <Bookmark className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Address Watchlist</span>
          </button>

          <button
            onClick={() => handleSelect(() => navigate('/app/threats'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <Shield className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Threat Radar & Blocked Gates</span>
          </button>

          <button
            onClick={() => handleSelect(() => navigate('/app/academy'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <FileCode className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Security Academy & Exploits</span>
          </button>

          <button
            onClick={() => handleSelect(() => navigate('/app/ecosystem'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <Activity className="w-4 h-4 text-sky-500 shrink-0" />
            <span>Ecosystem & Framework Directory</span>
          </button>

          <button
            onClick={() => handleSelect(() => navigate('/app/support'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <Shield className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Aegis AI Support & Diagnostics Hub</span>
          </button>

          <button
            onClick={() => handleSelect(() => navigate('/app/docs'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <FileCode className="w-4 h-4 text-stone-400 shrink-0" />
            <span>API Docs & Integration Contract</span>
          </button>

          <button
            onClick={() => handleSelect(() => navigate('/app/settings'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left"
          >
            <SettingsIcon className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Settings & RPC Configuration</span>
          </button>

          {/* Theme Quick Actions */}
          <div className="px-2 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-stone-400 select-none">
            Appearance
          </div>

          <div className="flex gap-1 p-1">
            <button
              onClick={() => handleSelect(() => setTheme('light'))}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
            <button
              onClick={() => handleSelect(() => setTheme('dark'))}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
            <button
              onClick={() => handleSelect(() => setTheme('system'))}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                theme === 'system'
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" /> System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
