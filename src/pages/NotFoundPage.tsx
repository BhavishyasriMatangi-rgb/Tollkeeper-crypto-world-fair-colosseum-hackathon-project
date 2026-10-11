import React from 'react';
import { Link } from 'react-router-dom';
import { GateLogo } from '../components/common/GateLogo';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF8F5] dark:bg-[#0B101B] bg-arena-pattern text-stone-900 dark:text-stone-100 text-center">
      <div className="max-w-md space-y-6">
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center rounded-2xl bg-amber-100/50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
          <GateLogo className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          <div className="absolute -bottom-1 -right-1 p-1 bg-rose-500 rounded-full text-white">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            404 — Route Not Found
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            The path you navigated to does not exist within the Tollkeeper gate enclosure.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Tollkeeper Gate</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
