import React from 'react';

interface GateLogoProps {
  className?: string;
  size?: number;
}

export function GateLogo({ className = 'w-7 h-7', size }: GateLogoProps) {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={sizeStyle}
      aria-hidden="true"
    >
      {/* Classical Arch Base Pedestals */}
      <rect x="6" y="40" width="10" height="4" rx="1" className="fill-amber-700/80 dark:fill-amber-500/80" />
      <rect x="32" y="40" width="10" height="4" rx="1" className="fill-amber-700/80 dark:fill-amber-500/80" />

      {/* Main Arch Columns */}
      <path
        d="M8 40V24M14 40V24M34 40V24M40 40V24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Arch Capital / Impost Blocks */}
      <rect x="7" y="21" width="8" height="3" rx="0.5" className="fill-stone-400 dark:fill-stone-600" />
      <rect x="33" y="21" width="8" height="3" rx="0.5" className="fill-stone-400 dark:fill-stone-600" />

      {/* Outer Arch Vault Curve */}
      <path
        d="M11 21C11 13.82 16.82 8 24 8C31.18 8 37 13.82 37 21"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Inner Arch Vault Curve */}
      <path
        d="M17 21C17 17.13 20.13 14 24 14C27.87 14 31 17.13 31 21"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />

      {/* Keystone at Apex */}
      <polygon
        points="22,6 26,6 25,12 23,12"
        className="fill-amber-500 dark:fill-amber-400"
        stroke="currentColor"
        strokeWidth="1"
      />

      {/* Horizontal Entablature / Architrave */}
      <path
        d="M4 7H44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Central Guard Diamond */}
      <path
        d="M24 22L27 25L24 28L21 25Z"
        className="fill-amber-500/90 dark:fill-amber-400"
      />

      {/* Portcullis Grate Bars */}
      <line x1="24" y1="28" x2="24" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="19" y1="25" x2="19" y2="40" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
      <line x1="29" y1="25" x2="29" y2="40" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
