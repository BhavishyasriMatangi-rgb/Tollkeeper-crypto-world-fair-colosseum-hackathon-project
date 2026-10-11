import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'typescript' | 'python' | 'curl'>('typescript');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(id);
    showToast({
      type: 'success',
      title: 'Snippet Copied',
      message: 'Code snippet copied to clipboard.',
    });
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const tsCode = `// AI Agent Payment Guard using Tollkeeper
import { Connection } from '@solana/web3.js';

interface TollkeeperVerdict {
  address: string;
  verdict: 'SAFE' | 'CAUTION' | 'BLOCK';
  score: number; // 0 - 100
  reasons: Array<{ id: string; title: string; pointsAdded: number; evidence: string }>;
}

async function verifyPaymentDestination(address: string): Promise<boolean> {
  // Query Tollkeeper Contract Engine before signing instruction
  const response = await fetch(\`https://api.tollkeeper.ai/v1/check?address=\${address}\`);
  const data: TollkeeperVerdict = await response.json();

  if (data.verdict === 'BLOCK') {
    throw new Error(\`Payment blocked by Tollkeeper (Score: \${data.score}/100): \${data.reasons.map(r => r.title).join(', ')}\`);
  }

  if (data.verdict === 'CAUTION') {
    console.warn(\`Cautionary risk flag detected (\${data.score}/100). Requesting human approval...\`);
    return await promptHumanApproval(data);
  }

  // Gate open: Safe to pay
  return true;
}
`;

  const pythonCode = `# LangChain / ElizaOS Agent Pre-Payment Tool
import requests

def tollkeeper_guard(address: str) -> dict:
    """Evaluates whether a Solana wallet or token mint is safe to pay."""
    res = requests.get(
        "https://api.tollkeeper.ai/v1/check",
        params={"address": address},
        timeout=5.0
    )
    res.raise_for_status()
    report = res.json()
    
    if report["verdict"] == "BLOCK":
        return {
            "allow_payment": False,
            "reason": f"Risk score {report['score']}/100 exceeds threshold.",
            "flags": [r["title"] for r in report["reasons"]]
        }
    
    return {"allow_payment": True, "verdict": report["verdict"]}
`;

  const curlCode = `# Test the Tollkeeper Evaluation Contract
curl -X GET "https://api.tollkeeper.ai/v1/check?address=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM" \\
  -H "Accept: application/json"
`;

  const responseJson = `{
  "id": "rep_1742089400123_x7a9k",
  "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "detectedType": "wallet",
  "score": 0,
  "verdict": "SAFE",
  "timestamp": 1742089400123,
  "summary": "Mature Solana settlement wallet with 1,000+ verified transactions and 482.45 SOL balance. No anomalous flags detected.",
  "reasons": [],
  "executionTimeMs": 142,
  "walletDetails": {
    "balanceSol": 482.451,
    "transactionCount": 1000,
    "oldestTxTimestamp": 1698200000,
    "ageInDays": 420.5,
    "hasMoreThan1000Txs": true,
    "ownerProgram": "System Program"
  }
}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase text-amber-700 dark:text-amber-400 mb-1 select-none">
          <span>◆ Integration Specification ◆</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          API & Agent Integration Contract
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
          Standardized interface for autonomous AI agents to query deterministic Solana safety
          verdicts before initiating token or SOL transfers.
        </p>
      </div>

      {/* Contract Notice Box */}
      <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Architectural Contract Design</p>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            This page specifies the standard HTTP request/response contract implemented by Tollkeeper.
            For this interactive client application, verification logic runs directly in your browser
            against Solana JSON-RPC endpoints. You can adapt these patterns into your own backend or
            agent microservice.
          </p>
        </div>
      </div>

      {/* Endpoint Spec Card */}
      <section aria-labelledby="contract-spec-heading" className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-800">
            GET
          </span>
          <code id="contract-spec-heading" className="font-mono text-sm font-semibold text-stone-900 dark:text-stone-100">
            /v1/check?address=&#123;solana_address&#125;
          </code>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          Evaluates an arbitrary Solana address. Returns risk score, categorical verdict, and
          deterministic penalty evidence.
        </p>

        {/* Parameters Table */}
        <div className="pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Query Parameters
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] uppercase">
                  <th className="py-2 pr-4">Parameter</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Required</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                <tr>
                  <td className="py-2 pr-4 font-mono font-semibold text-stone-900 dark:text-stone-100">
                    address
                  </td>
                  <td className="py-2 pr-4 font-mono text-stone-500">string</td>
                  <td className="py-2 pr-4 font-mono text-amber-600">Yes</td>
                  <td className="py-2 text-stone-600 dark:text-stone-400">
                    Base58-encoded Solana wallet address or token mint (32-44 characters).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Code Snippets Section */}
      <section aria-labelledby="snippets-heading" className="rounded-2xl bg-stone-950 text-stone-100 border border-stone-800 shadow-md overflow-hidden">
        <div className="px-5 py-3.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h2 id="snippets-heading" className="text-xs font-mono font-semibold text-stone-200">
              Agent Integration Code Examples
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('typescript')}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                activeTab === 'typescript'
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              TypeScript
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                activeTab === 'python'
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                activeTab === 'curl'
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              cURL
            </button>
          </div>
        </div>

        <div className="relative p-5">
          <pre className="font-mono text-xs overflow-x-auto text-stone-300 leading-relaxed max-h-96">
            {activeTab === 'typescript' && tsCode}
            {activeTab === 'python' && pythonCode}
            {activeTab === 'curl' && curlCode}
          </pre>

          <button
            onClick={() =>
              handleCopy(
                activeTab === 'typescript'
                  ? tsCode
                  : activeTab === 'python'
                  ? pythonCode
                  : curlCode,
                activeTab
              )
            }
            className="absolute top-4 right-4 p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            title="Copy snippet"
          >
            {copiedTab === activeTab ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </section>

      {/* Response Schema Card */}
      <section aria-labelledby="response-schema-heading" className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="response-schema-heading" className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
            Example 200 OK Response Payload
          </h2>
          <button
            onClick={() => handleCopy(responseJson, 'json')}
            className="text-xs font-mono text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            {copiedTab === 'json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy JSON</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 font-mono text-xs overflow-x-auto text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-800">
          {responseJson}
        </pre>
      </section>
    </div>
  );
}
