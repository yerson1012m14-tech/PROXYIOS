import React, { useState } from 'react';
import { FileCode, Copy, Check, ChevronRight } from 'lucide-react';

const OBJC_SOURCES: { [key: string]: { name: string; desc: string; code: string } } = {
  'ViewController.m': {
    name: 'ViewController.m',
    desc: 'UITableView, VisorArchivoVC, Toolbar, ActionSheets y Motor MCMFilza',
    code: `//
//  ViewController.m - XITFORGE File Manager (UIKit Nativo)
//
#import "ViewController.h"
#import "Motor.h"
#import "KeyManager.h"
#import "ScreenShieldManager.h"

@interface ViewController () <UITableViewDataSource, UITableViewDelegate, UISearchResultsUpdating>
@property (nonatomic, strong) UITableView *tv;
@property (nonatomic, strong) NSArray *elementos;
@property (nonatomic, strong) NSString *rutaActual;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [Motor asegurarMotor];
    self.view.backgroundColor = [UIColor blackColor];
    
    // Botones superiores UIKit (+) y Rayo Motor (⚡)
    UIBarButtonItem *btnNuevo = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd 
                                                                              target:self action:@selector(crearNuevo)];
    UIBarButtonItem *btnMotor = [[UIBarButtonItem alloc] initWithImage:[UIImage systemImageNamed:@"bolt.fill"] 
                                                                 style:UIBarButtonItemStylePlain 
                                                                target:self action:@selector(abrirHerramientas)];
    self.navigationItem.rightBarButtonItems = @[btnNuevo, btnMotor];
    
    // UITableView con estilo Plain
    self.tv = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStylePlain];
    self.tv.backgroundColor = [UIColor blackColor];
    self.tv.dataSource = self;
    self.tv.delegate = self;
    [self.view addSubview:self.tv];
    
    // Toolbar Inferior: Ir a ruta + Ajustes
    [self configurarToolbarInferior];
}

- (void)abrirHerramientas {
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"🛠️ XITFORGE • Herramientas"
        message:@"Opciones del sistema y acceso a contenedores:"
        preferredStyle:UIAlertControllerStyleActionSheet];

    [a addAction:[UIAlertAction actionWithTitle:@"📦 Explorar Contenedores de Apps (/Containers)" 
                                          style:UIAlertActionStyleDefault 
                                        handler:^(UIAlertAction *act) { [self abrirSelectorApps]; }]];

    [a addAction:[UIAlertAction actionWithTitle:@"⚡ Acceso Rápido: Free Fire (com.dts.freefireth)" 
                                          style:UIAlertActionStyleDefault 
                                        handler:^(UIAlertAction *act) { [self abrirBundleId:@"com.dts.freefireth"]; }]];

    [a addAction:[UIAlertAction actionWithTitle:@"🧹 Limpiar Temporales (/tmp)" 
                                          style:UIAlertActionStyleDefault 
                                        handler:^(UIAlertAction *act) { [self limpiarTemporales]; }]];

    [a addAction:[UIAlertAction actionWithTitle:@"Cancelar" style:UIAlertActionStyleCancel handler:nil]];
    [self presentViewController:a animated:YES completion:nil];
}
@end`
  },
  'LoginKeyViewController.m': {
    name: 'LoginKeyViewController.m',
    desc: 'Sistema de activación con formato XXXX-XXXX-XXXX-XXXX y telemetría de hardware',
    code: `//
//  LoginKeyViewController.m - Sistema de Licencias XITFORGE
//
#import "LoginKeyViewController.h"
#import "KeyManager.h"
#import <sys/utsname.h>

@implementation LoginKeyViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor colorWithRed:0.03 green:0.03 blue:0.04 alpha:1.0];
    
    // Campo Key con formato XXXX-XXXX-XXXX-XXXX
    self.tfKey = [[UITextField alloc] init];
    self.tfKey.placeholder = @"XXXX-XXXX-XXXX-XXXX";
    self.tfKey.font = [UIFont fontWithName:@"Menlo-Bold" size:15];
    self.tfKey.textColor = [UIColor colorWithRed:0.0 green:0.95 blue:0.5 alpha:1.0];
    
    // Botón Portapapeles (doc.on.doc)
    [self.btnPegar setImage:[UIImage systemImageNamed:@"doc.on.doc"] forState:UIControlStateNormal];
    
    // Validación de hardware
    NSString *modelo = obtenerModeloDispositivo(); // ej. iPhone 16 Pro Max
    BOOL compatible = verificarCompatibilidad([UIDevice currentDevice].systemVersion);
}
@end`
  },
  'ScreenShieldManager.m': {
    name: 'ScreenShieldManager.m',
    desc: 'Anti-Captura y Anti-Grabación mediante capa segura UITextField en compositor gráfico',
    code: `//
//  ScreenShieldManager.m - Protección de pantalla nativa
//
#import "ScreenShieldManager.h"

@implementation ScreenShieldManager

- (void)habilitarCapaSeguraiOS {
    // Técnica de capa segura de iOS (isSecureTextEntry)
    // El chip de Apple censura el contenido en grabaciones y capturas
    if (self.secureTextField) return;
    self.secureTextField = [[UITextField alloc] init];
    self.secureTextField.secureTextEntry = YES;
    self.secureTextField.userInteractionEnabled = NO;
    [self.mainWindow addSubview:self.secureTextField];
}

- (void)mostrarOverlayEscudo {
    // Blackout automático cuando se detecta UIScreenCapturedDidChangeNotification
    self.shieldOverlayView = [[UIView alloc] initWithFrame:self.mainWindow.bounds];
    self.shieldOverlayView.backgroundColor = [UIColor blackColor];
    // Mensaje: CONTENIDO PROTEGIDO
}
@end`
  },
  'Motor.m': {
    name: 'Motor.m',
    desc: 'Bypass de sandbox iOS vía MCMFilza y dlsym',
    code: `//
//  Motor.m - Bypass de Contenedores y File System
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
}

+ (NSString *)containerPathForBundleId:(NSString *)bundleId {
    [self asegurarMotor];
    NSString *(*dataPath)(NSString *) = dlsym(RTLD_DEFAULT, "MCMFilzaDataContainerPath");
    return dataPath ? dataPath(bundleId) : nil;
}
@end`
  }
};

export const UIKitObjcCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('ViewController.m');
  const [copied, setCopied] = useState(false);

  const file = OBJC_SOURCES[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(file.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden text-white">
      {/* Tab Header Selector */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {Object.keys(OBJC_SOURCES).map((k) => (
            <button
              key={k}
              onClick={() => setSelectedFile(k)}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                selectedFile === k
                  ? 'bg-emerald-950/80 text-[#00f280] border border-emerald-500/40 font-bold'
                  : 'text-zinc-400 hover:text-white bg-zinc-800/60'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>

      {/* File Description */}
      <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/40 text-xs text-zinc-400 font-sans flex items-center justify-between">
        <span>{file.desc}</span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
          Objective-C (Clang / Apple LLVM)
        </span>
      </div>

      {/* Code Block */}
      <div className="p-4 overflow-x-auto font-mono text-xs text-emerald-400/90 leading-relaxed max-h-[340px] bg-black">
        <pre>{file.code}</pre>
      </div>
    </div>
  );
};
