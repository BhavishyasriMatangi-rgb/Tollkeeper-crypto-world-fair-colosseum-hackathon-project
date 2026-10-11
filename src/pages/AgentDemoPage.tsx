import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Terminal,
  Play,
  RotateCcw,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Zap,
} from 'lucide-react';
import { analyzeSolanaAddress, PRESET_DEMO_REPORTS } from '../lib/scoring';
import { validateSolanaAddress } from '../lib/solana';
import { RiskReport, Verdict } from '../lib/types';
import { useSettings } from '../context/SettingsContext';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { AnimatedGate } from '../components/common/AnimatedGate';

interface AgentLogMessage {
  id: string;
  timestamp: string;
  sender: 'system' | 'agent' | 'tollkeeper' | 'human';
  text: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export function AgentDemoPage() {
  const { settings } = useSettings();

  const [targetAddress, setTargetAddress] = useState(
    '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
  );
  const [paymentAmount, setPaymentAmount] = useState('5 USDC');
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<AgentLogMessage[]>([]);
  const [currentReport, setCurrentReport] = useState<RiskReport | null>(null);
  const [awaitingHumanApproval, setAwaitingHumanApproval] = useState(false);
  const [agentStatus, setAgentStatus] = useState<
    'idle' | 'analyzing' | 'blocked' | 'approved' | 'awaiting_human'
  >('idle');

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (
    sender: AgentLogMessage['sender'],
    text: string,
    type: AgentLogMessage['type'] = 'info'
  ) => {
    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLogs((prev) => [
      ...prev,
      {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: timeStr,
        sender,
        text,
        type,
      },
    ]);
  };

  const runSimulation = async (addressToUse: string, isPresetDemoKey?: string) => {
    setIsSimulating(true);
    setAwaitingHumanApproval(false);
    setAgentStatus('analyzing');
    setLogs([]);
    setCurrentReport(null);

    const addr = addressToUse.trim();

    // Step 1: Agent Task Initiation
    addLog('system', `Task dispatched to agent: "Pay ${paymentAmount} to ${addr.substring(0, 8)}..."`);
    await delay(600);

    addLog('agent', `[Task Received] Instruction parsed. Initiating pre-settlement verification.`);
    await delay(700);

    addLog('agent', `[Calling Tollkeeper] Querying JSON-RPC safety invariants before signing...`);
    await delay(800);

    try {
      let report: RiskReport;

      if (isPresetDemoKey && PRESET_DEMO_REPORTS[isPresetDemoKey]) {
        report = PRESET_DEMO_REPORTS[isPresetDemoKey];
      } else {
        const val = validateSolanaAddress(addr);
        if (!val.isValid) {
          addLog('agent', `Invalid Base58 destination format: ${val.error}`, 'error');
          setAgentStatus('blocked');
          setIsSimulating(false);
          return;
        }
        report = await analyzeSolanaAddress(addr, settings.thresholds, settings.rpcUrl);
      }

      setCurrentReport(report);

      addLog(
        'tollkeeper',
        `Tollkeeper Verdict: ${report.verdict} (Risk Score: ${report.score}/100, ${report.executionTimeMs}ms)`
      );

      if (report.reasons.length > 0) {
        addLog(
          'tollkeeper',
          `Flags identified: ${report.reasons.map((r) => r.title).join(', ')}`,
          report.verdict === 'BLOCK' ? 'error' : 'warning'
        );
      } else {
        addLog('tollkeeper', `No anomalies detected on-chain. Destination is mature.`, 'success');
      }

      await delay(800);

      // Branch based on verdict
      if (report.verdict === 'SAFE') {
        addLog(
          'agent',
          `Gate Status: OPEN. Risk score within policy tolerance. Signing 5 USDC transfer...`,
          'success'
        );
        await delay(900);
        addLog(
          'agent',
          `Payment successfully finalized on Solana. Transaction signature: 4Yt...9Lq2`,
          'success'
        );
        setAgentStatus('approved');
        setIsSimulating(false);
      } else if (report.verdict === 'BLOCK') {
        addLog(
          'agent',
          `Gate Status: CLOSED. Score exceeded safety threshold (>= 60). Payment refused autonomously!`,
          'error'
        );
        await delay(500);
        addLog(
          'agent',
          `Defense protocol triggered: Treasury protected. Autonomous execution terminated.`,
          'error'
        );
        setAgentStatus('blocked');
        setIsSimulating(false);
      } else {
        // CAUTION -> Prompt human approval
        addLog(
          'agent',
          `Gate Status: CAUTION. Score is moderate (${report.score}/100). Halting autonomous execution for human supervisor authorization...`,
          'warning'
        );
        setAgentStatus('awaiting_human');
        setAwaitingHumanApproval(true);
        setIsSimulating(false);
      }
    } catch (err: any) {
      addLog('agent', `RPC Error during inspection: ${err.message}`, 'error');
      setAgentStatus('blocked');
      setIsSimulating(false);
    }
  };

  const handleHumanDecision = (approved: boolean) => {
    setAwaitingHumanApproval(false);
    if (approved) {
      addLog('human', 'Supervisor override: Payment approved manually.', 'warning');
      addLog('agent', 'Proceeding with manual release: 5 USDC transferred.', 'success');
      setAgentStatus('approved');
    } else {
      addLog('human', 'Supervisor decision: Payment rejected.', 'error');
      addLog('agent', 'Payment cancelled as per human supervisor instruction.', 'error');
      setAgentStatus('blocked');
    }
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and disclaimer badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase text-amber-700 dark:text-amber-400 mb-1 select-none">
            <span>◆ Scripted Agent Integration Sandbox ◆</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Autonomous Agent Payment Gate
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Watch how a simulated payment agent queries Tollkeeper before signing a transaction.
            When risk is detected, the agent autonomously refuses payment or requests human supervisor clearance.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] font-mono text-amber-900 dark:text-amber-200 shrink-0">
          Simulated Agent · Real Tollkeeper Engine
        </div>
      </div>

      {/* Preset Action Strip */}
      <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 font-semibold">Test Scenarios:</span>
          <button
            onClick={() => {
              setTargetAddress('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
              runSimulation('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'safe-treasury');
            }}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-medium transition-colors"
          >
            Scenario 1: Known-Good Safe Wallet
          </button>

          <button
            onClick={() => {
              setTargetAddress('4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM');
              runSimulation('4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM', 'caution-new-wallet');
            }}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-medium transition-colors"
          >
            Scenario 2: Cautionary New Wallet
          </button>

          <button
            onClick={() => {
              setTargetAddress('DUMMYhoneypotMintToken111111111111111111111');
              runSimulation('DUMMYhoneypotMintToken111111111111111111111', 'block-honeypot-token');
            }}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-medium transition-colors"
          >
            Scenario 3: Demo Risky Token (Block)
          </button>
        </div>

        {/* Custom address input */}
        <div className="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
          <input
            type="text"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            placeholder="Custom Solana address..."
            className="w-full lg:w-64 px-3 py-1.5 text-xs font-mono bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => runSimulation(targetAddress)}
            disabled={isSimulating || !targetAddress}
            className="px-3 py-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg shrink-0 flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate</span>
          </button>
        </div>
      </div>

      {/* Split Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Mock Payment Agent Terminal */}
        <section aria-labelledby="terminal-heading" className="lg:col-span-7 flex flex-col rounded-2xl bg-stone-950 text-stone-100 border border-stone-800 shadow-md overflow-hidden min-h-[460px]">
          {/* Terminal Title Bar */}
          <div className="px-4 py-3 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4 text-amber-400" />
              <h2 id="terminal-heading" className="text-xs font-mono font-semibold tracking-wide text-stone-200">
                Payment Agent Log <span className="text-stone-500">(Autonomous Executor)</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-[10px] font-mono text-stone-400 uppercase">
                {isSimulating ? 'Executing' : 'Standby'}
              </span>
            </div>
          </div>

          {/* Terminal Output Stream */}
          <div className="flex-1 p-4 font-mono text-xs space-y-3 overflow-y-auto max-h-[380px]">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-600 py-16 space-y-2">
                <Terminal className="w-8 h-8 opacity-40" />
                <p>Click any test scenario above to start agent execution.</p>
                <p className="text-[10px] text-stone-500">
                  Task received &rarr; Tollkeeper call &rarr; Verdict gating
                </p>
              </div>
            ) : (
              logs.map((log) => {
                let badgeClass = 'text-stone-400';
                if (log.sender === 'agent') badgeClass = 'text-sky-400';
                if (log.sender === 'tollkeeper') badgeClass = 'text-amber-400';
                if (log.sender === 'human') badgeClass = 'text-purple-400';

                let textClass = 'text-stone-300';
                if (log.type === 'error') textClass = 'text-rose-400 font-semibold';
                if (log.type === 'warning') textClass = 'text-amber-300';
                if (log.type === 'success') textClass = 'text-emerald-400 font-semibold';

                return (
                  <div key={log.id} className="leading-relaxed">
                    <span className="text-[10px] text-stone-600 mr-2 select-none">
                      [{log.timestamp}]
                    </span>
                    <span className={`text-[11px] font-bold mr-2 uppercase ${badgeClass}`}>
                      {log.sender}:
                    </span>
                    <span className={textClass}>{log.text}</span>
                  </div>
                );
              })
            )}
            <div ref={logEndRef} />
          </div>

          {/* Human Supervisor Action Bar (Visible when CAUTION) */}
          {awaitingHumanApproval && (
            <div className="p-4 bg-amber-950/70 border-t border-amber-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs text-amber-200">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Human Supervisor Clearance:</strong> Caution score flag detected. Release funds?
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleHumanDecision(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-rose-100 rounded-lg transition-colors border border-rose-700"
                >
                  Reject Payment
                </button>
                <button
                  onClick={() => handleHumanDecision(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-xs"
                >
                  Authorize Payment
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Tollkeeper Decision Panel */}
        <section aria-labelledby="decision-heading" className="lg:col-span-5 flex flex-col rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-md min-h-[460px]">
          <div className="border-b border-stone-200/80 dark:border-stone-800/80 pb-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 id="decision-heading" className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Tollkeeper Decision Gate
              </h2>
            </div>
            <span className="text-[11px] font-mono text-stone-500">
              Deterministic Engine
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            {/* Animated Toll Gate */}
            <AnimatedGate
              verdict={
                isSimulating
                  ? 'ANALYZING'
                  : currentReport
                  ? currentReport.verdict
                  : 'IDLE'
              }
              size="md"
            />

            {currentReport ? (
              <div className="space-y-3 max-w-sm w-full">
                <div className="flex items-center justify-center gap-3">
                  <VerdictBadge verdict={currentReport.verdict} size="lg" />
                  <span className="font-mono text-lg font-bold tabular-nums">
                    {currentReport.score}/100
                  </span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {currentReport.summary}
                </p>

                {currentReport.reasons.length > 0 && (
                  <div className="text-left p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-[11px] space-y-1">
                    <p className="font-semibold text-stone-700 dark:text-stone-300">
                      Why this verdict:
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5 text-stone-500">
                      {currentReport.reasons.map((r) => (
                        <li key={r.id}>
                          <strong>{r.title}</strong> (+{r.pointsAdded} pts)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-stone-400 text-xs py-8 space-y-1">
                <p className="font-medium">Gate in standby mode</p>
                <p className="text-[11px]">Run a simulation to observe real-time decision barriers.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
