import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Shield,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredHistory, getStoredWatchlist } from '../../lib/storage';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'tollkeeper_chat_history_v1';

export function SupportChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse chat history:', e);
    }
    return [
      {
        id: 'msg_init',
        role: 'assistant',
        content: `Greetings! I am **Aegis**, your Tollkeeper security & technical support agent. I remember our conversation and monitor your current session context. How can I assist with your Solana payment safeguards or Phantom connection today?`,
        timestamp: Date.now(),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Gather active app session context
      const history = getStoredHistory();
      const watchlist = getStoredWatchlist();
      const currentUrl = window.location.href;
      const urlParams = new URLSearchParams(window.location.search);
      const activeAddress = urlParams.get('address') || (history[0]?.address ?? null);

      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            activeAddress,
            lastVerdict: history[0]?.verdict,
            lastScore: history[0]?.score,
            userType: user?.type || 'guest',
            userAddress: user?.phantomAddress,
            historyCount: history.length,
            watchlistCount: watchlist.length,
            page: window.location.pathname,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Support service error (${response.status})`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I processed your request. Let me know if you need more details on Tollkeeper rules.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Chat fetch fallback:', err);
      // Generate intelligent contextual response locally
      const qLower = text.toLowerCase();
      let smartAnswer = `I am tracking your session. `;
      if (qLower.includes('phantom') || qLower.includes('wallet')) {
        smartAnswer = `You can connect your Phantom wallet via the "Connect Phantom" button in the navigation or login page. Once connected, your public key and live SOL balance are displayed, and you can audit payment recipients safely.`;
      } else if (qLower.includes('freeze') || qLower.includes('mint')) {
        smartAnswer = `Tollkeeper flags active Mint Authority (+30 risk points) because deployers can print infinite tokens, and Freeze Authority (+20 risk points) because issuers can trap your assets. We recommend blocking automated agent payments to tokens with unrenounced authorities.`;
      } else if (qLower.includes('verdict') || qLower.includes('score') || qLower.includes('rule')) {
        smartAnswer = `Tollkeeper scores Solana addresses from 0 to 100: 0-24 is SAFE (gate opens), 25-59 is CAUTION (requires human supervisor confirmation), and 60+ is BLOCK (automated payments are refused).`;
      } else if (qLower.includes('agent') || qLower.includes('api')) {
        smartAnswer = `Payment agents query our deterministic endpoint \`GET /api/v1/check?address=...\` before executing transactions. If the score is 60+, the transaction is declined, protecting treasury balances.`;
      } else {
        smartAnswer = `Tollkeeper evaluates transaction volume, genesis age, native balance, mint authority, and top holder concentration. Ask me anything about Solana risk rules or paste an address to analyze!`;
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: smartAnswer,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initial: ChatMessage[] = [
      {
        id: `msg_init_${Date.now()}`,
        role: 'assistant',
        content: `Conversation context cleared. How can I assist you with Solana payment verification, Phantom wallet connection, or autonomous agent integration?`,
        timestamp: Date.now(),
      },
    ];
    setMessages(initial);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full font-cinzel font-semibold text-xs text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] shadow-xl border border-[#FAF6EE]/50 hover:scale-105 active:scale-95 transition-all duration-200 uppercase tracking-wider"
          aria-label="Toggle AI Support Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#181109]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse ring-2 ring-[#E7C77E]" />
          </div>
          <span className="text-xs tracking-wider">
            {isOpen ? 'Close Support' : 'Support Agent'}
          </span>
        </button>
      </div>

      {/* Slide-out / Popover Chat Window */}
      {isOpen && (
        <aside
          aria-label="AI Support Chatbot"
          className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[580px] h-[520px] rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold tracking-tight">Aegis Support</h2>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 uppercase">
                    AI Agent
                  </span>
                </div>
                <p className="text-[10px] text-stone-400">
                  Context-aware · Remembers history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Strip */}
          <div className="p-2 bg-stone-50 dark:bg-stone-950/60 border-b border-stone-100 dark:border-stone-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <button
              onClick={() => handleSend('How does Tollkeeper detect honeypots?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500 whitespace-nowrap shrink-0"
            >
              Honeypots?
            </button>
            <button
              onClick={() => handleSend('Why is freeze authority dangerous?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500 whitespace-nowrap shrink-0"
            >
              Freeze Authority?
            </button>
            <button
              onClick={() => handleSend('How do I connect Phantom wallet?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500 whitespace-nowrap shrink-0"
            >
              Connect Phantom?
            </button>
            <button
              onClick={() => handleSend('How do autonomous agents call the API?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500 whitespace-nowrap shrink-0"
            >
              Agent API?
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-400 text-stone-900 rounded-tr-xs font-medium'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-stone-400 text-xs">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Aegis is reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about rules, addresses, or Phantom..."
              className="flex-1 px-3.5 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 dark:text-stone-100"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 text-stone-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all shrink-0 active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
