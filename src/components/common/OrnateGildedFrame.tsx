import React from 'react';

interface OrnateGildedFrameProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function OrnateGildedFrame({ children, className = '', title }: OrnateGildedFrameProps) {
  return (
    <div className={`relative p-3.5 sm:p-5 rounded-3xl bg-gradient-to-b from-[#FAF5EC] to-[#F3ECE0] dark:from-[#151D2F] dark:to-[#0D1424] border-2 border-[#D4AF37]/70 shadow-xl ${className}`}>
      {/* Outer bead border */}
      <div className="absolute inset-1.5 rounded-[22px] border border-[#D4AF37]/40 pointer-events-none" />

      {/* Four Antique Corner Filigree Ornaments */}
      <div className="absolute top-2 left-2 w-6 h-6 text-[#B89028] dark:text-[#E2C768] pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 12C2 6.48 6.48 2 12 2" />
          <circle cx="6" cy="6" r="1.5" fill="currentColor" />
          <path d="M4 16C4 9.37 9.37 4 16 4" strokeDasharray="1.5 1.5" />
        </svg>
      </div>

      <div className="absolute top-2 right-2 w-6 h-6 text-[#B89028] dark:text-[#E2C768] pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M22 12C22 6.48 17.52 2 12 2" />
          <circle cx="18" cy="6" r="1.5" fill="currentColor" />
          <path d="M20 16C20 9.37 14.63 4 8 4" strokeDasharray="1.5 1.5" />
        </svg>
      </div>

      <div className="absolute bottom-2 left-2 w-6 h-6 text-[#B89028] dark:text-[#E2C768] pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 12C2 17.52 6.48 22 12 22" />
          <circle cx="6" cy="18" r="1.5" fill="currentColor" />
          <path d="M4 8C4 14.63 9.37 20 16 20" strokeDasharray="1.5 1.5" />
        </svg>
      </div>

      <div className="absolute bottom-2 right-2 w-6 h-6 text-[#B89028] dark:text-[#E2C768] pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M22 12C22 17.52 17.52 22 12 22" />
          <circle cx="18" cy="18" r="1.5" fill="currentColor" />
          <path d="M20 8C20 14.63 14.63 20 8 20" strokeDasharray="1.5 1.5" />
        </svg>
      </div>

      {title && (
        <div className="text-center mb-3">
          <span className="font-editorial text-xs uppercase tracking-[0.25em] text-amber-800 dark:text-amber-300 font-bold">
            {title}
          </span>
        </div>
      )}

      {/* Frame content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
