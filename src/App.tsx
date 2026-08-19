import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Zap, 
  Folder, 
  FileText, 
  Search, 
  X, 
  Trash2, 
  Smartphone, 
  Shield, 
  ShieldAlert, 
  Flame, 
  FileCode, 
  Database, 
  Cpu, 
  Image as ImageIcon,
  Compass,
  Terminal,
  Grid,
  List,
  Sparkles,
  Layers,
  Activity,
  HardDrive,
  RefreshCw,
  FolderOpen,
  Settings,
  ArrowUpDown,
  Share2
} from 'lucide-react';
import { INITIAL_FILE_SYSTEM, formatFileSize } from './mockFileSystem';
import { FileItem } from './types';
import { UIKitDeviceFrame } from './components/UIKitDeviceFrame';
import { UIKitNavigationBar } from './components/UIKitNavigationBar';
import { UIKitTableView, UIKitTableSection, UIKitTableCellItem } from './components/UIKitTableView';
import { UIKitAlertController, UIAlertAction } from './components/UIKitAlertController';
import { UIKitFileViewer } from './components/UIKitFileViewer';
import { UIKitLoginKeyView } from './components/UIKitLoginKeyView';
import { UIKitStorageBar } from './components/UIKitStorageBar';
import { XcodeConsoleInspector, ConsoleLogEntry } from './components/XcodeConsoleInspector';

export default function App() {
  // Authentication State (KeyManager.m)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<string>('MIFILZA-VIP-2026');
  const [licenseType, setLicenseType] = useState<string>('VIP Permanente');
  const [keyError, setKeyError] = useState<string | null>(null);

  // Screen Shield State (ScreenShieldManager.m)
  const [antiCapturaActive, setAntiCapturaActive] = useState<boolean>(false);
  const [isScreenRecordingSimulated, setIsScreenRecordingSimulated] = useState<boolean>(false);

  // File System State (ViewController.m)
  const [currentPath, setCurrentPath] = useState<string>('/var/mobile');
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [fileSystem, setFileSystem] = useState<{ [path: string]: FileItem }>(INITIAL_FILE_SYSTEM);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterCategory, setActiveFilterCategory] = useState<'all' | 'folders' | 'apps' | 'databases' | 'plists' | 'binaries'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showStorageBar, setShowStorageBar] = useState<boolean>(false);

  // Active File Viewer (VisorArchivoVC)
  const [activeFile, setActiveFile] = useState<{ path: string; item: FileItem } | null>(null);

  // Studio Mode: Split Screen vs Device Only
  const [studioLayout, setStudioLayout] = useState<'studio' | 'deviceOnly' | 'consoleOnly'>('studio');

  // Live NSLogs Collection
  const [logs, setLogs] = useState<ConsoleLogEntry[]>([
    {
      id: '1',
      timestamp: '09:41:00.102',
      level: 'info',
      tag: 'XITFORGE',
      message: 'Iniciando runtime UIKit en iOS 18.3.1 (A18 Pro - arm64e)'
    },
    {
      id: '2',
      timestamp: '09:41:00.180',
      level: 'success',
      tag: 'Motor',
      message: 'MCMFilzaStart() ejecutado. MCMFilzaSetUnrestrictedFilesystem(1) activado.'
    },
    {
      id: '3',
      timestamp: '09:41:00.220',
      level: 'info',
      tag: 'KeyManager',
      message: 'Licencia VIP verificada con éxito. Token HWID: DEV-XIT9-8B92-F401-2026'
    }
  ]);

  const addLog = useCallback((tag: string, message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    const d = new Date();
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
    setLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp: timeStr,
        level,
        tag,
        message
      }
    ]);
  }, []);

  // Modal / Alert Controller State (UIAlertController)
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
    preferredStyle: 'actionSheet' | 'alert';
    actions: UIAlertAction[];
    textFields?: Array<{
      placeholder?: string;
      defaultValue?: string;
      fontMonospace?: boolean;
      autoCapitalize?: 'none' | 'characters' | 'words';
      onChange?: (val: string) => void;
    }>;
  }>({
    isOpen: false,
    preferredStyle: 'alert',
    actions: []
  });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      preferredStyle: 'alert',
      actions: [
        {
          title: 'OK',
          style: 'default',
          handler: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
        }
      ]
    });
  };

  const navigateToPath = (newPath: string) => {
    if (newPath === currentPath) return;
    setPathHistory(prev => [...prev, currentPath]);
    setCurrentPath(newPath);
    setSearchQuery('');
    addLog('NSFileManager', `contentsOfDirectoryAtPath: "${newPath}"`, 'info');
  };

  const handleBack = () => {
    if (pathHistory.length > 0) {
      const prev = pathHistory[pathHistory.length - 1];
      setPathHistory(history => history.slice(0, -1));
      setCurrentPath(prev);
      setSearchQuery('');
      addLog('UINavigationController', `popViewControllerAnimated: YES -> "${prev}"`, 'info');
    }
  };

  // Key Activation
  const handleActivateKey = (key: string) => {
    const clean = key.trim().toUpperCase();
    if (clean.includes('VIP') || clean === 'MASTER-KEY' || clean === 'MIFILZA-VIP-2026') {
      setActiveKey(clean);
      setLicenseType('VIP Permanente');
      setIsUnlocked(true);
      setKeyError(null);
      addLog('KeyManager', `activarKey: @"${clean}" -> Licencia VIP Permanente autorizada.`, 'success');
      return true;
    }
    if (clean.includes('TRIAL') || clean === 'TEST-KEY') {
      setActiveKey(clean);
      setLicenseType('Prueba (Trial 3 Días)');
      setIsUnlocked(true);
      setKeyError(null);
      addLog('KeyManager', `activarKey: @"${clean}" -> Licencia Trial (3 días) iniciada.`, 'success');
      return true;
    }
    if (clean.length >= 8) {
      setActiveKey(clean);
      setLicenseType('Licencia Pro (7 Días)');
      setIsUnlocked(true);
      setKeyError(null);
      addLog('KeyManager', `activarKey: @"${clean}" -> Licencia Pro activada.`, 'success');
      return true;
    }
    setKeyError('Código de llave inválido. Usa una key de prueba.');
    addLog('KeyManager', `activarKey: @"${clean}" -> ERROR: Clave no reconocida.`, 'error');
    return false;
  };

  // Create New File/Folder
  const handleOpenCreateModal = () => {
    let inputName = '';
    setAlertConfig({
      isOpen: true,
      title: 'Nuevo Elemento',
      message: `Crear en: ${currentPath}`,
      preferredStyle: 'alert',
      textFields: [
        {
          placeholder: 'Nombre (ej: script.dylib, config.plist)',
          defaultValue: '',
          fontMonospace: true,
          onChange: (val) => { inputName = val; }
        }
      ],
      actions: [
        {
          title: 'Carpeta',
          style: 'default',
          handler: () => {
            if (!inputName.trim()) return;
            const full = currentPath === '/' ? `/${inputName}` : `${currentPath}/${inputName}`;
            setFileSystem(prev => ({
              ...prev,
              [full]: {
                name: inputName,
                isDir: true,
                permissions: 'drwxr-xr-x',
                modifiedDate: new Date().toISOString().slice(0, 16).replace('T', ' ')
              }
            }));
            addLog('NSFileManager', `createDirectoryAtPath: @"${full}" withIntermediateDirectories:YES`, 'success');
            showAlert('Carpeta Creada', `Se creó la carpeta "${inputName}".`);
          }
        },
        {
          title: 'Archivo',
          style: 'default',
          handler: () => {
            if (!inputName.trim()) return;
            const full = currentPath === '/' ? `/${inputName}` : `${currentPath}/${inputName}`;
            setFileSystem(prev => ({
              ...prev,
              [full]: {
                name: inputName,
                isDir: false,
                size: 128,
                type: inputName.endsWith('.plist') ? 'plist' : inputName.endsWith('.db') ? 'sqlite' : 'text',
                content: `// XITFORGE File: ${inputName}\nCreado: ${new Date().toLocaleString()}\n`,
                permissions: '-rw-r--r--',
                modifiedDate: new Date().toISOString().slice(0, 16).replace('T', ' ')
              }
            }));
            addLog('NSFileManager', `createFileAtPath: @"${full}" contents:NSData(128b)`, 'success');
            showAlert('Archivo Creado', `Se creó el archivo "${inputName}".`);
          }
        },
        {
          title: 'Cancelar',
          style: 'cancel',
          handler: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
        }
      ]
    });
  };

  // Manual Path
  const handleOpenManualPath = () => {
    let typedPath = currentPath;
    setAlertConfig({
      isOpen: true,
      title: 'Ir a la ruta',
      message: 'Escribe cualquier ruta del sistema de archivos:',
      preferredStyle: 'alert',
      textFields: [
        {
          placeholder: '/var/mobile',
          defaultValue: currentPath,
          fontMonospace: true,
          onChange: (val) => { typedPath = val; }
        }
      ],
      actions: [
        {
          title: 'Ir',
          style: 'default',
          handler: () => {
            if (typedPath.trim()) {
              navigateToPath(typedPath.trim());
            }
          }
        },
        {
          title: 'Cancelar',
          style: 'cancel',
          handler: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
        }
      ]
    });
  };

  // App Container Selector
  const handleOpenAppContainers = () => {
    setAlertConfig({
      isOpen: true,
      title: 'Contenedores de Apps',
      message: 'Selecciona el directorio de aplicaciones:',
      preferredStyle: 'actionSheet',
      actions: [
        {
          title: '/var/mobile/Containers/Data/Application',
          style: 'default',
          handler: () => navigateToPath('/var/mobile/Containers/Data/Application')
        },
        {
          title: '/var/containers/Bundle/Application',
          style: 'default',
          handler: () => navigateToPath('/var/containers/Bundle/Application')
        },
        {
          title: 'Free Fire (com.dts.freefireth)',
          style: 'default',
          handler: () => {
            addLog('Motor', 'MCMFilzaDataContainerPath(@"com.dts.freefireth") resuelto.', 'success');
            navigateToPath('/var/mobile/Containers/Data/Application/3B9F2A1C-9E40-4C5A-85C1-37DB53A47C10');
          }
        },
        {
          title: 'Escribir Bundle ID manual...',
          style: 'default',
          handler: () => handleOpenManualBundleId()
        },
        {
          title: 'Cancelar',
          style: 'cancel',
          handler: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
        }
      ]
    });
  };

  const handleOpenManualBundleId = () => {
    let typedBundle = '';
    setAlertConfig({
      isOpen: true,
      title: 'Bundle ID',
      message: 'Escribe el bundle ID de la app instalada (ej: com.dts.freefireth)',
      preferredStyle: 'alert',
      textFields: [
        {
          placeholder: 'com.dts.freefireth',
          defaultValue: '',
          fontMonospace: true,
          onChange: (val) => { typedBundle = val; }
        }
      ],
      actions: [
        {
          title: 'Abrir',
          style: 'default',
          handler: () => {
            if (typedBundle.trim()) {
              addLog('Motor', `MCMFilzaDataContainerPath(@"${typedBundle.trim()}") -> /var/mobile/Containers/Data/Application`, 'info');
              navigateToPath('/var/mobile/Containers/Data/Application');
              showAlert('Contenedor Localizado', `Bypass MCMFilza resuelto para ${typedBundle.trim()}.`);
            }
          }
        },
        {
          title: 'Cancelar',
          style: 'cancel',
          handler: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
        }
      ]
    });
  };

  const handleCleanTemp = () => {
    const keysToRemove = Object.keys(fileSystem).filter(k => k.startsWith('/tmp/'));
    const newFs = { ...fileSystem };
    keysToRemove.forEach(k => delete newFs[k]);
    setFileSystem(newFs);
    addLog('NSFileManager', `Limpieza de /tmp completada. Se liberaron ${keysToRemove.length || 4} archivos temporales.`, 'warn');
    showAlert('Limpieza Completada', `Se eliminaron ${keysToRemove.length || 4} archivos temporales de /tmp.`);
  };

  // Tools Sheet
  const handleOpenTools = () => {
    setAlertConfig({
      isOpen: true,
      title: '🛠️ XITFORGE • Herramientas',
      message: 'Opciones del sistema y acceso a contenedores:',
      preferredStyle: 'actionSheet',
      actions: [
        {
          title: '📦 Explorar Contenedores de Apps (/Containers)',
          style: 'default',
          handler: () => handleOpenAppContainers()
        },
        {
          title: '⚡ Acceso Rápido: Free Fire (com.dts.freefireth)',
          style: 'default',
          handler: () => navigateToPath('/var/mobile/Containers/Data/Application/3B9F2A1C-9E40-4C5A-85C1-37DB53A47C10')
        },
        {
          title: '📂 Ir a Raíz (/)',
          style: 'default',
          handler: () => navigateToPath('/')
        },
        {
          title: '📱 Ir a Carpeta Mobile (/var/mobile)',
          style: 'default',
          handler: () => navigateToPath('/var/mobile')
        },
        {
          title: '🧹 Limpiar Temporales (/tmp)',
          style: 'default',
          handler: () => handleCleanTemp()
        },
        {
          title: 'Cancelar',
          style: 'cancel',
          handler: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
        }
      ]
    });
  };

  // Settings Sheet
  const handleOpenSettings = () => {
    const shieldStatus = antiCapturaActive ? '🛡️ ACTIVO (Bloquea Fotos y Videos)' : 'DESACTIVADO';
    const msg = `⚙️ XITFORGE UNRESTRICTED v2.0\n• Licencia: Activa (${licenseType})\n• HWID: DEV-XIT9-8B92-F401-2026\n• Anti-Captura/Grabación: ${shieldStatus}\n• Motor MCMFilza: ACTIVO`;

    setAlertConfig({
      isOpen: true,
      title: '⚙️ Ajustes del Sistema',
      message: msg,
      preferredStyle: 'actionSheet',
      actions: [
        {
          title: antiCapturaActive
            ? '🛡️ Desactivar Anti-Captura / Grabación'
            : '🛡️ Activar Anti-Captura / Grabación (Modo Oculto)',
          style: 'default',
          handler: () => {
            const next = !antiCapturaActive;
            setAntiCapturaActive(next);
            addLog('ScreenShieldManager', `antiCapturaHabilitado = ${next ? 1 : 0}`, next ? 'warn' : 'info');
            if (next) {
              showAlert(
                '🛡️ Anti-Captura Activado',
                'Cuando alguien tome captura de pantalla o grabe video dentro de XITFORGE, la pantalla se ocultará automáticamente en negro.'
              );
            } else {
              showAlert('Anti-Captura Desactivado', 'Las capturas y grabaciones ahora son visibles normalmente.');
            }
          }
        },
        {
          title: '🧹 Limpiar Caché y Temporales (/tmp)',
          style: 'default',
          handler: () => handleCleanTemp()
        },
        {
          title: '⚡ Re-sincronizar Motor MCMFilza',
          style: 'default',
          handler: () => {
            addLog('Motor', 'asegurarMotor() ejecutado. Conectores dlsym re-sincronizados.', 'success');
            showAlert('Motor Sincronizado', 'El bypass de sandbox y MCMFilza se encuentran activos.');
          }
        },
        {
          title: '🔑 Cambiar / Activar Otra Key',
          style: 'default',
          handler: () => {
            let newKey = '';
            setAlertConfig({
              isOpen: true,
              title: 'Cambiar Key',
              message: 'Ingresa tu código de licencia XITFORGE:',
              preferredStyle: 'alert',
              textFields: [
                {
                  placeholder: 'XXXX-XXXX-XXXX-XXXX',
                  defaultValue: activeKey,
                  fontMonospace: true,
                  onChange: (val) => { newKey = val; }
                }
              ],
              actions: [
                {
                  title: 'Activar',
                  style: 'default',
                  handler: () => {
                    handleActivateKey(newKey);
                  }
                },
                {
                  title: 'Cancelar',
                  style: 'cancel',
                  handler: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
                }
              ]
            });
          }
        },
        {
          title: '🚪 Cerrar Sesión (Volver a Pantalla de Key)',
          style: 'destructive',
          handler: () => {
            addLog('KeyManager', 'desactivarKey() -> Sesión cerrada.', 'warn');
            setIsUnlocked(false);
          }
        },
        {
          title: 'Cerrar',
          style: 'cancel',
          handler: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
        }
      ]
    });
  };

  // Diagnostic Runner from Console
  const handleRunDiagnostic = (action: string) => {
    if (action === 'asegurarMotor') {
      addLog('Motor', '[Motor asegurarMotor] -> MCMFilzaStart OK (pid 418)', 'success');
      showAlert('Diagnóstico de Motor', 'Motor MCMFilza verificado con bypass activo.');
    } else if (action === 'verificarLicencia') {
      addLog('KeyManager', `[KeyManager isKeyValida] -> YES (${licenseType})`, 'success');
      showAlert('Estado de Licencia', `Licencia activa: ${licenseType}`);
    } else if (action === 'testScreenShield') {
      addLog('ScreenShieldManager', 'Simulando notificación UIScreenCapturedDidChangeNotification', 'warn');
      setIsScreenRecordingSimulated(true);
      setTimeout(() => setIsScreenRecordingSimulated(false), 2500);
    }
  };

  // Filter items in current directory
  const currentDirectoryItems = useMemo(() => {
    const prefix = currentPath === '/' ? '/' : `${currentPath}/`;
    const paths = Object.keys(fileSystem);

    const directChildren = paths.filter(p => {
      if (p === currentPath) return false;
      if (!p.startsWith(prefix)) return false;
      const sub = p.slice(prefix.length);
      return !sub.includes('/');
    });

    let items = directChildren.map(p => ({
      path: p,
      name: p.slice(prefix.length),
      item: fileSystem[p]
    }));

    // Category filter
    if (activeFilterCategory === 'folders') {
      items = items.filter(i => i.item.isDir);
    } else if (activeFilterCategory === 'databases') {
      items = items.filter(i => i.name.endsWith('.db') || i.name.endsWith('.sqlite'));
    } else if (activeFilterCategory === 'plists') {
      items = items.filter(i => i.name.endsWith('.plist'));
    } else if (activeFilterCategory === 'binaries') {
      items = items.filter(i => i.name.endsWith('.dylib') || i.name.endsWith('.dat') || i.name.endsWith('.bin'));
    } else if (activeFilterCategory === 'apps') {
      items = items.filter(i => i.path.includes('Containers') || i.path.includes('Bundle') || i.name.includes('App') || i.item.isDir);
    }

    // Sort folders first, then files
    items.sort((a, b) => {
      if (a.item.isDir && !b.item.isDir) return -1;
      if (!a.item.isDir && b.item.isDir) return 1;
      return a.name.localeCompare(b.name);
    });

    // Apply search filter (UISearchController)
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q));
  }, [currentPath, fileSystem, searchQuery, activeFilterCategory]);

  // Convert current directory items to UIKit table section items with Apple HIG Squircles
  const tableSection: UIKitTableSection = useMemo(() => {
    const items: UIKitTableCellItem[] = currentDirectoryItems.map(({ path, name, item }) => {
      let icon = <FileText className="w-[18px] h-[18px]" />;
      let iconColor = '#8E8E93';
      let iconBg = 'rgba(142, 142, 147, 0.15)';

      if (item.isDir) {
        icon = <Folder className="w-[18px] h-[18px] fill-current" />;
        iconColor = '#30D158';
        iconBg = 'rgba(48, 209, 88, 0.15)';
      } else {
        const ext = name.split('.').pop()?.toLowerCase() || '';
        if (ext === 'plist') {
          icon = <FileCode className="w-[18px] h-[18px]" />;
          iconColor = '#FF9F0A';
          iconBg = 'rgba(255, 159, 10, 0.15)';
        } else if (ext === 'sqlite' || ext === 'db') {
          icon = <Database className="w-[18px] h-[18px]" />;
          iconColor = '#BF5AF2';
          iconBg = 'rgba(191, 90, 242, 0.15)';
        } else if (ext === 'dylib' || ext === 'dat' || ext === 'bin') {
          icon = <Cpu className="w-[18px] h-[18px]" />;
          iconColor = '#30D158';
          iconBg = 'rgba(48, 209, 88, 0.15)';
        } else if (['png', 'jpg', 'jpeg', 'car'].includes(ext)) {
          icon = <ImageIcon className="w-[18px] h-[18px]" />;
          iconColor = '#64D2FF';
          iconBg = 'rgba(100, 210, 255, 0.15)';
        }
      }

      return {
        id: path,
        title: name,
        subtitle: item.isDir ? 'Carpeta de archivos' : `${formatFileSize(item.size || 1024)} • ${item.permissions || '-rw-r--r--'}`,
        icon,
        iconTintColor: iconColor,
        iconBgColor: iconBg,
        accessoryType: item.isDir ? 'disclosure' : 'none',
        isDeletable: true,
        onClick: () => {
          if (item.isDir) {
            navigateToPath(path);
          } else {
            addLog('VisorArchivoVC', `Abriendo archivo: @"${path}" (${item.type || 'text'})`, 'info');
            setActiveFile({ path, item });
          }
        },
        onDelete: () => {
          const newFs = { ...fileSystem };
          delete newFs[path];
          setFileSystem(newFs);
          addLog('NSFileManager', `removeItemAtPath: @"${path}"`, 'warn');
        }
      };
    });

    return {
      header: `${currentDirectoryItems.length} ELEMENTOS`,
      items
    };
  }, [currentDirectoryItems, fileSystem, addLog]);

  // Breadcrumbs elements
  const breadcrumbSegments = useMemo(() => {
    if (currentPath === '/') return [{ label: '/', path: '/' }];
    const parts = currentPath.split('/').filter(Boolean);
    const result = [{ label: '/', path: '/' }];
    let acc = '';
    for (const p of parts) {
      acc += `/${p}`;
      result.push({ label: p, path: acc });
    }
    return result;
  }, [currentPath]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col p-2 sm:p-4 lg:p-6 font-sans selection:bg-[#30D158]/30 selection:text-[#30D158]">
      {/* Studio Header Bar */}
      <header className="w-full max-w-7xl mx-auto mb-4 bg-[#1C1C1E]/90 backdrop-blur-2xl border border-white/10 rounded-[20px] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-b from-[#1C3D28] to-[#0A1F13] border border-[#30D158]/40 flex items-center justify-center shadow-[0_4px_16px_rgba(48,209,88,0.2)]">
            <Flame className="w-5 h-5 text-[#30D158]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold tracking-[-0.4px] text-white">XITFORGE PRO STUDIO</span>
              <span className="text-[11px] font-mono font-semibold bg-[#30D158]/15 text-[#30D158] px-2 py-0.5 rounded-full border border-[#30D158]/30">
                v2.0 UNRESTRICTED
              </span>
            </div>
            <p className="text-[12px] text-[#8E8E93]">
              UIKit Nativo (Objective-C) • iOS 14.0 a iOS 27 Beta 4
            </p>
          </div>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex items-center gap-2">
          {/* Quick Screen Shield Trigger */}
          <button
            onClick={() => {
              const next = !antiCapturaActive;
              setAntiCapturaActive(next);
              addLog('ScreenShieldManager', `antiCapturaHabilitado = ${next ? 1 : 0}`, next ? 'warn' : 'info');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-medium border transition-all ${
              antiCapturaActive
                ? 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/50 shadow-[0_0_12px_rgba(48,209,88,0.2)]'
                : 'bg-[#2C2C2E] text-[#8E8E93] border-white/5 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Anti-Captura: {antiCapturaActive ? 'ACTIVO' : 'OFF'}</span>
          </button>

          {/* Layout Mode Switcher */}
          <div className="flex items-center bg-[#2C2C2E] p-1 rounded-[12px] border border-white/5">
            <button
              onClick={() => setStudioLayout('studio')}
              className={`flex items-center gap-1 px-3 py-1 text-[13px] font-medium rounded-[8px] transition-colors ${
                studioLayout === 'studio'
                  ? 'bg-[#636366] text-white shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Estudio Split</span>
            </button>
            <button
              onClick={() => setStudioLayout('deviceOnly')}
              className={`flex items-center gap-1 px-3 py-1 text-[13px] font-medium rounded-[8px] transition-colors ${
                studioLayout === 'deviceOnly'
                  ? 'bg-[#636366] text-white shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Solo iPhone</span>
            </button>
            <button
              onClick={() => setStudioLayout('consoleOnly')}
              className={`flex items-center gap-1 px-3 py-1 text-[13px] font-medium rounded-[8px] transition-colors ${
                studioLayout === 'consoleOnly'
                  ? 'bg-[#636366] text-white shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xcode Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Native iOS Device Simulation */}
        {(studioLayout === 'studio' || studioLayout === 'deviceOnly') && (
          <div className={`${studioLayout === 'studio' ? 'lg:col-span-6 xl:col-span-5' : 'lg:col-span-12'} flex justify-center`}>
            <UIKitDeviceFrame
              isShieldActive={antiCapturaActive && isScreenRecordingSimulated}
              licenseLabel={licenseType}
              currentPath={currentPath}
            >
              {/* Screen Shield Blackout Simulation */}
              {antiCapturaActive && isScreenRecordingSimulated ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black text-center animate-in fade-in">
                  <ShieldAlert className="w-16 h-16 text-[#FF453A] mb-4 animate-bounce" />
                  <h3 className="text-lg font-bold font-mono text-white tracking-wider">
                    CONTENIDO PROTEGIDO
                  </h3>
                  <p className="text-xs text-[#8E8E93] mt-2 max-w-[260px] leading-relaxed">
                    La grabación y captura de pantalla están bloqueadas por XITFORGE mediante la capa de hardware isSecureTextEntry.
                  </p>
                  <div className="mt-6 text-[10px] font-mono text-[#636366]">
                    ScreenShieldManager • UIScreenCapturedDidChangeNotification
                  </div>
                </div>
              ) : !isUnlocked ? (
                /* Screen 1: LoginKeyViewController.m */
                <UIKitLoginKeyView
                  onActivate={handleActivateKey}
                  initialError={keyError}
                />
              ) : activeFile ? (
                /* Screen 2: VisorArchivoVC */
                <UIKitFileViewer
                  filePath={activeFile.path}
                  fileItem={activeFile.item}
                  onBack={() => setActiveFile(null)}
                  onSaveContent={(newContent) => {
                    setFileSystem(prev => ({
                      ...prev,
                      [activeFile.path]: {
                        ...activeFile.item,
                        content: newContent,
                        size: newContent.length
                      }
                    }));
                    addLog('VisorArchivoVC', `writeToFile:@"${activeFile.path}" atomically:YES (${newContent.length}b)`, 'success');
                  }}
                />
              ) : (
                /* Screen 3: ViewController.m Main File Manager */
                <div className="flex-1 flex flex-col bg-[#000000] overflow-hidden justify-between">
                  {/* UINavigationBar */}
                  <UIKitNavigationBar
                    title={currentPath === '/' ? '/' : currentPath.split('/').pop() || '/'}
                    subtitle={currentPath}
                    onBack={pathHistory.length > 0 ? handleBack : undefined}
                    backButtonTitle={
                      pathHistory.length > 0
                        ? pathHistory[pathHistory.length - 1].split('/').pop() || 'Atrás'
                        : undefined
                    }
                    rightBarButtonItems={[
                      {
                        id: 'new',
                        icon: <Plus className="w-5 h-5 stroke-[2.5]" />,
                        onClick: handleOpenCreateModal
                      },
                      {
                        id: 'tools',
                        icon: <Zap className="w-5 h-5 fill-[#30D158]" />,
                        onClick: handleOpenTools
                      }
                    ]}
                    searchBar={
                      <div className="space-y-2">
                        {/* iOS 18 Native Pill Search Bar */}
                        <div className="relative flex items-center bg-[#767680]/24 border border-white/5 rounded-[10px] px-3 py-1.5 focus-within:bg-[#767680]/30 transition-all">
                          <Search className="w-4 h-4 text-[#8E8E93] mr-2 shrink-0" />
                          <input
                            type="text"
                            placeholder="Buscar"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-[15px] text-white placeholder:text-[#8E8E93] focus:outline-none"
                          />
                          {searchQuery && (
                            <button 
                              onClick={() => setSearchQuery('')} 
                              className="w-4 h-4 rounded-full bg-[#8E8E93] flex items-center justify-center text-black"
                            >
                              <X className="w-3 h-3 stroke-[3]" />
                            </button>
                          )}
                        </div>

                        {/* Category Filter Chips Bar (iOS Capsule Style) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[12px] no-scrollbar">
                          {[
                            { id: 'all', label: 'Todos' },
                            { id: 'folders', label: 'Carpetas' },
                            { id: 'apps', label: 'Apps' },
                            { id: 'databases', label: 'SQLite' },
                            { id: 'plists', label: 'Plists' },
                            { id: 'binaries', label: 'Binarios' }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveFilterCategory(tab.id as any)}
                              className={`px-3 py-1 rounded-full whitespace-nowrap text-[12px] font-medium transition-all ${
                                activeFilterCategory === tab.id
                                  ? 'bg-[#30D158] text-black font-semibold shadow-sm'
                                  : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-white border border-white/5'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    }
                  />

                  {/* Interactive Breadcrumb Bar */}
                  <div className="px-3.5 py-1.5 bg-[#121214] border-b border-[#38383A]/40 flex items-center gap-1.5 text-[12px] font-mono text-[#8E8E93] overflow-x-auto shrink-0">
                    <span className="text-[#636366]">Ruta:</span>
                    {breadcrumbSegments.map((seg, idx) => (
                      <React.Fragment key={seg.path}>
                        {idx > 0 && <span className="text-[#38383A]">/</span>}
                        <button
                          onClick={() => navigateToPath(seg.path)}
                          className={`hover:text-[#30D158] transition-colors truncate max-w-[120px] ${
                            idx === breadcrumbSegments.length - 1 ? 'text-[#30D158] font-bold' : ''
                          }`}
                        >
                          {seg.label}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Optional Storage Bar */}
                  {showStorageBar && <UIKitStorageBar />}

                  {/* UITableView / Grid View */}
                  <div className="flex-1 overflow-y-auto">
                    {viewMode === 'list' ? (
                      <UIKitTableView
                        style="plain"
                        sections={[tableSection]}
                        emptyMessage="Directorio vacío o sin resultados para el filtro actual."
                      />
                    ) : (
                      <div className="p-3.5 grid grid-cols-3 gap-3 text-center">
                        {currentDirectoryItems.map(({ path, name, item }) => (
                          <div
                            key={path}
                            onClick={() => {
                              if (item.isDir) {
                                navigateToPath(path);
                              } else {
                                setActiveFile({ path, item });
                              }
                            }}
                            className="flex flex-col items-center p-3 rounded-[16px] bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/5 active:scale-95 transition-all cursor-pointer group shadow-sm"
                          >
                            <div className="w-12 h-12 rounded-[12px] bg-[#2C2C2E] group-hover:bg-[#3A3A3C] flex items-center justify-center mb-1.5 transition-colors">
                              {item.isDir ? (
                                <Folder className="w-6 h-6 text-[#30D158] fill-[#30D158]/20" />
                              ) : name.endsWith('.plist') ? (
                                <FileCode className="w-6 h-6 text-[#FF9F0A]" />
                              ) : name.endsWith('.db') || name.endsWith('.sqlite') ? (
                                <Database className="w-6 h-6 text-[#BF5AF2]" />
                              ) : (
                                <FileText className="w-6 h-6 text-[#8E8E93]" />
                              )}
                            </div>
                            <span className="text-[13px] text-white font-medium truncate w-full">{name}</span>
                            <span className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                              {item.isDir ? 'Carpeta' : formatFileSize(item.size || 1024)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* UIToolbar (Native iOS Bottom Bar) */}
                  <div className="bg-[#161618]/90 backdrop-blur-2xl border-t border-[#38383A]/50 px-4 py-2.5 flex items-center justify-between shrink-0">
                    <button
                      onClick={handleOpenManualPath}
                      className="flex items-center gap-1.5 text-[15px] font-normal text-[#30D158] active:opacity-40 transition-opacity"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Ir a ruta</span>
                    </button>

                    <div className="flex items-center gap-1.5 bg-[#2C2C2E] p-0.5 rounded-[9px] border border-white/5">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-[7px] transition-colors ${
                          viewMode === 'list' ? 'bg-[#636366] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white'
                        }`}
                        title="Vista Lista"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-[7px] transition-colors ${
                          viewMode === 'grid' ? 'bg-[#636366] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white'
                        }`}
                        title="Vista Cuadrícula"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowStorageBar(!showStorageBar)}
                        className={`p-1.5 rounded-[7px] transition-colors ${
                          showStorageBar ? 'bg-[#30D158]/20 text-[#30D158]' : 'text-[#8E8E93] hover:text-white'
                        }`}
                        title="Almacenamiento"
                      >
                        <HardDrive className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={handleOpenSettings}
                      className="flex items-center gap-1 text-[15px] font-normal text-[#30D158] active:opacity-40 transition-opacity"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Ajustes</span>
                    </button>
                  </div>
                </div>
              )}
            </UIKitDeviceFrame>
          </div>
        )}

        {/* Right Side: Professional Xcode Console & Objective-C Inspector */}
        {(studioLayout === 'studio' || studioLayout === 'consoleOnly') && (
          <div className={`${studioLayout === 'studio' ? 'lg:col-span-6 xl:col-span-7 h-[850px]' : 'lg:col-span-12 h-[800px]'}`}>
            <XcodeConsoleInspector
              logs={logs}
              onClearLogs={() => setLogs([])}
              onRunDiagnostic={handleRunDiagnostic}
            />
          </div>
        )}
      </main>

      {/* UIAlertController Modal Dialog / ActionSheet */}
      <UIKitAlertController
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        preferredStyle={alertConfig.preferredStyle}
        actions={alertConfig.actions}
        textFields={alertConfig.textFields}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
