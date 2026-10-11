import React from 'react';
import { Verdict } from '../../lib/types';

interface AnimatedGateProps {
  verdict: Verdict | 'ANALYZING' | 'IDLE';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnimatedGate({
  verdict,
  size = 'md',
  className = '',
}: AnimatedGateProps) {
  // Gate rotation state based on verdict
  let leftRotation = 'rotateY(0deg)';
  let rightRotation = 'rotateY(0deg)';
  let leftTranslate = 'translateX(0)';
  let rightTranslate = 'translateX(0)';
  let lockBarOpacity = 0;
  let portalGlow = 'opacity-0';

  if (verdict === 'SAFE') {
    leftRotation = 'rotateY(-68deg)';
    rightRotation = 'rotateY(68deg)';
    leftTranslate = 'translateX(-22px)';
    rightTranslate = 'translateX(22px)';
    portalGlow = 'opacity-90';
  } else if (verdict === 'CAUTION') {
    leftRotation = 'rotateY(-24deg)';
    rightRotation = 'rotateY(24deg)';
    leftTranslate = 'translateX(-8px)';
    rightTranslate = 'translateX(8px)';
    portalGlow = 'opacity-40';
  } else if (verdict === 'BLOCK') {
    leftRotation = 'rotateY(0deg)';
    rightRotation = 'rotateY(0deg)';
    lockBarOpacity = 1;
    portalGlow = 'opacity-10';
  }

  const heightClass =
    size === 'sm' ? 'h-36 w-44' : size === 'lg' ? 'h-64 w-80' : 'h-48 w-60';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${heightClass} ${className}`}
      style={{ perspective: '800px' }}
      aria-label={`Toll gate status: ${verdict}`}
    >
      {/* Background portal illumination */}
      <div
        className={`absolute inset-6 rounded-t-full transition-opacity duration-700 ease-out ${portalGlow} ${
          verdict === 'SAFE'
            ? 'bg-gradient-to-t from-emerald-500/25 via-amber-400/20 to-transparent'
            : verdict === 'CAUTION'
            ? 'bg-gradient-to-t from-amber-500/20 via-amber-300/10 to-transparent'
            : verdict === 'BLOCK'
            ? 'bg-gradient-to-t from-rose-500/20 to-transparent'
            : 'bg-transparent'
        }`}
      />

      {/* Stone Arch Frame (Rigid outer portal) */}
      <svg
        viewBox="0 0 200 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full text-stone-700 dark:text-stone-300 pointer-events-none z-20"
      >
        {/* Foundation plinth */}
        <rect x="15" y="165" width="25" height="10" rx="1" className="fill-stone-300 dark:fill-stone-800" stroke="currentColor" strokeWidth="1.5" />
        <rect x="160" y="165" width="25" height="10" rx="1" className="fill-stone-300 dark:fill-stone-800" stroke="currentColor" strokeWidth="1.5" />

        {/* Pillars */}
        <path d="M25 165V85M35 165V85M165 165V85M175 165V85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="20" y="77" width="20" height="8" rx="1" className="fill-stone-300 dark:fill-stone-800" stroke="currentColor" strokeWidth="1.5" />
        <rect x="160" y="77" width="20" height="8" rx="1" className="fill-stone-300 dark:fill-stone-800" stroke="currentColor" strokeWidth="1.5" />

        {/* Outer Arch */}
        <path
          d="M30 85C30 45 61.34 15 100 15C138.66 15 170 45 170 85"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Inner Arch Edge */}
        <path
          d="M45 85C45 54.62 69.62 30 100 30C130.38 30 155 54.62 155 85"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Keystone */}
        <polygon
          points="93,8 107,8 105,24 95,24"
          className="fill-amber-500"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Scanning beam during analysis */}
        {verdict === 'ANALYZING' && (
          <line
            x1="45"
            y1="80"
            x2="155"
            y2="80"
            stroke="#D4AF37"
            strokeWidth="2"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Dual Gate Leaves (Wrought metal portal doors) */}
      <div className="absolute inset-x-8 bottom-3 top-10 flex justify-center items-end overflow-visible z-10">
        {/* Left Gate Door */}
        <div
          className="w-14 h-32 origin-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: `${leftTranslate} ${leftRotation}`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="w-full h-full border-r border-t border-l border-amber-600/60 dark:border-amber-400/60 bg-stone-200/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-tl-full flex flex-col justify-between p-1.5 shadow-md">
            {/* Iron grid pattern */}
            <div className="grid grid-cols-2 gap-1.5 h-full opacity-70">
              <div className="border-r border-stone-400 dark:border-stone-700 h-full" />
              <div className="border-b border-stone-400 dark:border-stone-700 w-full" />
            </div>
            {/* Classical bronze studs */}
            <div className="flex justify-between px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
          </div>
        </div>

        {/* Right Gate Door */}
        <div
          className="w-14 h-32 origin-right transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: `${rightTranslate} ${rightRotation}`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="w-full h-full border-l border-t border-r border-amber-600/60 dark:border-amber-400/60 bg-stone-200/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-tr-full flex flex-col justify-between p-1.5 shadow-md">
            {/* Iron grid pattern */}
            <div className="grid grid-cols-2 gap-1.5 h-full opacity-70">
              <div className="border-r border-stone-400 dark:border-stone-700 h-full" />
              <div className="border-b border-stone-400 dark:border-stone-700 w-full" />
            </div>
            {/* Classical bronze studs */}
            <div className="flex justify-between px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Heavy Crossbar / Lock (Visible when BLOCK) */}
      <div
        className="absolute inset-x-9 top-1/2 -translate-y-1/2 z-30 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: lockBarOpacity }}
      >
        <div className="h-4 bg-rose-950/90 border border-rose-500/80 rounded flex items-center justify-center shadow-lg">
          <div className="w-2.5 h-2.5 rotate-45 bg-rose-500" />
          <span className="text-[9px] font-mono font-bold tracking-widest text-rose-200 uppercase ml-2 select-none">
            BLOCKED
          </span>
        </div>
      </div>
    </div>
  );
}
