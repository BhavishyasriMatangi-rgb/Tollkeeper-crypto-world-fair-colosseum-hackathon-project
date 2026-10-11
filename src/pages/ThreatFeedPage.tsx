import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Flame,
  Radio,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Coins,
  Wallet,
  AlertTriangle,
  Lock,
  Layers,
} from 'lucide-react';
import { VerdictBadge } from '../components/common/VerdictBadge';

interface ThreatRecord {
  id: string;
  address: string;
  name: string;
  type: 'token_mint' | 'wallet';
  severity: 'critical' | 'high' | 'medium';
  score: number;
  detectedAt: string;
  flags: string[];
  description: string;
}

const THREAT_REGISTRY: ThreatRecord[] = [
  {
    id: 'th_1',
    address: '8bE9qfC94Ld6Z2nN9sW8qR4vB1mT3yU5pL8kX2jV4wQ',
    name: 'Fake USDC AirDrop Mint',
    type: 'token_mint',
    severity: 'critical',
    score: 95,
    detectedAt: '12 mins ago',
    flags: ['Active Freeze Authority', 'Unrenounced Mint Key', 'Top 10 hold 96%'],
    description: 'Impersonates circle token; active freeze authority locks buyer balances immediately upon DEX swap.',
  },
  {
    id: 'th_2',
    address: '3vK9xL2pQ8mR4wY7nT1sB5vC9dF6gH8jK2mN4pQ6rS8',
    name: 'Disposable Sybil Burner #409',
    type: 'wallet',
    severity: 'high',
    score: 80,
    detectedAt: '34 mins ago',
    flags: ['0 Balance', 'Age: 2 hours', '0 prior transactions'],
    description: 'Fresh ephemeral account requesting autonomous invoice settlement from automated agents.',
  },
  {
    id: 'th_3',
    address: '7nN9sW8qR4vB1mT3yU5pL8kX2jV4wQ8bE9qfC94Ld6Z',
    name: 'MoonPump LP Drain Mint',
    type: 'token_mint',
    severity: 'critical',
    score: 90,
    detectedAt: '1 hour ago',
    flags: ['Mint Authority Retained', 'Top 10 hold 88%'],
    description: 'Creator possesses permissions to print 500B additional tokens and dump against Raydium liquidity pool.',
  },
  {
    id: 'th_4',
    address: '5tY8uI2oP4aS6dF8gH1jK3lZ5xC7vB9nM2qW4eR6tY8',
    name: 'Oracle Imitation Collector',
    type: 'wallet',
    severity: 'medium',
    score: 55,
    detectedAt: '3 hours ago',
    flags: ['Young Account (3 days)', 'Sparse Txs (2)'],
    description: 'Mimics decentralized oracle node payout address with no verified protocol history.',
  },
  {
    id: 'th_5',
    address: '9kX2jV4wQ8bE9qfC94Ld6Z2nN9sW8qR4vB1mT3yU5pL',
    name: 'Honeypot Staking Yield Token',
    type: 'token_mint',
    severity: 'critical',
    score: 85,
    detectedAt: '5 hours ago',
    flags: ['Freeze Authority Active', 'Holder Concentration 91%'],
    description: 'Advertised as auto-yield token; freeze authority blocks external withdrawals from smart contracts.',
  },
];

export function ThreatFeedPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'token_mint' | 'wallet'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const navigate = useNavigate();

  const filteredThreats = THREAT_REGISTRY.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || t.severity === severityFilter;
    return matchesSearch && matchesType && matchesSeverity;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase text-rose-600 dark:text-rose-400 mb-1 select-none">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
            <span>Live On-Chain Threat Registry</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Hall of Blocked Gates & Threat Radar
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Continuously updated radar of flagged Solana honeypots, unrenounced mint authority contracts,
            and malicious burner accounts intercepted by Tollkeeper invariants.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-xs font-mono font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Real-Time Radar Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search threats by name or address..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:border-amber-500 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type filter */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('token_mint')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                typeFilter === 'token_mint'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500'
              }`}
            >
              Tokens
            </button>
            <button
              onClick={() => setTypeFilter('wallet')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                typeFilter === 'wallet'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500'
              }`}
            >
              Wallets
            </button>
          </div>
        </div>
      </div>

      {/* Threats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredThreats.map((threat) => (
          <div
            key={threat.id}
            className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-rose-400/50 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-stone-400">
                    Detected {threat.detectedAt}
                  </span>
                  <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mt-0.5">
                    <span>{threat.name}</span>
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                    BLOCK ({threat.score}/100)
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {threat.description}
              </p>

              {/* Flags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {threat.flags.map((flag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span>{flag}</span>
                  </span>
                ))}
              </div>

              {/* Address */}
              <p className="font-mono text-[11px] text-stone-500 dark:text-stone-400 break-all select-all bg-stone-50 dark:bg-stone-950 p-2 rounded-lg border border-stone-200/60 dark:border-stone-800">
                {threat.address}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                {threat.type === 'token_mint' ? (
                  <>
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>SPL Token Contract</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-3.5 h-3.5 text-amber-500" />
                    <span>Solana Wallet</span>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  navigate(`/app/check?address=${encodeURIComponent(threat.address)}`)
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-all active:scale-95"
              >
                <span>Inspect in Tollkeeper</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
