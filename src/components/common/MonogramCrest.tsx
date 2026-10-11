import React from 'react';

interface MonogramCrestProps {
  className?: string;
  initials?: string;
}

export function MonogramCrest({ className = 'w-16 h-20', initials = 'TK' }: MonogramCrestProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 100 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-amber-700 dark:text-amber-300"
      >
        {/* Outer Oval Line */}
        <ellipse
          cx="50"
          cy="65"
          rx="42"
          ry="58"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.85"
        />

        {/* Inner Dotted Oval */}
        <ellipse
          cx="50"
          cy="65"
          rx="37"
          ry="53"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          opacity="0.65"
        />

        {/* Top Acanthus Crown Leaves */}
        <path
          d="M50 7 C45 13, 38 10, 42 4 C47 0, 50 7, 50 7 Z"
          fill="currentColor"
          opacity="0.7"
        />
        <path
          d="M50 7 C55 13, 62 10, 58 4 C53 0, 50 7, 50 7 Z"
          fill="currentColor"
          opacity="0.7"
        />
        <circle cx="50" cy="3" r="1.5" fill="currentColor" />

        {/* Bottom Flourish Ribbon */}
        <path
          d="M32 118 C40 125, 60 125, 68 118 C62 115, 38 115, 32 118 Z"
          fill="currentColor"
          opacity="0.6"
        />
        <circle cx="50" cy="122" r="1.5" fill="currentColor" />

        {/* Delicate Side Vine Spirals */}
        <path
          d="M12 65 C16 55, 16 75, 12 65"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.5"
        />
        <path
          d="M88 65 C84 55, 84 75, 88 65"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.5"
        />
      </svg>

      {/* Monogram Initials */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-editorial text-xl sm:text-2xl font-normal italic tracking-widest text-amber-900 dark:text-amber-200 select-none">
          {initials}
        </span>
      </div>
    </div>
  );
}
