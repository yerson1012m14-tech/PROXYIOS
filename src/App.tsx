import React, { useState, useMemo, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  HardDrive, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  ChevronRight, 
  Binary, 
  Code2, 
  Check, 
  X, 
  Upload, 
  Sparkles,
  Smartphone,
  Music,
  Camera,
  Video,
  Lock,
  Globe,
  Settings,
  Terminal,
  FileCode,
  Shield,
  Layers,
  Sliders,
  Power,
  Zap,
  Activity,
  AlertTriangle,
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { INITIAL_APPS, INITIAL_FILE_SYSTEM, formatFileSize } from './mockFileSystem';
import { FileItem, AppMetadata } from './types';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'appList' | 'browser' | 'viewer'>('appList');
  const [history, setHistory] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  
  // Data State
  const [apps, setApps] = useState<AppMetadata[]>(INITIAL_APPS);
  const [fileSystem, setFileSystem] = useState<{ [path: string]: FileItem }>(INITIAL_FILE_SYSTEM);
  
  // Search & Filter
  const [manualBundleId, setManualBundleId] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  
  // File Viewer State
  const [activeFile, setActiveFile] = useState<{ path: string; item: FileItem } | null>(null);
  const [viewerMode, setViewerMode] = useState<'text' | 'hex' | 'plist' | 'edit'>('text');
  const [editedContent, setEditedContent] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dialog State for creating files/folders
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  // -------------------------------------------------------------
  // MOTOR MCMFILZA (asegurarMotor / TweakInit / MCMFilzaStart)
  // -------------------------------------------------------------
  const [motorEncendido, setMotorEncendido] = useState<boolean>(true);
  const [motorIniciando, setMotorIniciando] = useState<boolean>(false);
  const [mostrarLogsMotor, setMostrarLogsMotor] = useState<boolean>(false);
  const [alertaMotorApagado, setAlertaMotorApagado] = useState<boolean>(false);
  const [motorLogs, setMotorLogs] = useState<string[]>([
    '[asegurarMotor] Inicializado: dlsym(RTLD_DEFAULT, "TweakInit") -> OK',
    '[asegurarMotor] MCMFilzaStart() -> 0',
    '[asegurarMotor] MCMFilzaSetUnrestrictedFilesystem(1) -> Sandbox Desactivado',
    '[Sistema] Motor MCMFilza en estado listo.'
  ]);

  // Función para encender / apagar el motor
  const encenderMotor = () => {
    if (motorIniciando) return;
    setMotorIniciando(true);
    setAlertaMotorApagado(false);

    const nuevosLogs = [
      `[${new Date().toLocaleTimeString()}] Ejecutando asegurarMotor()...`,
      `[${new Date().toLocaleTimeString()}] dlsym(RTLD_DEFAULT, "TweakInit") -> OK (0x104a8210)`,
      `[${new Date().toLocaleTimeString()}] tweakInit() invocado -> Inyectando bypass de sandbox`,
      `[${new Date().toLocaleTimeString()}] MCMFilzaStart() -> Motor iniciado en puerto IPC interno`,
      `[${new Date().toLocaleTimeString()}] MCMFilzaSetUnrestrictedFilesystem(1) -> Acceso irrestricto concedido`,
      `[${new Date().toLocaleTimeString()}] ✅ ¡MOTOR ENCENDIDO! Acceso a todos los contenedores y raíz habilitado.`
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < nuevosLogs.length) {
        const logLine = nuevosLogs[step];
        setMotorLogs(prev => [...prev, logLine]);
        step++;
      } else {
        clearInterval(interval);
        setMotorIniciando(false);
        setMotorEncendido(true);
      }
    }, 200);
  };

  const apagarMotor = () => {
    setMotorEncendido(false);
    setMotorLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ⚠️ Motor MCMFilza APAGADO. Sandbox estándar de iOS restaurado.`
    ]);
  };

  const toggleMotor = () => {
    if (motorEncendido) {
      apagarMotor();
    } else {
      encenderMotor();
    }
  };

  // Helper to resolve directory object for a path
  const getDirectoryAt = (path: string): FileItem | null => {
    if (fileSystem[path]) return fileSystem[path];

    // Check root path traversal
    if (path.startsWith('/')) {
      const parts = path.split('/').filter(Boolean);
      let current: FileItem | undefined = fileSystem['/'];
      for (const part of parts) {
        if (!current || !current.children || !current.children[part]) {
          return null;
        }
        current = current.children[part];
      }
      return current || null;
    }
    return null;
  };

  // Open Container for a Bundle ID
  const handleOpenContainer = (bundleId: string) => {
    const trimmed = bundleId.trim();
    if (!trimmed) return;

    if (!motorEncendido) {
      setAlertaMotorApagado(true);
      return;
    }

    let app = apps.find(a => a.bundleId.toLowerCase() === trimmed.toLowerCase());
    
    if (!app) {
      // Provision dynamic container for unlisted bundle ID
      const newUuid = `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-4C5A-85C1-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
      const newPath = `/var/mobile/Containers/Data/Application/${newUuid}`;
      
      const newApp: AppMetadata = {
        bundleId: trimmed,
        name: trimmed.split('.').pop() || trimmed,
        version: '1.0',
        developer: 'Installed Application',
        iconType: 'tool',
        containerPath: newPath,
        installedSize: '4.2 MB'
      };

      // Add to simulated file system
      setFileSystem(prev => ({
        ...prev,
        [newPath]: {
          name: newUuid,
          isDir: true,
          modifiedDate: '2026-08-19 02:00',
          permissions: 'drwxr-xr-x',
          children: {
            'Documents': {
              name: 'Documents',
              isDir: true,
              modifiedDate: '2026-08-19 02:00',
              permissions: 'drwxr-xr-x',
              children: {
                'data.json': {
                  name: 'data.json',
                  isDir: false,
                  size: 256,
                  type: 'json',
                  modifiedDate: '2026-08-19 02:00',
                  permissions: '-rw-r--r--',
                  content: JSON.stringify({ bundleId: trimmed, initialized: true, timestamp: Date.now() }, null, 2)
                }
              }
            },
            'Library': {
              name: 'Library',
              isDir: true,
              modifiedDate: '2026-08-19 02:00',
              permissions: 'drwxr-xr-x',
              children: {
                'Preferences': {
                  name: 'Preferences',
                  isDir: true,
                  modifiedDate: '2026-08-19 02:00',
                  permissions: 'drwxr-xr-x',
                  children: {
                    [`${trimmed}.plist`]: {
                      name: `${trimmed}.plist`,
                      isDir: false,
                      size: 512,
                      type: 'plist',
                      modifiedDate: '2026-08-19 02:00',
                      permissions: '-rw-r--r--',
                      content: `<?xml version="1.0" encoding="UTF-8"?>\n<plist version="1.0">\n<dict>\n  <key>CFBundleIdentifier</key>\n  <string>${trimmed}</string>\n  <key>FirstRunCompleted</key>\n  <true/>\n</dict>\n</plist>`
                    }
                  }
                },
                'Caches': {
                  name: 'Caches',
                  isDir: true,
                  modifiedDate: '2026-08-19 02:00',
                  permissions: 'drwxr-xr-x',
                  children: {}
                }
              }
            },
            'tmp': {
              name: 'tmp',
              isDir: true,
              modifiedDate: '2026-08-19 02:00',
              permissions: 'drwxrwxrwx',
              children: {}
            }
          }
        }
      }));

      setApps(prev => [newApp, ...prev]);
      app = newApp;
    }

    setManualBundleId('');
    setCurrentPath(app.containerPath);
    setHistory([app.containerPath]);
    setCurrentView('browser');
  };

  // Navigate deeper into directory
  const handleNavigateTo = (folderName: string) => {
    if (!motorEncendido) {
      setAlertaMotorApagado(true);
      return;
    }
    const nextPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    setHistory(prev => [...prev, nextPath]);
    setCurrentPath(nextPath);
  };

  // Navigate back
  const handleGoBack = () => {
    if (currentView === 'viewer') {
      setCurrentView('browser');
      setActiveFile(null);
      return;
    }

    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevPath = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentPath(prevPath);
    } else {
      setCurrentView('appList');
      setHistory([]);
      setCurrentPath('');
    }
  };

  // Open file in viewer
  const handleOpenFile = (file: FileItem, path: string) => {
    if (!motorEncendido) {
      setAlertaMotorApagado(true);
      return;
    }
    setActiveFile({ path, item: file });
    setEditedContent(file.content || '');
    if (file.name.endsWith('.plist') || file.type === 'plist') {
      setViewerMode('plist');
    } else if (file.type === 'binary' || file.name.endsWith('.dat') || file.name.endsWith('.car')) {
      setViewerMode('hex');
    } else {
      setViewerMode('text');
    }
    setCurrentView('viewer');
  };

  // Save edited file
  const handleSaveFile = () => {
    if (!activeFile) return;

    // Mutate fileSystem in state
    setFileSystem(prev => {
      const updated = { ...prev };
      const path = activeFile.path;
      
      // Update top level container
      if (updated[path]) {
        updated[path] = {
          ...updated[path],
          content: editedContent,
          size: new Blob([editedContent]).size,
          modifiedDate: '2026-08-19 (editado)'
        };
      } else {
        // Deep search update
        const parts = path.split('/').filter(Boolean);
        const fileName = parts.pop();
        if (fileName) {
          const dirPath = '/' + parts.join('/');
          const dir = getDirectoryAt(dirPath);
          if (dir && dir.children && dir.children[fileName]) {
            dir.children[fileName] = {
              ...dir.children[fileName],
              content: editedContent,
              size: new Blob([editedContent]).size,
              modifiedDate: '2026-08-19 (editado)'
            };
          }
        }
      }
      return updated;
    });

    setActiveFile(prev => prev ? {
      ...prev,
      item: {
        ...prev.item,
        content: editedContent,
        size: new Blob([editedContent]).size
      }
    } : null);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Create new file or folder
  const handleCreateItem = () => {
    if (!newFileName.trim()) return;

    const name = newFileName.trim();
    const isDir = createType === 'folder';
    const targetDir = getDirectoryAt(currentPath);

    if (targetDir) {
      if (!targetDir.children) targetDir.children = {};
      targetDir.children[name] = {
        name,
        isDir,
        size: isDir ? undefined : new Blob([newFileContent]).size,
        content: isDir ? undefined : newFileContent,
        type: name.endsWith('.plist') ? 'plist' : name.endsWith('.json') ? 'json' : name.endsWith('.sqlite') ? 'sqlite' : 'text',
        modifiedDate: '2026-08-19',
        permissions: isDir ? 'drwxr-xr-x' : '-rw-r--r--',
        children: isDir ? {} : undefined
      };
      setFileSystem({ ...fileSystem });
    }

    setNewFileName('');
    setNewFileContent('');
    setShowCreateModal(false);
  };

  // Delete an item
  const handleDeleteItem = (e: React.MouseEvent, itemName: string) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar "${itemName}" de forma permanente?`)) return;

    const targetDir = getDirectoryAt(currentPath);
    if (targetDir && targetDir.children && targetDir.children[itemName]) {
      delete targetDir.children[itemName];
      setFileSystem({ ...fileSystem });
    }
  };

  // Current Directory items list
  const currentDirectory = useMemo(() => {
    if (!currentPath) return null;
    return getDirectoryAt(currentPath);
  }, [currentPath, fileSystem]);

  const directoryEntries = useMemo(() => {
    if (!currentDirectory || !currentDirectory.children) return [];
    
    const entries = Object.values(currentDirectory.children);
    const sorted = [...entries].sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });

    if (searchFilter) {
      return sorted.filter(item => 
        item.name.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }
    return sorted;
  }, [currentDirectory, searchFilter]);

  // Hex dump generator for binary viewer
  const generateHexDump = (str?: string) => {
    if (!str) return '00000000: 00 00 00 00  00 00 00 00  ........';
    const lines = [];
    const bytes = new TextEncoder().encode(str);
    for (let i = 0; i < Math.min(bytes.length, 512); i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
      const ascii = Array.from(chunk).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
      const offset = i.toString(16).padStart(8, '0');
      lines.push(`${offset}: ${hex.padEnd(48, ' ')}  |${ascii}|`);
    }
    return lines.join('\n');
  };

  // Helper icon for app
  const getAppIcon = (type: AppMetadata['iconType']) => {
    switch (type) {
      case 'music': return <Music className="w-5 h-5 text-[#33ff80]" />;
      case 'camera': return <Camera className="w-5 h-5 text-[#33ff80]" />;
      case 'video': return <Video className="w-5 h-5 text-[#33ff80]" />;
      case 'lock': return <Lock className="w-5 h-5 text-[#33ff80]" />;
      case 'globe': return <Globe className="w-5 h-5 text-[#33ff80]" />;
      case 'gear': return <Settings className="w-5 h-5 text-[#33ff80]" />;
      case 'chat': return <Smartphone className="w-5 h-5 text-[#33ff80]" />;
      default: return <Terminal className="w-5 h-5 text-[#33ff80]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-mono selection:bg-[#33ff80]/30 selection:text-[#33ff80]">
      
      {/* ========================================================= */}
      {/* iOS-Style Navigation Bar Header                            */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-30 bg-[#0d0e11]/95 backdrop-blur border-b border-[#22242a] px-3 sm:px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {currentView !== 'appList' && (
              <button
                id="btn-nav-back"
                onClick={handleGoBack}
                className="flex items-center space-x-1 text-[#33ff80] hover:text-[#52ff94] transition px-2 py-1 rounded bg-[#1c1e24] hover:bg-[#252830] border border-[#2f333e] text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Atrás</span>
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${motorEncendido ? 'bg-[#33ff80] shadow-[0_0_8px_#33ff80]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'} transition-all`} />
              <h1 className="text-sm sm:text-base font-bold text-[#33ff80] tracking-tight">
                {currentView === 'appList' && `MiFilza Pro v2.0 (${apps.length})`}
                {currentView === 'browser' && (currentPath.split('/').filter(Boolean).pop() || '/')}
                {currentView === 'viewer' && activeFile?.item.name}
              </h1>
            </div>
          </div>

          {/* Right Header: Motor Control Button & Root Navigation */}
          <div className="flex items-center space-x-2 text-xs">
            
            {/* BOTÓN PARA ENCENDER / APAGAR EL MOTOR (HEADER) */}
            <button
              id="btn-toggle-motor-header"
              onClick={toggleMotor}
              disabled={motorIniciando}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-bold transition shadow-sm border ${
                motorIniciando
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                  : motorEncendido
                  ? 'bg-[#33ff80]/15 text-[#33ff80] hover:bg-[#33ff80]/25 border-[#33ff80]/50 shadow-[0_0_12px_rgba(51,255,128,0.2)]'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50 animate-bounce'
              }`}
              title={motorEncendido ? "Motor Activo (Haz clic para apagar)" : "¡Haz clic aquí para encender el motor!"}
            >
              <Power className={`w-3.5 h-3.5 ${motorIniciando ? 'animate-spin' : motorEncendido ? 'text-[#33ff80]' : 'text-red-400'}`} />
              <span className="text-[11px] sm:text-xs">
                {motorIniciando 
                  ? 'Iniciando...' 
                  : motorEncendido 
                  ? 'MOTOR: ON' 
                  : '⚡ ENCENDER MOTOR'}
              </span>
            </button>

            <button
              id="btn-root-system"
              onClick={() => {
                if (!motorEncendido) {
                  setAlertaMotorApagado(true);
                  return;
                }
                setCurrentPath('/');
                setHistory(['/']);
                setCurrentView('browser');
              }}
              className={`px-2.5 py-1.5 rounded flex items-center space-x-1.5 transition border ${
                currentPath === '/' 
                  ? 'bg-[#33ff80]/20 text-[#33ff80] border-[#33ff80]/40 font-bold' 
                  : 'bg-[#15171c] text-gray-400 hover:text-white border-[#272b35]'
              }`}
              title="Explorar raíz del sistema /"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Root /</span>
            </button>

            <button
              id="btn-reload-apps"
              onClick={() => {
                setApps(INITIAL_APPS);
                setFileSystem(INITIAL_FILE_SYSTEM);
              }}
              className="p-1.5 rounded bg-[#15171c] hover:bg-[#1f222a] text-gray-400 hover:text-white border border-[#272b35] transition"
              title="Recargar aplicaciones"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-4 pb-16">

        {/* ALERTA: SI EL MOTOR ESTÁ APAGADO */}
        {alertaMotorApagado && !motorEncendido && (
          <div className="mb-4 bg-red-950/40 border border-red-500/60 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-lg animate-pulse">
            <div className="flex items-center space-x-2 text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>
                <strong>¡Motor apagado!</strong> Necesitas encender el motor MCMFilza para desbloquear los contenedores de aplicaciones y el sistema de archivos irrestricto.
              </span>
            </div>
            <button
              onClick={encenderMotor}
              className="px-3 py-1.5 bg-[#33ff80] hover:bg-[#4dff93] text-black font-bold rounded-lg flex items-center space-x-1 flex-shrink-0 transition shadow"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>Encender Ahora</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: APP LIST (ViewController.m Initial Screen)         */}
        {/* ========================================================= */}
        {currentView === 'appList' && (
          <div className="space-y-4">
            
            {/* PANEL PRINCIPAL DEL MOTOR (ASEGURARMOTOR) */}
            <div className={`rounded-xl border transition-all duration-300 p-4 shadow-xl ${
              motorEncendido 
                ? 'bg-gradient-to-r from-[#101419] to-[#0f1715] border-[#33ff80]/40' 
                : 'bg-gradient-to-r from-[#171012] to-[#141215] border-red-500/40'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                    motorEncendido 
                      ? 'bg-[#33ff80]/10 border-[#33ff80]/50 text-[#33ff80] shadow-[0_0_15px_rgba(51,255,128,0.25)]' 
                      : 'bg-red-500/10 border-red-500/50 text-red-400'
                  }`}>
                    <Zap className={`w-6 h-6 ${motorEncendido ? 'fill-[#33ff80]' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-sm font-bold text-white tracking-wide">
                        MOTOR MCMFILZA (asegurarMotor)
                      </h2>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        motorEncendido 
                          ? 'bg-[#33ff80]/20 text-[#33ff80] border border-[#33ff80]/40' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}>
                        {motorIniciando ? 'Iniciando...' : motorEncendido ? 'ACTIVO / UNRESTRICTED' : 'APAGADO'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {motorEncendido 
                        ? 'TweakInit + MCMFilzaStart activos • Sandbox liberado' 
                        : 'El sandbox de iOS está bloqueando el acceso a /var/mobile/Containers'}
                    </p>
                  </div>
                </div>

                {/* BOTÓN PRINCIPAL DE ACCIÓN PARA ENCENDER MOTOR */}
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    id="btn-encender-motor-card"
                    onClick={toggleMotor}
                    disabled={motorIniciando}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg ${
                      motorIniciando
                        ? 'bg-amber-500 text-black animate-pulse cursor-wait'
                        : motorEncendido
                        ? 'bg-[#181d24] text-gray-300 hover:text-white hover:bg-[#202731] border border-[#2f384a]'
                        : 'bg-[#33ff80] hover:bg-[#4aff91] text-black shadow-[0_0_20px_rgba(51,255,128,0.4)] scale-105'
                    }`}
                  >
                    <Power className={`w-4 h-4 ${motorEncendido ? 'text-red-400' : 'text-black'}`} />
                    <span>
                      {motorIniciando 
                        ? 'Iniciando Motor...' 
                        : motorEncendido 
                        ? 'Apagar Motor' 
                        : '⚡ ENCENDER MOTOR'}
                    </span>
                  </button>

                  <button
                    onClick={() => setMostrarLogsMotor(!mostrarLogsMotor)}
                    className="px-2.5 py-2 rounded-lg bg-[#141720] hover:bg-[#1c212d] text-gray-400 hover:text-white border border-[#282f40] text-xs flex items-center space-x-1"
                    title="Ver logs de ejecución del motor"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    {mostrarLogsMotor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Logs colapsables de inicialización del motor */}
              {mostrarLogsMotor && (
                <div className="mt-3.5 pt-3 border-t border-[#232938]">
                  <div className="text-[11px] text-gray-400 font-mono mb-1 flex items-center justify-between">
                    <span>Consola de enlace dinámico (dlsym):</span>
                    <span className="text-[#33ff80]">RTLD_DEFAULT</span>
                  </div>
                  <div className="bg-black/80 rounded-lg p-2.5 border border-[#262c3a] max-h-36 overflow-y-auto space-y-1 text-[11px] font-mono">
                    {motorLogs.map((log, index) => (
                      <div key={index} className={log.includes('✅') ? 'text-[#33ff80] font-bold' : log.includes('⚠️') ? 'text-amber-400' : 'text-gray-300'}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search / Manual Bundle ID Input */}
            <div className="bg-[#121419] rounded-xl border border-[#222631] p-3 shadow-lg">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleOpenContainer(manualBundleId);
                }}
                className="relative flex items-center"
              >
                <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  id="input-bundle-id"
                  type="text"
                  value={manualBundleId}
                  onChange={(e) => setManualBundleId(e.target.value)}
                  placeholder="bundle id manual + return (ej. com.spotify.client)"
                  className="w-full bg-[#181b22] text-sm text-white placeholder-gray-500 pl-9 pr-24 py-2 rounded-lg border border-[#282d3b] focus:outline-none focus:border-[#33ff80] focus:ring-1 focus:ring-[#33ff80] font-mono transition"
                />
                <button
                  type="submit"
                  disabled={!manualBundleId.trim()}
                  className="absolute right-1.5 px-3 py-1 bg-[#33ff80] hover:bg-[#48ff8e] disabled:opacity-40 disabled:hover:bg-[#33ff80] text-black font-bold text-xs rounded transition"
                >
                  Abrir
                </button>
              </form>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400 px-1">
                <span className="flex items-center gap-1">
                  <Shield className={`w-3 h-3 ${motorEncendido ? 'text-[#33ff80]' : 'text-red-400'}`} />
                  MCMFilza Unrestricted Filesystem: <strong className={motorEncendido ? 'text-[#33ff80]' : 'text-red-400'}>{motorEncendido ? 'ACTIVO' : 'INACTIVO'}</strong>
                </span>
                <span className="hidden sm:inline text-gray-500">Toca cualquier app para ver su contenedor</span>
              </div>
            </div>

            {/* Apps List Table */}
            <div className="bg-[#121419] rounded-xl border border-[#222631] overflow-hidden shadow-xl">
              <div className="px-4 py-2.5 bg-[#171a22] border-b border-[#232733] flex items-center justify-between text-xs font-medium text-gray-300">
                <span>APLICACIONES INSTALADAS ({apps.length})</span>
                <span>CONTENEDORES</span>
              </div>

              {apps.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No se detectaron apps.<br />
                  Escribe arriba el bundle ID de una app INSTALADA.
                </div>
              ) : (
                <div className="divide-y divide-[#1e222d]">
                  {apps.map((app) => (
                    <div
                      key={app.bundleId}
                      id={`app-item-${app.bundleId}`}
                      onClick={() => handleOpenContainer(app.bundleId)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[#171b24] cursor-pointer transition group"
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div className="w-9 h-9 rounded-lg bg-[#1a1e27] border border-[#2c3242] flex items-center justify-center flex-shrink-0 group-hover:border-[#33ff80]/50 transition">
                          {getAppIcon(app.iconType)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#33ff80] truncate font-mono group-hover:text-[#5aff9a] transition">
                            {app.bundleId}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate flex items-center gap-2">
                            <span>{app.name} (v{app.version})</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-500">{app.installedSize}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-[10px] text-gray-500 hidden sm:inline font-mono">toca para explorar</span>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#33ff80] transition" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Sandbox Guide Info */}
            <div className="bg-[#111317] border border-[#1e222a] rounded-xl p-4 text-xs text-gray-400 space-y-2">
              <div className="text-gray-200 font-semibold flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#33ff80]" />
                Estructura de Contenedor de Sandbox iOS (Data Container):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-[#171920] p-2 rounded border border-[#232733]">
                  <span className="text-[#38bdf8] font-bold">Documents/</span>
                  <p className="text-gray-400 text-[10px] mt-0.5">Archivos accesibles por el usuario, bases de datos y descargas.</p>
                </div>
                <div className="bg-[#171920] p-2 rounded border border-[#232733]">
                  <span className="text-[#38bdf8] font-bold">Library/Preferences/</span>
                  <p className="text-gray-400 text-[10px] mt-0.5">Archivos .plist con ajustes y NSUserDefaults de la aplicación.</p>
                </div>
                <div className="bg-[#171920] p-2 rounded border border-[#232733]">
                  <span className="text-[#38bdf8] font-bold">Library/Caches/</span>
                  <p className="text-gray-400 text-[10px] mt-0.5">Cachés temporales descartables, portadas e imágenes HTTP.</p>
                </div>
                <div className="bg-[#171920] p-2 rounded border border-[#232733]">
                  <span className="text-[#38bdf8] font-bold">tmp/</span>
                  <p className="text-gray-400 text-[10px] mt-0.5">Directorio volátil para buffers y archivos temporales.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: FILE BROWSER (FileBrowserVC Screen)                */}
        {/* ========================================================= */}
        {currentView === 'browser' && (
          <div className="space-y-3">
            
            {/* Breadcrumb Path & Tool Bar */}
            <div className="bg-[#121419] rounded-xl border border-[#222631] p-3 space-y-3 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                
                {/* Path display */}
                <div className="flex items-center space-x-1.5 text-xs text-gray-300 font-mono bg-[#171a22] px-2.5 py-1.5 rounded-lg border border-[#262a36] max-w-full overflow-x-auto">
                  <span className="text-gray-500">Ruta:</span>
                  <span className="text-[#38bdf8] font-semibold">{currentPath || '/'}</span>
                </div>

                {/* Actions: New File/Folder */}
                <div className="flex items-center space-x-2">
                  <button
                    id="btn-create-item"
                    onClick={() => {
                      setNewFileName('');
                      setNewFileContent('');
                      setShowCreateModal(true);
                    }}
                    className="px-2.5 py-1.5 bg-[#1e2330] hover:bg-[#282f40] text-[#33ff80] border border-[#2d364a] text-xs font-semibold rounded-lg flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo</span>
                  </button>
                </div>
              </div>

              {/* Search filter inside directory */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="input-filter-files"
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filtrar archivos en este directorio..."
                  className="w-full bg-[#181b22] text-xs text-white placeholder-gray-500 pl-8 pr-3 py-1.5 rounded-lg border border-[#262a36] focus:outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>

            {/* Directory Content Table */}
            <div className="bg-[#121419] rounded-xl border border-[#222631] overflow-hidden shadow-xl">
              <div className="divide-y divide-[#1d212b]">
                
                {/* ".." Subir (Parent Directory Row) if not at root */}
                {currentPath !== '/' && (
                  <div
                    id="btn-dir-parent"
                    onClick={handleGoBack}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-[#171a22] cursor-pointer text-gray-400 group transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded bg-[#181b24] border border-[#292e3c] flex items-center justify-center text-gray-400 group-hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white">..</span>
                        <div className="text-[10px] text-gray-500">subir al directorio superior</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Child entries */}
                {directoryEntries.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs font-mono">
                    Directorio vacío
                  </div>
                ) : (
                  directoryEntries.map((item) => {
                    const fullPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
                    
                    return (
                      <div
                        key={item.name}
                        id={`file-row-${item.name}`}
                        onClick={() => {
                          if (item.isDir) {
                            handleNavigateTo(item.name);
                          } else {
                            handleOpenFile(item, fullPath);
                          }
                        }}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-[#161a22] cursor-pointer transition group"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded bg-[#181c25] border border-[#282e3c] flex items-center justify-center flex-shrink-0">
                            {item.isDir ? (
                              <Folder className="w-4 h-4 text-[#38bdf8] fill-[#38bdf8]/20" />
                            ) : item.type === 'plist' ? (
                              <FileCode className="w-4 h-4 text-[#facc15]" />
                            ) : item.type === 'sqlite' ? (
                              <Layers className="w-4 h-4 text-[#c084fc]" />
                            ) : item.type === 'binary' ? (
                              <Binary className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-300" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className={`text-xs font-mono truncate font-semibold ${
                              item.isDir ? 'text-[#38bdf8] group-hover:text-[#60cdff]' : 'text-white'
                            }`}>
                              {item.name}
                            </div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-2">
                              <span>{item.isDir ? 'carpeta' : formatFileSize(item.size)}</span>
                              {item.modifiedDate && (
                                <>
                                  <span>•</span>
                                  <span>{item.modifiedDate}</span>
                                </>
                              )}
                              {item.permissions && (
                                <>
                                  <span>•</span>
                                  <span className="text-gray-600">{item.permissions}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 flex-shrink-0">
                          {/* Delete Item button */}
                          <button
                            onClick={(e) => handleDeleteItem(e, item.name)}
                            title="Eliminar elemento"
                            className="p-1 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {item.isDir ? (
                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#38bdf8] transition" />
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c202a] text-gray-400 border border-[#2b3040] font-mono uppercase">
                              {item.type || 'FILE'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: FILE VIEWER / EDITOR (TextViewVC Screen)          */}
        {/* ========================================================= */}
        {currentView === 'viewer' && activeFile && (
          <div className="space-y-3">
            
            {/* Viewer Action Toolbar */}
            <div className="bg-[#121419] rounded-xl border border-[#222631] p-3 flex flex-wrap items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 font-mono">Modo:</span>
                <div className="flex bg-[#181b24] p-0.5 rounded-lg border border-[#282d3b] text-xs">
                  <button
                    onClick={() => setViewerMode('text')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      viewerMode === 'text' ? 'bg-[#33ff80] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Texto
                  </button>
                  <button
                    onClick={() => setViewerMode('edit')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      viewerMode === 'edit' ? 'bg-[#33ff80] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setViewerMode('hex')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      viewerMode === 'hex' ? 'bg-[#33ff80] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Hex Dump
                  </button>
                  {activeFile.item.type === 'plist' && (
                    <button
                      onClick={() => setViewerMode('plist')}
                      className={`px-2.5 py-1 rounded-md transition font-medium ${
                        viewerMode === 'plist' ? 'bg-[#33ff80] text-black font-bold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Plist XML
                    </button>
                  )}
                </div>
              </div>

              {/* File Info Badges & Save button */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-gray-400 bg-[#181c25] px-2 py-1 rounded border border-[#282e3c]">
                  {formatFileSize(activeFile.item.size)}
                </span>
                
                {viewerMode === 'edit' && (
                  <button
                    id="btn-save-file"
                    onClick={handleSaveFile}
                    className="px-3 py-1 bg-[#33ff80] hover:bg-[#4dff93] text-black font-bold text-xs rounded-lg flex items-center space-x-1 transition shadow"
                  >
                    {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saveSuccess ? 'Guardado' : 'Guardar'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Text View / Editor Area (Faithfully styling TextViewVC) */}
            <div className="bg-black rounded-xl border border-[#222631] overflow-hidden shadow-2xl">
              <div className="bg-[#111216] px-4 py-2 border-b border-[#222631] flex items-center justify-between text-[11px] text-gray-400">
                <span className="font-mono text-gray-300 truncate">{activeFile.path}</span>
                <span className="text-[#33ff80] font-mono">Menlo 11pt</span>
              </div>

              {/* Editor Mode */}
              {viewerMode === 'edit' ? (
                <div className="p-3">
                  <textarea
                    id="textarea-file-content"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={20}
                    className="w-full bg-black text-[#33ff80] font-mono text-xs p-3 rounded border border-[#262a34] focus:outline-none focus:border-[#33ff80] resize-y"
                    spellCheck={false}
                  />
                </div>
              ) : viewerMode === 'hex' ? (
                /* Hex Dump View */
                <div className="p-4 bg-black overflow-x-auto text-[11px] text-emerald-400 font-mono leading-relaxed whitespace-pre selection:bg-emerald-900/50">
                  {generateHexDump(activeFile.item.content)}
                </div>
              ) : (
                /* Standard Text / Plist View */
                <div className="p-4 bg-black overflow-x-auto">
                  <pre className="text-xs text-[#33ff80] font-mono leading-relaxed whitespace-pre-wrap selection:bg-[#33ff80]/30 selection:text-white">
                    {activeFile.item.content || '(archivo vacío)'}
                  </pre>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Modal for Creating New File or Folder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161d] border border-[#2b3040] rounded-xl max-w-md w-full p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#252a38] pb-2.5">
              <h3 className="text-sm font-bold text-[#33ff80] flex items-center gap-2 font-mono">
                <Plus className="w-4 h-4" />
                Crear Nuevo Elemento
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCreateType('file')}
                  className={`flex-1 py-1.5 rounded-lg border text-center font-bold transition ${
                    createType === 'file' 
                      ? 'bg-[#33ff80] text-black border-[#33ff80]' 
                      : 'bg-[#1a1d26] text-gray-400 border-[#2b3040]'
                  }`}
                >
                  Archivo
                </button>
                <button
                  type="button"
                  onClick={() => setCreateType('folder')}
                  className={`flex-1 py-1.5 rounded-lg border text-center font-bold transition ${
                    createType === 'folder' 
                      ? 'bg-[#38bdf8] text-black border-[#38bdf8]' 
                      : 'bg-[#1a1d26] text-gray-400 border-[#2b3040]'
                  }`}
                >
                  Carpeta
                </button>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nombre:</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder={createType === 'file' ? 'config.plist' : 'MisDocumentos'}
                  className="w-full bg-[#1b1f2a] text-white p-2 rounded-lg border border-[#2d3446] focus:outline-none focus:border-[#33ff80]"
                />
              </div>

              {createType === 'file' && (
                <div>
                  <label className="block text-gray-400 mb-1">Contenido inicial:</label>
                  <textarea
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    rows={4}
                    placeholder="Texto o formato plist..."
                    className="w-full bg-[#1b1f2a] text-white p-2 rounded-lg border border-[#2d3446] focus:outline-none focus:border-[#33ff80]"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#252a38]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 bg-[#1b1e28] hover:bg-[#262b3a] text-gray-300 text-xs rounded-lg border border-[#2e3447]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateItem}
                disabled={!newFileName.trim()}
                className="px-4 py-1.5 bg-[#33ff80] hover:bg-[#4bff92] disabled:opacity-40 text-black font-bold text-xs rounded-lg"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 inset-x-0 bg-[#0d0e11] border-t border-[#1e222a] py-1 px-4 text-[10px] text-gray-500 font-mono flex items-center justify-between z-20">
        <div>MiFilza Pro v2.0 (com.elvis.mifilzapro) • Unrestricted Engine</div>
        <div className={motorEncendido ? 'text-[#33ff80]' : 'text-red-400'}>
          Motor: {motorEncendido ? 'ON (MCMFilza Unrestricted)' : 'OFF (Sandbox Bloqueado)'}
        </div>
      </footer>
    </div>
  );
}
