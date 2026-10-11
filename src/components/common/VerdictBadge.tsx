import React from 'react';
import { Verdict } from '../../lib/types';
import { CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showIcon?: boolean;
  className?: string;
}

export function VerdictBadge({
  verdict,
  size = 'md',
  showIcon = true,
  className = '',
}: VerdictBadgeProps) {
  const config = {
    SAFE: {
      label: 'SAFE TO PAY',
      shortLabel: 'SAFE',
      icon: CheckCircle2,
      shield: ShieldCheck,
      colorLight: 'text-emerald-700 bg-emerald-50/80 border-emerald-300/80',
      colorDark: 'dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800/80',
      dotColor: 'bg-emerald-600 dark:bg-emerald-400',
    },
    CAUTION: {
      label: 'CAUTION REQUIRED',
      shortLabel: 'CAUTION',
      icon: AlertTriangle,
      shield: AlertTriangle,
      colorLight: 'text-amber-800 bg-amber-50/80 border-amber-300/80',
      colorDark: 'dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800/80',
      dotColor: 'bg-amber-600 dark:bg-amber-400',
    },
    BLOCK: {
      label: 'PAYMENT BLOCKED',
      shortLabel: 'BLOCK',
      icon: ShieldAlert,
      shield: ShieldAlert,
      colorLight: 'text-rose-800 bg-rose-50/80 border-rose-300/80',
      colorDark: 'dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800/80',
      dotColor: 'bg-rose-600 dark:bg-rose-400',
    },
  }[verdict];

  const IconComponent = config.icon;

  if (size === 'hero') {
    return (
      <div
        className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-lg border text-base font-semibold tracking-wide ${config.colorLight} ${config.colorDark} ${className}`}
      >
        {showIcon && <IconComponent className="w-5 h-5 shrink-0" aria-hidden="true" />}
        <span>{config.label}</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-md border text-sm font-semibold tracking-wide ${config.colorLight} ${config.colorDark} ${className}`}
      >
        {showIcon && <IconComponent className="w-4 h-4 shrink-0" aria-hidden="true" />}
        <span>{config.label}</span>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium tracking-wide ${config.colorLight} ${config.colorDark} ${className}`}
      >
        {showIcon && <IconComponent className="w-3 h-3 shrink-0" aria-hidden="true" />}
        <span>{config.shortLabel}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-semibold tracking-wide ${config.colorLight} ${config.colorDark} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span>{config.shortLabel}</span>
    </div>
  );
}
