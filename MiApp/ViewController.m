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

static void ponerIcono(UITableViewCell *c, NSString *nombre, UIColor *tinte) {
    if (@available(iOS 13.0, *)) {
        c.imageView.image = [[UIImage systemImageNamed:nombre] imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
        c.imageView.tintColor = tinte;
    }
}

#pragma mark - Visor de texto y Hex Dump
@interface TextViewVC : UIViewController
@property (nonatomic, strong) NSString *ruta;
@property (nonatomic, strong) UITextView *tv;
@property (nonatomic, strong) UISegmentedControl *segmento;
@property (nonatomic, strong) NSString *contenidoOriginal;
@property (nonatomic, assign) unsigned long long tamanoArchivo;
@end

@implementation TextViewVC
- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    self.title = self.ruta.lastPathComponent;

    NSDictionary *attrs = [[NSFileManager defaultManager] attributesOfItemAtPath:self.ruta error:nil];
    self.tamanoArchivo = [[attrs objectForKey:@"NSFileSize"] unsignedLongLongValue];

    NSData *d = [NSData dataWithContentsOfFile:self.ruta];
    self.contenidoOriginal = d ? [[NSString alloc] initWithData:d encoding:NSUTF8StringEncoding] : nil;

    self.segmento = [[UISegmentedControl alloc] initWithItems:@[@"Texto", @"Hex"]];
    self.segmento.selectedSegmentIndex = 0;
    [self.segmento addTarget:self action:@selector(cambioModo) forControlEvents:UIControlEventValueChanged];
    self.navigationItem.titleView = self.segmento;

    self.tv = [[UITextView alloc] initWithFrame:self.view.bounds];
    self.tv.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.tv.editable = NO;
    self.tv.textColor = [UIColor labelColor];
    self.tv.backgroundColor = [UIColor systemBackgroundColor];
    self.tv.font = [UIFont fontWithName:@"Menlo" size:12] ?: [UIFont systemFontOfSize:12];
    self.tv.contentInset = UIEdgeInsetsMake(12, 12, 12, 12);
    [self.view addSubview:self.tv];

    [self actualizarTexto];
}

- (void)cambioModo {
    [self actualizarTexto];
}

- (void)actualizarTexto {
    if (self.segmento.selectedSegmentIndex == 0) {
        if (self.tamanoArchivo > 2 * 1024 * 1024) {
            self.tv.text = [NSString stringWithFormat:@"(Archivo demasiado grande: %@)", fmtSize(self.tamanoArchivo)];
        } else {
            self.tv.text = self.contenidoOriginal ?: [NSString stringWithFormat:@"(Archivo binario o no codificable en UTF-8, %@)", fmtSize(self.tamanoArchivo)];
        }
    } else {
        NSData *d = [NSData dataWithContentsOfFile:self.ruta];
        if (!d) {
            self.tv.text = @"(No se pudo leer el archivo)";
            return;
        }
        NSUInteger len = MIN(d.length, (NSUInteger)2048);
        const unsigned char *bytes = d.bytes;
        NSMutableString *hexStr = [NSMutableString new];
        [hexStr appendFormat:@"// Offset: Hex Bytes  | ASCII (%@ total)\n\n", fmtSize(self.tamanoArchivo)];
        for (NSUInteger i = 0; i < len; i += 16) {
            [hexStr appendFormat:@"%08lx: ", (unsigned long)i];
            for (NSUInteger j = 0; j < 16; j++) {
                if (i + j < len) {
                    [hexStr appendFormat:@"%02x ", bytes[i + j]];
                } else {
                    [hexStr appendString:@"   "];
                }
                if (j == 7) [hexStr appendString:@" "];
            }
            [hexStr appendString:@" |"];
            for (NSUInteger j = 0; j < 16 && (i + j) < len; j++) {
                unsigned char c = bytes[i + j];
                [hexStr appendFormat:@"%c", (c >= 32 && c <= 126) ? c : '.'];
            }
            [hexStr appendString:@"|\n"];
        }
        self.tv.text = hexStr;
    }
}
@end

#pragma mark - Navegador de carpetas (Filza Explorer)
@interface FileBrowserVC : UIViewController <UITableViewDataSource, UITableViewDelegate>
@property (nonatomic, strong) NSString *ruta;
@property (nonatomic, strong) NSArray *items;
@property (nonatomic, strong) UITableView *tv;
@end

@implementation FileBrowserVC
- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    self.title = self.ruta.lastPathComponent.length ? self.ruta.lastPathComponent : @"/";

    UIBarButtonItem *btnNuevo = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd target:self action:@selector(crearElemento)];
    self.navigationItem.rightBarButtonItem = btnNuevo;

    self.tv = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStylePlain];
    self.tv.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.tv.backgroundColor = [UIColor systemBackgroundColor];
    self.tv.dataSource = self;
    self.tv.delegate = self;
    [self.view addSubview:self.tv];

    [self recargar];
}

- (void)crearElemento {
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"Nuevo Elemento"
        message:self.ruta
        preferredStyle:UIAlertControllerStyleAlert];
    [a addTextFieldWithConfigurationHandler:^(UITextField *tf) {
        tf.placeholder = @"Nombre";
    }];
    [a addAction:[UIAlertAction actionWithTitle:@"Carpeta" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        NSString *n = a.textFields.firstObject.text;
        if (n.length) {
            [[NSFileManager defaultManager] createDirectoryAtPath:[self.ruta stringByAppendingPathComponent:n] withIntermediateDirectories:YES attributes:nil error:nil];
            [self recargar];
        }
    }]];
    [a addAction:[UIAlertAction actionWithTitle:@"Archivo" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        NSString *n = a.textFields.firstObject.text;
        if (n.length) {
            [[NSFileManager defaultManager] createFileAtPath:[self.ruta stringByAppendingPathComponent:n] contents:[@"" dataUsingEncoding:NSUTF8StringEncoding] attributes:nil];
            [self recargar];
        }
    }]];
    [a addAction:[UIAlertAction actionWithTitle:@"Cancelar" style:UIAlertActionStyleCancel handler:nil]];
    [self presentViewController:a animated:YES completion:nil];
}

- (void)recargar {
    NSMutableArray *dirs = [NSMutableArray new], *files = [NSMutableArray new];
    NSArray *all = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:self.ruta error:nil];
    for (NSString *n in [all sortedArrayUsingSelector:@selector(localizedStandardCompare:)]) {
        BOOL isDir = NO;
        [[NSFileManager defaultManager] fileExistsAtPath:[self.ruta stringByAppendingPathComponent:n] isDirectory:&isDir];
        if (isDir) { [dirs addObject:n]; } else { [files addObject:n]; }
    }
    NSMutableArray *fin = [NSMutableArray new];
    if (![self.ruta isEqualToString:@"/"]) [fin addObject:@".."];
    [fin addObjectsFromArray:dirs];
    [fin addObjectsFromArray:files];
    self.items = fin;
    [self.tv reloadData];
}

- (NSInteger)tableView:(UITableView *)t numberOfRowsInSection:(NSInteger)s { return self.items.count; }
- (UITableViewCell *)tableView:(UITableView *)t cellForRowAtIndexPath:(NSIndexPath *)ip {
    UITableViewCell *c = [t dequeueReusableCellWithIdentifier:@"c"];
    if (!c) c = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"c"];
    
    NSString *n = self.items[ip.row];
    c.textLabel.text = n;
    c.textLabel.font = [UIFont systemFontOfSize:15 weight:UIFontWeightMedium];
    c.detailTextLabel.font = [UIFont systemFontOfSize:12];
    c.detailTextLabel.textColor = [UIColor secondaryLabelColor];

    if ([n isEqualToString:@".."]) {
        ponerIcono(c, @"arrow.left.circle.fill", [UIColor systemGrayColor]);
        c.textLabel.textColor = [UIColor secondaryLabelColor];
        c.detailTextLabel.text = @"Directorio superior";
        c.accessoryType = UITableViewCellAccessoryNone;
    } else if ([self esDir:n]) {
        ponerIcono(c, @"folder.fill", [UIColor systemBlueColor]);
        c.textLabel.textColor = [UIColor labelColor];
        c.detailTextLabel.text = @"Carpeta";
        c.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    } else {
        NSString *ext = [n.pathExtension lowercaseString];
        if ([ext isEqualToString:@"plist"]) {
            ponerIcono(c, @"list.bullet.rectangle.portrait.fill", [UIColor systemOrangeColor]);
        } else if ([ext isEqualToString:@"sqlite"] || [ext isEqualToString:@"db"]) {
            ponerIcono(c, @"cylinder.split.1x2.fill", [UIColor systemPurpleColor]);
        } else if ([ext isEqualToString:@"dylib"] || [ext isEqualToString:@"dat"] || [ext isEqualToString:@"bin"]) {
            ponerIcono(c, @"cpu.fill", [UIColor systemGreenColor]);
        } else if ([ext isEqualToString:@"png"] || [ext isEqualToString:@"jpg"] || [ext isEqualToString:@"jpeg"] || [ext isEqualToString:@"car"]) {
            ponerIcono(c, @"photo.fill", [UIColor systemTealColor]);
        } else {
            ponerIcono(c, @"doc.text.fill", [UIColor systemGrayColor]);
        }
        c.textLabel.textColor = [UIColor labelColor];
        NSDictionary *a = [[NSFileManager defaultManager] attributesOfItemAtPath:[self.ruta stringByAppendingPathComponent:n] error:nil];
        c.detailTextLabel.text = fmtSize([[a objectForKey:@"NSFileSize"] unsignedLongLongValue]);
        c.accessoryType = UITableViewCellAccessoryNone;
    }
    return c;
}

- (BOOL)esDir:(NSString *)n {
    BOOL isDir = NO;
    [[NSFileManager defaultManager] fileExistsAtPath:[self.ruta stringByAppendingPathComponent:n] isDirectory:&isDir];
    return isDir;
}

- (void)tableView:(UITableView *)t didSelectRowAtIndexPath:(NSIndexPath *)ip {
    [t deselectRowAtIndexPath:ip animated:YES];
    NSString *n = self.items[ip.row];
    if ([n isEqualToString:@".."]) { [self.navigationController popViewControllerAnimated:YES]; return; }
    NSString *full = [self.ruta stringByAppendingPathComponent:n];
    if ([self esDir:n]) {
        FileBrowserVC *fb = [FileBrowserVC new];
        fb.ruta = full;
        [self.navigationController pushViewController:fb animated:YES];
    } else {
        TextViewVC *tv = [TextViewVC new];
        tv.ruta = full;
        [self.navigationController pushViewController:tv animated:YES];
    }
}

- (BOOL)tableView:(UITableView *)t canEditRowAtIndexPath:(NSIndexPath *)ip {
    return ![self.items[ip.row] isEqualToString:@".."];
}

- (void)tableView:(UITableView *)t commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)ip {
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        NSString *n = self.items[ip.row];
        NSString *full = [self.ruta stringByAppendingPathComponent:n];
        [[NSFileManager defaultManager] removeItemAtPath:full error:nil];
        [self recargar];
    }
}
@end

#pragma mark - Pantalla Principal (Estilo Filza Limpio y Nativo)
@interface ViewController () <UITableViewDataSource, UITableViewDelegate, UISearchBarDelegate>
@property (nonatomic, strong) UITableView *tv;
@property (nonatomic, strong) UISearchBar *searchBar;
@property (nonatomic, strong) NSMutableArray *apps;
@property (nonatomic, strong) NSMutableArray *appsFiltradas;
@property (nonatomic, strong) NSArray *accesosRapidos;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    self.title = @"MiFilza";

    // Botón discreto y elegante del motor en la barra superior
    UIBarButtonItem *btnMotor = [[UIBarButtonItem alloc] initWithTitle:@"⚡ Motor" style:UIBarButtonItemStylePlain target:self action:@selector(accionMotor)];
    btnMotor.tintColor = [UIColor systemGreenColor];
    self.navigationItem.rightBarButtonItem = btnMotor;

    self.accesosRapidos = @[
        @{@"titulo": @"Raíz del Sistema ( / )", @"sub": @"Acceso irrestricto sin sandbox", @"ruta": @"/", @"icono": @"internaldrive.fill", @"color": [UIColor systemGreenColor]},
        @{@"titulo": @"Contenedores de Apps", @"sub": @"/var/mobile/Containers/Data/Application", @"ruta": @"/var/mobile/Containers/Data/Application", @"icono": @"shippingbox.fill", @"color": [UIColor systemBlueColor]},
        @{@"titulo": @"Documentos", @"sub": @"/var/mobile/Documents", @"ruta": @"/var/mobile/Documents", @"icono": @"folder.fill", @"color": [UIColor systemOrangeColor]},
        @{@"titulo": @"Preferencias (.plist)", @"sub": @"/var/mobile/Library/Preferences", @"ruta": @"/var/mobile/Library/Preferences", @"icono": @"gearshape.fill", @"color": [UIColor systemPurpleColor]}
    ];

    self.apps = [NSMutableArray new];
    self.appsFiltradas = [NSMutableArray new];

    [self configurarUI];
    [self cargarApps];
}

- (void)configurarUI {
    self.tv = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStyleInsetGrouped];
    self.tv.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.tv.backgroundColor = [UIColor systemGroupedBackgroundColor];
    self.tv.dataSource = self;
    self.tv.delegate = self;

    // Search bar nativa limpia
    self.searchBar = [[UISearchBar alloc] initWithFrame:CGRectMake(0, 0, self.view.bounds.size.width, 56)];
    self.searchBar.delegate = self;
    self.searchBar.placeholder = @"Buscar o escribir bundle ID...";
    self.searchBar.searchBarStyle = UISearchBarStyleMinimal;
    self.searchBar.autocapitalizationType = UITextAutocapitalizationTypeNone;
    self.searchBar.autocorrectionType = UITextAutocorrectionTypeNo;
    self.tv.tableHeaderView = self.searchBar;

    [self.view addSubview:self.tv];
}

- (void)cargarApps {
    NSMutableOrderedSet *set = [NSMutableOrderedSet new];
    @try {
        Class ws = NSClassFromString(@"LSApplicationWorkspace");
        if (ws && [ws respondsToSelector:@selector(defaultWorkspace)]) {
            id workspace = [ws performSelector:@selector(defaultWorkspace)];
            if (workspace && [workspace respondsToSelector:@selector(allApplications)]) {
                NSArray *all = [workspace performSelector:@selector(allApplications)];
                for (id proxy in all) {
                    @try {
                        if ([proxy respondsToSelector:@selector(applicationIdentifier)]) {
                            NSString *bid = [proxy performSelector:@selector(applicationIdentifier)];
                            if (bid && ![bid hasPrefix:@"com.apple."]) [set addObject:bid];
                        }
                    } @catch (NSException *e) {}
                }
            }
        }
    } @catch (NSException *e) {}

    // Si el workspace está restringido por sandbox, añadir aplicaciones estándar
    if (set.count == 0) {
        NSArray *comunes = @[
            @"com.dts.freefireth",
            @"com.spotify.client",
            @"org.videolan.vlc-ios",
            @"com.tinyspeck.chatlyio",
            @"com.toyopagroup.picaboo",
            @"com.burbn.instagram",
            @"com.google.ios.youtube",
            @"com.agilebits.onepassword-ios"
        ];
        [set addObjectsFromArray:comunes];
    }

    [self.apps removeAllObjects];
    [self.apps addObjectsFromArray:[set array]];
    [self.apps sortUsingSelector:@selector(localizedStandardCompare:)];
    
    [self.appsFiltradas removeAllObjects];
    [self.appsFiltradas addObjectsFromArray:self.apps];

    [self.tv reloadData];
}

- (void)accionMotor {
    asegurarMotor();
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"Motor MCMFilza"
        message:@"El motor está activo.\nTweakInit y MCMFilzaStart funcionando con bypass de sandbox."
        preferredStyle:UIAlertControllerStyleAlert];
    [a addAction:[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:nil]];
    [self presentViewController:a animated:YES completion:nil];
}

#pragma mark - Search Bar Delegate

- (void)searchBar:(UISearchBar *)searchBar textDidChange:(NSString *)searchText {
    NSString *t = [searchText stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    if (t.length == 0) {
        [self.appsFiltradas removeAllObjects];
        [self.appsFiltradas addObjectsFromArray:self.apps];
    } else {
        NSPredicate *pred = [NSPredicate predicateWithFormat:@"SELF contains[cd] %@", t];
        self.appsFiltradas = [NSMutableArray arrayWithArray:[self.apps filteredArrayUsingPredicate:pred]];
    }
    [self.tv reloadData];
}

- (void)searchBarSearchButtonClicked:(UISearchBar *)searchBar {
    [searchBar resignFirstResponder];
    NSString *texto = [searchBar.text stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    if (texto.length) {
        [self abrirContenedor:texto];
    }
}

#pragma mark - Table View Data Source & Delegate

- (NSInteger)numberOfSectionsInTableView:(UITableView *)t {
    return 2;
}

- (NSString *)tableView:(UITableView *)t titleForHeaderInSection:(NSInteger)s {
    return (s == 0) ? @"ACCESOS DIRECTOS" : [NSString stringWithFormat:@"APLICACIONES (%lu)", (unsigned long)self.appsFiltradas.count];
}

- (NSInteger)tableView:(UITableView *)t numberOfRowsInSection:(NSInteger)s {
    return (s == 0) ? self.accesosRapidos.count : self.appsFiltradas.count;
}

- (UITableViewCell *)tableView:(UITableView *)t cellForRowAtIndexPath:(NSIndexPath *)ip {
    UITableViewCell *c = [t dequeueReusableCellWithIdentifier:@"cell"];
    if (!c) c = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"cell"];

    if (ip.section == 0) {
        NSDictionary *dict = self.accesosRapidos[ip.row];
        c.textLabel.text = dict[@"titulo"];
        c.textLabel.textColor = [UIColor labelColor];
        c.textLabel.font = [UIFont systemFontOfSize:15 weight:UIFontWeightMedium];
        c.detailTextLabel.text = dict[@"sub"];
        c.detailTextLabel.textColor = [UIColor secondaryLabelColor];
        ponerIcono(c, dict[@"icono"], dict[@"color"]);
        c.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    } else {
        NSString *bid = self.appsFiltradas[ip.row];
        c.textLabel.text = bid;
        c.textLabel.textColor = [UIColor labelColor];
        c.textLabel.font = [UIFont fontWithName:@"Menlo" size:13] ?: [UIFont systemFontOfSize:13];
        c.detailTextLabel.text = @"Toca para explorar contenedor";
        c.detailTextLabel.textColor = [UIColor secondaryLabelColor];
        ponerIcono(c, @"app.fill", [UIColor systemBlueColor]);
        c.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    }

    return c;
}

- (void)tableView:(UITableView *)t didSelectRowAtIndexPath:(NSIndexPath *)ip {
    [t deselectRowAtIndexPath:ip animated:YES];
    if (ip.section == 0) {
        NSDictionary *dict = self.accesosRapidos[ip.row];
        FileBrowserVC *fb = [FileBrowserVC new];
        fb.ruta = dict[@"ruta"];
        [self.navigationController pushViewController:fb animated:YES];
    } else {
        [self abrirContenedor:self.appsFiltradas[ip.row]];
    }
}

- (void)abrirContenedor:(NSString *)bid {
    bid = [bid stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    if (!bid.length) return;
    asegurarMotor();
    
    NSString *p = nil;
    @try { p = containerPath(bid); } @catch (NSException *e) { p = nil; }
    
    if (!p) {
        // Buscar carpeta manual por nombre si MCM no devuelve UUID
        NSString *containersGeneral = @"/var/mobile/Containers/Data/Application";
        FileBrowserVC *fb = [FileBrowserVC new];
        fb.ruta = containersGeneral;
        [self.navigationController pushViewController:fb animated:YES];
        return;
    }
    
    FileBrowserVC *fb = [FileBrowserVC new];
    fb.ruta = p;
    [self.navigationController pushViewController:fb animated:YES];
}

@end
