import React from 'react';

interface DiamondDividerProps {
  className?: string;
  label?: string;
}

export function DiamondDivider({ className = 'my-12', label }: DiamondDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-4 text-stone-300 dark:text-stone-700 ${className}`} aria-hidden="true">
      <div className="h-px bg-gradient-to-r from-transparent to-stone-300 dark:to-stone-700 flex-1 max-w-xs" />
      <span className="text-amber-600/70 dark:text-amber-400/70 text-xs tracking-widest font-mono select-none">
        ◆
      </span>
      {label && (
        <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-medium px-1 select-none font-sans">
          {label}
        </span>
      )}
      <span className="text-amber-600/70 dark:text-amber-400/70 text-xs tracking-widest font-mono select-none">
        ◆
      </span>
      <div className="h-px bg-gradient-to-l from-transparent to-stone-300 dark:to-stone-700 flex-1 max-w-xs" />
    </div>
  );
}
