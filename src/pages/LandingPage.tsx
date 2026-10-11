import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Bot,
  Zap,
  Lock,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { InteractiveParticleBackground } from '../components/common/InteractiveParticleBackground';
import { LaceBorderRibbon } from '../components/common/LaceBorderRibbon';
import { LaceMedallionCrest } from '../components/common/LaceMedallionCrest';
import { MonogramCrest } from '../components/common/MonogramCrest';
import { validateSolanaAddress } from '../lib/solana';

export function LandingPage() {
  const [heroAddress, setHeroAddress] = useState('');
  const [heroError, setHeroError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const navigate = useNavigate();

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroAddress.trim();
    if (!trimmed) {
      navigate('/app/check');
      return;
    }
    const val = validateSolanaAddress(trimmed);
    if (!val.isValid) {
      setHeroError(val.error || 'Invalid address');
      return;
    }
    setHeroError(null);
    navigate(`/app/check?address=${encodeURIComponent(trimmed)}`);
  };

  const faqs = [
    {
      q: 'Why do autonomous AI agents need Tollkeeper?',
      a: 'Autonomous agents execute payments programmatically without human hesitation. Fraudulent burner wallets, honey-pot tokens with active freeze authorities, and unrenounced mint permissions can drain agent balances in seconds. Tollkeeper serves as a deterministic toll gate before any transaction instruction is signed.',
    },
    {
      q: 'Does Tollkeeper require smart contracts or private keys?',
      a: 'No. Tollkeeper is completely non-custodial and read-only. It queries Solana blockchain state directly via standard JSON-RPC without requiring access to private keys, transaction signing permissions, or proprietary contracts.',
    },
    {
      q: 'How does Tollkeeper distinguish wallets from token mints?',
      a: 'Tollkeeper inspects the account owner program via getAccountInfo with jsonParsed encoding. If owned by the SPL Token Program or Token-2022 and typed as a mint, it evaluates mint authority, freeze authority, and supply distribution. Otherwise, it audits transaction history, account age, and balance.',
    },
    {
      q: 'Can I integrate Tollkeeper into my own agent framework or workflow?',
      a: 'Yes. Tollkeeper exposes an explainable deterministic evaluation contract designed to integrate directly with LangChain, ElizaOS, Solana Agent Kit, or custom autonomous Python/TypeScript payment loops.',
    },
    {
      q: 'Can I provide my own RPC endpoint or Helius API key?',
      a: 'Yes. In the Settings page or via the VITE_SOLANA_RPC_URL environment variable, you can connect your private Helius, QuickNode, or custom Solana RPC node to eliminate rate limits.',
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#080E0B] text-stone-900 dark:text-stone-100 antialiased">
      {/* Interactive subtle golden dust particles */}
      <InteractiveParticleBackground />

      <Navbar />

      <main className="flex-1 relative z-10">
        {/* ========================================================
            TOP SECTION: DEEP WILLOW LAKE / NOIR FOREST (REF TOP)
            ======================================================== */}
        <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 bg-[#08120D] text-[#FAF7F2] overflow-hidden">
          {/* Subtle ambient lighting */}
          <div className="absolute inset-0 bg-radial from-[#15281D]/40 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            {/* Vintage Wire Monogram Crest */}
            <div className="flex justify-center">
              <MonogramCrest initials="TK" className="w-16 h-20 text-[#D8B468]" />
            </div>

            {/* Editorial Title Block (Directly matching reference typography) */}
            <div className="space-y-2">
              <p className="font-editorial text-xs sm:text-sm uppercase tracking-[0.4em] text-[#CBB27E] font-medium select-none">
                WELCOME TO
              </p>
              <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-normal tracking-[0.14em] text-[#FAF6EE] leading-tight uppercase">
                TOLLKEEPER
              </h1>
              <p className="font-editorial text-base sm:text-xl tracking-[0.22em] text-[#C4B293] uppercase font-normal pt-1">
                THE TOLL GATE FOR AI AGENT PAYMENTS
              </p>
            </div>

            <p className="font-editorial text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed pt-2">
              Tells AI agents and humans whether a Solana wallet or token mint is safe to pay before autonomous funds leave the gate.
            </p>

            {/* Centered Live Address Input directly in the hero */}
            <form onSubmit={handleHeroSubmit} className="max-w-xl mx-auto pt-4">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-1.5 bg-[#FAF6EE]/95 dark:bg-[#111C16]/90 rounded-2xl border border-[#D8B468]/60 shadow-xl backdrop-blur-md">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-[#8C764D]" />
                  <input
                    type="text"
                    value={heroAddress}
                    onChange={(e) => {
                      setHeroAddress(e.target.value);
                      if (heroError) setHeroError(null);
                    }}
                    placeholder="Paste a Solana address or token mint..."
                    className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm font-mono bg-transparent text-[#221B14] dark:text-[#FAF6EE] placeholder-stone-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 text-xs sm:text-sm font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] active:scale-95 transition-all rounded-xl shadow-md shrink-0 flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <span>Check Address</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {heroError && (
                <p className="text-xs text-rose-300 mt-2 text-center font-mono font-medium">
                  {heroError}
                </p>
              )}
            </form>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link
                to="/app/demo"
                className="px-5 py-2.5 text-xs font-cinzel font-semibold text-[#FAF6EE] bg-[#16271E]/90 hover:bg-[#1E3428] rounded-xl border border-[#D8B468]/50 transition-all shadow-sm flex items-center gap-2 tracking-wider"
              >
                <Bot className="w-4 h-4 text-[#D8B468]" />
                <span>Simulate Payment Agent</span>
              </Link>

              <Link
                to="/app/threats"
                className="px-5 py-2.5 text-xs font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] rounded-xl shadow-md border border-[#D8B468]/60 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider"
              >
                <ShieldAlert className="w-4 h-4 text-[#181109]" />
                <span>Live Threat Radar</span>
              </Link>
            </div>

            {/* Live Threat Bar / Quick Mint Inspector */}
            <div className="pt-6">
              <div className="inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-[#0F1E16]/90 border border-[#D8B468]/40 shadow-lg text-xs font-mono backdrop-blur-md">
                <span className="flex items-center gap-1.5 text-[#E1D4B8] text-xs font-sans tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Try Known USDC Mint:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHeroAddress('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
                    navigate('/app/check?address=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-medium text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] active:scale-95 rounded-lg shadow-xs border border-[#D8B468]/60 transition-all cursor-pointer"
                  title="Load USDC Mint Address"
                >
                  <span>EPjF...TDt1v</span>
                </button>
                <span className="text-[#D8B468]/50 select-none">·</span>
                <Link
                  to="/app/check"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[11px] font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] active:scale-95 rounded-lg shadow-xs border border-[#D8B468]/60 transition-all uppercase tracking-wider"
                >
                  <span>Full Inspector</span>
                  <ArrowRight className="w-3 h-3 text-[#181109]" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            FIRST LACE BORDER RIBBON (Full-Width Crochet Ivory Lace)
            ======================================================== */}
        <LaceBorderRibbon className="-mt-1 -mb-1 relative z-20" />

        {/* ========================================================
            MIDDLE SECTION: PURE ALABASTER / CREAM (REF "OUR STORY")
            ======================================================== */}
        <section id="how-it-works" className="py-20 bg-[#F4EFE6] text-[#221B17]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* Editorial Heading like "OUR STORY" in reference */}
            <div className="text-center space-y-3">
              <h2 className="font-cinzel text-3xl sm:text-4xl font-normal tracking-[0.2em] text-[#1E1713] uppercase">
                OUR PROTOCOL <span className="font-editorial italic font-normal text-[#8A6A2C] lowercase text-4xl sm:text-5xl">&amp;</span> PURPOSE
              </h2>
              <p className="font-editorial text-sm sm:text-base text-[#57493E] max-w-2xl mx-auto leading-relaxed">
                Autonomous AI agents will soon transact on their own across Solana. Scams, burner addresses, and honeypots are designed specifically to exploit unverified automated payments.
              </p>
            </div>

            {/* 3-Step Protocol Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 01 */}
              <div className="p-7 rounded-2xl bg-[#FCFAF5] border border-[#D5C2A5] shadow-xs space-y-4">
                <div className="font-editorial text-4xl sm:text-5xl font-bold text-[#8A6A2C] tabular-nums">
                  01
                </div>
                <h3 className="font-cinzel text-lg font-bold text-[#1E1713] tracking-wider uppercase">
                  Paste &amp; Auto-Detect
                </h3>
                <p className="font-editorial text-sm text-[#4A3D33] leading-relaxed">
                  Provide any Base58 Solana public key. Tollkeeper inspects owner programs to immediately differentiate between standard wallets and SPL token contracts.
                </p>
                <div className="text-[11px] font-mono text-[#8C764D] pt-1">
                  getAccountInfo · Base58 format
                </div>
              </div>

              {/* Step 02 */}
              <div className="p-7 rounded-2xl bg-[#FCFAF5] border border-[#D5C2A5] shadow-xs space-y-4">
                <div className="font-editorial text-4xl sm:text-5xl font-bold text-[#8A6A2C] tabular-nums">
                  02
                </div>
                <h3 className="font-cinzel text-lg font-bold text-[#1E1713] tracking-wider uppercase">
                  Audit On-Chain State
                </h3>
                <p className="font-editorial text-sm text-[#4A3D33] leading-relaxed">
                  Fetches live transaction signatures, account age, native balance, mint authority status, freeze keys, and top 10 supply concentration percentages.
                </p>
                <div className="text-[11px] font-mono text-[#8C764D] pt-1">
                  getSignaturesForAddress · getTokenSupply
                </div>
              </div>

              {/* Step 03 */}
              <div className="p-7 rounded-2xl bg-[#FCFAF5] border border-[#D5C2A5] shadow-xs space-y-4">
                <div className="font-editorial text-4xl sm:text-5xl font-bold text-[#8A6A2C] tabular-nums">
                  03
                </div>
                <h3 className="font-cinzel text-lg font-bold text-[#1E1713] tracking-wider uppercase">
                  Decide with Plain Proofs
                </h3>
                <p className="font-editorial text-sm text-[#4A3D33] leading-relaxed">
                  Generates an explainable 0–100 risk score and clear SAFE / CAUTION / BLOCK verdict. The gate opens for safe payments, or bars the transaction before settlement.
                </p>
                <div className="text-[11px] font-mono text-[#8C764D] pt-1">
                  Deterministic · Zero Hallucination
                </div>
              </div>
            </div>

            {/* Threat vectors overview */}
            <div className="p-8 rounded-3xl bg-[#ECE4D5] border border-[#CBB89A] grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <ShieldAlert className="w-6 h-6 text-[#7E2434] mx-auto" />
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#1E1713]">
                  Burner Sybils
                </h4>
                <p className="font-editorial text-xs text-[#57493E]">
                  0 balance, age &lt; 7 days, zero recorded history. Intercepted autonomously.
                </p>
              </div>

              <div className="space-y-2">
                <Lock className="w-6 h-6 text-[#7E2434] mx-auto" />
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#1E1713]">
                  Active Freeze Traps
                </h4>
                <p className="font-editorial text-xs text-[#57493E]">
                  Deployers retain freeze keys, locking agent balances indefinitely. Blocked at the toll gate.
                </p>
              </div>

              <div className="space-y-2">
                <AlertTriangle className="w-6 h-6 text-[#7E2434] mx-auto" />
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#1E1713]">
                  Mint Dilution
                </h4>
                <p className="font-editorial text-xs text-[#57493E]">
                  Unrenounced mint authority allows printing infinite supply, crashing agent collateral.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECOND LACE BORDER RIBBON
            ======================================================== */}
        <LaceBorderRibbon className="-mt-1 -mb-1 relative z-20" />

        {/* ========================================================
            THIRD SECTION: NOCTURNAL BOTANICAL NOIR (REF "WHEN / WHERE")
            ======================================================== */}
        <section className="py-20 bg-[#0E1511] text-[#FAF7F2] relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
            {/* Symmetrical Twin Columns (Directly mirroring "WHEN" & "WHERE" in reference) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center border-b border-[#2C3B30] pb-14">
              {/* Column 1: WHAT WE VERIFY */}
              <div className="space-y-3">
                <h3 className="font-cinzel text-xl sm:text-2xl font-normal tracking-[0.25em] text-[#E7C77E] uppercase">
                  WHAT WE VERIFY
                </h3>
                <p className="font-editorial text-base sm:text-lg text-[#FAF6EE] tracking-wide">
                  Public Solana On-Chain State
                </p>
                <div className="font-editorial text-xs sm:text-sm text-[#AAB8AE] space-y-1 pt-1 leading-relaxed">
                  <p>Account Age · First Genesis Timestamp</p>
                  <p>Transaction Signatures · Native SOL Balance</p>
                  <p>SPL Mint Authority · Freeze Authority Presence</p>
                  <p>Top 10 Holder Supply Concentration</p>
                </div>
              </div>

              {/* Column 2: FOR WHOM */}
              <div className="space-y-3">
                <h3 className="font-cinzel text-xl sm:text-2xl font-normal tracking-[0.25em] text-[#E7C77E] uppercase">
                  FOR WHOM
                </h3>
                <p className="font-editorial text-base sm:text-lg text-[#FAF6EE] tracking-wide">
                  Autonomous AI Agents &amp; Human Treasurers
                </p>
                <div className="font-editorial text-xs sm:text-sm text-[#AAB8AE] space-y-1 pt-1 leading-relaxed">
                  <p>ElizaOS · Solana Agent Kit · SendAI</p>
                  <p>LangChain &amp; LangGraph Multi-Agent Workflows</p>
                  <p>Enterprise Treasury Operations &amp; DAOs</p>
                  <p>Phantom &amp; Web3 Connected Supervisors</p>
                </div>
              </div>
            </div>

            {/* AI Copilot Aegis Highlight */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#142019] border border-[#C5A059]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#D8B468]">
                  <Bot className="w-4 h-4" />
                  <span>Aegis · Context-Aware Security Copilot</span>
                </div>
                <h4 className="font-cinzel text-xl sm:text-2xl font-normal text-[#FAF6EE] uppercase tracking-wide">
                  An intelligent support agent that remembers your discussions.
                </h4>
                <p className="font-editorial text-sm text-[#C4B293] leading-relaxed">
                  Ask questions about flagged token authorities, review diagnostic RPC health, or connect your Phantom wallet with assistance from our session-aware AI assistant.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/app/support"
                  className="px-5 py-2.5 text-xs font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] rounded-xl transition-all shadow-md active:scale-95 text-center uppercase tracking-wider"
                >
                  Open AI Support
                </Link>
                <Link
                  to="/app/academy"
                  className="px-4 py-2.5 text-xs font-cinzel font-semibold text-[#FAF6EE] bg-[#1B2C22] hover:bg-[#253D30] rounded-xl border border-[#C5A059]/50 transition-colors text-center uppercase tracking-wider"
                >
                  Security Academy
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            FOURTH SECTION: DEEP VELVET OXBLOOD / BURGUNDY (REF BOTTOM)
            ======================================================== */}
        <section className="py-24 bg-[#3B131D] text-[#FAF6EE] relative overflow-hidden border-t-2 border-[#D8B468]/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10 relative z-10">
            {/* Section Tagline */}
            <div className="space-y-2">
              <p className="font-editorial text-xs sm:text-sm uppercase tracking-[0.4em] text-[#E7C77E] font-medium">
                THE TOLL GATE VERDICT
              </p>
              <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[0.15em] text-[#FAF6EE] uppercase">
                VERIFY ANY SOLANA DESTINATION
              </h2>
              <p className="font-editorial text-sm sm:text-base text-stone-300 max-w-lg mx-auto leading-relaxed pt-1">
                Click below to launch the pre-flight risk evaluation engine.
              </p>
            </div>

            {/* Circular Lace Rosette Medallion (Directly mirroring "RSVP HERE" in reference photo) */}
            <div className="flex justify-center pt-2">
              <Link to="/app/check" className="group">
                <LaceMedallionCrest
                  label="VERIFY"
                  sublabel="HERE"
                  className="w-72 h-72 sm:w-80 sm:h-80 hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </Link>
            </div>

            <div className="pt-2">
              <Link
                to="/app/check"
                className="inline-flex items-center gap-2 px-8 py-3 text-xs sm:text-sm font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] rounded-xl shadow-xl transition-all active:scale-95 uppercase tracking-wider"
              >
                <span>Launch Address Inspector</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            FAQ ACCORDION SECTION (Matching the luxurious palette)
            ======================================================== */}
        <section id="faq" className="py-16 bg-[#F4EFE6] text-[#221B17]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-2 mb-12">
              <p className="font-editorial text-xs uppercase tracking-[0.3em] text-[#8A6A2C] font-semibold">
                ASSURANCE &amp; DETAILS
              </p>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-normal tracking-[0.15em] text-[#1E1713] uppercase">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#D5C2A5] bg-[#FCFAF5] overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm font-cinzel font-semibold text-[#1E1713] hover:text-[#8A6A2C] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${
                        openFaq === idx ? 'rotate-180 text-[#8A6A2C]' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 sm:px-5 pb-5 font-editorial text-xs sm:text-sm text-[#4A3D33] leading-relaxed border-t border-[#E8DDCC] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
