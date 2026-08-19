import React from 'react';
import { HardDrive, Smartphone } from 'lucide-react';

interface UIKitStorageBarProps {
  totalGb?: number;
  usedGb?: number;
  freeGb?: number;
}

export const UIKitStorageBar: React.FC<UIKitStorageBarProps> = ({
  totalGb = 256,
  usedGb = 42.8,
  freeGb = 213.2
}) => {
  return (
    <div className="w-full bg-zinc-950/90 border-b border-zinc-800/80 px-4 py-2 text-xs">
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1.5">
        <div className="flex items-center gap-1.5 text-white font-medium">
          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
          <span>Almacenamiento iPhone</span>
        </div>
        <span>{usedGb} GB de {totalGb} GB usados ({freeGb} GB libres)</span>
      </div>

      {/* Segmented iOS Storage Bar */}
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
        {/* System (Red/Coral) */}
        <div className="h-full bg-red-500 rounded-l-full" style={{ width: '8%' }} title="Sistema: 12 GB" />
        {/* Apps & Containers (Emerald Green) */}
        <div className="h-full bg-[#00f280]" style={{ width: '14%' }} title="Apps & Contenedores: 22 GB" />
        {/* Databases / Media (Purple) */}
        <div className="h-full bg-purple-500" style={{ width: '6%' }} title="Datos / SQLite: 8.8 GB" />
        {/* Free space (Zinc/Empty) */}
        <div className="h-full bg-zinc-700/60 rounded-r-full flex-1" title="Libre: 213.2 GB" />
      </div>

      {/* Storage Legend */}
      <div className="flex items-center gap-3 mt-1.5 text-[9px] text-zinc-400 font-mono">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Sistema</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#00f280]" />
          <span>Apps</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Datos</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <span>Libre</span>
        </div>
      </div>
    </div>
  );
};
