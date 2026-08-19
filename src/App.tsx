import React, { useState, useMemo, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  ArrowLeft, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight, 
  Check, 
  X, 
  Zap, 
  Smartphone, 
  CornerDownRight, 
  FileCode, 
  Database, 
  Cpu, 
  Image as ImageIcon,
  Key,
  LogOut,
  AlertCircle,
  Flame,
  Settings,
  Copy,
  Timer,
  CheckCircle2,
  Sparkles,
  Palette,
  Layers,
  Moon,
  Sun,
  Grid,
  Sparkle
} from 'lucide-react';
import { INITIAL_FILE_SYSTEM, formatFileSize } from './mockFileSystem';
import { FileItem } from './types';

// Definition of Background Presets
interface ThemeBackground {
  id: string;
  name: string;
  desc: string;
  bgHex: string;
  cardHex: string;
  headerHex: string;
  borderHex: string;
  previewGradient: string;
}

const THEME_BACKGROUNDS: ThemeBackground[] = [
  {
    id: 'oled-black',
    name: 'OLED Negro Puro',
    desc: 'Negro absoluto 100% óptimo para pantallas OLED',
    bgHex: '#000000',
    cardHex: '#0a0a0d',
    headerHex: '#0c0c10',
    borderHex: '#1f1f24',
    previewGradient: 'from-black to-zinc-900'
  },
  {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    desc: 'Azul espacial profundo galáctico',
    bgHex: '#040711',
    cardHex: '#090e1f',
    headerHex: '#0c1329',
    borderHex: '#1e293b',
    previewGradient: 'from-[#040711] to-[#0f172a]'
  },
  {
    id: 'cyber-emerald',
    name: 'Cyber Emerald',
    desc: 'Verde oscuro matriz estilo terminal hacker',
    bgHex: '#020b06',
    cardHex: '#05180f',
    headerHex: '#072014',
    borderHex: '#064e3b',
    previewGradient: 'from-[#020b06] to-[#064e3b]'
  },
  {
    id: 'obsidian-purple',
    name: 'Obsidian Purple',
    desc: 'Púrpura neón oscuro y místico',
    bgHex: '#080312',
    cardHex: '#120726',
    headerHex: '#180a33',
    borderHex: '#3b0764',
    previewGradient: 'from-[#080312] to-[#3b0764]'
  },
  {
    id: 'crimson-blood',
    name: 'Crimson Rogue',
    desc: 'Rojo carmesí oscuro de alta intensidad',
    bgHex: '#0e0204',
    cardHex: '#1f070b',
    headerHex: '#29090e',
    borderHex: '#4c0519',
    previewGradient: 'from-[#0e0204] to-[#4c0519]'
  },
  {
    id: 'titanium-gray',
    name: 'Titanium Carbon',
    desc: 'Gris carbón grafito mate texturizado',
    bgHex: '#0d0d10',
    cardHex: '#16161c',
    headerHex: '#1a1a22',
    borderHex: '#27272a',
    previewGradient: 'from-[#0d0d10] to-[#27272a]'
  }
];

// Definition of Accent Color Presets
interface AccentColor {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  glowClass: string;
}

const ACCENT_COLORS: AccentColor[] = [
  {
    id: 'emerald',
    name: 'Esmeralda XIT',
    hex: '#10b981',
    rgb: '16, 185, 129',
    glowClass: 'rgba(16, 185, 129, 0.3)'
  },
  {
    id: 'cyan',
    name: 'Cian Eléctrico',
    hex: '#06b6d4',
    rgb: '6, 182, 212',
    glowClass: 'rgba(6, 182, 212, 0.3)'
  },
  {
    id: 'purple',
    name: 'Púrpura Neón',
    hex: '#a855f7',
    rgb: '168, 85, 247',
    glowClass: 'rgba(168, 85, 247, 0.3)'
  },
  {
    id: 'gold',
    name: 'Dorado Ámbar',
    hex: '#f59e0b',
    rgb: '245, 158, 11',
    glowClass: 'rgba(245, 158, 11, 0.3)'
  },
  {
    id: 'crimson',
    name: 'Rojo Carmesí',
    hex: '#ef4444',
    rgb: '239, 68, 68',
    glowClass: 'rgba(239, 68, 68, 0.3)'
  },
  {
    id: 'pink',
    name: 'Rosa Neón',
    hex: '#ec4899',
    rgb: '236, 72, 153',
    glowClass: 'rgba(236, 72, 153, 0.3)'
  }
];

export default function App() {
  // Key / License System State (Starts on Key Screen)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [licenseState, setLicenseState] = useState<{
    isActive: boolean;
    key: string;
    type: 'VIP PERMANENTE' | 'PRUEBA (TRIAL 3 DÍAS)' | 'PRO (7 DÍAS)' | 'SIN LICENCIA';
    activatedAt?: number;
    expiresAtTimestamp?: number | null;
    totalDurationSeconds?: number;
  }>({
    isActive: false,
    key: '',
    type: 'SIN LICENCIA',
    expiresAtTimestamp: null
  });

  const [inputKey, setInputKey] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [justPasted, setJustPasted] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedHwid, setCopiedHwid] = useState(false);

  // =========================================================================
  // THEME & CUSTOMIZATION STATE
  // =========================================================================
  const [selectedBgId, setSelectedBgId] = useState<string>('oled-black');
  const [selectedAccentId, setSelectedAccentId] = useState<string>('emerald');
  const [ambientGlowEnabled, setAmbientGlowEnabled] = useState<boolean>(true);
  const [gridPatternEnabled, setGridPatternEnabled] = useState<boolean>(false);
  const [neonBordersEnabled, setNeonBordersEnabled] = useState<boolean>(true);

  // Active theme objects
  const activeBg = useMemo(() => {
    return THEME_BACKGROUNDS.find(b => b.id === selectedBgId) || THEME_BACKGROUNDS[0];
  }, [selectedBgId]);

  const activeAccent = useMemo(() => {
    return ACCENT_COLORS.find(a => a.id === selectedAccentId) || ACCENT_COLORS[0];
  }, [selectedAccentId]);

  // Live countdown state
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute countdown breakdown
  const countdown = useMemo(() => {
    if (!licenseState.isActive) {
      return { isPermanent: false, isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0, percentRemaining: 0 };
    }
    if (licenseState.expiresAtTimestamp === null || licenseState.expiresAtTimestamp === undefined || licenseState.type === 'VIP PERMANENTE') {
      return { isPermanent: true, isExpired: false, days: 0, hours: 0, minutes: 0, seconds: 0, percentRemaining: 100 };
    }

    const diffMs = licenseState.expiresAtTimestamp - now;
    if (diffMs <= 0) {
      return { isPermanent: false, isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0, percentRemaining: 0 };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const totalDuration = licenseState.totalDurationSeconds || (7 * 86400);
    const percent = Math.min(100, Math.max(0, (totalSeconds / totalDuration) * 100));

    return {
      isPermanent: false,
      isExpired: false,
      days,
      hours,
      minutes,
      seconds,
      percentRemaining: percent
    };
  }, [licenseState, now]);

  // Device Telemetry
  const deviceInfo = useMemo(() => ({
    model: 'iPhone 16 Pro Max',
    iosVersion: '18.3.1',
    isCompatible: true,
    maxSupported: 'iOS 27 Beta 4',
    hwid: 'DEV-XIT9-8B92-F401-2026'
  }), []);

  // View state: 'files' | 'settings'
  const [currentView, setCurrentView] = useState<'files' | 'settings'>('files');

  // Current Directory path (default /var/mobile)
  const [currentPath, setCurrentPath] = useState<string>('/var/mobile');
  const [history, setHistory] = useState<string[]>([]);
  
  // File System State
  const [fileSystem, setFileSystem] = useState<{ [path: string]: FileItem }>(INITIAL_FILE_SYSTEM);
  const [searchFilter, setSearchFilter] = useState('');
  
  // File Viewer & Editor State
  const [activeFile, setActiveFile] = useState<{ path: string; item: FileItem } | null>(null);
  const [viewerMode, setViewerMode] = useState<'text' | 'hex' | 'edit'>('text');
  const [editedContent, setEditedContent] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Dialogs
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  const [showManualPathModal, setShowManualPathModal] = useState(false);
  const [manualPathInput, setManualPathInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper to format Key input
  const handleKeyInputChange = (val: string) => {
    const raw = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 16);
    const parts = raw.match(/.{1,4}/g) || [];
    setInputKey(parts.join('-'));
    if (keyError) setKeyError(null);
  };

  // Paste from clipboard
  const handlePasteKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length > 0) {
        handleKeyInputChange(text);
      } else {
        handleKeyInputChange('XIT9-8B92-F401-2026');
      }
    } catch {
      handleKeyInputChange('XIT9-8B92-F401-2026');
    }
    setJustPasted(true);
    setTimeout(() => setJustPasted(false), 1200);
  };

  // Trigger Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Activate Key Action
  const handleActivateKey = (customKey?: string) => {
    const rawKey = (customKey || inputKey).trim().toUpperCase();
    if (!rawKey) {
      setKeyError('Ingresa un código de llave para activar.');
      return;
    }

    const currentTime = Date.now();

    if (rawKey.includes('VIP') || rawKey === 'MASTER-KEY' || rawKey === 'XITFORGE-VIP') {
      setLicenseState({
        isActive: true,
        key: rawKey || 'VIP-9999-PERM-2026',
        type: 'VIP PERMANENTE',
        activatedAt: currentTime,
        expiresAtTimestamp: null,
        totalDurationSeconds: undefined
      });
      setKeyError(null);
      setIsUnlocked(true);
      showToast('⚡ Licencia VIP Permanente Activada');
      return;
    }

    if (rawKey.includes('TRIAL') || rawKey === 'TEST-KEY' || rawKey.includes('PRUEBA')) {
      const duration = 3 * 86400; // 3 days
      setLicenseState({
        isActive: true,
        key: rawKey || 'TRIAL-3DAYS-TEST-KEY',
        type: 'PRUEBA (TRIAL 3 DÍAS)',
        activatedAt: currentTime,
        expiresAtTimestamp: currentTime + (duration * 1000),
        totalDurationSeconds: duration
      });
      setKeyError(null);
      setIsUnlocked(true);
      showToast('⏱️ Licencia Trial (3 Días) Activada');
      return;
    }

    if (rawKey.length >= 8) {
      const duration = 7 * 86400; // 7 days
      setLicenseState({
        isActive: true,
        key: rawKey,
        type: 'PRO (7 DÍAS)',
        activatedAt: currentTime,
        expiresAtTimestamp: currentTime + (duration * 1000),
        totalDurationSeconds: duration
      });
      setKeyError(null);
      setIsUnlocked(true);
      showToast('💎 Licencia PRO (7 Días) Activada');
      return;
    }

    setKeyError('Código de llave inválido. Ingresa una Key válida.');
  };

  const handleLogoutKey = () => {
    setIsUnlocked(false);
    setLicenseState({
      isActive: false,
      key: '',
      type: 'SIN LICENCIA',
      expiresAtTimestamp: null
    });
    setInputKey('');
    setKeyError(null);
    setCurrentView('files');
  };

  // Get current directory items
  const currentDirectoryItems = useMemo(() => {
    const items: Array<{ name: string; fullPath: string; isDirectory: boolean; item?: FileItem }> = [];
    const prefix = currentPath === '/' ? '/' : `${currentPath}/`;
    
    const childPaths = Object.keys(fileSystem).filter(p => {
      if (p === currentPath) return false;
      if (!p.startsWith(prefix)) return false;
      const relative = p.slice(prefix.length);
      return !relative.includes('/');
    });

    for (const p of childPaths) {
      const name = p.slice(prefix.length);
      const item = fileSystem[p];
      items.push({
        name,
        fullPath: p,
        isDirectory: item ? item.isDir : false,
        item
      });
    }

    return items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [currentPath, fileSystem]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!searchFilter.trim()) return currentDirectoryItems;
    const q = searchFilter.toLowerCase();
    return currentDirectoryItems.filter(i => i.name.toLowerCase().includes(q));
  }, [currentDirectoryItems, searchFilter]);

  // Navigation
  const navigateTo = (newPath: string) => {
    setCurrentView('files');
    if (newPath === currentPath) return;
    setHistory(prev => [...prev, currentPath]);
    setCurrentPath(newPath);
    setSearchFilter('');
  };

  const goBack = () => {
    if (currentView === 'settings') {
      setCurrentView('files');
      return;
    }
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCurrentPath(prev);
    } else if (currentPath !== '/') {
      const parts = currentPath.split('/').filter(Boolean);
      parts.pop();
      setCurrentPath(parts.length === 0 ? '/' : `/${parts.join('/')}`);
    }
  };

  // Open file
  const handleOpenFile = (path: string, item: FileItem) => {
    setActiveFile({ path, item });
    setEditedContent(item.content || '');
    setViewerMode('text');
  };

  // Save file
  const handleSaveFile = () => {
    if (!activeFile) return;
    setFileSystem(prev => ({
      ...prev,
      [activeFile.path]: {
        ...activeFile.item,
        content: editedContent,
        size: editedContent.length,
        modifiedDate: 'Just now'
      }
    }));
    setActiveFile(prev => prev ? {
      ...prev,
      item: {
        ...prev.item,
        content: editedContent,
        size: editedContent.length,
        modifiedDate: 'Just now'
      }
    } : null);
    showToast('Archivo guardado correctamente');
    setViewerMode('text');
  };

  // Create item
  const handleCreate = () => {
    if (!newFileName.trim()) return;
    const cleanName = newFileName.trim().replace(/\//g, '');
    const newPath = currentPath === '/' ? `/${cleanName}` : `${currentPath}/${cleanName}`;
    
    setFileSystem(prev => ({
      ...prev,
      [newPath]: {
        name: cleanName,
        isDir: createType === 'folder',
        type: createType === 'file' ? 'text' : undefined,
        size: createType === 'folder' ? 0 : newFileContent.length,
        permissions: createType === 'folder' ? 'drwxr-xr-x' : '-rw-r--r--',
        modifiedDate: 'Just now',
        content: createType === 'file' ? newFileContent : undefined
      }
    }));

    showToast(createType === 'folder' ? 'Carpeta creada' : 'Archivo creado');
    setNewFileName('');
    setNewFileContent('');
    setShowCreateModal(false);
  };

  // Delete item
  const handleDelete = (pathToDelete: string) => {
    setFileSystem(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(k => {
        if (k === pathToDelete || k.startsWith(`${pathToDelete}/`)) {
          delete copy[k];
        }
      });
      return copy;
    });
    showToast('Elemento eliminado');
  };

  // Hex dump helper
  const generateHexDump = (content?: string) => {
    const text = content || '';
    const bytes: number[] = [];
    for (let i = 0; i < Math.min(text.length, 512); i++) {
      bytes.push(text.charCodeAt(i));
    }
    if (bytes.length === 0) {
      return '// (Archivo vacío o sin datos binarios)';
    }

    let out = `// Hex Dump (primeros ${bytes.length} bytes):\n\n`;
    for (let i = 0; i < bytes.length; i += 16) {
      const hexOffset = i.toString(16).padStart(8, '0');
      let hexBytes = '';
      let ascii = '';
      for (let j = 0; j < 16; j++) {
        if (i + j < bytes.length) {
          const b = bytes[i + j];
          hexBytes += b.toString(16).padStart(2, '0') + ' ';
          ascii += (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.';
        } else {
          hexBytes += '   ';
        }
        if (j === 7) hexBytes += ' ';
      }
      out += `${hexOffset}: ${hexBytes} |${ascii}|\n`;
    }
    return out;
  };

  const getFileIcon = (name: string, isDir: boolean) => {
    if (isDir) {
      return (
        <div style={{ color: activeAccent.hex }}>
          <Folder className="w-5 h-5 fill-current opacity-80" />
        </div>
      );
    }
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'plist') return <FileCode className="w-5 h-5 text-amber-400" />;
    if (ext === 'sqlite' || ext === 'db') return <Database className="w-5 h-5 text-purple-400" />;
    if (ext === 'dylib' || ext === 'bin' || ext === 'dat') return <Cpu className="w-5 h-5 text-emerald-400" />;
    if (['png', 'jpg', 'jpeg', 'car', 'svg'].includes(ext || '')) return <ImageIcon className="w-5 h-5 text-cyan-400" />;
    return <FileText className="w-5 h-5 text-zinc-400" />;
  };

  // =========================================================================
  // PANTALLA 1: PANTALLA DE ACTIVACIÓN DE KEY
  // =========================================================================
  if (!isUnlocked) {
    return (
      <div 
        className="min-h-screen text-zinc-100 flex flex-col justify-center items-center p-6 font-sans select-none antialiased relative overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: activeBg.bgHex }}
      >
        {/* Glow de Acento Ambiental */}
        {ambientGlowEnabled && (
          <div 
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[110px] pointer-events-none opacity-20 transition-all duration-700"
            style={{ backgroundColor: activeAccent.hex }}
          />
        )}

        <div className="w-full max-w-sm flex flex-col items-center relative z-10 animate-in fade-in duration-300">
          
          {/* Logo Estilizado XITFORGE */}
          <div className="relative mb-5">
            <div 
              className="p-4 rounded-3xl flex items-center justify-center border transition-all duration-500 shadow-2xl"
              style={{ 
                backgroundColor: `${activeBg.cardHex}`,
                borderColor: neonBordersEnabled ? `${activeAccent.hex}60` : activeBg.borderHex,
                boxShadow: neonBordersEnabled ? `0 0 35px ${activeAccent.hex}25` : 'none'
              }}
            >
              <Flame className="w-11 h-11 transition-colors duration-500" style={{ color: activeAccent.hex }} />
            </div>
          </div>

          {/* Nombre XITFORGE */}
          <div className="flex items-center gap-1 mb-0.5 tracking-widest">
            <span className="text-3xl font-black text-white">XIT</span>
            <span 
              className="text-3xl font-black transition-colors duration-500"
              style={{ color: activeAccent.hex }}
            >
              FORGE
            </span>
          </div>
          
          <p className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-8 font-semibold">
            UNRESTRICTED ENGINE
          </p>

          {/* Key Input Form */}
          <div className="w-full space-y-2 mb-3.5">
            <div 
              className="relative flex items-center rounded-2xl p-1.5 border transition-all shadow-inner"
              style={{ 
                backgroundColor: activeBg.cardHex,
                borderColor: neonBordersEnabled ? `${activeAccent.hex}50` : activeBg.borderHex
              }}
            >
              <input
                type="text"
                value={inputKey}
                onChange={(e) => handleKeyInputChange(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full bg-transparent text-sm font-mono placeholder-zinc-600 pl-3 pr-2 py-2 focus:outline-none uppercase tracking-widest font-bold"
                style={{ color: activeAccent.hex }}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleActivateKey()}
              />
              
              {/* Botón Icono de Pegar */}
              <button
                type="button"
                onClick={handlePasteKey}
                className="p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center flex-shrink-0 border"
                style={{
                  backgroundColor: justPasted ? activeAccent.hex : `${activeAccent.hex}18`,
                  borderColor: `${activeAccent.hex}50`,
                  color: justPasted ? '#000000' : activeAccent.hex
                }}
                title="Pegar Key"
              >
                {justPasted ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {keyError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{keyError}</span>
              </div>
            )}
          </div>

          {/* Botón Principal: ACTIVAR */}
          <button
            onClick={() => handleActivateKey()}
            className="w-full py-3.5 active:scale-[0.98] text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl transition-all mb-6 flex items-center justify-center gap-2 shadow-lg"
            style={{ 
              backgroundColor: activeAccent.hex,
              boxShadow: `0 0 25px ${activeAccent.hex}50`
            }}
          >
            <Key className="w-4 h-4" />
            <span>ACTIVAR</span>
          </button>

          {/* DETECCIÓN DE DISPOSITIVO & COMPATIBILIDAD */}
          <div 
            className="w-full rounded-2xl p-3.5 border shadow-md flex flex-col gap-2.5 animate-in fade-in"
            style={{ 
              backgroundColor: activeBg.cardHex,
              borderColor: activeBg.borderHex
            }}
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Smartphone className="w-4 h-4" style={{ color: activeAccent.hex }} />
                <span className="font-semibold text-zinc-100">{deviceInfo.model}</span>
              </div>
              <span className="px-2 py-0.5 bg-black/50 border border-zinc-800 rounded-lg text-zinc-400 text-[11px]">
                iOS {deviceInfo.iosVersion}
              </span>
            </div>

            <div 
              className="flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-mono font-bold border"
              style={{
                backgroundColor: `${activeAccent.hex}15`,
                borderColor: `${activeAccent.hex}35`,
                color: activeAccent.hex
              }}
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>COMPATIBLE</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-normal">
                Hasta {deviceInfo.maxSupported}
              </span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // PANTALLA 2: APLICACIÓN XITFORGE (DESBLOQUEADA CON SELECTOR DE APARIENCIA)
  // =========================================================================
  return (
    <div 
      className="min-h-screen text-zinc-100 flex flex-col font-sans select-none antialiased animate-in fade-in duration-300 relative transition-colors duration-500"
      style={{ backgroundColor: activeBg.bgHex }}
    >
      {/* Resplandor Ambiental de Fondo */}
      {ambientGlowEnabled && (
        <div 
          className="fixed top-0 right-0 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-15 transition-all duration-700"
          style={{ backgroundColor: activeAccent.hex }}
        />
      )}

      {/* Grid Pattern Hacker opcional */}
      {gridPatternEnabled && (
        <div 
          className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" 
        />
      )}
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div 
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 text-black font-bold text-xs rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2"
          style={{ backgroundColor: activeAccent.hex }}
        >
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP NAVIGATION BAR */}
      <header 
        className="sticky top-0 z-30 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b transition-colors duration-500"
        style={{ 
          backgroundColor: `${activeBg.headerHex}ee`,
          borderColor: neonBordersEnabled ? `${activeAccent.hex}25` : activeBg.borderHex 
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {currentView === 'settings' ? (
            <button 
              onClick={() => setCurrentView('files')}
              className="p-1.5 -ml-1 active:scale-95 transition-transform flex items-center gap-1 text-sm font-medium"
              style={{ color: activeAccent.hex }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          ) : currentPath !== '/' ? (
            <button 
              onClick={goBack}
              className="p-1.5 -ml-1 active:scale-95 transition-transform flex items-center gap-1 text-sm font-medium"
              style={{ color: activeAccent.hex }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div 
                className="p-1.5 rounded-xl border"
                style={{ 
                  backgroundColor: `${activeAccent.hex}15`,
                  borderColor: `${activeAccent.hex}35`
                }}
              >
                <Flame className="w-4 h-4" style={{ color: activeAccent.hex }} />
              </div>
              <div className="flex items-center gap-0.5">
                <span className="font-bold text-sm text-white tracking-wider">XIT</span>
                <span className="font-bold text-sm tracking-wider font-extrabold" style={{ color: activeAccent.hex }}>
                  FORGE
                </span>
              </div>
            </div>
          )}

          {currentView === 'files' && (
            <div className="flex flex-col ml-1">
              <h1 className="font-semibold text-xs text-zinc-100 truncate flex items-center gap-1.5">
                <span>{currentPath === '/' ? '/' : currentPath.split('/').pop()}</span>
              </h1>
              <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[140px] sm:max-w-xs">
                {currentPath}
              </span>
            </div>
          )}
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2">
          {currentView === 'files' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-xl transition-colors active:scale-95 border"
              style={{ 
                backgroundColor: activeBg.cardHex,
                borderColor: activeBg.borderHex,
                color: activeAccent.hex
              }}
              title="Crear elemento"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Quick Jump to Path */}
          <button
            onClick={() => {
              setManualPathInput(currentPath);
              setShowManualPathModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all active:scale-95 border text-zinc-200"
            style={{ 
              backgroundColor: activeBg.cardHex,
              borderColor: activeBg.borderHex
            }}
            title="Ir a ruta"
          >
            <CornerDownRight className="w-3.5 h-3.5" style={{ color: activeAccent.hex }} />
            <span>Ruta</span>
          </button>

          {/* License Badge */}
          <div 
            onClick={() => setCurrentView('settings')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold cursor-pointer active:scale-95 transition-all border"
            style={{ 
              backgroundColor: `${activeAccent.hex}15`,
              borderColor: `${activeAccent.hex}40`,
              color: activeAccent.hex
            }}
            title="Ver tiempo de licencia en Ajustes"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{licenseState.type === 'VIP PERMANENTE' ? 'VIP' : 'PRO'}</span>
          </div>
        </div>
      </header>

      {/* 2. SEARCH BAR (Only visible on Files view) */}
      {currentView === 'files' && (
        <div 
          className="px-4 py-2 border-b transition-colors duration-500"
          style={{ 
            backgroundColor: `${activeBg.bgHex}dd`,
            borderColor: activeBg.borderHex
          }}
        >
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar o filtrar archivos..."
              className="w-full text-xs text-zinc-100 placeholder-zinc-500 pl-9 pr-8 py-2 rounded-xl border focus:outline-none transition-colors font-mono"
              style={{ 
                backgroundColor: activeBg.cardHex,
                borderColor: activeBg.borderHex
              }}
            />
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 overflow-y-auto pb-24">
        
        {/* VISTA A: NAVEGADOR DE ARCHIVOS DIRECTO */}
        {currentView === 'files' && (
          <div className="divide-y" style={{ borderColor: activeBg.borderHex }}>
            {currentPath !== '/' && (
              <div 
                onClick={goBack}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-lg bg-zinc-800/80 text-zinc-400">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-300">..</div>
                    <div className="text-[11px] text-zinc-500">Subir al directorio anterior</div>
                  </div>
                </div>
              </div>
            )}

            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <Folder className="w-12 h-12 text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-400 font-medium">Esta carpeta está vacía</p>
                <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                  Usa el botón <Plus className="inline w-3.5 h-3.5" style={{ color: activeAccent.hex }} /> superior para crear archivos o carpetas.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.fullPath}
                  onClick={() => {
                    if (item.isDirectory) {
                      navigateTo(item.fullPath);
                    } else if (item.item) {
                      handleOpenFile(item.fullPath, item.item);
                    }
                  }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="flex-shrink-0">
                      {getFileIcon(item.name, item.isDirectory)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-100 truncate transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
                        <span>{item.isDirectory ? 'Carpeta' : formatFileSize(item.item?.size || 0)}</span>
                        {item.item?.modifiedDate && (
                          <>
                            <span>•</span>
                            <span>{item.item.modifiedDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.fullPath);
                      }}
                      className="p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {item.isDirectory && (
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA B: AJUSTES (LICENCIA EN TIEMPO REAL + PERSONALIZACIÓN DE FONDOS Y COLORES) */}
        {/* ========================================================================= */}
        {currentView === 'settings' && (
          <div className="p-4 space-y-6 max-w-lg mx-auto animate-in fade-in">
            
            {/* Header de Ajustes */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <Settings className="w-5 h-5" style={{ color: activeAccent.hex }} />
                  <span>Ajustes del Sistema</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Licencia activa y personalización de temas y colores
                </p>
              </div>
              <span 
                className="px-2.5 py-1 rounded-xl font-mono text-[11px] border"
                style={{ 
                  backgroundColor: activeBg.cardHex,
                  borderColor: activeBg.borderHex,
                  color: activeAccent.hex
                }}
              >
                v2.0
              </span>
            </div>

            {/* ===================================================================== */}
            {/* SECCIÓN 1: ESTADO DE LICENCIA & CUENTA REGRESIVA EN VIVO */}
            {/* ===================================================================== */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider font-mono px-1 flex items-center justify-between" style={{ color: activeAccent.hex }}>
                <div className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Licencia & Vigencia</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: activeAccent.hex }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeAccent.hex }} />
                  <span>EN LÍNEA</span>
                </div>
              </div>

              {/* CARD DE LICENCIA DE ALTO IMPACTO */}
              <div 
                className="rounded-3xl p-4 border transition-all duration-500 relative overflow-hidden"
                style={{ 
                  backgroundColor: activeBg.cardHex,
                  borderColor: neonBordersEnabled ? `${activeAccent.hex}50` : activeBg.borderHex,
                  boxShadow: neonBordersEnabled ? `0 0 30px ${activeAccent.hex}15` : 'none'
                }}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="p-2.5 rounded-2xl border shadow-inner"
                      style={{ 
                        backgroundColor: `${activeAccent.hex}20`,
                        borderColor: `${activeAccent.hex}40`,
                        color: activeAccent.hex
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white tracking-wide">
                        {licenseState.type}
                      </div>
                      <div className="text-[11px] font-mono flex items-center gap-1" style={{ color: `${activeAccent.hex}cc` }}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Acceso Ilimitado Autorizado</span>
                      </div>
                    </div>
                  </div>

                  <span 
                    className="px-3 py-1 text-[10px] font-extrabold rounded-full font-mono tracking-wider shadow-sm border"
                    style={{ 
                      backgroundColor: `${activeAccent.hex}20`,
                      borderColor: `${activeAccent.hex}40`,
                      color: activeAccent.hex
                    }}
                  >
                    ACTIVA
                  </span>
                </div>

                {/* RELOJ DIGITAL DE CUENTA REGRESIVA EN TIEMPO REAL */}
                <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 mb-3.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5" style={{ color: activeAccent.hex }} />
                      <span className="font-semibold text-zinc-300">TIEMPO RESTANTE</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {countdown.isPermanent ? 'VIGENCIA ILIMITADA' : 'CUENTA REGRESIVA EN VIVO'}
                    </span>
                  </div>

                  {countdown.isPermanent ? (
                    /* Tarjeta VIP Permanente */
                    <div 
                      className="py-2.5 px-3 rounded-xl flex items-center justify-between border"
                      style={{ 
                        backgroundColor: `${activeAccent.hex}15`,
                        borderColor: `${activeAccent.hex}30`
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${activeAccent.hex}25`, color: activeAccent.hex }}>
                          <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white font-mono">ACCESO PERMANENTE</div>
                          <div className="text-[11px] font-mono" style={{ color: activeAccent.hex }}>Sin fecha de vencimiento (Vitalicia)</div>
                        </div>
                      </div>
                      <span className="text-xl font-bold font-mono" style={{ color: activeAccent.hex }}>♾️</span>
                    </div>
                  ) : countdown.isExpired ? (
                    /* Tarjeta Expirada */
                    <div className="py-2 px-3 bg-red-950/30 border border-red-500/40 rounded-xl text-center font-mono">
                      <div className="text-xs font-bold text-red-400">⚠️ LICENCIA EXPIRADA</div>
                      <div className="text-[10px] text-zinc-400">Ingresa una nueva clave para renovar el acceso.</div>
                    </div>
                  ) : (
                    /* CONTADOR DIGITAL EN TIEMPO REAL (DÍAS, HORAS, MINUTOS, SEGUNDOS) */
                    <div>
                      <div className="grid grid-cols-4 gap-2 text-center my-1.5 font-mono">
                        {/* DÍAS */}
                        <div 
                          className="rounded-xl p-2 flex flex-col items-center border"
                          style={{ backgroundColor: activeBg.headerHex, borderColor: `${activeAccent.hex}30` }}
                        >
                          <span className="text-lg sm:text-xl font-black tracking-wider" style={{ color: activeAccent.hex }}>
                            {String(countdown.days).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5">Días</span>
                        </div>

                        {/* HORAS */}
                        <div 
                          className="rounded-xl p-2 flex flex-col items-center border"
                          style={{ backgroundColor: activeBg.headerHex, borderColor: `${activeAccent.hex}30` }}
                        >
                          <span className="text-lg sm:text-xl font-black tracking-wider" style={{ color: activeAccent.hex }}>
                            {String(countdown.hours).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5">Horas</span>
                        </div>

                        {/* MINUTOS */}
                        <div 
                          className="rounded-xl p-2 flex flex-col items-center border"
                          style={{ backgroundColor: activeBg.headerHex, borderColor: `${activeAccent.hex}30` }}
                        >
                          <span className="text-lg sm:text-xl font-black tracking-wider" style={{ color: activeAccent.hex }}>
                            {String(countdown.minutes).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5">Min</span>
                        </div>

                        {/* SEGUNDOS (ANIMADOS) */}
                        <div 
                          className="rounded-xl p-2 flex flex-col items-center relative overflow-hidden border"
                          style={{ backgroundColor: activeBg.headerHex, borderColor: `${activeAccent.hex}60` }}
                        >
                          <span className="text-lg sm:text-xl font-black tracking-wider animate-pulse" style={{ color: activeAccent.hex }}>
                            {String(countdown.seconds).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] font-bold uppercase mt-0.5" style={{ color: activeAccent.hex }}>Seg</span>
                        </div>
                      </div>

                      {/* Barra de progreso de tiempo restante */}
                      <div className="mt-2.5 space-y-1">
                        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="h-1.5 rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${countdown.percentRemaining}%`,
                              backgroundColor: activeAccent.hex 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                          <span>Progreso de validez</span>
                          <span className="font-bold" style={{ color: activeAccent.hex }}>
                            {countdown.percentRemaining.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detalles de Clave y HWID con botones de copia */}
                <div className="space-y-2 text-xs font-mono bg-black/60 p-3 rounded-2xl border border-white/10 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Llave:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-wider" style={{ color: activeAccent.hex }}>
                        {licenseState.key || 'XIT9-8B92-F401-2026'}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(licenseState.key || 'XIT9-8B92-F401-2026');
                          setCopiedKey(true);
                          setTimeout(() => setCopiedKey(false), 2000);
                        }}
                        className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
                        title="Copiar Key"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5" style={{ color: activeAccent.hex }} /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>HWID:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-300 text-[11px] truncate max-w-[150px]">
                        {deviceInfo.hwid}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(deviceInfo.hwid);
                          setCopiedHwid(true);
                          setTimeout(() => setCopiedHwid(false), 2000);
                        }}
                        className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
                        title="Copiar HWID"
                      >
                        {copiedHwid ? <Check className="w-3.5 h-3.5" style={{ color: activeAccent.hex }} /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Acciones de Licencia */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleLogoutKey}
                    className="py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] border font-bold text-xs"
                    style={{ 
                      backgroundColor: `${activeAccent.hex}15`,
                      borderColor: `${activeAccent.hex}40`,
                      color: activeAccent.hex 
                    }}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Cambiar Key</span>
                  </button>

                  <button
                    onClick={handleLogoutKey}
                    className="py-2.5 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>

              </div>
            </div>

            {/* ===================================================================== */}
            {/* SECCIÓN 2: PERSONALIZACIÓN & APARIENCIA (FONDOS, COLORES Y ESTILO) */}
            {/* ===================================================================== */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider font-mono px-1 flex items-center gap-1.5 text-zinc-300">
                <Palette className="w-4 h-4" style={{ color: activeAccent.hex }} />
                <span>Personalización & Apariencia</span>
              </div>

              {/* 1. SELECCIÓN DE FONDOS (THEME BACKGROUNDS) */}
              <div 
                className="rounded-3xl p-4 border transition-colors duration-500 space-y-3"
                style={{ 
                  backgroundColor: activeBg.cardHex,
                  borderColor: activeBg.borderHex 
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" style={{ color: activeAccent.hex }} />
                    <span className="text-xs font-bold text-zinc-100">Fondo de Pantalla</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {activeBg.name}
                  </span>
                </div>

                {/* Grid de Fondos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {THEME_BACKGROUNDS.map((bg) => {
                    const isSelected = bg.id === selectedBgId;
                    return (
                      <button
                        key={bg.id}
                        onClick={() => {
                          setSelectedBgId(bg.id);
                          showToast(`Fondo "${bg.name}" aplicado`);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden active:scale-95 flex flex-col justify-between h-20 ${
                          isSelected ? 'ring-2' : 'hover:border-zinc-700'
                        }`}
                        style={{
                          backgroundColor: bg.cardHex,
                          borderColor: isSelected ? activeAccent.hex : bg.borderHex,
                          boxShadow: isSelected ? `0 0 20px ${activeAccent.hex}25` : 'none'
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: bg.bgHex }}
                          />
                          {isSelected && (
                            <div 
                              className="w-4 h-4 rounded-full flex items-center justify-center text-black"
                              style={{ backgroundColor: activeAccent.hex }}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-100 truncate">{bg.name}</div>
                          <div className="text-[9px] text-zinc-500 font-mono truncate">{bg.bgHex}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. SELECCIÓN DE COLOR DE ACENTO (ACCENT COLORS) */}
              <div 
                className="rounded-3xl p-4 border transition-colors duration-500 space-y-3"
                style={{ 
                  backgroundColor: activeBg.cardHex,
                  borderColor: activeBg.borderHex 
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: activeAccent.hex }} />
                    <span className="text-xs font-bold text-zinc-100">Color de Acento & Botones</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold" style={{ color: activeAccent.hex }}>
                    {activeAccent.name}
                  </span>
                </div>

                {/* Círculos de Colores de Acento */}
                <div className="grid grid-cols-6 gap-2 pt-1">
                  {ACCENT_COLORS.map((accent) => {
                    const isSelected = accent.id === selectedAccentId;
                    return (
                      <button
                        key={accent.id}
                        onClick={() => {
                          setSelectedAccentId(accent.id);
                          showToast(`Color "${accent.name}" aplicado`);
                        }}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all relative active:scale-90 border ${
                          isSelected ? 'scale-110 shadow-lg' : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: `${accent.hex}25`,
                          borderColor: isSelected ? accent.hex : `${accent.hex}40`,
                          boxShadow: isSelected ? `0 0 15px ${accent.hex}60` : 'none'
                        }}
                        title={accent.name}
                      >
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-black shadow-md transition-transform"
                          style={{ backgroundColor: accent.hex }}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. EFECTOS VISUALES & ESTILOS */}
              <div 
                className="rounded-3xl p-4 border transition-colors duration-500 space-y-3"
                style={{ 
                  backgroundColor: activeBg.cardHex,
                  borderColor: activeBg.borderHex 
                }}
              >
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4" style={{ color: activeAccent.hex }} />
                  <span>Efectos Visuales & Neón</span>
                </div>

                {/* Switch Resplandor Ambiental */}
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Resplandor Ambiental (Glow)</div>
                    <div className="text-[10px] text-zinc-500">Halos de luz difusa según el color elegido</div>
                  </div>
                  <button
                    onClick={() => setAmbientGlowEnabled(!ambientGlowEnabled)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                      ambientGlowEnabled ? 'justify-end' : 'justify-start bg-zinc-800'
                    }`}
                    style={{ backgroundColor: ambientGlowEnabled ? activeAccent.hex : undefined }}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Switch Bordes de Neón */}
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Bordes Neón Brillantes</div>
                    <div className="text-[10px] text-zinc-500">Contornos reactivos al color seleccionado</div>
                  </div>
                  <button
                    onClick={() => setNeonBordersEnabled(!neonBordersEnabled)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                      neonBordersEnabled ? 'justify-end' : 'justify-start bg-zinc-800'
                    }`}
                    style={{ backgroundColor: neonBordersEnabled ? activeAccent.hex : undefined }}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Switch Textura Grid Hacker */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Textura de Cuadrícula (Grid)</div>
                    <div className="text-[10px] text-zinc-500">Patrón sutil estilo interfaz de terminal</div>
                  </div>
                  <button
                    onClick={() => setGridPatternEnabled(!gridPatternEnabled)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                      gridPatternEnabled ? 'justify-end' : 'justify-start bg-zinc-800'
                    }`}
                    style={{ backgroundColor: gridPatternEnabled ? activeAccent.hex : undefined }}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* 4. BOTTOM TOOLBAR */}
      <footer 
        className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md px-8 py-2.5 flex items-center justify-around border-t transition-colors duration-500"
        style={{ 
          backgroundColor: `${activeBg.headerHex}f0`,
          borderColor: neonBordersEnabled ? `${activeAccent.hex}25` : activeBg.borderHex 
        }}
      >
        {/* 1. Ir a Ruta */}
        <button
          onClick={() => {
            setCurrentView('files');
            setManualPathInput(currentPath);
            setShowManualPathModal(true);
          }}
          className={`flex items-center gap-2 py-2 px-5 text-xs font-semibold rounded-xl transition-all active:scale-95 ${
            currentView === 'files'
              ? 'border'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          style={{
            backgroundColor: currentView === 'files' ? `${activeAccent.hex}15` : 'transparent',
            borderColor: currentView === 'files' ? `${activeAccent.hex}40` : 'transparent',
            color: currentView === 'files' ? activeAccent.hex : undefined
          }}
        >
          <CornerDownRight className="w-4 h-4" />
          <span>Ir a ruta</span>
        </button>

        {/* 2. Ajustes */}
        <button
          onClick={() => setCurrentView(currentView === 'settings' ? 'files' : 'settings')}
          className={`flex items-center gap-2 py-2 px-5 text-xs font-semibold rounded-xl transition-all active:scale-95 ${
            currentView === 'settings' 
              ? 'border' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          style={{
            backgroundColor: currentView === 'settings' ? `${activeAccent.hex}15` : 'transparent',
            borderColor: currentView === 'settings' ? `${activeAccent.hex}40` : 'transparent',
            color: currentView === 'settings' ? activeAccent.hex : undefined
          }}
        >
          <Settings className="w-4 h-4" />
          <span>Ajustes</span>
        </button>
      </footer>

      {/* 5. IR A RUTA MODAL */}
      {showManualPathModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="rounded-3xl w-full max-w-sm p-4 animate-in fade-in scale-95 shadow-2xl border"
            style={{ 
              backgroundColor: activeBg.cardHex,
              borderColor: neonBordersEnabled ? `${activeAccent.hex}60` : activeBg.borderHex 
            }}
          >
            <h3 className="font-bold text-zinc-100 text-sm mb-1 flex items-center gap-2">
              <CornerDownRight className="w-4 h-4" style={{ color: activeAccent.hex }} />
              <span>Ir a la ruta</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-3">Escribe cualquier ruta del sistema de archivos de iOS:</p>
            <input
              type="text"
              value={manualPathInput}
              onChange={(e) => setManualPathInput(e.target.value)}
              placeholder="/var/mobile/..."
              className="w-full bg-black text-xs font-mono px-3.5 py-2.5 rounded-xl border mb-4 focus:outline-none"
              style={{ 
                borderColor: activeBg.borderHex,
                color: activeAccent.hex
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualPathInput.trim()) {
                  navigateTo(manualPathInput.trim());
                  setShowManualPathModal(false);
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowManualPathModal(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (manualPathInput.trim()) {
                    navigateTo(manualPathInput.trim());
                    setShowManualPathModal(false);
                  }
                }}
                className="px-4 py-2 text-black font-bold text-xs rounded-xl active:scale-95 transition-transform shadow-md"
                style={{ backgroundColor: activeAccent.hex }}
              >
                Ir a la ruta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. NUEVO ELEMENTO MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="rounded-3xl w-full max-w-sm p-4 animate-in fade-in scale-95 shadow-2xl border"
            style={{ 
              backgroundColor: activeBg.cardHex,
              borderColor: neonBordersEnabled ? `${activeAccent.hex}60` : activeBg.borderHex 
            }}
          >
            <h3 className="font-bold text-zinc-100 text-sm mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4" style={{ color: activeAccent.hex }} />
              <span>Nuevo Elemento</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-3 font-mono truncate">En: {currentPath}</p>

            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setCreateType('file')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  createType === 'file' 
                    ? 'text-white' 
                    : 'bg-black/40 text-zinc-400 border-zinc-800'
                }`}
                style={{
                  backgroundColor: createType === 'file' ? `${activeAccent.hex}25` : undefined,
                  borderColor: createType === 'file' ? activeAccent.hex : undefined
                }}
              >
                📄 Archivo
              </button>
              <button
                type="button"
                onClick={() => setCreateType('folder')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  createType === 'folder' 
                    ? 'text-white' 
                    : 'bg-black/40 text-zinc-400 border-zinc-800'
                }`}
                style={{
                  backgroundColor: createType === 'folder' ? `${activeAccent.hex}25` : undefined,
                  borderColor: createType === 'folder' ? activeAccent.hex : undefined
                }}
              >
                📁 Carpeta
              </button>
            </div>

            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder={createType === 'file' ? 'nombre.txt' : 'NuevaCarpeta'}
              className="w-full bg-black text-xs text-zinc-100 font-mono px-3.5 py-2.5 rounded-xl border focus:outline-none mb-3"
              style={{ borderColor: activeBg.borderHex }}
              autoFocus
            />

            {createType === 'file' && (
              <textarea
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                placeholder="Contenido inicial del archivo..."
                rows={3}
                className="w-full bg-black text-xs text-zinc-300 font-mono p-3 rounded-xl border focus:outline-none mb-4 resize-none"
                style={{ borderColor: activeBg.borderHex }}
              />
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setNewFileName('');
                  setNewFileContent('');
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!newFileName.trim()}
                className="px-4 py-2 disabled:opacity-50 text-black font-bold text-xs rounded-xl active:scale-95 transition-transform shadow-md"
                style={{ backgroundColor: activeAccent.hex }}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. FILE VIEWER & HEX DUMP */}
      {activeFile && (
        <div 
          className="fixed inset-0 z-50 flex flex-col animate-in fade-in transition-colors duration-500"
          style={{ backgroundColor: activeBg.bgHex }}
        >
          <div 
            className="border-b px-4 py-3 flex items-center justify-between"
            style={{ 
              backgroundColor: activeBg.headerHex,
              borderColor: activeBg.borderHex 
            }}
          >
            <button
              onClick={() => setActiveFile(null)}
              className="p-1 flex items-center gap-1 text-sm font-medium"
              style={{ color: activeAccent.hex }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cerrar</span>
            </button>

            <div className="flex bg-black/60 p-0.5 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setViewerMode('text')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  viewerMode === 'text' ? 'text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={{ backgroundColor: viewerMode === 'text' ? activeAccent.hex : 'transparent' }}
              >
                Texto
              </button>
              <button
                onClick={() => setViewerMode('hex')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  viewerMode === 'hex' ? 'text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={{ backgroundColor: viewerMode === 'hex' ? activeAccent.hex : 'transparent' }}
              >
                Hex Dump
              </button>
              <button
                onClick={() => setViewerMode('edit')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  viewerMode === 'edit' ? 'text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={{ backgroundColor: viewerMode === 'edit' ? activeAccent.hex : 'transparent' }}
              >
                Editar
              </button>
            </div>

            <div className="flex items-center gap-2">
              {viewerMode === 'edit' ? (
                <button
                  onClick={handleSaveFile}
                  className="flex items-center gap-1 px-3 py-1 text-black font-bold text-xs rounded-xl active:scale-95 transition-transform shadow-md"
                  style={{ backgroundColor: activeAccent.hex }}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeFile.item.content || '');
                    setCopiedNotification(true);
                    setTimeout(() => setCopiedNotification(false), 2000);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-xl hover:bg-white/10"
                  title="Copiar contenido"
                >
                  {copiedNotification ? <Check className="w-4 h-4" style={{ color: activeAccent.hex }} /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          <div className="px-4 py-2 bg-black/60 border-b border-white/5 text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span className="truncate max-w-xs sm:max-w-md">{activeFile.path}</span>
            <span>{formatFileSize(activeFile.item.size || 0)}</span>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-black font-mono text-xs">
            {viewerMode === 'text' && (
              <pre className="whitespace-pre-wrap leading-relaxed" style={{ color: activeAccent.hex }}>
                {activeFile.item.content || '(Archivo vacío)'}
              </pre>
            )}

            {viewerMode === 'hex' && (
              <pre className="text-zinc-300 whitespace-pre font-mono leading-relaxed">
                {generateHexDump(activeFile.item.content)}
              </pre>
            )}

            {viewerMode === 'edit' && (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-full bg-transparent font-mono text-xs p-2 focus:outline-none resize-none leading-relaxed"
                style={{ color: activeAccent.hex }}
                autoFocus
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
