#import "ViewController.h"
#import "Motor.h"
#import <dlfcn.h>

static void asegurarMotor(void) {
    [Motor asegurarMotor];
}

static NSString *containerPath(NSString *bid) {
    return [Motor containerPathForBundleId:bid];
}

static NSString *fmtSize(unsigned long long b) {
    if (b < 1024) return [NSString stringWithFormat:@"%llu B", b];
    if (b < 1024 * 1024) return [NSString stringWithFormat:@"%.1f KB", b / 1024.0];
    if (b < 1024 * 1024 * 1024) return [NSString stringWithFormat:@"%.1f MB", b / (1024.0 * 1024.0)];
    return [NSString stringWithFormat:@"%.2f GB", b / (1024.0 * 1024.0 * 1024.0)];
}

#pragma mark - Visor de Texto y Hex (Filza Editor)
@interface VisorArchivoVC : UIViewController
@property (nonatomic, strong) NSString *ruta;
@property (nonatomic, strong) UITextView *tv;
@property (nonatomic, strong) UISegmentedControl *segmento;
@property (nonatomic, strong) NSString *contenidoTexto;
@property (nonatomic, assign) unsigned long long tamano;
@end

@implementation VisorArchivoVC
- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    self.title = self.ruta.lastPathComponent;

    NSDictionary *attrs = [[NSFileManager defaultManager] attributesOfItemAtPath:self.ruta error:nil];
    self.tamano = [[attrs objectForKey:@"NSFileSize"] unsignedLongLongValue];

    NSData *d = [NSData dataWithContentsOfFile:self.ruta];
    self.contenidoTexto = d ? [[NSString alloc] initWithData:d encoding:NSUTF8StringEncoding] : nil;

    self.segmento = [[UISegmentedControl alloc] initWithItems:@[@"Texto", @"Hex"]];
    self.segmento.selectedSegmentIndex = 0;
    [self.segmento addTarget:self action:@selector(cambioModo) forControlEvents:UIControlEventValueChanged];
    self.navigationItem.titleView = self.segmento;

    UIBarButtonItem *btnCompartir = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAction target:self action:@selector(compartir)];
    self.navigationItem.rightBarButtonItem = btnCompartir;

    self.tv = [[UITextView alloc] initWithFrame:self.view.bounds];
    self.tv.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.tv.editable = NO;
    self.tv.textColor = [UIColor labelColor];
    self.tv.backgroundColor = [UIColor systemBackgroundColor];
    self.tv.font = [UIFont fontWithName:@"Menlo" size:12] ?: [UIFont systemFontOfSize:12];
    self.tv.contentInset = UIEdgeInsetsMake(10, 12, 10, 12);
    [self.view addSubview:self.tv];

    [self refrescar];
}

- (void)compartir {
    NSURL *url = [NSURL fileURLWithPath:self.ruta];
    UIActivityViewController *act = [[UIActivityViewController alloc] initWithActivityItems:@[url] applicationActivities:nil];
    [self presentViewController:act animated:YES completion:nil];
}

- (void)cambioModo {
    [self refrescar];
}

- (void)refrescar {
    if (self.segmento.selectedSegmentIndex == 0) {
        if (self.tamano > 2 * 1024 * 1024) {
            self.tv.text = [NSString stringWithFormat:@"(Archivo grande: %@. Usa visor externo si es necesario)", fmtSize(self.tamano)];
        } else {
            self.tv.text = self.contenidoTexto ?: [NSString stringWithFormat:@"(Archivo binario o datos no UTF-8: %@)", fmtSize(self.tamano)];
        }
    } else {
        NSData *d = [NSData dataWithContentsOfFile:self.ruta];
        if (!d) {
            self.tv.text = @"(Error al leer datos binarios)";
            return;
        }
        NSUInteger len = MIN(d.length, (NSUInteger)2048);
        const unsigned char *bytes = d.bytes;
        NSMutableString *s = [NSMutableString new];
        [s appendFormat:@"// Offset: Hex Bytes  | ASCII (%@)\n\n", fmtSize(self.tamano)];
        for (NSUInteger i = 0; i < len; i += 16) {
            [s appendFormat:@"%08lx: ", (unsigned long)i];
            for (NSUInteger j = 0; j < 16; j++) {
                if (i + j < len) [s appendFormat:@"%02x ", bytes[i + j]];
                else [s appendString:@"   "];
                if (j == 7) [s appendString:@" "];
            }
            [s appendString:@" |"];
            for (NSUInteger j = 0; j < 16 && (i + j) < len; j++) {
                unsigned char c = bytes[i + j];
                [s appendFormat:@"%c", (c >= 32 && c <= 126) ? c : '.'];
            }
            [s appendString:@"|\n"];
        }
        self.tv.text = s;
    }
}
@end

#pragma mark - Pantalla Principal: Explorador Filza Completo
@interface ViewController () <UITableViewDataSource, UITableViewDelegate, UISearchResultsUpdating>
@property (nonatomic, strong) NSString *rutaActual;
@property (nonatomic, strong) UITableView *tv;
@property (nonatomic, strong) NSArray *elementos;
@property (nonatomic, strong) NSArray *elementosFiltrados;
@property (nonatomic, strong) UISearchController *searchController;
@end

@implementation ViewController

- (instancetype)initWithPath:(NSString *)ruta {
    self = [super init];
    if (self) {
        _rutaActual = ruta.length ? ruta : @"/var/mobile";
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Iniciar motor automáticamente
    asegurarMotor();
    
    if (!self.rutaActual.length) {
        self.rutaActual = @"/var/mobile";
    }

    self.view.backgroundColor = [UIColor systemBackgroundColor];
    [self actualizarTitulo];

    // Barra de navegación: Botón de Motor y Botón + (Crear)
    UIBarButtonItem *btnMotor = [[UIBarButtonItem alloc] initWithImage:[UIImage systemImageNamed:@"bolt.fill"] style:UIBarButtonItemStylePlain target:self action:@selector(tocarMotor)];
    btnMotor.tintColor = [UIColor systemGreenColor];

    UIBarButtonItem *btnNuevo = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd target:self action:@selector(crearNuevo)];
    self.navigationItem.rightBarButtonItems = @[btnNuevo, btnMotor];

    // Search Controller nativo estándar de iOS
    self.searchController = [[UISearchController alloc] initWithSearchResultsController:nil];
    self.searchController.searchResultsUpdater = self;
    self.searchController.obscuresBackgroundDuringPresentation = NO;
    self.searchController.searchBar.placeholder = @"Buscar archivos o escribir /ruta...";
    self.navigationItem.searchController = self.searchController;
    self.navigationItem.hidesSearchBarWhenScrolling = NO;
    self.definesPresentationContext = YES;

    // Tabla estilo Filza estándar
    self.tv = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStylePlain];
    self.tv.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.tv.backgroundColor = [UIColor systemBackgroundColor];
    self.tv.dataSource = self;
    self.tv.delegate = self;
    [self.view addSubview:self.tv];

    // Toolbar inferior estilo Filza
    [self configurarToolbarInferior];

    [self cargarDirectorio];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    self.navigationController.toolbarHidden = NO;
    [self cargarDirectorio];
}

- (void)actualizarTitulo {
    if ([self.rutaActual isEqualToString:@"/"]) {
        self.title = @"/";
    } else {
        self.title = self.rutaActual.lastPathComponent;
    }
}

- (void)configurarToolbarInferior {
    UIBarButtonItem *btnRoot = [[UIBarButtonItem alloc] initWithTitle:@"Raíz /" style:UIBarButtonItemStylePlain target:self action:@selector(irARaiz)];
    UIBarButtonItem *btnSpace1 = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace target:nil action:nil];
    
    UIBarButtonItem *btnContainers = [[UIBarButtonItem alloc] initWithTitle:@"Apps" style:UIBarButtonItemStylePlain target:self action:@selector(abrirSelectorApps)];
    UIBarButtonItem *btnSpace2 = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace target:nil action:nil];
    
    UIBarButtonItem *btnMobile = [[UIBarButtonItem alloc] initWithTitle:@"Mobile" style:UIBarButtonItemStylePlain target:self action:@selector(irAMobile)];
    UIBarButtonItem *btnSpace3 = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace target:nil action:nil];

    UIBarButtonItem *btnRutaManual = [[UIBarButtonItem alloc] initWithImage:[UIImage systemImageNamed:@"magnifyingglass"] style:UIBarButtonItemStylePlain target:self action:@selector(escribirRutaManual)];

    self.toolbarItems = @[btnRoot, btnSpace1, btnContainers, btnSpace2, btnMobile, btnSpace3, btnRutaManual];
    self.navigationController.toolbar.tintColor = [UIColor systemGreenColor];
}

- (void)cargarDirectorio {
    asegurarMotor();
    NSMutableArray *dirs = [NSMutableArray new], *files = [NSMutableArray new];
    NSError *err = nil;
    NSArray *contents = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:self.rutaActual error:&err];

    if (!contents && ![self.rutaActual isEqualToString:@"/var/mobile"]) {
        // Si no se puede abrir /var/mobile directamente, probar /
        contents = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:@"/" error:nil];
        if (contents) {
            self.rutaActual = @"/";
            [self actualizarTitulo];
        }
    }

    for (NSString *n in [contents sortedArrayUsingSelector:@selector(localizedStandardCompare:)]) {
        BOOL isDir = NO;
        NSString *full = [self.rutaActual stringByAppendingPathComponent:n];
        [[NSFileManager defaultManager] fileExistsAtPath:full isDirectory:&isDir];
        if (isDir) {
            [dirs addObject:n];
        } else {
            [files addObject:n];
        }
    }

    NSMutableArray *res = [NSMutableArray new];
    [res addObjectsFromArray:dirs];
    [res addObjectsFromArray:files];
    self.elementos = res;
    self.elementosFiltrados = res;
    [self.tv reloadData];
}

- (void)tocarMotor {
    asegurarMotor();
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"⚡ Motor MCMFilza"
        message:@"El motor está activo y funcionando.\nAcceso irrestricto al sistema de archivos."
        preferredStyle:UIAlertControllerStyleAlert];
    [a addAction:[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:nil]];
    [self presentViewController:a animated:YES completion:nil];
}

- (void)irARaiz {
    [self navegarHaciaRuta:@"/"];
}

- (void)irAMobile {
    [self navegarHaciaRuta:@"/var/mobile"];
}

- (void)abrirSelectorApps {
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"Contenedores de Apps"
        message:@"Selecciona o escribe el bundle ID:"
        preferredStyle:UIAlertControllerStyleActionSheet];

    [a addAction:[UIAlertAction actionWithTitle:@"Abrir /Containers/Data/Application" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        [self navegarHaciaRuta:@"/var/mobile/Containers/Data/Application"];
    }]];

    [a addAction:[UIAlertAction actionWithTitle:@"Abrir /Bundle/Application" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        [self navegarHaciaRuta:@"/var/containers/Bundle/Application"];
    }]];

    [a addAction:[UIAlertAction actionWithTitle:@"Free Fire (com.dts.freefireth)" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        [self abrirBundleId:@"com.dts.freefireth"];
    }]];

    [a addAction:[UIAlertAction actionWithTitle:@"Escribir Bundle ID manual..." style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        [self escribirBundleIdManual];
    }]];

    [a addAction:[UIAlertAction actionWithTitle:@"Cancelar" style:UIAlertActionStyleCancel handler:nil]];

    // Compatibilidad iPad
    if (a.popoverPresentationController) {
        a.popoverPresentationController.barButtonItem = self.toolbarItems[2];
    }
    [self presentViewController:a animated:YES completion:nil];
}

- (void)escribirBundleIdManual {
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"Bundle ID"
        message:@"Escribe el bundle ID de la app instalada (ej: com.dts.freefireth)"
        preferredStyle:UIAlertControllerStyleAlert];
    [a addTextFieldWithConfigurationHandler:^(UITextField *tf) {
        tf.placeholder = @"com.ejemplo.app";
        tf.autocapitalizationType = UITextAutocapitalizationTypeNone;
    }];
    [a addAction:[UIAlertAction actionWithTitle:@"Abrir" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        NSString *bid = a.textFields.firstObject.text;
        [self abrirBundleId:bid];
    }]];
    [a addAction:[UIAlertAction actionWithTitle:@"Cancelar" style:UIAlertActionStyleCancel handler:nil]];
    [self presentViewController:a animated:YES completion:nil];
}

- (void)abrirBundleId:(NSString *)bid {
    bid = [bid stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    if (!bid.length) return;
    asegurarMotor();
    NSString *p = nil;
    @try { p = containerPath(bid); } @catch (NSException *e) { p = nil; }
    if (p.length) {
        [self navegarHaciaRuta:p];
    } else {
        [self navegarHaciaRuta:@"/var/mobile/Containers/Data/Application"];
    }
}

- (void)escribirRutaManual {
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"Ir a la ruta"
        message:@"Escribe cualquier ruta del sistema de archivos:"
        preferredStyle:UIAlertControllerStyleAlert];
    [a addTextFieldWithConfigurationHandler:^(UITextField *tf) {
        tf.text = self.rutaActual;
        tf.font = [UIFont fontWithName:@"Menlo" size:12];
        tf.autocapitalizationType = UITextAutocapitalizationTypeNone;
    }];
    [a addAction:[UIAlertAction actionWithTitle:@"Ir" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        NSString *r = a.textFields.firstObject.text;
        if (r.length) [self navegarHaciaRuta:r];
    }]];
    [a addAction:[UIAlertAction actionWithTitle:@"Cancelar" style:UIAlertActionStyleCancel handler:nil]];
    [self presentViewController:a animated:YES completion:nil];
}

- (void)navegarHaciaRuta:(NSString *)nuevaRuta {
    if ([nuevaRuta isEqualToString:self.rutaActual]) {
        [self cargarDirectorio];
        return;
    }
    ViewController *vc = [[ViewController alloc] initWithPath:nuevaRuta];
    [self.navigationController pushViewController:vc animated:YES];
}

- (void)crearNuevo {
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"Nuevo Elemento"
        message:self.rutaActual
        preferredStyle:UIAlertControllerStyleAlert];
    [a addTextFieldWithConfigurationHandler:^(UITextField *tf) {
        tf.placeholder = @"Nombre";
    }];
    [a addAction:[UIAlertAction actionWithTitle:@"Carpeta" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        NSString *n = a.textFields.firstObject.text;
        if (n.length) {
            NSString *nueva = [self.rutaActual stringByAppendingPathComponent:n];
            [[NSFileManager defaultManager] createDirectoryAtPath:nueva withIntermediateDirectories:YES attributes:nil error:nil];
            [self cargarDirectorio];
        }
    }]];
    [a addAction:[UIAlertAction actionWithTitle:@"Archivo" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        NSString *n = a.textFields.firstObject.text;
        if (n.length) {
            NSString *nueva = [self.rutaActual stringByAppendingPathComponent:n];
            [[NSFileManager defaultManager] createFileAtPath:nueva contents:[@"" dataUsingEncoding:NSUTF8StringEncoding] attributes:nil];
            [self cargarDirectorio];
        }
    }]];
    [a addAction:[UIAlertAction actionWithTitle:@"Cancelar" style:UIAlertActionStyleCancel handler:nil]];
    [self presentViewController:a animated:YES completion:nil];
}

#pragma mark - Search Updater

- (void)updateSearchResultsForSearchController:(UISearchController *)searchController {
    NSString *t = [searchController.searchBar.text stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    if (t.length == 0) {
        self.elementosFiltrados = self.elementos;
    } else {
        NSPredicate *pred = [NSPredicate predicateWithFormat:@"SELF contains[cd] %@", t];
        self.elementosFiltrados = [self.elementos filteredArrayUsingPredicate:pred];
    }
    [self.tv reloadData];
}

#pragma mark - Table View Data Source & Delegate

- (NSInteger)tableView:(UITableView *)t numberOfRowsInSection:(NSInteger)s {
    return self.elementosFiltrados.count;
}

- (UITableViewCell *)tableView:(UITableView *)t cellForRowAtIndexPath:(NSIndexPath *)ip {
    UITableViewCell *c = [t dequeueReusableCellWithIdentifier:@"fcell"];
    if (!c) c = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"fcell"];

    NSString *n = self.elementosFiltrados[ip.row];
    NSString *full = [self.rutaActual stringByAppendingPathComponent:n];
    BOOL isDir = NO;
    [[NSFileManager defaultManager] fileExistsAtPath:full isDirectory:&isDir];

    c.textLabel.text = n;
    c.textLabel.font = [UIFont systemFontOfSize:15 weight:UIFontWeightRegular];

    if (isDir) {
        c.imageView.image = [[UIImage systemImageNamed:@"folder.fill"] imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
        c.imageView.tintColor = [UIColor systemBlueColor];
        c.textLabel.textColor = [UIColor labelColor];
        c.detailTextLabel.text = @"Carpeta";
        c.detailTextLabel.textColor = [UIColor secondaryLabelColor];
        c.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    } else {
        NSString *ext = [n.pathExtension lowercaseString];
        if ([ext isEqualToString:@"plist"]) {
            c.imageView.image = [[UIImage systemImageNamed:@"list.bullet.rectangle.portrait.fill"] imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
            c.imageView.tintColor = [UIColor systemOrangeColor];
        } else if ([ext isEqualToString:@"sqlite"] || [ext isEqualToString:@"db"]) {
            c.imageView.image = [[UIImage systemImageNamed:@"cylinder.split.1x2.fill"] imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
            c.imageView.tintColor = [UIColor systemPurpleColor];
        } else if ([ext isEqualToString:@"dylib"] || [ext isEqualToString:@"dat"] || [ext isEqualToString:@"bin"]) {
            c.imageView.image = [[UIImage systemImageNamed:@"cpu.fill"] imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
            c.imageView.tintColor = [UIColor systemGreenColor];
        } else if ([ext isEqualToString:@"png"] || [ext isEqualToString:@"jpg"] || [ext isEqualToString:@"jpeg"] || [ext isEqualToString:@"car"]) {
            c.imageView.image = [[UIImage systemImageNamed:@"photo.fill"] imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
            c.imageView.tintColor = [UIColor systemTealColor];
        } else {
            c.imageView.image = [[UIImage systemImageNamed:@"doc.text.fill"] imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
            c.imageView.tintColor = [UIColor systemGrayColor];
        }
        
        c.textLabel.textColor = [UIColor labelColor];
        NSDictionary *attrs = [[NSFileManager defaultManager] attributesOfItemAtPath:full error:nil];
        unsigned long long sz = [[attrs objectForKey:@"NSFileSize"] unsignedLongLongValue];
        c.detailTextLabel.text = fmtSize(sz);
        c.detailTextLabel.textColor = [UIColor secondaryLabelColor];
        c.accessoryType = UITableViewCellAccessoryNone;
    }

    return c;
}

- (void)tableView:(UITableView *)t didSelectRowAtIndexPath:(NSIndexPath *)ip {
    [t deselectRowAtIndexPath:ip animated:YES];
    NSString *n = self.elementosFiltrados[ip.row];
    NSString *full = [self.rutaActual stringByAppendingPathComponent:n];
    BOOL isDir = NO;
    [[NSFileManager defaultManager] fileExistsAtPath:full isDirectory:&isDir];

    if (isDir) {
        [self navegarHaciaRuta:full];
    } else {
        VisorArchivoVC *v = [VisorArchivoVC new];
        v.ruta = full;
        [self.navigationController pushViewController:v animated:YES];
    }
}

- (BOOL)tableView:(UITableView *)t canEditRowAtIndexPath:(NSIndexPath *)ip {
    return YES;
}

- (void)tableView:(UITableView *)t commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)ip {
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        NSString *n = self.elementosFiltrados[ip.row];
        NSString *full = [self.rutaActual stringByAppendingPathComponent:n];
        [[NSFileManager defaultManager] removeItemAtPath:full error:nil];
        [self cargarDirectorio];
    }
}

@end
