import React from 'react';

interface LaceMedallionCrestProps {
  className?: string;
  size?: number;
  label?: string;
  sublabel?: string;
}

export function LaceMedallionCrest({
  className = 'w-72 h-72 sm:w-80 sm:h-80',
  label = 'VERIFY',
  sublabel = 'HERE',
}: LaceMedallionCrestProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-[#FAF6EE] drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
      >
        <defs>
          <filter id="laceShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Outermost Scalloped Lace Ring (16 large scallops with picot loops) */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={i} transform={`rotate(${angle} 160 160)`}>
              {/* Lace petal arc */}
              <path
                d="M142 16 C152 4, 168 4, 178 16"
                stroke="currentColor"
                strokeWidth="1.6"
                opacity="0.95"
              />
              {/* Outer picot pearls */}
              <circle cx="160" cy="8" r="2.8" fill="currentColor" opacity="0.95" />
              <circle cx="148" cy="12" r="1.8" fill="currentColor" opacity="0.8" />
              <circle cx="172" cy="12" r="1.8" fill="currentColor" opacity="0.8" />

              {/* Heart-shaped lace openwork loop */}
              <path
                d="M160 22 C150 22, 145 32, 160 46 C175 32, 170 22, 160 22 Z"
                stroke="currentColor"
                strokeWidth="1.1"
                opacity="0.9"
              />
              <circle cx="160" cy="32" r="2" fill="currentColor" opacity="0.85" />
            </g>
          );
        })}

        {/* Concentric Lace Lattice Layer 1 */}
        <circle cx="160" cy="160" r="114" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <circle cx="160" cy="160" r="108" stroke="currentColor" strokeWidth="1.8" opacity="0.9" />

        {/* Middle Filigree Rosettes (24 petals) */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          return (
            <g key={i} transform={`rotate(${angle} 160 160)`}>
              <ellipse cx="160" cy="68" rx="5" ry="11" stroke="currentColor" strokeWidth="0.9" opacity="0.85" />
              <circle cx="160" cy="62" r="1.8" fill="currentColor" opacity="0.9" />
              {/* Lattice tick */}
              <line x1="156" y1="72" x2="164" y2="72" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
            </g>
          );
        })}

        {/* Inner Solid Border Ring with delicate studs */}
        <circle cx="160" cy="160" r="82" stroke="currentColor" strokeWidth="2.2" opacity="0.95" />
        <circle cx="160" cy="160" r="77" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.85" />

        {/* Central Cartouche (Rounded rectangle like "RSVP HERE" in reference) */}
        <rect
          x="105"
          y="118"
          width="110"
          height="84"
          rx="16"
          fill="#FAF6EE"
          stroke="#421520"
          strokeWidth="1.5"
          filter="url(#laceShadow)"
        />

        {/* Delicate inner frame within cartouche */}
        <rect
          x="110"
          y="123"
          width="100"
          height="74"
          rx="12"
          stroke="#421520"
          strokeWidth="0.75"
          strokeDasharray="2 2"
          opacity="0.6"
        />

        {/* Corner dots */}
        <circle cx="116" cy="129" r="1.5" fill="#421520" opacity="0.7" />
        <circle cx="204" cy="129" r="1.5" fill="#421520" opacity="0.7" />
        <circle cx="116" cy="191" r="1.5" fill="#421520" opacity="0.7" />
        <circle cx="204" cy="191" r="1.5" fill="#421520" opacity="0.7" />
      </svg>

      {/* Cartouche Typography (Directly matching "RSVP HERE" in the reference) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <p className="font-editorial text-xl sm:text-2xl font-bold tracking-[0.2em] text-[#3D141C] uppercase leading-none">
          {label}
        </p>
        <p className="font-editorial text-[10px] sm:text-[11px] tracking-[0.25em] text-[#7A3644] uppercase font-semibold mt-1">
          {sublabel}
        </p>
      </div>
    </div>
  );
}
