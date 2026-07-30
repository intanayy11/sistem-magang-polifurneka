import React from 'react';

/**
 * DovetailDivider Component
 * Signature visual emblem representing classical woodworking dovetail joints.
 * Used as a clean, consistent section separator line across all pages.
 */
const DovetailDivider = ({ className = 'my-4' }) => {
  return (
    <div className={`relative flex items-center justify-center w-full opacity-65 pointer-events-none ${className}`}>
      {/* Left Line */}
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#E8A800]/40 to-[#E8A800]/70" />
      
      {/* Dovetail Joint SVG Teeth Center Emblem */}
      <div className="px-3 flex items-center gap-1.5 shrink-0 text-[#E8A800]">
        <svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dovetail Pin 1 */}
          <path d="M2 1L8 11H14L8 1Z" fill="#E8A800" fillOpacity="0.85" />
          {/* Dovetail Pin 2 */}
          <path d="M16 1L22 11H28L22 1Z" fill="#E8A800" />
          {/* Dovetail Pin 3 */}
          <path d="M30 1L36 11H40L36 1Z" fill="#E8A800" fillOpacity="0.85" />
        </svg>
      </div>

      {/* Right Line */}
      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#E8A800]/40 to-[#E8A800]/70" />
    </div>
  );
};

export default DovetailDivider;
