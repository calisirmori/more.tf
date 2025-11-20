import React, { ReactNode, useState } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 border-r border-b rotate-45',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-px w-2 h-2 border-l border-t rotate-45',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-px w-2 h-2 border-t border-r rotate-45',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-px w-2 h-2 border-b border-l rotate-45',
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} px-2 py-1 bg-warmscale-9 border border-orange-500 rounded text-xs font-normal text-white whitespace-nowrap z-[9999] shadow-lg pointer-events-none`}
        >
          {content}
          <div className={`absolute ${arrowClasses[position]} bg-warmscale-9 border-orange-500`}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
