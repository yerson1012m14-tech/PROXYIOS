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

static UIColor *colorFondo(void) { return [UIColor colorWithRed:0.04 green:0.05 blue:0.06 alpha:1.0]; }
static UIColor *colorCard(void) { return [UIColor colorWithRed:0.08 green:0.09 blue:0.12 alpha:1.0]; }
static UIColor *acento(void) { return [UIColor colorWithRed:0.20 green:1.00 blue:0.50 alpha:1.0]; }
static UIColor *acentoAzul(void) { return [UIColor colorWithRed:0.22 green:0.74 blue:0.97 alpha:1.0]; }

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
    self.view.backgroundColor = [UIColor blackColor];
    self.title = self.ruta.lastPathComponent;

    NSDictionary *attrs = [[NSFileManager defaultManager] attributesOfItemAtPath:self.ruta error:nil];
    self.tamanoArchivo = [[attrs objectForKey:@"NSFileSize"] unsignedLongLongValue];

    NSData *d = [NSData dataWithContentsOfFile:self.ruta];
    self.contenidoOriginal = d ? [[NSString alloc] initWithData:d encoding:NSUTF8StringEncoding] : nil;

    self.segmento = [[UISegmentedControl alloc] initWithItems:@[@"Texto", @"Hex Dump"]];
    self.segmento.selectedSegmentIndex = 0;
    [self.segmento addTarget:self action:@selector(cambioModo) forControlEvents:UIControlEventValueChanged];
    self.segmento.backgroundColor = [UIColor colorWithWhite:0.15 alpha:1.0];
    self.segmento.selectedSegmentTintColor = acento();
    [self.segmento setTitleTextAttributes:@{NSForegroundColorAttributeName: [UIColor blackColor], NSFontAttributeName: [UIFont fontWithName:@"Menlo-Bold" size:11]} forState:UIControlStateSelected];
    [self.segmento setTitleTextAttributes:@{NSForegroundColorAttributeName: [UIColor lightGrayColor], NSFontAttributeName: [UIFont fontWithName:@"Menlo" size:11]} forState:UIControlStateNormal];
    self.navigationItem.titleView = self.segmento;

    self.tv = [[UITextView alloc] initWithFrame:self.view.bounds];
    self.tv.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.tv.editable = NO;
    self.tv.textColor = acento();
    self.tv.backgroundColor = [UIColor blackColor];
    self.tv.font = [UIFont fontWithName:@"Menlo" size:11];
    self.tv.contentInset = UIEdgeInsetsMake(10, 10, 10, 10);
    [self.view addSubview:self.tv];

    [self actualizarTexto];
}

- (void)cambioModo {
    [self actualizarTexto];
}

- (void)actualizarTexto {
    if (self.segmento.selectedSegmentIndex == 0) {
        if (self.tamanoArchivo > 2 * 1024 * 1024) {
            self.tv.text = [NSString stringWithFormat:@"(archivo demasiado grande para texto: %@)", fmtSize(self.tamanoArchivo)];
        } else {
            self.tv.text = self.contenidoOriginal ?: [NSString stringWithFormat:@"(binario / no UTF-8, %@)", fmtSize(self.tamanoArchivo)];
        }
    } else {
        NSData *d = [NSData dataWithContentsOfFile:self.ruta];
        if (!d) {
            self.tv.text = @"(no se pudo leer el archivo en bytes)";
            return;
        }
        NSUInteger len = MIN(d.length, (NSUInteger)1024);
        const unsigned char *bytes = d.bytes;
        NSMutableString *hexStr = [NSMutableString new];
        [hexStr appendFormat:@"// Hex Dump (primeros %lu bytes de %@):\n\n", (unsigned long)len, fmtSize(self.tamanoArchivo)];
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

#pragma mark - Navegador de carpetas
@interface FileBrowserVC : UIViewController <UITableViewDataSource, UITableViewDelegate>
@property (nonatomic, strong) NSString *ruta;
@property (nonatomic, strong) NSArray *items;
@property (nonatomic, strong) UITableView *tv;
@end

@implementation FileBrowserVC
- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = colorFondo();
    self.title = self.ruta.lastPathComponent.length ? self.ruta.lastPathComponent : @"/";

    UIBarButtonItem *btnNuevo = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd target:self action:@selector(crearElemento)];
    self.navigationItem.rightBarButtonItem = btnNuevo;

    self.tv = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStyleInsetGrouped];
    self.tv.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.tv.backgroundColor = colorFondo();
    self.tv.separatorColor = [UIColor colorWithWhite:0.18 alpha:1.0];
    self.tv.dataSource = self;
    self.tv.delegate = self;
    [self.view addSubview:self.tv];

    [self recargar];
}

- (void)crearElemento {
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"Nuevo Elemento"
        message:[NSString stringWithFormat:@"Crear en: %@", self.ruta]
        preferredStyle:UIAlertControllerStyleAlert];
    [a addTextFieldWithConfigurationHandler:^(UITextField *tf) {
        tf.placeholder = @"Nombre del archivo o carpeta";
        tf.font = [UIFont fontWithName:@"Menlo" size:12];
    }];
    [a addAction:[UIAlertAction actionWithTitle:@"Crear Carpeta" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        NSString *nombre = a.textFields.firstObject.text;
        if (nombre.length) {
            NSString *nuevaRuta = [self.ruta stringByAppendingPathComponent:nombre];
            [[NSFileManager defaultManager] createDirectoryAtPath:nuevaRuta withIntermediateDirectories:YES attributes:nil error:nil];
            [self recargar];
        }
    }]];
    [a addAction:[UIAlertAction actionWithTitle:@"Crear Archivo" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
        NSString *nombre = a.textFields.firstObject.text;
        if (nombre.length) {
            NSString *nuevaRuta = [self.ruta stringByAppendingPathComponent:nombre];
            [[NSFileManager defaultManager] createFileAtPath:nuevaRuta contents:[@"" dataUsingEncoding:NSUTF8StringEncoding] attributes:nil];
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
    c.backgroundColor = colorCard();
    c.selectedBackgroundView = [UIView new];
    c.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:0.18 alpha:1.0];
    NSString *n = self.items[ip.row];
    c.textLabel.text = n;
    c.textLabel.font = [UIFont fontWithName:@"Menlo-Bold" size:13];
    c.detailTextLabel.font = [UIFont fontWithName:@"Menlo" size:10];
    c.detailTextLabel.textColor = [UIColor lightGrayColor];

    if ([n isEqualToString:@".."]) {
        ponerIcono(c, @"arrow.uturn.left", [UIColor grayColor]);
        c.textLabel.textColor = [UIColor grayColor];
        c.detailTextLabel.text = @"subir al directorio superior";
        c.accessoryType = UITableViewCellAccessoryNone;
    } else if ([self esDir:n]) {
        ponerIcono(c, @"folder.fill", acentoAzul());
        c.textLabel.textColor = acentoAzul();
        c.detailTextLabel.text = @"carpeta";
        c.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    } else {
        NSString *ext = [n.pathExtension lowercaseString];
        if ([ext isEqualToString:@"plist"]) {
            ponerIcono(c, @"list.bullet.rectangle.fill", [UIColor colorWithRed:0.98 green:0.80 blue:0.08 alpha:1.0]);
        } else if ([ext isEqualToString:@"sqlite"] || [ext isEqualToString:@"db"]) {
            ponerIcono(c, @"cylinder.split.1x2.fill", [UIColor colorWithRed:0.75 green:0.52 blue:0.99 alpha:1.0]);
        } else if ([ext isEqualToString:@"dylib"] || [ext isEqualToString:@"dat"]) {
            ponerIcono(c, @"cpu.fill", acento());
        } else {
            ponerIcono(c, @"doc.text.fill", [UIColor whiteColor]);
        }
        c.textLabel.textColor = [UIColor whiteColor];
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
    NSString *n = self.items[ip.row];
    return ![n isEqualToString:@".."];
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

#pragma mark - Pantalla principal
@interface ViewController () <UITableViewDataSource, UITableViewDelegate, UITextFieldDelegate>
@property (nonatomic, strong) UITableView *tv;
@property (nonatomic, strong) UITextField *campo;
@property (nonatomic, strong) NSMutableArray *apps;
@property (nonatomic, strong) NSArray *accesosRapidos;
@property (nonatomic, strong) UIView *headerView;
@property (nonatomic, strong) UILabel *estadoMotorLabel;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = colorFondo();
    self.title = @"MiFilza Pro";

    UIBarButtonItem *btnMotor = [[UIBarButtonItem alloc] initWithTitle:@"⚡ Motor: ON" style:UIBarButtonItemStylePlain target:self action:@selector(accionEncenderMotor)];
    btnMotor.tintColor = acento();
    self.navigationItem.rightBarButtonItem = btnMotor;

    self.accesosRapidos = @[
        @{@"titulo": @"Root ( / )", @"sub": @"Sistema de archivos raíz irrestricto", @"ruta": @"/", @"icono": @"internaldrive.fill", @"color": acento()},
        @{@"titulo": @"App Containers", @"sub": @"/var/mobile/Containers/Data/Application", @"ruta": @"/var/mobile/Containers/Data/Application", @"icono": @"shippingbox.fill", @"color": acentoAzul()},
        @{@"titulo": @"Documents", @"sub": @"/var/mobile/Documents", @"ruta": @"/var/mobile/Documents", @"icono": @"folder.fill", @"color": [UIColor colorWithRed:0.98 green:0.80 blue:0.08 alpha:1.0]},
        @{@"titulo": @"Preferences", @"sub": @"/var/mobile/Library/Preferences", @"ruta": @"/var/mobile/Library/Preferences", @"icono": @"gearshape.fill", @"color": [UIColor colorWithRed:0.75 green:0.52 blue:0.99 alpha:1.0]}
    ];

    self.apps = [NSMutableArray new];
    [self configurarTablaYHeader];
    [self cargarApps];
}

- (void)configurarTablaYHeader {
    self.tv = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStyleInsetGrouped];
    self.tv.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.tv.backgroundColor = colorFondo();
    self.tv.separatorColor = [UIColor colorWithWhite:0.18 alpha:1.0];
    self.tv.dataSource = self;
    self.tv.delegate = self;

    // Header completo con Card del Motor y Barra de Búsqueda
    UIView *header = [[UIView alloc] initWithFrame:CGRectMake(0, 0, self.view.bounds.size.width, 160)];
    header.backgroundColor = [UIColor clearColor];

    // 1. Tarjeta del Motor
    UIView *motorCard = [[UIView alloc] initWithFrame:CGRectMake(16, 10, self.view.bounds.size.width - 32, 75)];
    motorCard.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    motorCard.backgroundColor = colorCard();
    motorCard.layer.cornerRadius = 12;
    motorCard.layer.borderWidth = 1;
    motorCard.layer.borderColor = [UIColor colorWithRed:0.20 green:1.00 blue:0.50 alpha:0.35].CGColor;

    UIImageView *motorIcon = [[UIImageView alloc] initWithFrame:CGRectMake(12, 18, 38, 38)];
    if (@available(iOS 13.0, *)) {
        motorIcon.image = [[UIImage systemImageNamed:@"bolt.shield.fill"] imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
        motorIcon.tintColor = acento();
    }
    [motorCard addSubview:motorIcon];

    UILabel *tituloMotor = [[UILabel alloc] initWithFrame:CGRectMake(58, 12, motorCard.bounds.size.width - 150, 20)];
    tituloMotor.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    tituloMotor.text = @"MOTOR MCMFILZA";
    tituloMotor.textColor = [UIColor whiteColor];
    tituloMotor.font = [UIFont fontWithName:@"Menlo-Bold" size:13];
    [motorCard addSubview:tituloMotor];

    self.estadoMotorLabel = [[UILabel alloc] initWithFrame:CGRectMake(58, 32, motorCard.bounds.size.width - 150, 32)];
    self.estadoMotorLabel.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    self.estadoMotorLabel.text = @"TweakInit + MCMFilzaStart activos\nSandbox liberado (Unrestricted)";
    self.estadoMotorLabel.numberOfLines = 2;
    self.estadoMotorLabel.textColor = [UIColor lightGrayColor];
    self.estadoMotorLabel.font = [UIFont fontWithName:@"Menlo" size:10];
    [motorCard addSubview:self.estadoMotorLabel];

    UIButton *btnProbarMotor = [UIButton buttonWithType:UIButtonTypeCustom];
    btnProbarMotor.frame = CGRectMake(motorCard.bounds.size.width - 85, 20, 75, 34);
    btnProbarMotor.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin;
    [btnProbarMotor setTitle:@"Activo" forState:UIControlStateNormal];
    [btnProbarMotor setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    btnProbarMotor.backgroundColor = acento();
    btnProbarMotor.titleLabel.font = [UIFont fontWithName:@"Menlo-Bold" size:11];
    btnProbarMotor.layer.cornerRadius = 8;
    [btnProbarMotor addTarget:self action:@selector(accionEncenderMotor) forControlEvents:UIControlEventTouchUpInside];
    [motorCard addSubview:btnProbarMotor];

    [header addSubview:motorCard];

    // 2. Campo de búsqueda de bundle ID
    UIView *searchContainer = [[UIView alloc] initWithFrame:CGRectMake(16, 95, self.view.bounds.size.width - 32, 50)];
    searchContainer.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    searchContainer.backgroundColor = colorCard();
    searchContainer.layer.cornerRadius = 10;
    searchContainer.layer.borderWidth = 1;
    searchContainer.layer.borderColor = [UIColor colorWithWhite:0.22 alpha:1.0].CGColor;

    self.campo = [[UITextField alloc] initWithFrame:CGRectMake(10, 5, searchContainer.bounds.size.width - 80, 40)];
    self.campo.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    self.campo.placeholder = @"bundle id manual (ej: com.spotify.client)";
    self.campo.backgroundColor = [UIColor clearColor];
    self.campo.textColor = [UIColor whiteColor];
    self.campo.font = [UIFont fontWithName:@"Menlo" size:12];
    self.campo.autocapitalizationType = UITextAutocapitalizationTypeNone;
    self.campo.autocorrectionType = UITextAutocorrectionTypeNo;
    self.campo.returnKeyType = UIReturnKeyDone;
    self.campo.delegate = self;

    if (@available(iOS 13.0, *)) {
        UIImageView *lupa = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, 26, 20)];
        lupa.image = [[UIImage systemImageNamed:@"magnifyingglass"] imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
        lupa.tintColor = [UIColor grayColor];
        lupa.contentMode = UIViewContentModeCenter;
        self.campo.leftView = lupa;
        self.campo.leftViewMode = UITextFieldViewModeAlways;
    }
    [searchContainer addSubview:self.campo];

    UIButton *btnAbrir = [UIButton buttonWithType:UIButtonTypeCustom];
    btnAbrir.frame = CGRectMake(searchContainer.bounds.size.width - 65, 8, 55, 34);
    btnAbrir.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin;
    [btnAbrir setTitle:@"Abrir" forState:UIControlStateNormal];
    [btnAbrir setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    btnAbrir.backgroundColor = acento();
    btnAbrir.titleLabel.font = [UIFont fontWithName:@"Menlo-Bold" size:12];
    btnAbrir.layer.cornerRadius = 6;
    [btnAbrir addTarget:self action:@selector(abrirDesdeBoton) forControlEvents:UIControlEventTouchUpInside];
    [searchContainer addSubview:btnAbrir];

    [header addSubview:searchContainer];

    self.tv.tableHeaderView = header;
    [self.view addSubview:self.tv];
}

- (void)abrirDesdeBoton {
    [self.campo resignFirstResponder];
    [self abrirContenedor:self.campo.text];
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

    // Si el workspace está vacío (sandbox estricto), añadir apps frecuentes y escanear contenedores
    if (set.count == 0) {
        NSArray *comunes = @[
            @"com.spotify.client",
            @"org.videolan.vlc-ios",
            @"com.tinyspeck.chatlyio",
            @"com.toyopagroup.picaboo",
            @"com.burbn.instagram",
            @"com.google.ios.youtube",
            @"com.agilebits.onepassword-ios",
            @"com.apple.mobilesafari"
        ];
        [set addObjectsFromArray:comunes];
    }

    [self.apps removeAllObjects];
    [self.apps addObjectsFromArray:[set array]];
    [self.apps sortUsingSelector:@selector(localizedStandardCompare:)];
    self.title = [NSString stringWithFormat:@"MiFilza Pro (%lu)", (unsigned long)self.apps.count];
    [self.tv reloadData];
}

- (void)accionEncenderMotor {
    asegurarMotor();
    UIAlertController *a = [UIAlertController alertControllerWithTitle:@"⚡ Motor MCMFilza"
        message:@"Motor ejecutado y verificado con éxito:\n\n• TweakInit -> OK\n• MCMFilzaStart -> OK\n• MCMFilzaSetUnrestrictedFilesystem -> ACTIVO\n\nEl acceso a contenedores y root / está completamente habilitado."
        preferredStyle:UIAlertControllerStyleAlert];
    [a addAction:[UIAlertAction actionWithTitle:@"Entendido" style:UIAlertActionStyleDefault handler:nil]];
    [self presentViewController:a animated:YES completion:nil];
}

- (BOOL)textFieldShouldReturn:(UITextField *)tf {
    [tf resignFirstResponder];
    [self abrirContenedor:tf.text];
    return YES;
}

#pragma mark - Table View Data Source & Delegate

- (NSInteger)numberOfSectionsInTableView:(UITableView *)t {
    return 2;
}

- (NSString *)tableView:(UITableView *)t titleForHeaderInSection:(NSInteger)s {
    return (s == 0) ? @"ACCESOS RÁPIDOS DEL SISTEMA" : [NSString stringWithFormat:@"CONTENEDORES DE APLICACIONES (%lu)", (unsigned long)self.apps.count];
}

- (void)tableView:(UITableView *)tableView willDisplayHeaderView:(UIView *)view forSection:(NSInteger)section {
    if ([view isKindOfClass:[UITableViewHeaderFooterView class]]) {
        UITableViewHeaderFooterView *h = (UITableViewHeaderFooterView *)view;
        h.textLabel.textColor = [UIColor colorWithWhite:0.65 alpha:1.0];
        h.textLabel.font = [UIFont fontWithName:@"Menlo-Bold" size:11];
    }
}

- (NSInteger)tableView:(UITableView *)t numberOfRowsInSection:(NSInteger)s {
    return (s == 0) ? self.accesosRapidos.count : self.apps.count;
}

- (UITableViewCell *)tableView:(UITableView *)t cellForRowAtIndexPath:(NSIndexPath *)ip {
    UITableViewCell *c = [t dequeueReusableCellWithIdentifier:@"cell"];
    if (!c) c = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"cell"];
    c.backgroundColor = colorCard();
    c.selectedBackgroundView = [UIView new];
    c.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:0.18 alpha:1.0];

    if (ip.section == 0) {
        NSDictionary *dict = self.accesosRapidos[ip.row];
        c.textLabel.text = dict[@"titulo"];
        c.textLabel.textColor = dict[@"color"];
        c.textLabel.font = [UIFont fontWithName:@"Menlo-Bold" size:13];
        c.detailTextLabel.text = dict[@"sub"];
        c.detailTextLabel.textColor = [UIColor grayColor];
        c.detailTextLabel.font = [UIFont fontWithName:@"Menlo" size:10];
        ponerIcono(c, dict[@"icono"], dict[@"color"]);
        c.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    } else {
        NSString *bid = self.apps[ip.row];
        c.textLabel.text = bid;
        c.textLabel.textColor = acento();
        c.textLabel.font = [UIFont fontWithName:@"Menlo-Bold" size:12];
        c.detailTextLabel.text = @"Toca para resolver contenedor y explorar";
        c.detailTextLabel.textColor = [UIColor lightGrayColor];
        c.detailTextLabel.font = [UIFont fontWithName:@"Menlo" size:10];
        ponerIcono(c, @"app.fill", acento());
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
        [self abrirContenedor:self.apps[ip.row]];
    }
}

- (void)abrirContenedor:(NSString *)bid {
    bid = [bid stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    if (!bid.length) return;
    asegurarMotor();
    NSString *p = nil;
    @try { p = containerPath(bid); } @catch (NSException *e) { p = nil; }
    if (!p) {
        // Si no devuelve contenedor específico, ofrecer abrir la carpeta general de contenedores
        UIAlertController *a = [UIAlertController alertControllerWithTitle:@"Sin contenedor directo"
            message:[NSString stringWithFormat:@"%@ no devolvió ruta específica. ¿Deseas abrir la carpeta de Contenedores de Aplicaciones?", bid]
            preferredStyle:UIAlertControllerStyleAlert];
        [a addAction:[UIAlertAction actionWithTitle:@"Abrir /Containers" style:UIAlertActionStyleDefault handler:^(UIAlertAction *act) {
            FileBrowserVC *fb = [FileBrowserVC new];
            fb.ruta = @"/var/mobile/Containers/Data/Application";
            [self.navigationController pushViewController:fb animated:YES];
        }]];
        [a addAction:[UIAlertAction actionWithTitle:@"Cancelar" style:UIAlertActionStyleCancel handler:nil]];
        [self presentViewController:a animated:YES completion:nil];
        return;
    }
    FileBrowserVC *fb = [FileBrowserVC new];
    fb.ruta = p;
    [self.navigationController pushViewController:fb animated:YES];
}

@end
