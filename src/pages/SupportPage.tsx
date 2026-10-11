import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getStoredHistory, getStoredWatchlist } from '../lib/storage';
import { callSolanaRpc } from '../lib/solana';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'tollkeeper_chat_history_v1';

export function SupportPage() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse chat history:', e);
    }
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: `Welcome to the **Tollkeeper Support & Security Intelligence Center**. I am **Aegis**, your AI security consultant. I track your current session and have complete visibility into Solana account verification rules, Phantom authentication, and autonomous payment agent integration. How can I help you today?`,
        timestamp: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rpcLatency, setRpcLatency] = useState<number | null>(null);
  const [isPingingRpc, setIsPingingRpc] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn(e);
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ping RPC for diagnostics
  const pingRpc = async () => {
    setIsPingingRpc(true);
    const start = performance.now();
    try {
      await callSolanaRpc('getBalance', ['11111111111111111111111111111111'], settings.rpcUrl);
      setRpcLatency(Math.round(performance.now() - start));
    } catch {
      setRpcLatency(-1);
    } finally {
      setIsPingingRpc(false);
    }
  };

  useEffect(() => {
    pingRpc();
  }, [settings.rpcUrl]);

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = getStoredHistory();
      const watchlist = getStoredWatchlist();

      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            userType: user?.type || 'guest',
            userAddress: user?.phantomAddress,
            historyCount: history.length,
            watchlistCount: watchlist.length,
            rpcEndpoint: settings.rpcUrl,
            page: 'support_center',
          },
        }),
      });

      const data = await response.json();
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Request processed. Let me know if you need more assistance.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Support page chat error:', err);
      const qLower = text.toLowerCase();
      let smartAnswer = `I am monitoring your Tollkeeper security state. `;
      if (qLower.includes('phantom') || qLower.includes('wallet')) {
        smartAnswer = `You can connect your Phantom wallet using the button in the upper header or on the Sign In page. Tollkeeper uses your public key to authenticate your session safely.`;
      } else if (qLower.includes('freeze') || qLower.includes('mint')) {
        smartAnswer = `Active Mint Authority (+30 pts) and Freeze Authority (+20 pts) are severe risks. If an SPL token retains either, autonomous payment agents should refuse payment until renounced.`;
      } else if (qLower.includes('score') || qLower.includes('verdict')) {
        smartAnswer = `Tollkeeper risk scoring: 0-24 is SAFE, 25-59 is CAUTION (prompting human supervisor approval), and 60+ is BLOCK (immediate payment refusal).`;
      } else {
        smartAnswer = `Tollkeeper's client-side rule evaluation is completely live. You can test wallet addresses in the Inspector or simulate autonomous payments in the Agent Simulator.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_fallback_${Date.now()}`,
          role: 'assistant',
          content: smartAnswer,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const fresh: Message = {
      id: `init_${Date.now()}`,
      role: 'assistant',
      content: 'Chat session reset. What question or diagnostic do you have?',
      timestamp: Date.now(),
    };
    setMessages([fresh]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase text-amber-700 dark:text-amber-400 mb-1 select-none">
          <Bot className="w-3.5 h-3.5" />
          <span>Security & System Support</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Aegis AI Support & Diagnostics Hub
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
          Ask questions, inspect diagnostic health, and receive contextual assistance from our
          security intelligence model.
        </p>
      </div>

      {/* Diagnostics Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* RPC Status */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Solana RPC Health</p>
              <p className="text-[11px] font-mono text-stone-500">
                {rpcLatency === null
                  ? 'Pinging...'
                  : rpcLatency > 0
                  ? `${rpcLatency}ms latency`
                  : 'Unreachable'}
              </p>
            </div>
          </div>
          <button
            onClick={pingRpc}
            disabled={isPingingRpc}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            title="Refresh ping"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPingingRpc ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Auth Status */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Wallet Authentication</p>
            <p className="text-[11px] font-mono text-stone-500 truncate">
              {user?.type === 'phantom'
                ? `Phantom: ${user.name}`
                : user?.type === 'email'
                ? `Email: ${user.email}`
                : 'Guest Session'}
            </p>
          </div>
        </div>

        {/* Storage Health */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Local Cache</p>
            <p className="text-[11px] font-mono text-stone-500">
              {getStoredHistory().length} checks · {getStoredWatchlist().length} watched
            </p>
          </div>
        </div>
      </div>

      {/* Main Full-Size Chat Interface */}
      <section aria-labelledby="chat-hub-heading" className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 id="chat-hub-heading" className="text-xs font-bold text-stone-100">
                Aegis Context-Aware Agent
              </h2>
              <p className="text-[10px] text-stone-400 font-mono">
                Persistent multi-turn conversation memory active
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1 text-xs text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Context</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-3.5 rounded-2xl leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-400 text-stone-900 rounded-tr-xs font-medium'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-stone-400 text-xs">
              <Bot className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Aegis is generating context-aware advice...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or paste a Solana address..."
            className="flex-1 px-4 py-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 rounded-xl transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </section>
    </div>
  );
}
