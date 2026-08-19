import React, { useState } from 'react';
import { Share2, Save, ArrowLeft, Check, Copy, Database, ListTree, Code, Eye, FileText, Info } from 'lucide-react';
import { FileItem } from '../types';

interface UIKitFileViewerProps {
  filePath: string;
  fileItem: FileItem;
  onBack: () => void;
  onSaveContent?: (newContent: string) => void;
}

export const UIKitFileViewer: React.FC<UIKitFileViewerProps> = ({
  filePath,
  fileItem,
  onBack,
  onSaveContent
}) => {
  const isSqlite = filePath.endsWith('.db') || filePath.endsWith('.sqlite');
  const isPlist = filePath.endsWith('.plist');

  const [selectedMode, setSelectedMode] = useState<'text' | 'hex' | 'structured' | 'info'>('text');
  const [content, setContent] = useState<string>(fileItem.content || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const fileName = filePath.split('/').pop() || 'Archivo';
  const fileSize = fileItem.size || 1024;

  // Generate real hex dump format matching ViewController.m VisorArchivoVC
  const generateHexDump = (text: string) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text || 'XITFORGE SYSTEM DATA');
    const len = Math.min(bytes.length, 2048);
    const lines: string[] = [];

    lines.push(`// Offset: Hex Bytes  | ASCII (${fileSize} Bytes)\n`);

    for (let i = 0; i < len; i += 16) {
      const offset = i.toString(16).padStart(8, '0');
      let hexPart = '';
      let asciiPart = '';

      for (let j = 0; j < 16; j++) {
        if (i + j < len) {
          const byte = bytes[i + j];
          hexPart += byte.toString(16).padStart(2, '0') + ' ';
          asciiPart += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
        } else {
          hexPart += '   ';
        }
        if (j === 7) hexPart += ' ';
      }

      lines.push(`${offset}: ${hexPart}|${asciiPart}|`);
    }

    return lines.join('\n');
  };

  const handleSave = () => {
    onSaveContent?.(content);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Render lines with line numbers for code editor
  const renderTextWithLineNumbers = () => {
    const lines = content.split('\n');
    return (
      <div className="flex h-full font-mono text-xs">
        {/* Line numbers gutter */}
        <div className="w-10 py-2 pr-2 select-none text-right text-zinc-600 bg-zinc-950/80 border-r border-zinc-800 shrink-0">
          {lines.map((_, idx) => (
            <div key={idx} className="leading-5">{idx + 1}</div>
          ))}
        </div>
        {/* Editor text area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 py-2 px-3 bg-transparent resize-none focus:outline-none font-mono text-xs text-[#00f280] leading-5 placeholder:text-zinc-600 whitespace-pre overflow-auto"
          placeholder="(Archivo vacío)"
          spellCheck={false}
        />
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white overflow-hidden">
      {/* UIKit Navigation Bar for VisorArchivoVC */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 border-b border-zinc-800/80 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center text-[15px] text-[#00f280] active:opacity-60 transition-opacity font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-1 stroke-[2.5]" />
          <span>Atrás</span>
        </button>

        {/* UISegmentedControl Modes */}
        <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setSelectedMode('text')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              selectedMode === 'text'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Texto
          </button>
          <button
            onClick={() => setSelectedMode('hex')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              selectedMode === 'hex'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Hex
          </button>
          {(isSqlite || isPlist) && (
            <button
              onClick={() => setSelectedMode('structured')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedMode === 'structured'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isSqlite ? 'Tablas' : 'Árbol'}
            </button>
          )}
          <button
            onClick={() => setSelectedMode('info')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
              selectedMode === 'info'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Info
          </button>
        </div>

        {/* Actions (Save / Share) */}
        <div className="flex items-center gap-1">
          {selectedMode === 'text' && (
            <button
              onClick={handleSave}
              className="p-1.5 text-[#00f280] active:opacity-60"
              title="Guardar cambios"
            >
              {isSaved ? <Check className="w-5 h-5 text-emerald-300" /> : <Save className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            className="p-1.5 text-[#00f280] active:opacity-60"
            title="Compartir (UIActivityViewController)"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Path Breadcrumb Ribbon */}
      <div className="px-4 py-1.5 bg-zinc-900/70 border-b border-zinc-800/50 flex items-center justify-between text-xs text-zinc-400 font-mono shrink-0">
        <span className="truncate max-w-[260px]">{filePath}</span>
        <span className="text-[10px] bg-zinc-800/90 px-2 py-0.5 rounded text-emerald-400 font-bold border border-zinc-700/60">
          {fileItem.type?.toUpperCase() || 'DAT'}
        </span>
      </div>

      {/* Main Viewer Body */}
      <div className="flex-1 overflow-auto bg-black font-mono text-xs select-text">
        {selectedMode === 'text' && renderTextWithLineNumbers()}

        {selectedMode === 'hex' && (
          <div className="p-3 text-emerald-400">
            <pre className="whitespace-pre overflow-x-auto text-[11px] leading-snug">
              {generateHexDump(content)}
            </pre>
          </div>
        )}

        {selectedMode === 'structured' && isSqlite && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold font-mono">
              <Database className="w-4 h-4" />
              <span>Inspector de Tablas SQLite 3</span>
            </div>
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-800/80 border-b border-zinc-700 text-zinc-300 font-bold text-[11px]">
                Tabla: tracks_offline (Registros: 3)
              </div>
              <div className="divide-y divide-zinc-800 text-[11px]">
                <div className="p-2.5 flex items-center justify-between text-zinc-200">
                  <span>1. Rick Astley - Never Gonna Give You Up</span>
                  <span className="text-emerald-400 font-bold">213s • Cached</span>
                </div>
                <div className="p-2.5 flex items-center justify-between text-zinc-200">
                  <span>2. The Weeknd - Blinding Lights</span>
                  <span className="text-emerald-400 font-bold">200s • Cached</span>
                </div>
                <div className="p-2.5 flex items-center justify-between text-zinc-200">
                  <span>3. Ed Sheeran - Shape of You</span>
                  <span className="text-emerald-400 font-bold">233s • Cached</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMode === 'structured' && isPlist && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
              <ListTree className="w-4 h-4" />
              <span>Property List Tree (Apple XML/Binary Plist)</span>
            </div>
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-3 space-y-2 text-[11px] font-mono">
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-400">CFBundleIdentifier:</span>
                <span className="text-emerald-400 font-bold">com.dts.freefireth</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-400">CFBundleShortVersionString:</span>
                <span className="text-white">1.104.2</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-400">UIRequiredDeviceCapabilities:</span>
                <span className="text-amber-300">arm64</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">MCMFilzaBypassEnabled:</span>
                <span className="text-emerald-400 font-bold">YES (Boolean)</span>
              </div>
            </div>
          </div>
        )}

        {selectedMode === 'info' && (
          <div className="p-4 space-y-4 font-sans text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Atributos de Sistema de Archivos (NSFileManager)</span>
            </div>

            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-3.5 space-y-2.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-400">Nombre:</span>
                <span className="text-white font-bold">{fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Ruta Completa:</span>
                <span className="text-emerald-400 truncate max-w-[200px]">{filePath}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Tamaño (NSFileSize):</span>
                <span className="text-white">{fileSize} Bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Permisos UNIX (POSIX):</span>
                <span className="text-amber-400">{fileItem.permissions || '-rw-r--r--'} (0644)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Propietario / Grupo:</span>
                <span className="text-zinc-200">mobile (501) : staff (20)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Modificado (NSFileModificationDate):</span>
                <span className="text-zinc-300">{fileItem.modifiedDate || '2026-08-19 09:41'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UIActivityViewController Mock Sheet */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-[390px] bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-700/60 p-4 space-y-4 shadow-2xl animate-in slide-in-from-bottom">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-white">UIActivityViewController</h4>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{fileName}</p>
            </div>

            <div className="grid grid-cols-4 gap-3 py-2 text-center text-[11px] text-zinc-300">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(content);
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-zinc-800/80 active:bg-zinc-700"
              >
                <Copy className="w-5 h-5 text-[#00f280]" />
                <span>Copiar</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-zinc-800/80 active:bg-zinc-700"
              >
                <Share2 className="w-5 h-5 text-[#00f280]" />
                <span>AirDrop</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-zinc-800/80 active:bg-zinc-700"
              >
                <Save className="w-5 h-5 text-[#00f280]" />
                <span>Archivos</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-zinc-800/80 active:bg-zinc-700"
              >
                <Check className="w-5 h-5 text-[#00f280]" />
                <span>Listo</span>
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-3 bg-zinc-800 text-center text-sm font-semibold text-[#00f280] rounded-xl active:bg-zinc-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
