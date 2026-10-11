import React from 'react';

interface ArchHeroIllustrationProps {
  className?: string;
}

export function ArchHeroIllustration({ className = 'w-full h-auto' }: ArchHeroIllustrationProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Radial backlight glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl" />
      </div>

      <svg
        viewBox="0 0 540 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-lg h-auto relative z-10 text-stone-900 dark:text-stone-100"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="archGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#B48B25" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="gateFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Perspective floor arena pavers */}
        <path d="M70 340H470" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M120 360H420" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
        <path d="M160 375H380" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.15" />

        <line x1="160" y1="340" x2="200" y2="380" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
        <line x1="270" y1="340" x2="270" y2="380" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
        <line x1="380" y1="340" x2="340" y2="380" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />

        {/* Outer concentric monumental arches */}
        <path
          d="M100 340V190C100 96.11 176.11 20 270 20C363.89 20 440 96.11 440 190V340"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.25"
        />
        <path
          d="M130 340V195C130 117.68 192.68 55 270 55C347.32 55 410 117.68 410 195V340"
          stroke="url(#archGold)"
          strokeWidth="2"
        />
        <path
          d="M160 340V205C160 144.25 209.25 95 270 95C330.75 95 380 144.25 380 205V340"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeOpacity="0.4"
        />

        {/* Inner Classical Portal Arch */}
        <path
          d="M190 340V215C190 170.82 225.82 135 270 135C314.18 135 350 170.82 350 215V340"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        {/* Arch Keystone & Crown */}
        <polygon
          points="258,40 282,40 278,65 262,65"
          fill="#D4AF37"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="270" cy="52" r="3" fill="currentColor" />

        {/* Radial voussoir rays (classical arch stones) */}
        <line x1="270" y1="135" x2="270" y2="95" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="228" y1="152" x2="202" y2="124" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="312" y1="152" x2="338" y2="124" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="198" y1="195" x2="168" y2="182" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="342" y1="195" x2="372" y2="182" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />

        {/* Architectural Pediments & Capitals */}
        <rect x="180" y="212" width="20" height="8" rx="1" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="340" y="212" width="20" height="8" rx="1" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />

        {/* Gateway Inner Fill & Radiance */}
        <path
          d="M191 340V216C191 172.43 226.43 137 270 137C313.57 137 349 172.43 349 216V340H191Z"
          fill="url(#gateFade)"
        />

        {/* The Golden Toll Gate Grid (Floating security lattice) */}
        <line x1="270" y1="150" x2="270" y2="340" stroke="#D4AF37" strokeWidth="1.75" />
        <line x1="230" y1="180" x2="230" y2="340" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.7" />
        <line x1="310" y1="180" x2="310" y2="340" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.7" />
        
        <line x1="200" y1="250" x2="340" y2="250" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="200" y1="290" x2="340" y2="290" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.6" />

        {/* Central Toll Diamond Crest */}
        <polygon
          points="270,225 282,237 270,249 258,237"
          fill="#D4AF37"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Flanking Guardian Columns */}
        <line x1="90" y1="340" x2="90" y2="210" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
        <line x1="450" y1="340" x2="450" y2="210" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      </svg>
    </div>
  );
}
