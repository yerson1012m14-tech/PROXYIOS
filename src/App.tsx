import React, { useState, useMemo } from 'react';
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
  Share2, 
  Zap, 
  Boxes, 
  Smartphone, 
  CornerDownRight, 
  FileCode, 
  Database, 
  Cpu, 
  Image as ImageIcon 
} from 'lucide-react';
import { INITIAL_APPS, INITIAL_FILE_SYSTEM, formatFileSize } from './mockFileSystem';
import { FileItem } from './types';

export default function App() {
  // Current Directory path (default /var/mobile like native Filza)
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

  const [showAppsSheet, setShowAppsSheet] = useState(false);
  const [showManualPathModal, setShowManualPathModal] = useState(false);
  const [manualPathInput, setManualPathInput] = useState('');
  const [manualBundleIdInput, setManualBundleIdInput] = useState('');
  const [showMotorModal, setShowMotorModal] = useState(false);

  // Get current directory's children
  const currentDirectoryItems = useMemo(() => {
    const items: Array<{ name: string; fullPath: string; isDirectory: boolean; item?: FileItem }> = [];
    
    // Prefix to look for direct children
    const prefix = currentPath === '/' ? '/' : `${currentPath}/`;
    
    // Find all paths that start with currentPath/ and have no further slashes
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

    // Sort: directories first, then alphabetically
    return items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [currentPath, fileSystem]);

  // Filtered by search bar
  const filteredItems = useMemo(() => {
    if (!searchFilter.trim()) return currentDirectoryItems;
    const q = searchFilter.toLowerCase();
    return currentDirectoryItems.filter(i => i.name.toLowerCase().includes(q));
  }, [currentDirectoryItems, searchFilter]);

  // Navigate to path
  const navigateTo = (newPath: string) => {
    if (newPath === currentPath) return;
    setHistory(prev => [...prev, currentPath]);
    setCurrentPath(newPath);
    setSearchFilter('');
  };

  // Go back
  const goBack = () => {
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

  // Open a file
  const handleOpenFile = (path: string, item: FileItem) => {
    setActiveFile({ path, item });
    setEditedContent(item.content || '');
    setViewerMode('text');
  };

  // Save edited file
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
    setViewerMode('text');
  };

  // Create new file or folder
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
  };

  // Jump to Bundle ID container
  const handleOpenBundleId = (bundleId: string) => {
    const bid = bundleId.trim();
    if (!bid) return;
    const matchedApp = INITIAL_APPS.find(a => a.bundleId.toLowerCase() === bid.toLowerCase());
    if (matchedApp) {
      navigateTo(matchedApp.containerPath);
    } else {
      navigateTo('/var/mobile/Containers/Data/Application');
    }
    setShowAppsSheet(false);
  };

  // Generate Hex dump for Viewer
  const generateHexDump = (content?: string) => {
    const text = content || '';
    const bytes: number[] = [];
    for (let i = 0; i < Math.min(text.length, 512); i++) {
      bytes.push(text.charCodeAt(i));
    }
    if (bytes.length === 0) {
      return '// (Archivo vacío o sin datos binarios cargados)';
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
    if (isDir) return <Folder className="w-5 h-5 text-blue-500 fill-blue-500/20" />;
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'plist') return <FileCode className="w-5 h-5 text-amber-500" />;
    if (ext === 'sqlite' || ext === 'db') return <Database className="w-5 h-5 text-purple-400" />;
    if (ext === 'dylib' || ext === 'bin' || ext === 'dat') return <Cpu className="w-5 h-5 text-emerald-400" />;
    if (['png', 'jpg', 'jpeg', 'car', 'svg'].includes(ext || '')) return <ImageIcon className="w-5 h-5 text-cyan-400" />;
    return <FileText className="w-5 h-5 text-zinc-400" />;
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col font-sans select-none antialiased">
      {/* ========================================================= */}
      {/* 1. TOP NAVIGATION BAR (Exact Native iOS Filza Style)     */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-30 bg-[#121214]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {currentPath !== '/' && (
            <button 
              onClick={goBack}
              className="p-1.5 -ml-1 text-emerald-400 hover:text-emerald-300 active:scale-95 transition-transform flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="font-semibold text-base text-zinc-100 truncate flex items-center gap-1.5">
              <span>{currentPath === '/' ? '/' : currentPath.split('/').pop()}</span>
            </h1>
            <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[220px] sm:max-w-md">
              {currentPath}
            </span>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-2 text-emerald-400 hover:bg-zinc-800/60 rounded-full transition-colors active:scale-95"
            title="Crear archivo o carpeta"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowMotorModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono font-medium hover:bg-emerald-500/20 active:scale-95 transition-all"
            title="Estado del Motor MCMFilza"
          >
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Motor: ON</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. SEARCH BAR (Native iOS UISearchBar Style)              */}
      {/* ========================================================= */}
      <div className="px-4 py-2 bg-[#09090b] border-b border-zinc-800/40">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar archivos o escribir nombre..."
            className="w-full bg-zinc-900/90 text-sm text-zinc-100 placeholder-zinc-500 pl-9 pr-8 py-1.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono"
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

      {/* ========================================================= */}
      {/* 3. DIRECTORY CONTENT LIST (Real Filza Explorer)           */}
      {/* ========================================================= */}
      <main className="flex-1 overflow-y-auto pb-24 divide-y divide-zinc-800/50">
        {/* Parent ".." item when not in root */}
        {currentPath !== '/' && (
          <div 
            onClick={goBack}
            className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/70 active:bg-zinc-800 cursor-pointer transition-colors"
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
              Usa el botón <Plus className="inline w-3.5 h-3.5 text-emerald-400" /> superior para crear archivos o carpetas aquí.
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
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/60 active:bg-zinc-800/80 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="flex-shrink-0">
                  {getFileIcon(item.name, item.isDirectory)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-100 truncate group-hover:text-emerald-400 transition-colors">
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
      </main>

      {/* ========================================================= */}
      {/* 4. BOTTOM TOOLBAR (Native iOS Filza Toolbar)             */}
      {/* ========================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[#121214]/95 backdrop-blur-md border-t border-zinc-800/80 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => navigateTo('/')}
          className={`flex flex-col items-center gap-1 p-1.5 text-xs font-medium transition-colors ${
            currentPath === '/' ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <HardDrive className="w-5 h-5" />
          <span>Raíz /</span>
        </button>

        <button
          onClick={() => setShowAppsSheet(true)}
          className={`flex flex-col items-center gap-1 p-1.5 text-xs font-medium transition-colors ${
            currentPath.includes('Containers') ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span>Apps</span>
        </button>

        <button
          onClick={() => navigateTo('/var/mobile')}
          className={`flex flex-col items-center gap-1 p-1.5 text-xs font-medium transition-colors ${
            currentPath === '/var/mobile' ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span>Mobile</span>
        </button>

        <button
          onClick={() => {
            setManualPathInput(currentPath);
            setShowManualPathModal(true);
          }}
          className="flex flex-col items-center gap-1 p-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <CornerDownRight className="w-5 h-5" />
          <span>Ir a ruta</span>
        </button>
      </footer>

      {/* ========================================================= */}
      {/* 5. MODAL: APPS CONTAINERS SELECTOR (Action Sheet)         */}
      {/* ========================================================= */}
      {showAppsSheet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm">Contenedores de Aplicaciones</h3>
                <p className="text-xs text-zinc-400">Acceso directo a carpetas de apps instaladas</p>
              </div>
              <button 
                onClick={() => setShowAppsSheet(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Bundle ID input */}
            <div className="p-3 bg-zinc-900/60 border-b border-zinc-800/60 flex items-center gap-2">
              <input
                type="text"
                value={manualBundleIdInput}
                onChange={(e) => setManualBundleIdInput(e.target.value)}
                placeholder="Bundle ID manual (ej: com.dts.freefireth)"
                className="flex-1 bg-black text-xs text-zinc-100 placeholder-zinc-500 px-3 py-2 rounded-lg border border-zinc-800 font-mono focus:outline-none focus:border-emerald-500"
                onKeyDown={(e) => e.key === 'Enter' && handleOpenBundleId(manualBundleIdInput)}
              />
              <button
                onClick={() => handleOpenBundleId(manualBundleIdInput)}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-lg active:scale-95 transition-transform"
              >
                Abrir
              </button>
            </div>

            {/* Common Apps List */}
            <div className="overflow-y-auto p-2 divide-y divide-zinc-800/40">
              <div 
                onClick={() => {
                  navigateTo('/var/mobile/Containers/Data/Application');
                  setShowAppsSheet(false);
                }}
                className="p-3 hover:bg-zinc-800/60 rounded-xl cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-emerald-400">
                      Explorar /Containers/Data/Application
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">Todos los contenedores de datos de iOS</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </div>

              {INITIAL_APPS.map(app => (
                <div
                  key={app.bundleId}
                  onClick={() => handleOpenBundleId(app.bundleId)}
                  className="p-3 hover:bg-zinc-800/60 rounded-xl cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-emerald-400 group-hover:underline">
                      {app.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">{app.bundleId}</div>
                    <div className="text-[10px] text-zinc-600 font-mono truncate max-w-[280px]">{app.containerPath}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: IR A RUTA MANUAL                                */}
      {/* ========================================================= */}
      {showManualPathModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl w-full max-w-sm p-4 animate-in fade-in scale-95">
            <h3 className="font-semibold text-zinc-100 text-sm mb-1">Ir a la ruta</h3>
            <p className="text-xs text-zinc-400 mb-3">Escribe cualquier ruta del sistema de archivos:</p>
            <input
              type="text"
              value={manualPathInput}
              onChange={(e) => setManualPathInput(e.target.value)}
              placeholder="/var/mobile/..."
              className="w-full bg-black text-xs text-emerald-400 font-mono px-3 py-2.5 rounded-xl border border-zinc-700 focus:outline-none focus:border-emerald-500 mb-4"
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
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
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
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl"
              >
                Ir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MODAL: NUEVO ELEMENTO (+ CREAR ARCHIVO O CARPETA)      */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl w-full max-w-sm p-4 animate-in fade-in scale-95">
            <h3 className="font-semibold text-zinc-100 text-sm mb-1">Nuevo Elemento</h3>
            <p className="text-xs text-zinc-400 mb-3 font-mono truncate">En: {currentPath}</p>

            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setCreateType('file')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  createType === 'file' 
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                📄 Archivo
              </button>
              <button
                type="button"
                onClick={() => setCreateType('folder')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  createType === 'folder' 
                    ? 'bg-blue-500/20 border-blue-500/60 text-blue-300' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                📁 Carpeta
              </button>
            </div>

            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder={createType === 'file' ? 'nombre.txt' : 'NuevaCarpeta'}
              className="w-full bg-black text-xs text-zinc-100 font-mono px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-emerald-500 mb-3"
              autoFocus
            />

            {createType === 'file' && (
              <textarea
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                placeholder="Contenido inicial del archivo (opcional)..."
                rows={3}
                className="w-full bg-black text-xs text-zinc-300 font-mono p-3 rounded-xl border border-zinc-700 focus:outline-none focus:border-emerald-500 mb-4 resize-none"
              />
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setNewFileName('');
                  setNewFileContent('');
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!newFileName.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs rounded-xl"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MODAL: ESTADO DEL MOTOR MCMFILZA                       */}
      {/* ========================================================= */}
      {showMotorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-emerald-500/40 rounded-2xl w-full max-w-md p-5 animate-in fade-in scale-95 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-3 text-emerald-400">
              <Zap className="w-5 h-5 fill-emerald-400" />
              <h3 className="font-bold text-base text-zinc-100">Motor MCMFilza Activo</h3>
            </div>
            
            <div className="space-y-2 bg-black/80 p-3.5 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-300 mb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>TweakInit() → Ejecutado OK</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>MCMFilzaStart() → Motor iniciado</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>MCMFilzaSetUnrestrictedFilesystem(1) → ACTIVO</span>
              </div>
              <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                Acceso sin sandbox habilitado para lectura y escritura en todo el sistema de archivos de iOS.
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowMotorModal(false)}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. FILE VIEWER & HEX DUMP (Filza Text / Hex Viewer)      */}
      {/* ========================================================= */}
      {activeFile && (
        <div className="fixed inset-0 z-50 bg-[#000000] flex flex-col animate-in fade-in">
          {/* Viewer Header */}
          <div className="bg-[#121214] border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setActiveFile(null)}
              className="p-1 text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cerrar</span>
            </button>

            {/* Segmented Control (Texto / Hex / Editar) */}
            <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
              <button
                onClick={() => setViewerMode('text')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewerMode === 'text' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Texto
              </button>
              <button
                onClick={() => setViewerMode('hex')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewerMode === 'hex' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Hex Dump
              </button>
              <button
                onClick={() => setViewerMode('edit')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewerMode === 'edit' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Editar
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {viewerMode === 'edit' ? (
                <button
                  onClick={handleSaveFile}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-black font-semibold text-xs rounded-lg active:scale-95 transition-transform"
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
                  className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800"
                  title="Copiar contenido"
                >
                  {copiedNotification ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Subheader info */}
          <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-900 text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span className="truncate max-w-xs sm:max-w-md">{activeFile.path}</span>
            <span>{formatFileSize(activeFile.item.size || 0)}</span>
          </div>

          {/* Viewer Content */}
          <div className="flex-1 overflow-auto p-4 bg-black font-mono text-xs">
            {viewerMode === 'text' && (
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
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
                className="w-full h-full bg-black text-emerald-300 font-mono text-xs p-2 focus:outline-none resize-none leading-relaxed"
                autoFocus
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
