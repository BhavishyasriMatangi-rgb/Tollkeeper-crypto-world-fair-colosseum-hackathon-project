import React from 'react';
import {
  Layers,
  Bot,
  ExternalLink,
  Code2,
  CheckCircle2,
  ArrowRight,
  Database,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EcosystemItem {
  name: string;
  category: 'Framework' | 'Infrastructure' | 'DEX & Liquidity' | 'Wallets';
  description: string;
  badge: string;
  integrationSnippet: string;
}

const ECOSYSTEM_LIST: EcosystemItem[] = [
  {
    name: 'ElizaOS (ai16z)',
    category: 'Framework',
    badge: 'Autonomous Agents',
    description: 'Pre-flight Tollkeeper plugin for ElizaOS autonomous Discord, Telegram, and Twitter agents managing real treasury payments.',
    integrationSnippet: `// elizaOS plugin-tollkeeper
export const tollkeeperEvaluator = {
  name: 'TOLLKEEPER_GUARD',
  validate: async (runtime, message) => {
    const verdict = await checkSolanaSafety(message.recipient);
    return verdict.verdict !== 'BLOCK';
  }
};`,
  },
  {
    name: 'Solana Agent Kit (SendAI)',
    category: 'Framework',
    badge: 'Solana Actions',
    description: 'Native tool binding for Solana Agent Kit preventing autonomous payment execution when risk score exceeds 60.',
    integrationSnippet: `// solana-agent-kit action
import { TollkeeperTool } from '@tollkeeper/agent-kit';

agent.registerTool(new TollkeeperTool({
  blockOnRisk: 60,
  supervisorConfirmation: true,
}));`,
  },
  {
    name: 'LangChain & LangGraph',
    category: 'Framework',
    badge: 'Python & TS SDK',
    description: 'Structured tool schema compatible with OpenAI Function Calling, Claude Tool Use, and LangGraph multi-agent payment workflows.',
    integrationSnippet: `from langchain.tools import tool

@tool
def tollkeeper_verify(address: str) -> dict:
    """Verifies Solana recipient address safety before signing."""
    return requests.get(f"https://api.tollkeeper.ai/v1/check?address={address}").json()`,
  },
  {
    name: 'Helius RPC Infrastructure',
    category: 'Infrastructure',
    badge: 'Enterprise Node',
    description: 'Ultra-low-latency Geyser-powered Solana RPC nodes delivering sub-80ms transaction signature and mint authority queries.',
    integrationSnippet: `// Use Helius in Tollkeeper Settings
const connection = new Connection(
  'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY'
);`,
  },
  {
    name: 'Jupiter Aggregator Guard',
    category: 'DEX & Liquidity',
    badge: 'Swap Protection',
    description: 'Pre-swap verification ensuring target output token mints do not retain active freeze authorities or severe holder concentrations.',
    integrationSnippet: `// Inspect output mint before calling Jupiter swap
const safety = await tollkeeper.check(outputMint);
if (safety.verdict === 'BLOCK') abortSwap();`,
  },
  {
    name: 'Phantom & Backpack Wallets',
    category: 'Wallets',
    badge: 'Client Auth',
    description: 'Seamless browser extension public-key authentication without signing or custodial commitments.',
    integrationSnippet: `// One-click Phantom connection
const resp = await window.solana.connect();
const pubkey = resp.publicKey.toString();`,
  },
];

export function EcosystemPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase text-amber-700 dark:text-amber-400 mb-1 select-none">
          <Layers className="w-3.5 h-3.5" />
          <span>Integrations & Tooling</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Agent Ecosystem & Tooling Directory
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
          Tollkeeper connects seamlessly into premier autonomous AI agent frameworks, Solana RPC
          providers, and Web3 wallets to protect agent funds worldwide.
        </p>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ECOSYSTEM_LIST.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800">
                  {item.badge}
                </span>
                <span className="text-[11px] text-stone-400 font-mono">
                  {item.category}
                </span>
              </div>

              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {item.name}
              </h2>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2">
                <pre className="p-3 rounded-xl bg-stone-950 text-stone-300 font-mono text-[11px] overflow-x-auto border border-stone-800">
                  {item.integrationSnippet}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-400 text-[11px]">Production ready</span>
              <Link
                to="/app/docs"
                className="font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Integration Docs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
