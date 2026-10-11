import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Plus,
  Coins,
  Wallet,
} from 'lucide-react';
import {
  getStoredWatchlist,
  saveStoredWatchlist,
  removeWatchlistItem,
  addWatchlistItem,
} from '../lib/storage';
import { WatchlistItem } from '../lib/types';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { useToast } from '../context/ToastContext';
import { analyzeSolanaAddress } from '../lib/scoring';
import { useSettings } from '../context/SettingsContext';

export function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [recheckingAddress, setRecheckingAddress] = useState<string | null>(null);

  const { showToast } = useToast();
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    setWatchlist(getStoredWatchlist());
  }, []);

  const handleRemove = (id: string) => {
    const updated = removeWatchlistItem(id);
    setWatchlist(updated);
    showToast({
      type: 'info',
      title: 'Address Removed',
      message: 'Removed destination from watchlist.',
    });
  };

  const handleStartEdit = (item: WatchlistItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
  };

  const handleSaveEdit = (item: WatchlistItem) => {
    const updated = watchlist.map((w) =>
      w.id === item.id ? { ...w, label: editLabel.trim() || w.label } : w
    );
    saveStoredWatchlist(updated);
    setWatchlist(updated);
    setEditingId(null);
    showToast({
      type: 'success',
      title: 'Label Saved',
      message: 'Watchlist item nickname updated.',
    });
  };

  const handleRecheck = async (item: WatchlistItem) => {
    setRecheckingAddress(item.address);
    try {
      const result = await analyzeSolanaAddress(
        item.address,
        settings.thresholds,
        settings.rpcUrl
      );

      const updated = addWatchlistItem({
        ...item,
        lastVerdict: result.verdict,
        lastScore: result.score,
        lastCheckedAt: Date.now(),
      });
      setWatchlist(updated);

      showToast({
        type: 'success',
        title: 'Re-check Complete',
        message: `${item.address.substring(0, 8)}... is ${result.verdict} (${result.score}/100)`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Re-check Failed',
        message: err?.message || 'Could not reach RPC endpoint.',
      });
    } finally {
      setRecheckingAddress(null);
    }
  };

  const filteredWatchlist = watchlist.filter(
    (item) =>
      item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Address Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Persistently track monitored vendor wallets, payment destinations, and token contracts.
          </p>
        </div>

        <button
          onClick={() => navigate('/app/check')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Search Filter */}
      {watchlist.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search watchlist by label or address..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:border-amber-500 text-stone-900 dark:text-stone-100"
            />
          </div>
          <span className="text-xs text-stone-400 font-mono">
            {filteredWatchlist.length} saved
          </span>
        </div>
      )}

      {/* Watchlist Cards Grid */}
      {watchlist.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Your watchlist is empty
            </h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Bookmark important destination wallets or token mints on the Inspection page to
              re-check them anytime.
            </p>
          </div>
          <button
            onClick={() => navigate('/app/check')}
            className="px-5 py-2.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <span>Inspect and bookmark an address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWatchlist.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all"
            >
              <div>
                {/* Header with Label and Actions */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-1 bg-stone-100 dark:bg-stone-800 border rounded focus:outline-none focus:border-amber-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(item)}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-stone-400 hover:text-stone-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                          {item.label}
                        </h2>
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-400 hover:text-stone-600 transition-opacity"
                          title="Rename label"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-stone-400 hover:text-rose-500 p-1 rounded transition-colors shrink-0"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Address string */}
                <p className="font-mono text-xs text-stone-600 dark:text-stone-400 break-all select-all bg-stone-50 dark:bg-stone-950 p-2 rounded-lg border border-stone-200/60 dark:border-stone-800/60">
                  {item.address}
                </p>

                {/* Type & Meta */}
                <div className="flex items-center gap-2 mt-3 text-xs text-stone-500">
                  {item.detectedType === 'token_mint' ? (
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>Token Mint</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-amber-500" />
                      <span>Solana Wallet</span>
                    </span>
                  )}
                  {item.isDemo && (
                    <span className="text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1 rounded">
                      Demo
                    </span>
                  )}
                </div>
              </div>

              {/* Verdict & Re-check Footer */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <VerdictBadge verdict={item.lastVerdict} size="sm" />
                  <span className="font-mono text-xs font-bold tabular-nums">
                    {item.lastScore}/100
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRecheck(item)}
                    disabled={recheckingAddress === item.address}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${
                        recheckingAddress === item.address ? 'animate-spin' : ''
                      }`}
                    />
                    <span>Re-check</span>
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/app/check?address=${encodeURIComponent(item.address)}`)
                    }
                    className="px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
