import React from 'react';

interface LaceBorderRibbonProps {
  className?: string;
  variant?: 'ivory' | 'dark' | 'gold';
}

export function LaceBorderRibbon({ className = 'my-0', variant = 'ivory' }: LaceBorderRibbonProps) {
  const colorClass =
    variant === 'dark'
      ? 'text-stone-800/80 dark:text-stone-300/80'
      : variant === 'gold'
      ? 'text-[#D4AF37]/80'
      : 'text-[#FAF5EB] dark:text-[#F3ECE0] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]';

  return (
    <div className={`w-full overflow-hidden select-none pointer-events-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-9 sm:h-12 ${colorClass}`}
        preserveAspectRatio="none"
      >
        <pattern
          id="lace-pattern-repeat"
          x="0"
          y="0"
          width="80"
          height="52"
          patternUnits="userSpaceOnUse"
        >
          {/* Top Scalloped Heading */}
          <path
            d="M0 8 C10 1, 30 1, 40 8 C50 1, 70 1, 80 8"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Picot Mini Loops along top edge */}
          <circle cx="10" cy="3" r="1.2" fill="currentColor" opacity="0.85" />
          <circle cx="20" cy="2" r="1.5" fill="currentColor" opacity="0.95" />
          <circle cx="30" cy="3" r="1.2" fill="currentColor" opacity="0.85" />
          <circle cx="50" cy="3" r="1.2" fill="currentColor" opacity="0.85" />
          <circle cx="60" cy="2" r="1.5" fill="currentColor" opacity="0.95" />
          <circle cx="70" cy="3" r="1.2" fill="currentColor" opacity="0.85" />

          {/* Central Arabesque Filigree Medallion */}
          <circle cx="40" cy="26" r="9" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
          <circle cx="40" cy="26" r="5" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="40" cy="26" r="2" fill="currentColor" />

          {/* Heart & Fleur-de-lis Openwork Lace Scrolls */}
          <path
            d="M40 16 C34 9, 24 13, 28 22 C33 27, 40 35, 40 35 C40 35, 47 27, 52 22 C56 13, 46 9, 40 16 Z"
            stroke="currentColor"
            strokeWidth="0.9"
            fill="none"
          />
          <path
            d="M0 16 C-6 9, -16 13, -12 22 C-7 27, 0 35, 0 35 C0 35, 7 27, 12 22 C16 13, 6 9, 0 16 Z"
            stroke="currentColor"
            strokeWidth="0.9"
            fill="none"
          />
          <path
            d="M80 16 C74 9, 64 13, 68 22 C73 27, 80 35, 80 35 C80 35, 87 27, 92 22 C96 13, 86 9, 80 16 Z"
            stroke="currentColor"
            strokeWidth="0.9"
            fill="none"
          />

          {/* Lace Lattice Mesh Netting */}
          <line x1="16" y1="12" x2="28" y2="24" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          <line x1="28" y1="12" x2="16" y2="24" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          <line x1="52" y1="12" x2="64" y2="24" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          <line x1="64" y1="12" x2="52" y2="24" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />

          {/* Bottom Scalloped Border */}
          <path
            d="M0 45 C10 51, 30 51, 40 45 C50 51, 70 51, 80 45"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
          />
          {/* Bottom Droplet Pearls */}
          <circle cx="20" cy="50" r="1.8" fill="currentColor" opacity="0.85" />
          <circle cx="40" cy="45" r="1.2" fill="currentColor" opacity="0.6" />
          <circle cx="60" cy="50" r="1.8" fill="currentColor" opacity="0.85" />
        </pattern>

        <rect width="1200" height="52" fill="url(#lace-pattern-repeat)" />
      </svg>
    </div>
  );
}
