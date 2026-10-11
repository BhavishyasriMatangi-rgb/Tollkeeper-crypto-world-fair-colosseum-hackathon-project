import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Database,
  Sliders,
  Trash2,
  Info,
  Check,
  AlertCircle,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_RPC_URL, DEFAULT_THRESHOLDS } from '../config/thresholds';
import { callSolanaRpc } from '../lib/solana';

export function SettingsPage() {
  const { settings, updateRpcUrl, updateThresholds, resetThresholds, clearAllData } = useSettings();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [customRpc, setCustomRpc] = useState(settings.rpcUrl);
  const [isTestingRpc, setIsTestingRpc] = useState(false);
  const [rpcStatus, setRpcStatus] = useState<{ success: boolean; latencyMs?: number; message?: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveRpc = () => {
    updateRpcUrl(customRpc);
    showToast({
      type: 'success',
      title: 'RPC Saved',
      message: 'Active Solana JSON-RPC endpoint updated.',
    });
  };

  const handleTestRpc = async () => {
    setIsTestingRpc(true);
    setRpcStatus(null);
    const start = performance.now();
    try {
      // Test getBalance on system program
      await callSolanaRpc('getBalance', ['11111111111111111111111111111111'], customRpc.trim());
      const latency = Math.round(performance.now() - start);
      setRpcStatus({
        success: true,
        latencyMs: latency,
        message: `Endpoint responded in ${latency}ms. Connection healthy.`,
      });
      showToast({
        type: 'success',
        title: 'Connection Succeeded',
        message: `RPC verified (${latency}ms latency).`,
      });
    } catch (err: any) {
      setRpcStatus({
        success: false,
        message: err?.message || 'Failed to reach RPC endpoint.',
      });
      showToast({
        type: 'error',
        title: 'Connection Failed',
        message: err?.message || 'Check endpoint URL and CORS support.',
      });
    } finally {
      setIsTestingRpc(false);
    }
  };

  const handleResetDefaults = () => {
    resetThresholds();
    showToast({
      type: 'info',
      title: 'Thresholds Reset',
      message: 'Scoring penalties restored to factory standards.',
    });
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    setCustomRpc(DEFAULT_RPC_URL);
    showToast({
      type: 'warning',
      title: 'All Local Data Wiped',
      message: 'History, watchlist, and custom settings have been reset.',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Engine Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          Configure RPC connectivity, tune scoring weights, adjust themes, or wipe local caches.
        </p>
      </div>

      {/* Theme Selection */}
      <section aria-labelledby="theme-heading" className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div>
          <h2 id="theme-heading" className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Visual Theme
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Choose light arena cream, deep navy charcoal, or system preference.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'bg-amber-100/60 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light (Arena Cream)</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-amber-100/60 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
            }`}
          >
            <Moon className="w-4 h-4 text-amber-400" />
            <span>Dark (Deep Navy)</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'system'
                ? 'bg-amber-100/60 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
            }`}
          >
            <Laptop className="w-4 h-4 text-stone-500" />
            <span>System Default</span>
          </button>
        </div>
      </section>

      {/* Solana RPC Configuration */}
      <section aria-labelledby="rpc-heading" className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="rpc-heading" className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Solana RPC Endpoint Override</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Connect your own Helius or QuickNode key to eliminate public rate limits.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={customRpc}
            onChange={(e) => setCustomRpc(e.target.value)}
            placeholder="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
            className="w-full px-4 py-2.5 text-xs font-mono bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 dark:text-stone-100"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestRpc}
                disabled={isTestingRpc || !customRpc}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingRpc ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>

              <button
                onClick={() => setCustomRpc(DEFAULT_RPC_URL)}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 underline"
              >
                Reset to default public RPC
              </button>
            </div>

            <button
              onClick={handleSaveRpc}
              className="px-4 py-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-all active:scale-95"
            >
              Save RPC URL
            </button>
          </div>

          {rpcStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                rpcStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
              }`}
            >
              {rpcStatus.success ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{rpcStatus.message}</span>
            </div>
          )}
        </div>
      </section>

      {/* Tunable Scoring Thresholds */}
      <section aria-labelledby="scoring-heading" className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h2 id="scoring-heading" className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Tunable Risk Penalty Weights</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Calibrate rule penalties and verdict thresholds according to your risk policy.
            </p>
          </div>

          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Weights</span>
          </button>
        </div>

        {/* Verdict Cutoffs */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Verdict Score Boundaries
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/80 dark:border-stone-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  SAFE Max Cutoff (0 to {settings.thresholds.safeMaxScore})
                </span>
                <span className="font-mono font-bold">{settings.thresholds.safeMaxScore}</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={settings.thresholds.safeMaxScore}
                onChange={(e) =>
                  updateThresholds({ safeMaxScore: parseInt(e.target.value, 10) })
                }
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/80 dark:border-stone-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  CAUTION Max Cutoff ({settings.thresholds.safeMaxScore + 1} to {settings.thresholds.cautionMaxScore})
                </span>
                <span className="font-mono font-bold">{settings.thresholds.cautionMaxScore}</span>
              </div>
              <input
                type="range"
                min="41"
                max="80"
                value={settings.thresholds.cautionMaxScore}
                onChange={(e) =>
                  updateThresholds({ cautionMaxScore: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Wallet Rule Weights */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Wallet Invariant Weights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-stone-200/70 dark:border-stone-800 space-y-2">
              <div className="flex justify-between">
                <span>No Transaction History</span>
                <span className="font-mono font-bold">+{settings.thresholds.walletNoHistory} pts</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={settings.thresholds.walletNoHistory}
                onChange={(e) =>
                  updateThresholds({ walletNoHistory: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            <div className="p-3 rounded-lg border border-stone-200/70 dark:border-stone-800 space-y-2">
              <div className="flex justify-between">
                <span>Wallet Younger Than 7 Days</span>
                <span className="font-mono font-bold">+{settings.thresholds.walletYoungerThan7Days} pts</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={settings.thresholds.walletYoungerThan7Days}
                onChange={(e) =>
                  updateThresholds({ walletYoungerThan7Days: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            <div className="p-3 rounded-lg border border-stone-200/70 dark:border-stone-800 space-y-2">
              <div className="flex justify-between">
                <span>Fewer Than 5 Transactions</span>
                <span className="font-mono font-bold">+{settings.thresholds.walletFewerThan5Txs} pts</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={settings.thresholds.walletFewerThan5Txs}
                onChange={(e) =>
                  updateThresholds({ walletFewerThan5Txs: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            <div className="p-3 rounded-lg border border-stone-200/70 dark:border-stone-800 space-y-2">
              <div className="flex justify-between">
                <span>Zero Native SOL Balance</span>
                <span className="font-mono font-bold">+{settings.thresholds.walletZeroBalance} pts</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={settings.thresholds.walletZeroBalance}
                onChange={(e) =>
                  updateThresholds({ walletZeroBalance: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Token Mint Rule Weights */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Token Mint Invariant Weights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-stone-200/70 dark:border-stone-800 space-y-2">
              <div className="flex justify-between">
                <span>Mint Authority Not Renounced</span>
                <span className="font-mono font-bold">+{settings.thresholds.tokenMintAuthNotRenounced} pts</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={settings.thresholds.tokenMintAuthNotRenounced}
                onChange={(e) =>
                  updateThresholds({ tokenMintAuthNotRenounced: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            <div className="p-3 rounded-lg border border-stone-200/70 dark:border-stone-800 space-y-2">
              <div className="flex justify-between">
                <span>Freeze Authority Present</span>
                <span className="font-mono font-bold">+{settings.thresholds.tokenFreezeAuthPresent} pts</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={settings.thresholds.tokenFreezeAuthPresent}
                onChange={(e) =>
                  updateThresholds({ tokenFreezeAuthPresent: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            <div className="p-3 rounded-lg border border-stone-200/70 dark:border-stone-800 space-y-2">
              <div className="flex justify-between">
                <span>Top 10 Own &gt;80% of Supply</span>
                <span className="font-mono font-bold">+{settings.thresholds.tokenTop10Over80Percent} pts</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                value={settings.thresholds.tokenTop10Over80Percent}
                onChange={(e) =>
                  updateThresholds({ tokenTop10Over80Percent: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            <div className="p-3 rounded-lg border border-stone-200/70 dark:border-stone-800 space-y-2">
              <div className="flex justify-between">
                <span>Top 10 Own &gt;50% of Supply</span>
                <span className="font-mono font-bold">+{settings.thresholds.tokenTop10Over50Percent} pts</span>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                value={settings.thresholds.tokenTop10Over50Percent}
                onChange={(e) =>
                  updateThresholds({ tokenTop10Over50Percent: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Clear Local Data & Reset Section */}
      <section aria-labelledby="privacy-heading" className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div>
          <h2 id="privacy-heading" className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Reset Local Session & Storage</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Permanently clear all audit history, saved watchlists, and custom settings from this browser.
          </p>
        </div>

        {showClearConfirm ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 space-y-3">
            <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearAll}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              >
                Yes, Clear Everything
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-800 border border-rose-200 dark:border-rose-900 rounded-xl transition-colors"
          >
            Clear All Stored Data
          </button>
        )}
      </section>

      {/* About Section */}
      <section aria-labelledby="about-heading" className="p-6 rounded-2xl bg-stone-50/70 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 space-y-2">
        <h2 id="about-heading" className="font-bold text-stone-900 dark:text-stone-200">
          About Tollkeeper
        </h2>
        <p className="leading-relaxed">
          Tollkeeper v1.0.0 · The toll gate for AI agent payments.
          Built with React 19, TypeScript, Vite, Tailwind CSS, Recharts, and Solana JSON-RPC.
        </p>
        <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
          Disclaimer: Tollkeeper provides risk signals from public on-chain data. It is not financial
          advice and cannot guarantee safety.
        </p>
      </section>
    </div>
  );
}
