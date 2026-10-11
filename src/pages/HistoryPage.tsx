import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Download,
  Trash2,
  ArrowUpDown,
  Filter,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { getStoredHistory, clearStoredHistory, deleteStoredHistoryItem } from '../lib/storage';
import { HistoryItem, Verdict } from '../lib/types';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { useToast } from '../context/ToastContext';

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'ALL' | Verdict>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'address'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [confirmClear, setConfirmClear] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getStoredHistory());
  }, []);

  const handleDeleteItem = (id: string) => {
    const updated = deleteStoredHistoryItem(id);
    setHistory(updated);
    showToast({
      type: 'info',
      title: 'Item Deleted',
      message: 'Removed check record from local history.',
    });
  };

  const handleClearAll = () => {
    clearStoredHistory();
    setHistory([]);
    setConfirmClear(false);
    showToast({
      type: 'info',
      title: 'History Cleared',
      message: 'All past check records have been deleted.',
    });
  };

  const handleExportCsv = () => {
    if (history.length === 0) return;

    const headers = ['ID', 'Address', 'Type', 'Score', 'Verdict', 'Timestamp', 'Date', 'Summary'];
    const rows = history.map((item) => [
      item.id,
      item.address,
      item.detectedType,
      item.score,
      item.verdict,
      item.timestamp,
      new Date(item.timestamp).toISOString(),
      `"${item.summary.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tollkeeper-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'CSV Exported',
      message: `Downloaded ${history.length} records.`,
    });
  };

  // Filter and sort
  const filteredHistory = React.useMemo(() => {
    return history
      .filter((item) => {
        const matchesSearch =
          item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVerdict = verdictFilter === 'ALL' || item.verdict === verdictFilter;
        return matchesSearch && matchesVerdict;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'date') diff = a.timestamp - b.timestamp;
        if (sortBy === 'score') diff = a.score - b.score;
        if (sortBy === 'address') diff = a.address.localeCompare(b.address);
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [history, searchTerm, verdictFilter, sortBy, sortOrder]);

  const toggleSort = (field: 'date' | 'score' | 'address') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Audit History
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Search, filter, and export all past address evaluations performed on this machine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xs hover:border-amber-500/50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              {confirmClear ? (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 p-1 rounded-lg border border-rose-300 dark:border-rose-800">
                  <span className="text-[11px] text-rose-700 dark:text-rose-300 px-1 font-medium">
                    Confirm?
                  </span>
                  <button
                    onClick={handleClearAll}
                    className="px-2 py-0.5 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-0.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search address or summary..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:border-amber-500 text-stone-900 dark:text-stone-100"
          />
        </div>

        {/* Verdict Filter Buttons (Interactive segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800 w-full sm:w-auto">
          {(['ALL', 'SAFE', 'CAUTION', 'BLOCK'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVerdictFilter(v)}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                verdictFilter === v
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <HistoryIcon className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto" />
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              No matching records found
            </p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {history.length === 0
                ? 'Your audit history is empty. Check an address to start tracking verdicts.'
                : 'No check records match your active search term and verdict filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 text-[11px] uppercase tracking-wider text-stone-400 font-semibold select-none">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-stone-600 dark:hover:text-stone-200"
                    onClick={() => toggleSort('address')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Address</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Type</th>
                  <th
                    className="py-3 px-4 text-center cursor-pointer hover:text-stone-600 dark:hover:text-stone-200"
                    onClick={() => toggleSort('score')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Verdict</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-stone-600 dark:hover:text-stone-200"
                    onClick={() => toggleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Recorded At</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-900 dark:text-stone-100">
                      <div className="flex items-center gap-2">
                        <span>
                          {item.address.substring(0, 8)}...{item.address.substring(item.address.length - 8)}
                        </span>
                        {item.isDemo && (
                          <span className="text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded border border-amber-300/80">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-sans text-stone-500 truncate max-w-xs mt-0.5">
                        {item.summary}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 capitalize">
                      {item.detectedType.replace('_', ' ')}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {item.score}
                    </td>

                    <td className="py-3.5 px-4">
                      <VerdictBadge verdict={item.verdict} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/app/check?address=${encodeURIComponent(item.address)}`)
                          }
                          className="px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-stone-400 hover:text-rose-500 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
