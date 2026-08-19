import React from 'react';
import { ChevronLeft } from 'lucide-react';

export interface UIBarItem {
  id: string;
  icon?: React.ReactNode;
  title?: string;
  isDestructive?: boolean;
  isPrimary?: boolean;
  onClick: () => void;
}

interface UIKitNavigationBarProps {
  title: string;
  subtitle?: string;
  largeTitle?: boolean;
  onBack?: () => void;
  backButtonTitle?: string;
  leftBarButtonItems?: UIBarItem[];
  rightBarButtonItems?: UIBarItem[];
  searchBar?: React.ReactNode;
}

export const UIKitNavigationBar: React.FC<UIKitNavigationBarProps> = ({
  title,
  subtitle,
  largeTitle = false,
  onBack,
  backButtonTitle,
  leftBarButtonItems = [],
  rightBarButtonItems = [],
  searchBar
}) => {
  return (
    <div className="w-full bg-[#000000]/95 backdrop-blur-2xl border-b border-[#38383A]/50 z-40 sticky top-0 transition-all">
      {/* Top Header Row (44pt standard UIKit height) */}
      <div className="h-[48px] px-3 flex items-center justify-between">
        {/* Left Bar Items / Back Button */}
        <div className="flex items-center gap-1 min-w-[70px]">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center text-[#30D158] hover:opacity-80 active:opacity-40 transition-opacity font-normal text-[17px] -ml-1 py-1 px-1.5 rounded-lg active:bg-white/10"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5] -mr-1 text-[#30D158]" />
              <span className="truncate max-w-[100px]">{backButtonTitle || 'Atrás'}</span>
            </button>
          ) : (
            leftBarButtonItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className="p-2 rounded-full text-[#30D158] hover:bg-white/10 active:bg-white/20 transition-all"
                title={item.title}
              >
                {item.icon}
                {item.title && <span className="text-[17px] font-normal">{item.title}</span>}
              </button>
            ))
          )}
        </div>

        {/* Center Title View */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 text-center overflow-hidden">
          <span className="text-[17px] font-semibold text-white tracking-[-0.4px] truncate max-w-[180px] leading-tight">
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] text-[#8E8E93] font-mono tracking-tight truncate max-w-[200px]">
              {subtitle}
            </span>
          )}
        </div>

        {/* Right Bar Items */}
        <div className="flex items-center justify-end gap-1 min-w-[70px]">
          {rightBarButtonItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-95 ${
                item.isPrimary
                  ? 'bg-[#30D158] text-black hover:bg-[#28b84c] shadow-sm'
                  : 'text-[#30D158] hover:bg-[#1C1C1E] active:bg-[#2C2C2E]'
              }`}
              title={item.title}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Embedded Search Bar (UISearchController) */}
      {searchBar && (
        <div className="px-3.5 pb-2.5 pt-0.5 animate-in fade-in duration-150">
          {searchBar}
        </div>
      )}
    </div>
  );
};
