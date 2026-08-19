import React, { useState } from 'react';
import { Flame, Copy, Smartphone, Check, Sparkles, KeyRound } from 'lucide-react';

interface UIKitLoginKeyViewProps {
  onActivate: (key: string) => boolean | void;
  initialError?: string | null;
}

export const UIKitLoginKeyView: React.FC<UIKitLoginKeyViewProps> = ({
  onActivate,
  initialError
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const [justPasted, setJustPasted] = useState(false);

  const formatKey = (raw: string) => {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
    const parts = clean.match(/.{1,4}/g) || [];
    return parts.join('-');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKey(e.target.value);
    setKeyInput(formatted);
    if (errorMessage) setErrorMessage(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length > 0) {
        setKeyInput(formatKey(text));
      } else {
        setKeyInput('MIFILZA-VIP-2026');
      }
    } catch {
      setKeyInput('MIFILZA-VIP-2026');
    }
    setJustPasted(true);
    setTimeout(() => setJustPasted(false), 1200);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!keyInput.trim()) {
      setErrorMessage('La llave no puede estar vacía.');
      return;
    }
    const res = onActivate(keyInput);
    if (res === false) {
      setErrorMessage('Key inválida. Usa VIP-2026, TRIAL-TEST o una clave de 16 caracteres.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-[#000000] text-white overflow-y-auto">
      {/* Top Header & Branding (LoginKeyViewController) */}
      <div className="flex flex-col items-center pt-8">
        {/* Flame Logo Container (Apple Squircle) */}
        <div className="w-[76px] h-[76px] rounded-[22px] bg-gradient-to-b from-[#1C3D28] to-[#0A1F13] border border-[#30D158]/50 shadow-[0_10px_30px_rgba(48,209,88,0.25)] flex items-center justify-center mb-4">
          <Flame className="w-10 h-10 text-[#30D158] fill-[#30D158]/20" />
        </div>

        {/* Title XITFORGE */}
        <div className="flex items-center tracking-[-0.5px] text-[30px] font-black">
          <span className="text-white">XIT</span>
          <span className="text-[#30D158]">FORGE</span>
        </div>

        {/* Subtitle */}
        <div className="text-[11px] font-mono font-semibold tracking-wider text-[#8E8E93] uppercase mt-1">
          UNRESTRICTED ENGINE • UIKIT NATIVO
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full mt-8 space-y-4">
          {/* Key Input Row with Paste doc.on.doc Button */}
          <div className="w-full flex items-center bg-[#1C1C1E] border border-[#38383A] rounded-[14px] p-1.5 focus-within:border-[#30D158] focus-within:ring-1 focus-within:ring-[#30D158] transition-all">
            <div className="pl-2.5 text-[#8E8E93]">
              <KeyRound className="w-4 h-4" />
            </div>

            <input
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={keyInput}
              onChange={handleInputChange}
              className="flex-1 bg-transparent px-3 py-2.5 text-[16px] font-mono font-bold text-[#30D158] placeholder:text-[#636366] focus:outline-none uppercase tracking-wider"
              maxLength={19}
            />

            {/* Paste Button (doc.on.doc) */}
            <button
              type="button"
              onClick={handlePaste}
              className={`p-2.5 rounded-[10px] border transition-all flex items-center justify-center ${
                justPasted
                  ? 'bg-[#30D158] text-black border-[#30D158]'
                  : 'bg-[#2C2C2E] text-[#30D158] border-white/10 hover:bg-[#3A3A3C]'
              }`}
              title="Pegar del portapapeles"
            >
              {justPasted ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Primary ACTIVAR Button (iOS .borderedProminent button) */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#30D158] hover:bg-[#28b84c] active:scale-[0.98] text-black font-semibold text-[17px] tracking-[-0.4px] rounded-[14px] shadow-[0_4px_16px_rgba(48,209,88,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <span>ACTIVAR</span>
          </button>

          {/* Error Label */}
          {errorMessage && (
            <p className="text-center text-[13px] font-medium text-[#FF453A] mt-1 animate-in fade-in">
              {errorMessage}
            </p>
          )}

          {/* Quick Preset Keys for Testing */}
          <div className="pt-2">
            <div className="text-[11px] text-[#8E8E93] font-mono text-center mb-2">
              Keys de prueba rápidas:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {[
                { label: 'VIP Perm', key: 'MIFILZA-VIP-2026' },
                { label: 'Trial 3d', key: 'TRIAL-MIFILZA-TEST' },
                { label: 'Pro 7d', key: 'XIT9-8B92-F401-2026' }
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setKeyInput(p.key);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="px-3 py-1.5 bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-[#38383A] text-[12px] font-mono text-[#D1D1D6] rounded-[8px] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Real Hardware Telemetry Card (LoginKeyViewController.m) */}
      <div className="w-full bg-[#1C1C1E] border border-[#38383A]/80 rounded-[18px] p-4 mt-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#30D158]/15 flex items-center justify-center text-[#30D158]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate tracking-[-0.2px]">
              iPhone 16 Pro Max • iOS 18.3.1
            </div>
            <div className="text-[11px] font-mono text-[#8E8E93] truncate">
              HWID: DEV-XIT9-8B92-F401-2026
            </div>
          </div>
        </div>

        {/* Compatibility Badge */}
        <div className="mt-3 py-2 px-3 rounded-[10px] bg-[#30D158]/10 border border-[#30D158]/30 text-center">
          <span className="text-[12px] font-mono font-bold text-[#30D158]">
            ✓ COMPATIBLE (Hasta iOS 27 Beta 4)
          </span>
        </div>
      </div>
    </div>
  );
};
