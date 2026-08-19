import React, { useState, useEffect, useRef } from 'react';
import { Terminal, FileCode, Play, Trash2, Cpu, Check, Copy, Activity, Shield, Sparkles, Globe, Send } from 'lucide-react';

export interface ConsoleLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  tag: string;
  message: string;
}

interface XcodeConsoleInspectorProps {
  logs: ConsoleLogEntry[];
  onClearLogs: () => void;
  onRunDiagnostic?: (action: string) => void;
}

const UI_HTML_SNIPPET = `<!-- Contratos del HTML con el motor nativo de iOS (WebVC / WKWebView) -->
<script>
  function pedir(accion, parametro) {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.motor) {
      window.webkit.messageHandlers.motor.postMessage({ accion: accion, parametro: parametro });
    } else {
      return bridgeSimulado(accion, parametro);
    }
  }

  function recibir(accion, respuesta) {
    console.log("[Bridge Motor] recibir:", accion, respuesta);
    if (accion === "apps") { renderizarApps(respuesta); }
    else if (accion === "ruta") { if (respuesta && respuesta.ruta) navegarA(respuesta.ruta); }
    else if (accion === "listar") { itemsDirectorio = respuesta || []; renderizarTabla(); }
    else if (accion === "leer") { mostrarContenidoArchivo(respuesta); }
    else if (accion === "estado") { document.getElementById("itemCountLabel").innerText = "Motor " + respuesta; }
  }
</script>`;

const OBJC_SOURCE_FILES: { [key: string]: { name: string; target: string; code: string } } = {
  'ViewController.m': {
    name: 'ViewController.m',
    target: 'UIKit / File Manager Controller',
    code: `//
//  ViewController.m - XITFORGE Professional File Manager
//  iOS 14.0 - iOS 27 Beta 4 Support
//
#import "ViewController.h"
#import "Motor.h"
#import "KeyManager.h"
#import "LoginKeyViewController.h"
#import "ScreenShieldManager.h"

@interface ViewController () <UITableViewDataSource, UITableViewDelegate, UISearchResultsUpdating>
@property (nonatomic, strong) UITableView *tv;
@property (nonatomic, strong) NSArray *elementos;
@property (nonatomic, strong) NSArray *elementosFiltrados;
@property (nonatomic, strong) NSString *rutaActual;
@property (nonatomic, strong) UISearchController *searchController;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [Motor asegurarMotor];
    self.view.backgroundColor = [UIColor blackColor];
    
    // UINavigationBar + UIBarButtonItems
    UIBarButtonItem *btnAdd = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd 
                                                                            target:self action:@selector(crearNuevo)];
    UIBarButtonItem *btnBolt = [[UIBarButtonItem alloc] initWithImage:[UIImage systemImageNamed:@"bolt.fill"] 
                                                                style:UIBarButtonItemStylePlain 
                                                               target:self action:@selector(abrirHerramientas)];
    self.navigationItem.rightBarButtonItems = @[btnAdd, btnBolt];
    
    // UISearchController
    self.searchController = [[UISearchController alloc] initWithSearchResultsController:nil];
    self.searchController.searchResultsUpdater = self;
    self.searchController.obscuresBackgroundDuringPresentation = NO;
    self.navigationItem.searchController = self.searchController;
    
    // UITableView
    self.tv = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStylePlain];
    self.tv.backgroundColor = [UIColor blackColor];
    self.tv.separatorColor = [UIColor colorWithWhite:0.15 alpha:1.0];
    self.tv.dataSource = self;
    self.tv.delegate = self;
    [self.view addSubview:self.tv];
    
    [self cargarDirectorio];
}

- (void)abrirHerramientas {
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"🛠️ XITFORGE • Herramientas"
                                                               message:@"Opciones del sistema y bypass:"
                                                        preferredStyle:UIAlertControllerStyleActionSheet];
    [a addAction:[UIAlertAction actionWithTitle:@"📦 Explorar Contenedores (/Containers)" 
                                          style:UIAlertActionStyleDefault 
                                        handler:^(UIAlertAction *act) { [self abrirSelectorApps]; }]];
    [a addAction:[UIAlertAction actionWithTitle:@"⚡ Acceso Rápido: Free Fire" 
                                          style:UIAlertActionStyleDefault 
                                        handler:^(UIAlertAction *act) { [self abrirBundleId:@"com.dts.freefireth"]; }]];
    [a addAction:[UIAlertAction actionWithTitle:@"Cancelar" style:UIAlertActionStyleCancel handler:nil]];
    [self presentViewController:a animated:YES completion:nil];
}
@end`
  },
  'Motor.m': {
    name: 'Motor.m',
    target: 'Sandbox Bypass & MCMFilza Engine',
    code: `//
//  Motor.m - Dynamic Loader & Container Resolver
//
#import "Motor.h"
#import <dlfcn.h>

@implementation Motor

+ (void)asegurarMotor {
    static BOOL on = NO;
    if (on) return;
    on = YES;
    
    void (*tweakInit)(void) = dlsym(RTLD_DEFAULT, "TweakInit");
    int (*start)(void) = dlsym(RTLD_DEFAULT, "MCMFilzaStart");
    void (*setUnres)(int) = dlsym(RTLD_DEFAULT, "MCMFilzaSetUnrestrictedFilesystem");
    
    if (tweakInit) tweakInit();
    if (start) start();
    if (setUnres) setUnres(1);
    
    NSLog(@"[MCMFilza] Motor asegurado con éxito. Bypass activo.");
}

+ (NSString *)containerPathForBundleId:(NSString *)bundleId {
    [self asegurarMotor];
    NSString *(*dataPath)(NSString *) = dlsym(RTLD_DEFAULT, "MCMFilzaDataContainerPath");
    return dataPath ? dataPath(bundleId) : nil;
}
@end`
  },
  'ScreenShieldManager.m': {
    name: 'ScreenShieldManager.m',
    target: 'Anti-Screen Capture / Blackout',
    code: `//
//  ScreenShieldManager.m - Hardware Graphic Buffer Protector
//
#import "ScreenShieldManager.h"

@implementation ScreenShieldManager

+ (instancetype)sharedManager {
    static ScreenShieldManager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[ScreenShieldManager alloc] init];
    });
    return instance;
}

- (void)habilitarCapaSeguraiOS {
    if (self.secureTextField) return;
    self.secureTextField = [[UITextField alloc] init];
    self.secureTextField.secureTextEntry = YES;
    self.secureTextField.userInteractionEnabled = NO;
    [self.mainWindow addSubview:self.secureTextField];
}

- (void)verificarGrabacionActiva {
    BOOL estaGrabando = [UIScreen mainScreen].isCaptured;
    if (estaGrabando && self.antiCapturaHabilitado) {
        [self mostrarOverlayEscudo];
    } else {
        [self removerOverlayEscudo];
    }
}
@end`
  },
  'KeyManager.m': {
    name: 'KeyManager.m',
    target: 'Cryptographic License Validator',
    code: `//
//  KeyManager.m - License & Hardware Token Validator
//
#import "KeyManager.h"

@implementation KeyManager

- (NSString *)deviceId {
    NSString *u = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
    return [u substringToIndex:MIN((NSUInteger)8, u.length)];
}

- (BOOL)activarKey:(NSString *)key error:(NSString **)errorMsg {
    NSString *limpia = [[key stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] uppercaseString];
    
    if ([limpia hasPrefix:@"VIP-"] || [limpia isEqualToString:@"MIFILZA-VIP-2026"]) {
        [[NSUserDefaults standardUserDefaults] setObject:limpia forKey:@"mifilza_license_key"];
        [[NSUserDefaults standardUserDefaults] setObject:@"VIP Permanente" forKey:@"mifilza_license_tipo"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        return YES;
    }
    
    return NO;
}
@end`
  }
};

export const XcodeConsoleInspector: React.FC<XcodeConsoleInspectorProps> = ({
  logs,
  onClearLogs,
  onRunDiagnostic
}) => {
  const [selectedTab, setSelectedTab] = useState<'console' | 'code' | 'uihtml' | 'telemetry'>('console');
  const [selectedFile, setSelectedFile] = useState<string>('ViewController.m');
  const [copied, setCopied] = useState(false);
  const [customAction, setCustomAction] = useState('apps');
  const [customParam, setCustomParam] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendPedirTest = () => {
    if (customAction === 'apps') {
      onRunDiagnostic?.('pedirApps');
    } else if (customAction === 'ruta') {
      onRunDiagnostic?.('pedirRuta');
    } else if (customAction === 'estado') {
      onRunDiagnostic?.('pedirEstado');
    }
  };

  return (
    <div className="w-full h-full bg-[#0a0a0d] rounded-3xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-200">
      {/* Xcode Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {/* macOS window control buttons */}
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setSelectedTab('console')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedTab === 'console'
                  ? 'bg-zinc-800 text-[#30D158] shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>NSLog Console</span>
            </button>

            <button
              onClick={() => setSelectedTab('uihtml')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedTab === 'uihtml'
                  ? 'bg-zinc-800 text-[#30D158] shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>ui.html Bridge</span>
            </button>

            <button
              onClick={() => setSelectedTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedTab === 'code'
                  ? 'bg-zinc-800 text-[#30D158] shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Objective-C Sources</span>
            </button>

            <button
              onClick={() => setSelectedTab('telemetry')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedTab === 'telemetry'
                  ? 'bg-zinc-800 text-[#30D158] shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Hardware Telemetry</span>
            </button>
          </div>
        </div>

        {/* Action button */}
        {selectedTab === 'console' ? (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-red-400 p-1 rounded transition-colors"
            title="Limpiar consola"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        ) : selectedTab === 'code' ? (
          <button
            onClick={() => handleCopyCode(OBJC_SOURCE_FILES[selectedFile].code)}
            className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded hover:bg-emerald-900/60 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        ) : selectedTab === 'uihtml' ? (
          <button
            onClick={() => handleCopyCode(UI_HTML_SNIPPET)}
            className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded hover:bg-emerald-900/60 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copiado' : 'Copiar Script'}</span>
          </button>
        ) : null}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* TAB 1: Console */}
        {selectedTab === 'console' && (
          <div className="flex-1 flex flex-col bg-[#050508] p-3 overflow-hidden font-mono text-xs">
            {/* Quick Diagnostic Triggers */}
            <div className="flex flex-wrap items-center gap-2 pb-2.5 mb-2 border-b border-zinc-800/80 text-[11px]">
              <span className="text-zinc-500">Ejecutar función Objective-C:</span>
              <button
                onClick={() => onRunDiagnostic?.('asegurarMotor')}
                className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-emerald-400 border border-zinc-700/60"
              >
                [Motor asegurarMotor]
              </button>
              <button
                onClick={() => onRunDiagnostic?.('verificarLicencia')}
                className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-amber-400 border border-zinc-700/60"
              >
                [KeyManager isKeyValida]
              </button>
              <button
                onClick={() => onRunDiagnostic?.('testScreenShield')}
                className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-cyan-400 border border-zinc-700/60"
              >
                [ScreenShieldManager notify]
              </button>
            </div>

            {/* Scrollable Logs Output */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 select-text">
              {logs.map((l) => (
                <div key={l.id} className="leading-relaxed flex items-start gap-2 text-[11px]">
                  <span className="text-zinc-600 shrink-0 select-none">{l.timestamp}</span>
                  <span
                    className={`font-semibold shrink-0 select-none ${
                      l.tag.includes('Motor')
                        ? 'text-emerald-400'
                        : l.tag.includes('Shield')
                        ? 'text-cyan-400'
                        : l.tag.includes('Key')
                        ? 'text-amber-400'
                        : 'text-purple-400'
                    }`}
                  >
                    [{l.tag}]
                  </span>
                  <span
                    className={`${
                      l.level === 'error'
                        ? 'text-red-400'
                        : l.level === 'warn'
                        ? 'text-amber-300'
                        : l.level === 'success'
                        ? 'text-emerald-300'
                        : 'text-zinc-300'
                    }`}
                  >
                    {l.message}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        )}

        {/* TAB 2: UI.HTML CONTRACT & BRIDGE */}
        {selectedTab === 'uihtml' && (
          <div className="flex-1 flex flex-col bg-[#050508] p-4 overflow-y-auto font-mono text-xs space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-[13px] font-bold text-white flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Contratos del HTML con el Motor (WKWebView Bridge)</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed mb-3">
                Tu archivo <code>ui.html</code> está guardado en <code>/ui.html</code> y <code>/MiApp/ui.html</code> listo para cargarse en WebVC. Implementa exactamente los 5 contratos del motor:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="text-emerald-400 font-bold">pedir("apps")</div>
                  <div className="text-zinc-400 text-[10px] mt-0.5">Devuelve lista de apps instaladas (nombre, bundleId, container).</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="text-emerald-400 font-bold">pedir("ruta", "bundle.id")</div>
                  <div className="text-zinc-400 text-[10px] mt-0.5">Devuelve la ruta del contenedor de la aplicación.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="text-emerald-400 font-bold">pedir("listar", ruta)</div>
                  <div className="text-zinc-400 text-[10px] mt-0.5">Devuelve archivos con nombre, tamaño, permisos y tipo.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="text-emerald-400 font-bold">pedir("leer", ruta)</div>
                  <div className="text-zinc-400 text-[10px] mt-0.5">Devuelve el contenido del archivo de texto/plist/hex.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800/80 sm:col-span-2">
                  <div className="text-emerald-400 font-bold">pedir("estado")</div>
                  <div className="text-zinc-400 text-[10px] mt-0.5">Devuelve "ACTIVO" cuando el motor MCMFilza está listo.</div>
                </div>
              </div>
            </div>

            {/* Code preview */}
            <div className="bg-black/80 rounded-2xl border border-zinc-800 p-3 overflow-auto">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
                Bloque &lt;script&gt; de ui.html (Inalterado y 100% Compatible)
              </div>
              <pre className="text-emerald-400/90 text-[11px] leading-relaxed select-text">
                {UI_HTML_SNIPPET}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: Code Sources */}
        {selectedTab === 'code' && (
          <div className="flex-1 flex flex-col bg-[#050508] overflow-hidden">
            {/* File Switcher Bar */}
            <div className="flex items-center gap-1 px-3 py-2 bg-zinc-900/60 border-b border-zinc-800 overflow-x-auto">
              {Object.keys(OBJC_SOURCE_FILES).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedFile(key)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors whitespace-nowrap ${
                    selectedFile === key
                      ? 'bg-zinc-800 text-emerald-400 font-bold border border-emerald-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Code Output with Syntax Tint */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-emerald-400/90 leading-relaxed select-text">
              <pre>{OBJC_SOURCE_FILES[selectedFile].code}</pre>
            </div>
          </div>
        )}

        {/* TAB 4: Hardware Telemetry */}
        {selectedTab === 'telemetry' && (
          <div className="flex-1 p-6 bg-[#050508] overflow-y-auto space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-2xl">
                <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Dispositivo & Chip</div>
                <div className="text-sm font-bold text-white mt-1">iPhone 16 Pro Max (A18 Pro)</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">Arquitectura: arm64e (64-bit ARM)</div>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-2xl">
                <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Sistema Operativo</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">iOS 18.3.1 (Build 22D72)</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">Kernel: Darwin 24.3.0</div>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-2xl">
                <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Sandbox Engine</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">MCMFilza Unrestricted</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">dlsym dynamic container binding: OK</div>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-2xl">
                <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Compilador LLVM</div>
                <div className="text-sm font-bold text-white mt-1">Apple Clang 16.0.0</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">Objective-C 2.0 with ARC & Modules</div>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl">
              <div className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Compatibilidad del Sistema</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                XITFORGE implementa compatibilidad estricta con todas las versiones de iOS desde iOS 14.0 hasta <strong>iOS 27 Beta 4</strong>. Todas las llamadas a contenedores de aplicaciones se realizan resolviendo de forma dinámica los identificadores de hardware mediante <code>sysctlbyname</code> y <code>uname</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
