import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  Lock,
  Flame,
  AlertTriangle,
  Coins,
  Bot,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export function AcademyPage() {
  const [activeTab, setActiveTab] = useState<'freeze' | 'mint' | 'burner' | 'concentration'>('freeze');

  const topics = {
    freeze: {
      title: 'Freeze Authority Traps',
      badge: '+20 Penalty Invariant',
      summary: 'Why SPL token contracts with active freeze authorities present extreme danger to autonomous agents.',
      explanation:
        'In the Solana SPL Token standard, the freezeAuthority key permits the token issuer to freeze user token accounts with a single RPC instruction. Once frozen, the token balance cannot be transferred, sold, or used in DeFi. For autonomous payment agents, this allows malicious token deployers to whitelist deposits from AI agents, then immediately freeze the agent’s token account while dumping developer liquidity.',
      defense:
        'Tollkeeper flags any token with non-null freezeAuthority, adding a +20 risk penalty and recommending payment blocking unless verified through governance DAO escrow.',
    },
    mint: {
      title: 'Unrenounced Mint Authority',
      badge: '+30 Penalty Invariant',
      summary: 'The dilution attack vector where creators print infinite token supply at zero cost.',
      explanation:
        'When an SPL token mint has an active mintAuthority, the private key holder retains cryptographic rights to execute MintTo instructions indefinitely. If an autonomous agent accepts this token as payment or purchases it for liquidity, the creator can instantaneously mint billions of new tokens, flooding the market and crashing the token price to absolute zero within a single block.',
      defense:
        'Tollkeeper verifies if mintAuthority has been permanently renounced (set to null or PublicKey.default). If unrenounced, a heavy +30 penalty is applied.',
    },
    burner: {
      title: 'Disposable Sybil Burner Wallets',
      badge: '+40 / +35 Penalty Invariants',
      summary: 'Ephemeral recipient wallets created moments before invoices are submitted to agents.',
      explanation:
        'Autonomous AI agents are increasingly targeted with automated invoice spam. Attackers generate disposable Solana keypairs with 0 prior transactions and 0 SOL balance. Once the agent pays the requested invoice, the burner wallet routes the funds through a mixer or bridge, and the address is never used again.',
      defense:
        'Tollkeeper inspects the historical signature count via getSignaturesForAddress and calculates account age from the genesis block timestamp. Accounts with no history receive +40 points, and accounts under 7 days old receive +35 points.',
    },
    concentration: {
      title: 'Top 10 Holder Centralization',
      badge: '+35 / +20 Penalty Invariants',
      summary: 'High supply concentration in developer-controlled wallets enables catastrophic exit dumps.',
      explanation:
        'Even if authorities are renounced, an issuer can pre-mine or allocate 80%+ of the token supply across stealth developer accounts before opening trading. When autonomous agents trade into the token, the concentrated holders dump their tokens, extracting all liquidity.',
      defense:
        'Tollkeeper queries getTokenLargestAccounts and compares the sum of the top 10 accounts against the total token supply. Concentration over 80% yields a critical +35 penalty; over 50% yields +20 points.',
    },
  };

  const currentTopic = topics[activeTab];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase text-amber-700 dark:text-amber-400 mb-1 select-none">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Security Knowledge Base</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Tollkeeper Security Academy
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
          Master the on-chain attack vectors, cryptographic authorities, and heuristic invariants
          guarding autonomous AI payment infrastructure on Solana.
        </p>
      </div>

      {/* Interactive Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <button
          onClick={() => setActiveTab('freeze')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'freeze'
              ? 'bg-amber-400 text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Freeze Authority</span>
        </button>

        <button
          onClick={() => setActiveTab('mint')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'mint'
              ? 'bg-amber-400 text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Mint Dilution</span>
        </button>

        <button
          onClick={() => setActiveTab('burner')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'burner'
              ? 'bg-amber-400 text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Burner Sybils</span>
        </button>

        <button
          onClick={() => setActiveTab('concentration')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'concentration'
              ? 'bg-amber-400 text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Holder Dumps</span>
        </button>
      </div>

      {/* Active Module Card */}
      <section aria-labelledby="academy-module-heading" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400">
              {currentTopic.badge}
            </span>
            <h2 id="academy-module-heading" className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              {currentTopic.title}
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium max-w-xs text-right hidden sm:block">
            {currentTopic.summary}
          </span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
          <p>{currentTopic.explanation}</p>
        </div>

        {/* Defense Blueprint Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>How Tollkeeper Enforces Safety</span>
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            {currentTopic.defense}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/app/check"
            className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            <span>Test this invariant on the Inspector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/app/demo"
            className="px-4 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all active:scale-95"
          >
            Simulate in Agent Playground
          </Link>
        </div>
      </section>
    </div>
  );
}
