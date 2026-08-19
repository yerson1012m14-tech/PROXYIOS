import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Zap, Shield, HardDrive, Bell } from 'lucide-react';

interface UIKitDeviceFrameProps {
  children: React.ReactNode;
  currentTime?: string;
  isShieldActive?: boolean;
  engineActive?: boolean;
  licenseLabel?: string;
  currentPath?: string;
}

export const UIKitDeviceFrame: React.FC<UIKitDeviceFrameProps> = ({
  children,
  currentTime,
  isShieldActive = false,
  engineActive = true,
  licenseLabel = 'VIP PERM',
  currentPath = '/var/mobile'
}) => {
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [displayTime, setDisplayTime] = useState(currentTime || '9:41');

  useEffect(() => {
    if (currentTime) {
      setDisplayTime(currentTime);
      return;
    }
    const update = () => {
      const d = new Date();
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      setDisplayTime(`${h}:${m}`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [currentTime]);

  return (
    <div className="relative mx-auto select-none">
      {/* External Physical Titanium Frame & Side Buttons */}
      <div className="relative w-full max-w-[420px] min-w-[340px] h-[850px] bg-[#0c0c0e] text-white rounded-[56px] p-[12px] shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1),0_0_0_4px_#27272a,0_0_0_8px_#18181b] border border-white/10 flex flex-col overflow-hidden">
        
        {/* Left Side Buttons (Action Button, Volume Up, Volume Down) */}
        <div className="absolute -left-[5px] top-[115px] w-[5px] h-[30px] bg-zinc-700 rounded-l-md border-y border-l border-zinc-500/50 shadow-sm" title="Action Button" />
        <div className="absolute -left-[5px] top-[165px] w-[5px] h-[52px] bg-zinc-700 rounded-l-md border-y border-l border-zinc-500/50 shadow-sm" title="Volume Up" />
        <div className="absolute -left-[5px] top-[230px] w-[5px] h-[52px] bg-zinc-700 rounded-l-md border-y border-l border-zinc-500/50 shadow-sm" title="Volume Down" />

        {/* Right Side Button (Power / Siri Button) */}
        <div className="absolute -right-[5px] top-[180px] w-[5px] h-[78px] bg-zinc-700 rounded-r-md border-y border-r border-zinc-500/50 shadow-sm" title="Side Button" />

        {/* Titanium Edge Glare Simulation */}
        <div className="absolute inset-0 rounded-[56px] pointer-events-none border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.8)]" />

        {/* Top Speaker Ear Slit */}
        <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-[54px] h-[4px] bg-zinc-800 rounded-full z-50 border border-zinc-700/40" />

        {/* Status Bar Container */}
        <div className="relative z-50 w-full pt-2 px-6 flex items-center justify-between text-xs font-semibold tracking-tight text-white/90 shrink-0">
          {/* Time */}
          <span className="text-[14px] font-semibold tracking-tight pl-1 font-mono">{displayTime}</span>

          {/* Interactive Dynamic Island */}
          <div
            onClick={() => setIslandExpanded(!islandExpanded)}
            className={`absolute left-1/2 -translate-x-1/2 top-2 bg-black rounded-[20px] border border-zinc-800 shadow-xl flex items-center cursor-pointer transition-all duration-300 ease-out z-50 ${
              islandExpanded
                ? 'w-[320px] h-[66px] px-4 py-2 justify-between'
                : 'w-[124px] h-[32px] px-2.5 justify-between hover:scale-105 active:scale-95'
            }`}
          >
            {islandExpanded ? (
              <div className="w-full flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/60 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold font-mono text-white flex items-center gap-1">
                      <span>MCMFilza Unrestricted</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      Sandbox Bypass: <span className="text-emerald-400 font-semibold">ACTIVO</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                    {licenseLabel}
                  </span>
                  <div className="text-[9px] text-zinc-500 mt-1 font-mono">Toca para cerrar</div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
                  <span className="text-[10px] text-zinc-300 font-mono font-semibold tracking-wider">XIT</span>
                </div>
                {/* Camera lens indicator */}
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700/60" />
              </>
            )}
          </div>

          {/* Right Status Bar (Cellular, Wifi, Battery) */}
          <div className="flex items-center gap-1.5 pr-1 text-white">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-1 bg-zinc-800/80 px-1.5 py-0.5 rounded-md border border-zinc-700/50">
              <span className="text-[10px] font-mono font-medium">100%</span>
              <Battery className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* OLED Display Viewport */}
        <div className="relative flex-1 flex flex-col overflow-hidden rounded-[44px] bg-[#000000] mt-1 shadow-inner border border-zinc-900">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full flex justify-center py-2 bg-black shrink-0">
          <div className="w-32 h-1 bg-white/40 rounded-full active:bg-white/70 transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
