import React from 'react';
import { Link } from 'react-router-dom';
import { GateLogo } from '../common/GateLogo';
import { DiamondDivider } from '../common/DiamondDivider';

export function Footer() {
  return (
    <footer className="w-full bg-[#F5F2EB] dark:bg-[#080C14] border-t border-stone-200/80 dark:border-stone-800/80 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <GateLogo className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <span className="font-serif text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Tollkeeper
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm leading-relaxed">
              The toll gate for AI agent payments. Real-time deterministic risk
              intelligence verifying Solana wallets and token mints before payments execute.
            </p>
            <div className="text-[11px] text-stone-500 dark:text-stone-500 font-mono">
              Solana JSON-RPC · Read-Only · Zero Smart Contracts
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <Link to="/app/check" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Inspect Address
                </Link>
              </li>
              <li>
                <Link to="/app/threats" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Live Threat Radar
                </Link>
              </li>
              <li>
                <Link to="/app/demo" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Agent Simulator
                </Link>
              </li>
              <li>
                <Link to="/app/academy" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Security Academy
                </Link>
              </li>
              <li>
                <Link to="/app/ecosystem" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Ecosystem Directory
                </Link>
              </li>
              <li>
                <Link to="/app/support" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  AI Support Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-3">
              Developers & Legal
            </h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <Link to="/app/docs" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  API & Agent Contract
                </Link>
              </li>
              <li>
                <Link to="/app/settings" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Scoring Methodology & RPC
                </Link>
              </li>
              <li>
                <a
                  href="https://solana.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Solana Network
                </a>
              </li>
              <li>
                <a
                  href="https://solscan.io"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Solscan Explorer
                </a>
              </li>
            </ul>
          </div>
        </div>

        <DiamondDivider className="my-6" />

        {/* Disclaimer & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-stone-500 dark:text-stone-400">
          <p className="max-w-2xl leading-relaxed">
            <strong className="font-semibold text-stone-700 dark:text-stone-300">Disclaimer: </strong>
            Tollkeeper provides risk signals from public on-chain data. It is not financial advice and cannot guarantee safety.
          </p>
          <p className="shrink-0 text-[11px] font-mono">
            © {new Date().getFullYear()} Tollkeeper. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
