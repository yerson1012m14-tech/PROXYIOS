import React, { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';

export interface UIKitTableCellItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconTintColor?: string;
  accessoryType?: 'none' | 'disclosure' | 'checkmark' | 'detail';
  badge?: string;
  isDeletable?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

export interface UIKitTableSection {
  header?: string;
  footer?: string;
  items: UIKitTableCellItem[];
}

interface UIKitTableViewProps {
  style?: 'plain' | 'grouped' | 'insetGrouped';
  sections: UIKitTableSection[];
  emptyMessage?: string;
}

export const UIKitTableView: React.FC<UIKitTableViewProps> = ({
  style = 'plain',
  sections,
  emptyMessage = 'No hay elementos'
}) => {
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);

  if (totalItems === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#8E8E93]">
        <p className="text-[15px] font-normal leading-relaxed">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${style === 'insetGrouped' ? 'px-4 py-3 space-y-5' : 'space-y-3'}`}>
      {sections.map((section, secIdx) => (
        <div key={secIdx} className="w-full">
          {section.header && (
            <div className="px-4 pb-1.5 text-[13px] font-medium text-[#8E8E93] uppercase tracking-[-0.2px]">
              {section.header}
            </div>
          )}

          <div
            className={`w-full overflow-hidden ${
              style === 'insetGrouped'
                ? 'bg-[#1C1C1E] rounded-[16px] border border-white/5 shadow-sm divide-y divide-[#38383A]/40'
                : 'bg-[#000000] border-t border-b border-[#38383A]/50 divide-y divide-[#38383A]/40'
            }`}
          >
            {section.items.map((item, itemIdx) => {
              const isSwiped = swipedItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden group select-none transition-colors"
                >
                  {/* Background Swipe Delete Action Button (iOS Style) */}
                  {item.isDeletable && (
                    <div className="absolute inset-y-0 right-0 flex items-center justify-end z-0 bg-[#FF453A] px-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          item.onDelete?.();
                          setSwipedItemId(null);
                        }}
                        className="flex flex-col items-center justify-center text-white text-[13px] font-medium active:opacity-70"
                      >
                        <Trash2 className="w-5 h-5 mb-0.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  )}

                  {/* Cell Foreground Content Row (iOS Standard Table Cell) */}
                  <div
                    onClick={() => {
                      if (isSwiped) {
                        setSwipedItemId(null);
                      } else {
                        item.onClick?.();
                      }
                    }}
                    className={`relative z-10 flex items-center justify-between px-4 py-2.5 bg-[#000000] active:bg-[#1C1C1E] transition-transform duration-200 ease-out cursor-pointer ${
                      isSwiped ? '-translate-x-24' : 'translate-x-0'
                    }`}
                  >
                    {/* Left Icon Squircle Plate + Text Labels */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {item.icon && (
                        <div
                          className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0 shadow-sm"
                          style={{
                            backgroundColor: item.iconBgColor || 'rgba(48, 209, 88, 0.15)',
                            color: item.iconTintColor || '#30D158'
                          }}
                        >
                          {item.icon}
                        </div>
                      )}

                      <div className="flex flex-col min-w-0 flex-1 pr-2">
                        <span className="text-[16px] font-normal text-white truncate tracking-[-0.3px] leading-tight">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="text-[12px] text-[#8E8E93] font-mono truncate leading-snug mt-0.5">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Accessory & Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#2C2C2E] text-[#D1D1D6] border border-white/5">
                          {item.badge}
                        </span>
                      )}

                      {item.isDeletable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSwipedItemId(isSwiped ? null : item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#8E8E93] hover:text-[#FF453A] transition-opacity"
                          title="Deslizar para eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {item.accessoryType === 'disclosure' && (
                        <ChevronRight className="w-4 h-4 text-[#8E8E93] stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {section.footer && (
            <div className="px-4 pt-1.5 text-[12px] text-[#8E8E93] font-normal leading-relaxed">
              {section.footer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
