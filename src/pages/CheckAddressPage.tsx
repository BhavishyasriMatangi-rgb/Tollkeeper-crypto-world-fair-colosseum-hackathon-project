import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Shield,
  Search,
  Copy,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Info,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Coins,
  Wallet,
} from 'lucide-react';
import { analyzeSolanaAddress, PRESET_DEMO_REPORTS } from '../lib/scoring';
import { validateSolanaAddress, SolanaRpcError } from '../lib/solana';
import { RiskReport, Verdict } from '../lib/types';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import {
  addHistoryItem,
  addWatchlistItem,
  getStoredWatchlist,
  removeWatchlistItem,
} from '../lib/storage';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { AnimatedGate } from '../components/common/AnimatedGate';

export function CheckAddressPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [inputAddress, setInputAddress] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<RiskReport | null>(null);
  const [rpcError, setRpcError] = useState<{ message: string; isRateLimit: boolean; countdown?: number } | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const countdownIntervalRef = useRef<any>(null);

  // Sync with Watchlist state
  useEffect(() => {
    if (!report) {
      setIsInWatchlist(false);
      return;
    }
    const currentList = getStoredWatchlist();
    setIsInWatchlist(currentList.some((w) => w.address === report.address));
  }, [report]);

  // Handle URL query parameter `?address=...`
  useEffect(() => {
    const addressFromUrl = searchParams.get('address');
    if (addressFromUrl) {
      setInputAddress(addressFromUrl);
      executeCheck(addressFromUrl);
    }
  }, [searchParams]);

  // Clean countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setInputAddress(val);
    setRpcError(null);

    if (!val) {
      setValidationError(null);
      return;
    }

    const res = validateSolanaAddress(val);
    if (!res.isValid) {
      setValidationError(res.error || 'Invalid address');
    } else {
      setValidationError(null);
    }
  };

  const executeCheck = async (addressToCheck: string) => {
    const trimmed = addressToCheck.trim();
    const valRes = validateSolanaAddress(trimmed);
    if (!valRes.isValid) {
      setValidationError(valRes.error || 'Invalid Solana address format.');
      return;
    }

    setValidationError(null);
    setRpcError(null);
    setIsLoading(true);

    try {
      const result = await analyzeSolanaAddress(
        trimmed,
        settings.thresholds,
        settings.rpcUrl
      );

      setReport(result);
      addHistoryItem({
        id: result.id,
        address: result.address,
        detectedType: result.detectedType,
        score: result.score,
        verdict: result.verdict,
        timestamp: result.timestamp,
        summary: result.summary,
        isDemo: result.isDemo,
      });
    } catch (err: any) {
      if (err instanceof SolanaRpcError && err.isRateLimit) {
        let sec = err.retryAfterSeconds || 8;
        setRpcError({
          message:
            'The public Solana RPC endpoint rate limited your request. A backoff timer has been scheduled.',
          isRateLimit: true,
          countdown: sec,
        });

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = setInterval(() => {
          sec -= 1;
          if (sec <= 0) {
            clearInterval(countdownIntervalRef.current);
            setRpcError((prev) => (prev ? { ...prev, countdown: 0 } : null));
          } else {
            setRpcError((prev) => (prev ? { ...prev, countdown: sec } : null));
          }
        }, 1000);
      } else {
        setRpcError({
          message: err?.message || 'Failed to inspect on-chain account. Please check your RPC connection.',
          isRateLimit: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAddress) return;
    executeCheck(inputAddress);
  };

  // Load preset demo report directly or set address
  const handleLoadPreset = (key: string) => {
    const preset = PRESET_DEMO_REPORTS[key];
    if (preset) {
      setInputAddress(preset.address);
      setValidationError(null);
      setRpcError(null);
      setReport(preset);
      addHistoryItem({
        id: preset.id,
        address: preset.address,
        detectedType: preset.detectedType,
        score: preset.score,
        verdict: preset.verdict,
        timestamp: Date.now(),
        summary: preset.summary,
        isDemo: true,
      });
      showToast({
        type: 'info',
        title: 'Demo Preset Loaded',
        message: `Loaded ${preset.verdict} example scenario. Clearly marked as Demo data.`,
      });
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    const reportText = `[Tollkeeper Risk Report]
Address: ${report.address}
Type: ${report.detectedType.toUpperCase()}
Score: ${report.score}/100
Verdict: ${report.verdict}
Summary: ${report.summary}
Reasons:
${report.reasons.length ? report.reasons.map((r) => `- [${r.title}] (+${r.pointsAdded} pts): ${r.evidence}`).join('\n') : '- No risk flags identified.'}
Generated at: ${new Date(report.timestamp).toISOString()}
Notice: Rule-based signals from public on-chain data. Not financial advice.`;

    navigator.clipboard.writeText(reportText);
    showToast({
      type: 'success',
      title: 'Report Copied',
      message: 'Markdown report copied to clipboard.',
    });
  };

  const handleDownloadJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tollkeeper-report-${report.address.substring(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'Report Downloaded',
      message: 'JSON file saved to your device.',
    });
  };

  const handleShare = () => {
    if (!report) return;
    const shareUrl = `${window.location.origin}/app/check?address=${encodeURIComponent(
      report.address
    )}`;
    navigator.clipboard.writeText(shareUrl);
    setSearchParams({ address: report.address });
    showToast({
      type: 'success',
      title: 'Share Link Copied',
      message: 'Direct inspection URL copied to clipboard.',
    });
  };

  const handleToggleWatchlist = () => {
    if (!report) return;
    if (isInWatchlist) {
      removeWatchlistItem(report.address);
      setIsInWatchlist(false);
      showToast({
        type: 'info',
        title: 'Removed from Watchlist',
        message: `${report.address.substring(0, 8)}... was removed.`,
      });
    } else {
      addWatchlistItem({
        id: `watch_${Date.now()}`,
        address: report.address,
        label: report.detectedType === 'token_mint' ? 'Token Mint' : 'Solana Wallet',
        detectedType: report.detectedType,
        lastVerdict: report.verdict,
        lastScore: report.score,
        addedAt: Date.now(),
        lastCheckedAt: report.timestamp,
        isDemo: report.isDemo,
      });
      setIsInWatchlist(true);
      showToast({
        type: 'success',
        title: 'Added to Watchlist',
        message: 'Saved to your persistent watchlist.',
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title & Introduction */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Inspect Solana Address
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
          Verify whether an autonomous payment destination is safe before releasing funds.
          Auto-detects wallets and SPL token mints.
        </p>
      </div>

      {/* Primary Input Card */}
      <section aria-labelledby="inspection-heading" className="bg-white dark:bg-stone-900/90 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-sm">
        <h2 id="inspection-heading" className="sr-only">Solana Address Inspection</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="solana-address-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2"
            >
              Solana Address or Token Mint
            </label>
            <div className="relative flex items-center">
              <input
                id="solana-address-input"
                type="text"
                value={inputAddress}
                onChange={handleInputChange}
                placeholder="Paste 32-44 character Base58 address (e.g. 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM)"
                className={`w-full px-4 py-3 pl-11 text-xs sm:text-sm font-mono bg-stone-50 dark:bg-stone-950/60 border rounded-xl focus:outline-none transition-colors ${
                  validationError
                    ? 'border-rose-400 focus:border-rose-500 text-rose-900 dark:text-rose-200'
                    : 'border-stone-200 dark:border-stone-800 focus:border-amber-500'
                }`}
              />
              <Search className="absolute left-3.5 w-4 h-4 text-stone-400" />
            </div>

            {/* Inline validation error */}
            {validationError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Quick demo presets with clear labels */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-400 font-medium">Quick Presets:</span>
              <button
                type="button"
                onClick={() => handleLoadPreset('safe-treasury')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-stone-100 hover:bg-emerald-50 dark:bg-stone-800 dark:hover:bg-emerald-950/30 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-stone-200 dark:border-stone-700 transition-colors"
              >
                Safe Wallet
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('caution-new-wallet')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-stone-100 hover:bg-amber-50 dark:bg-stone-800 dark:hover:bg-amber-950/30 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 border border-stone-200 dark:border-stone-700 transition-colors"
              >
                Caution Wallet
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('block-honeypot-token')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-stone-100 hover:bg-rose-50 dark:bg-stone-800 dark:hover:bg-rose-950/30 text-stone-700 dark:text-stone-300 hover:text-rose-700 dark:hover:text-rose-300 border border-stone-200 dark:border-stone-700 transition-colors"
              >
                Blocked Token
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputAddress('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
                  executeCheck('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
                }}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
              >
                Live USDC Mint
              </button>
            </div>

            {/* Check action button */}
            <button
              type="submit"
              disabled={isLoading || !inputAddress || !!validationError}
              className="px-5 py-2.5 text-xs font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-md border border-[#D8B468]/60 transition-all active:scale-95 flex items-center gap-2 shrink-0 ml-auto uppercase tracking-wider"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#181109]" />
                  <span>Inspecting Solana RPC...</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-[#181109]" />
                  <span>Analyze Address</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* RPC Rate-Limit & Backoff Banner */}
        {rpcError && (
          <div className="mt-4 p-4 rounded-xl border border-rose-300 bg-rose-50/90 dark:bg-rose-950/40 dark:border-rose-800/80 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-3">
            <Info className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold">
                {rpcError.isRateLimit ? 'Public RPC Rate Limit Hit (429)' : 'RPC Request Error'}
              </p>
              <p className="leading-relaxed text-stone-700 dark:text-stone-300">
                {rpcError.message}
              </p>
              {rpcError.countdown !== undefined && rpcError.countdown > 0 && (
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-amber-700 dark:text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Retrying automatically in {rpcError.countdown}s...</span>
                </div>
              )}
            </div>
            {rpcError.countdown === 0 && (
              <button
                onClick={() => executeCheck(inputAddress)}
                className="px-3 py-1 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded font-semibold text-xs shrink-0"
              >
                Retry Now
              </button>
            )}
          </div>
        )}
      </section>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white dark:bg-stone-900/90 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-8 space-y-6 animate-pulse">
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <AnimatedGate verdict="ANALYZING" size="md" />
            <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-48 mt-4" />
            <div className="h-3 bg-stone-100 dark:bg-stone-800/60 rounded w-64" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100 dark:border-stone-800">
            <div className="h-16 bg-stone-100 dark:bg-stone-800/50 rounded-xl" />
            <div className="h-16 bg-stone-100 dark:bg-stone-800/50 rounded-xl" />
            <div className="h-16 bg-stone-100 dark:bg-stone-800/50 rounded-xl" />
          </div>
        </div>
      )}

      {/* Full Result Report Card */}
      {!isLoading && report && (
        <section aria-labelledby="report-heading" className="bg-white dark:bg-stone-900/90 rounded-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-sm transition-all">
          <h2 id="report-heading" className="sr-only">Inspection Report Details</h2>
          {/* Top Banner with Verdict Reveal and Gate Animation */}
          <div className="p-6 sm:p-8 border-b border-stone-200/80 dark:border-stone-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
                {report.isDemo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    Demo Data
                  </span>
                )}
                <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1 font-mono">
                  {report.detectedType === 'token_mint' ? (
                    <>
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>SPL Token Mint</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-3.5 h-3.5 text-amber-500" />
                      <span>Solana Wallet</span>
                    </>
                  )}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                  Checked in {report.executionTimeMs}ms
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <VerdictBadge verdict={report.verdict} size="hero" />
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">
                    {report.score}
                  </span>
                  <span className="text-xs text-stone-400">/100 risk</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 max-w-xl leading-relaxed">
                {report.summary}
              </p>
            </div>

            {/* Animated Gate Reveal */}
            <div className="shrink-0">
              <AnimatedGate verdict={report.verdict} size="md" />
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="p-6 border-b border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-950/30">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                  Address
                </p>
                <p className="text-xs font-mono font-semibold text-stone-900 dark:text-stone-100 truncate mt-0.5">
                  {report.address}
                </p>
              </div>

              {report.walletDetails && (
                <>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                      SOL Balance
                    </p>
                    <p className="text-xs font-mono font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
                      {report.walletDetails.balanceSol.toFixed(4)} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                      Recorded Txs
                    </p>
                    <p className="text-xs font-mono font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
                      {report.walletDetails.hasMoreThan1000Txs
                        ? '1,000+ (Capped)'
                        : report.walletDetails.transactionCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                      Account Age
                    </p>
                    <p className="text-xs font-mono font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
                      {report.walletDetails.ageInDays !== null
                        ? `${report.walletDetails.ageInDays} days`
                        : 'Unknown / Zero txs'}
                    </p>
                  </div>
                </>
              )}

              {report.tokenMintDetails && (
                <>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                      Mint Authority
                    </p>
                    <p className="text-xs font-mono font-semibold text-stone-900 dark:text-stone-100 mt-0.5 truncate">
                      {report.tokenMintDetails.mintAuthority ? 'ACTIVE' : 'RENOUNCED'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                      Freeze Authority
                    </p>
                    <p className="text-xs font-mono font-semibold text-stone-900 dark:text-stone-100 mt-0.5 truncate">
                      {report.tokenMintDetails.freezeAuthority ? 'ACTIVE' : 'RENOUNCED'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                      Top 10 Supply
                    </p>
                    <p className="text-xs font-mono font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
                      {report.tokenMintDetails.top10HoldersSharePct !== null
                        ? `${report.tokenMintDetails.top10HoldersSharePct}%`
                        : 'Not available'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* "Why" List: Deterministic Evidence Behind Every Penalty */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Rule-Based Evidence & Score Audit</span>
                <span className="text-xs font-mono text-stone-400 font-normal">
                  ({report.reasons.length} flags)
                </span>
              </h3>
            </div>

            {report.reasons.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <p className="font-semibold">Zero Anomalies Detected</p>
                <p className="text-emerald-700 dark:text-emerald-400">
                  This destination satisfies all baseline heuristic conditions. All verification
                  invariants passed successfully.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {report.reasons.map((reason) => (
                  <div
                    key={reason.id}
                    className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {reason.title}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mt-0.5">
                          {reason.description}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 shrink-0 tabular-nums">
                        +{reason.pointsAdded} pts
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-200/50 dark:border-stone-800/50">
                      Evidence: <span className="text-stone-700 dark:text-stone-300">{reason.evidence}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="p-4 sm:p-6 bg-stone-100/60 dark:bg-stone-950/50 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-amber-500/50 transition-colors shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Report</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-amber-500/50 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-amber-500/50 transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>

              <button
                onClick={handleToggleWatchlist}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors shadow-xs ${
                  isInWatchlist
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700'
                }`}
              >
                {isInWatchlist ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={`https://explorer.solana.com/address/${report.address}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline"
            >
              <span>Open in Solana Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      )}

      {/* Methodology Accordion Panel */}
      <section aria-labelledby="methodology-heading" className="bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-semibold text-stone-800 dark:text-stone-200 hover:text-amber-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span id="methodology-heading">Scoring Methodology & Architectural Notice</span>
          </div>
          <span className="text-stone-400 font-mono text-[11px]">
            {showMethodology ? 'Hide' : 'Expand'}
          </span>
        </button>

        {showMethodology && (
          <div className="px-5 pb-5 text-xs text-stone-600 dark:text-stone-400 space-y-3 border-t border-stone-200 dark:border-stone-800 pt-4 leading-relaxed">
            <p>
              Tollkeeper employs an <strong>explainable, deterministic rule-based heuristic</strong> rather
              than a black-box machine learning model. Every point penalty corresponds directly to an
              auditable on-chain condition retrieved via standard Solana JSON-RPC queries.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white dark:bg-stone-950/50 rounded-lg border border-stone-200/60 dark:border-stone-800/60">
                <p className="font-semibold text-stone-900 dark:text-stone-200">
                  Wallet Scoring Invariants
                </p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px]">
                  <li>No history (+40 pts): 0 signatures recorded</li>
                  <li>Age &lt; 7 days (+35 pts): high disposable burner probability</li>
                  <li>Fewer than 5 txs (+15 pts): unverified recipient track record</li>
                  <li>Zero balance (+10 pts): unfunded account</li>
                </ul>
              </div>

              <div className="p-3 bg-white dark:bg-stone-950/50 rounded-lg border border-stone-200/60 dark:border-stone-800/60">
                <p className="font-semibold text-stone-900 dark:text-stone-200">
                  Token Mint Scoring Invariants
                </p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px]">
                  <li>Mint Authority not renounced (+30 pts): arbitrary inflation risk</li>
                  <li>Freeze Authority active (+20 pts): non-transferable account lock danger</li>
                  <li>Top 10 hold &gt;80% (+35 pts) or &gt;50% (+20 pts): extreme centralization</li>
                </ul>
              </div>
            </div>
            <p className="text-[11px] text-stone-500 italic pt-1">
              Notice: Tollkeeper risk scores provide defensive signals from public on-chain telemetry.
              It does not guarantee safety and does not constitute financial advice.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
