import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getStoredHistory } from '../lib/storage';
import { HistoryItem } from '../lib/types';
import { VerdictBadge } from '../components/common/VerdictBadge';

export function OverviewPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getStoredHistory());
  }, []);

  // Compute stat totals
  const totalChecks = history.length;
  const safeCount = history.filter((h) => h.verdict === 'SAFE').length;
  const cautionCount = history.filter((h) => h.verdict === 'CAUTION').length;
  const blockCount = history.filter((h) => h.verdict === 'BLOCK').length;

  // Aggregate checks by day for the chart
  const chartData = React.useMemo(() => {
    if (history.length === 0) return [];

    // Group by date (MM/DD)
    const map = new Map<string, { date: string; safe: number; caution: number; block: number }>();
    
    // Sort oldest to newest for chronological chart
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);

    sorted.forEach((item) => {
      const d = new Date(item.timestamp);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      if (!map.has(key)) {
        map.set(key, { date: key, safe: 0, caution: 0, block: 0 });
      }
      const entry = map.get(key)!;
      if (item.verdict === 'SAFE') entry.safe += 1;
      else if (item.verdict === 'CAUTION') entry.caution += 1;
      else if (item.verdict === 'BLOCK') entry.block += 1;
    });

    return Array.from(map.values()).slice(-7); // Last 7 active days
  }, [history]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Security Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Audit metrics and real-time gate protection telemetry from your browser session.
          </p>
        </div>

        <Link
          to="/app/check"
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Inspect New Address</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Checks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Checks Run
            </span>
            <Activity className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {totalChecks}
          </div>
          <p className="text-[11px] text-stone-500 font-mono">
            {totalChecks > 0 ? 'Recorded in local audit log' : 'No checks recorded yet'}
          </p>
        </div>

        {/* Safe Verdicts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Safe Payments
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-serif text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {safeCount}
          </div>
          <p className="text-[11px] text-stone-500 font-mono">
            Score &le; 24 (Toll open)
          </p>
        </div>

        {/* Cautions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Caution Flags
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {cautionCount}
          </div>
          <p className="text-[11px] text-stone-500 font-mono">
            Score 25–59 (Human check)
          </p>
        </div>

        {/* Blocked */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Payments Blocked
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-serif text-3xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
            {blockCount}
          </div>
          <p className="text-[11px] text-stone-500 font-mono">
            Score &ge; 60 (Gate barred)
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <section aria-labelledby="chart-heading" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="chart-heading" className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Verdicts Over Time</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Aggregated evaluation distribution from your real check history.
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl text-center p-6 space-y-3">
            <Clock className="w-8 h-8 text-stone-300 dark:text-stone-700" />
            <p className="text-xs text-stone-500 max-w-sm">
              No historical checks yet. When you inspect Solana addresses, real verdict trends will populate here automatically.
            </p>
            <Link
              to="/app/check"
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Run your first check &rarr;
            </Link>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888888" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1917',
                    borderColor: '#292524',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#FAFAF9',
                  }}
                />
                <Bar dataKey="safe" name="Safe" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="caution" name="Caution" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="block" name="Blocked" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Recent Checks Table & Empty State */}
      <section aria-labelledby="recent-heading" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between">
          <div>
            <h2 id="recent-heading" className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Recent Checks
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              The latest addresses evaluated by your Tollkeeper instance.
            </p>
          </div>
          {history.length > 0 && (
            <Link
              to="/app/history"
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              View all ({history.length})
            </Link>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                No addresses checked yet
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Paste any Solana wallet or SPL token mint to run a live risk analysis and see
                detailed reasons behind the verdict.
              </p>
            </div>
            <button
              onClick={() => navigate('/app/check')}
              className="px-5 py-2.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <span>Check your first address</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-sans">
                {history.slice(0, 5).map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-stone-900 dark:text-stone-100">
                      <div className="flex items-center gap-2">
                        <span>
                          {item.address.substring(0, 6)}...{item.address.substring(item.address.length - 6)}
                        </span>
                        {item.isDemo && (
                          <span className="text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded border border-amber-300/80">
                            Demo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-500 capitalize">
                      {item.detectedType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-center font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {item.score}
                    </td>
                    <td className="py-3 px-4">
                      <VerdictBadge verdict={item.verdict} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-stone-400 text-[11px] font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/app/check?address=${encodeURIComponent(item.address)}`)}
                        className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
