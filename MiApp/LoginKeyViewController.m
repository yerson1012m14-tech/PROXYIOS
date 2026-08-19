#import "LoginKeyViewController.h"
#import "KeyManager.h"
#import "ViewController.h"
#import <sys/utsname.h>
#import <sys/sysctl.h>

@interface LoginKeyViewController () <UITextFieldDelegate>
@property (nonatomic, strong) UITextField *tfKey;
@property (nonatomic, strong) UILabel *lblError;
@property (nonatomic, strong) UIButton *btnActivar;
@property (nonatomic, strong) UIButton *btnPegar;
@property (nonatomic, strong) UILabel *lblDispositivo;
@property (nonatomic, strong) UILabel *lblBuildNumber;
@property (nonatomic, strong) UILabel *lblCompatibilidad;
@end

@implementation LoginKeyViewController

// Obtiene el identificador de hardware real y mapea al nombre comercial de Apple
static NSString *obtenerModeloDispositivo() {
    struct utsname systemInfo;
    uname(&systemInfo);
    NSString *code = [NSString stringWithCString:systemInfo.machine encoding:NSUTF8StringEncoding];
    
    if (!code || code.length == 0) {
        size_t size;
        sysctlbyname("hw.machine", NULL, &size, NULL, 0);
        char *machine = malloc(size);
        sysctlbyname("hw.machine", machine, &size, NULL, 0);
        if (machine) {
            code = [NSString stringWithUTF8String:machine];
            free(machine);
        }
    }
    
    // Diccionario completo de mapeo oficial de hardware Apple iOS
    static NSDictionary *deviceMap = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        deviceMap = @{
            // iPhone 16 Series
            @"iPhone17,1": @"iPhone 16 Pro",
            @"iPhone17,2": @"iPhone 16 Pro Max",
            @"iPhone17,3": @"iPhone 16",
            @"iPhone17,4": @"iPhone 16 Plus",
            
            // iPhone 15 Series
            @"iPhone16,1": @"iPhone 15 Pro",
            @"iPhone16,2": @"iPhone 15 Pro Max",
            @"iPhone15,4": @"iPhone 15",
            @"iPhone15,5": @"iPhone 15 Plus",
            
            // iPhone 14 Series
            @"iPhone15,2": @"iPhone 14 Pro",
            @"iPhone15,3": @"iPhone 14 Pro Max",
            @"iPhone14,7": @"iPhone 14",
            @"iPhone14,8": @"iPhone 14 Plus",
            
            // iPhone 13 Series
            @"iPhone14,2": @"iPhone 13 Pro",
            @"iPhone14,3": @"iPhone 13 Pro Max",
            @"iPhone14,4": @"iPhone 13 mini",
            @"iPhone14,5": @"iPhone 13",
            
            // iPhone 12 Series
            @"iPhone13,1": @"iPhone 12 mini",
            @"iPhone13,2": @"iPhone 12",
            @"iPhone13,3": @"iPhone 12 Pro",
            @"iPhone13,4": @"iPhone 12 Pro Max",
            
            // iPhone 11 Series
            @"iPhone12,1": @"iPhone 11",
            @"iPhone12,3": @"iPhone 11 Pro",
            @"iPhone12,5": @"iPhone 11 Pro Max",
            
            // iPhone XS / XR / X / 8 / SE
            @"iPhone11,2": @"iPhone XS",
            @"iPhone11,4": @"iPhone XS Max",
            @"iPhone11,6": @"iPhone XS Max",
            @"iPhone11,8": @"iPhone XR",
            @"iPhone10,3": @"iPhone X",
            @"iPhone10,6": @"iPhone X",
            @"iPhone10,1": @"iPhone 8",
            @"iPhone10,4": @"iPhone 8",
            @"iPhone10,2": @"iPhone 8 Plus",
            @"iPhone10,5": @"iPhone 8 Plus",
            @"iPhone12,8": @"iPhone SE (2nd gen)",
            @"iPhone14,6": @"iPhone SE (3rd gen)",
            
            // iPad Pro / Air / Mini
            @"iPad13,1": @"iPad Air (4th gen)",
            @"iPad13,2": @"iPad Air (4th gen)",
            @"iPad13,16": @"iPad Air (5th gen)",
            @"iPad13,17": @"iPad Air (5th gen)",
            @"iPad14,3": @"iPad Pro 11-inch (4th gen)",
            @"iPad14,4": @"iPad Pro 11-inch (4th gen)",
            @"iPad14,5": @"iPad Pro 12.9-inch (6th gen)",
            @"iPad14,6": @"iPad Pro 12.9-inch (6th gen)",
            @"iPad16,3": @"iPad Pro 11-inch (M4)",
            @"iPad16,4": @"iPad Pro 11-inch (M4)",
            @"iPad16,5": @"iPad Pro 13-inch (M4)",
            @"iPad16,6": @"iPad Pro 13-inch (M4)",
            
            // Simuladores y Macs
            @"x86_64": @"iPhone Simulator",
            @"arm64": @"iPhone (Apple Silicon)"
        };
    });
    
    if (code && deviceMap[code]) {
        return deviceMap[code];
    }
    
    if (code && code.length > 0) {
        return [NSString stringWithFormat:@"%@ (%@)", [UIDevice currentDevice].model, code];
    }
    
    return [UIDevice currentDevice].model ?: @"iPhone";
}

// Obtiene el build del kernel de iOS (ej: 21F79)
static NSString *obtenerBuildNumber() {
    size_t size;
    sysctlbyname("kern.osversion", NULL, &size, NULL, 0);
    char *version = malloc(size);
    sysctlbyname("kern.osversion", version, &size, NULL, 0);
    NSString *build = @"";
    if (version) {
        build = [NSString stringWithUTF8String:version];
        free(version);
    }
    return build;
}

// Verifica compatibilidad estricta con iOS 27 Beta 4
static BOOL verificarCompatibilidad(NSString *versionStr) {
    if (!versionStr || versionStr.length == 0) return YES;
    
    NSArray *components = [versionStr componentsSeparatedByString:@"."];
    NSInteger major = components.count > 0 ? [components[0] integerValue] : 0;
    NSInteger minor = components.count > 1 ? [components[1] integerValue] : 0;
    
    if (major < 27) {
        return YES;
    }
    if (major == 27) {
        return (minor <= 4);
    }
    return NO;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor colorWithRed:0.03 green:0.03 blue:0.04 alpha:1.0];

    UIScrollView *scrollView = [[UIScrollView alloc] initWithFrame:CGRectZero];
    scrollView.translatesAutoresizingMaskIntoConstraints = NO;
    scrollView.alwaysBounceVertical = YES;
    scrollView.keyboardDismissMode = UIScrollViewKeyboardDismissModeOnDrag;
    [self.view addSubview:scrollView];

    UIView *contentView = [[UIView alloc] initWithFrame:CGRectZero];
    contentView.translatesAutoresizingMaskIntoConstraints = NO;
    [scrollView addSubview:contentView];

    // Logo Contenedor Estilizado
    UIView *iconBox = [[UIView alloc] init];
    iconBox.backgroundColor = [UIColor colorWithRed:0.0 green:0.25 blue:0.12 alpha:0.35];
    iconBox.layer.cornerRadius = 24;
    iconBox.layer.borderWidth = 1.5;
    iconBox.layer.borderColor = [UIColor colorWithRed:0.0 green:0.85 blue:0.45 alpha:0.6].CGColor;
    iconBox.translatesAutoresizingMaskIntoConstraints = NO;
    [contentView addSubview:iconBox];

    UIImageView *ivIcon = [[UIImageView alloc] initWithImage:[UIImage systemImageNamed:@"flame.fill"]];
    ivIcon.tintColor = [UIColor colorWithRed:0.0 green:0.95 blue:0.5 alpha:1.0];
    ivIcon.contentMode = UIViewContentModeScaleAspectFit;
    ivIcon.translatesAutoresizingMaskIntoConstraints = NO;
    [iconBox addSubview:ivIcon];

    // Título estilizado XITFORGE
    UILabel *lblTitulo = [[UILabel alloc] init];
    NSMutableAttributedString *attrStr = [[NSMutableAttributedString alloc] initWithString:@"XIT" attributes:@{
        NSFontAttributeName: [UIFont systemFontOfSize:32 weight:UIFontWeightHeavy],
        NSForegroundColorAttributeName: [UIColor whiteColor],
        NSKernAttributeName: @(2.0)
    }];
    [attrStr appendAttributedString:[[NSAttributedString alloc] initWithString:@"FORGE" attributes:@{
        NSFontAttributeName: [UIFont systemFontOfSize:32 weight:UIFontWeightHeavy],
        NSForegroundColorAttributeName: [UIColor colorWithRed:0.0 green:0.95 blue:0.5 alpha:1.0],
        NSKernAttributeName: @(2.5)
    }]];
    lblTitulo.attributedText = attrStr;
    lblTitulo.textAlignment = NSTextAlignmentCenter;
    lblTitulo.translatesAutoresizingMaskIntoConstraints = NO;
    [contentView addSubview:lblTitulo];

    // Subtítulo elegante
    UILabel *lblSub = [[UILabel alloc] init];
    lblSub.text = @"UNRESTRICTED ENGINE";
    lblSub.font = [UIFont fontWithName:@"Menlo-Bold" size:10] ?: [UIFont systemFontOfSize:10 weight:UIFontWeightBold];
    lblSub.textColor = [UIColor colorWithWhite:0.45 alpha:1.0];
    lblSub.textAlignment = NSTextAlignmentCenter;
    lblSub.translatesAutoresizingMaskIntoConstraints = NO;
    [contentView addSubview:lblSub];

    // Campo de texto Key con placeholder XXXX-XXXX-XXXX-XXXX
    UIView *inputContainer = [[UIView alloc] init];
    inputContainer.backgroundColor = [UIColor colorWithWhite:0.08 alpha:1.0];
    inputContainer.layer.cornerRadius = 16;
    inputContainer.layer.borderWidth = 1.2;
    inputContainer.layer.borderColor = [UIColor colorWithWhite:0.18 alpha:1.0].CGColor;
    inputContainer.translatesAutoresizingMaskIntoConstraints = NO;
    [contentView addSubview:inputContainer];

    self.tfKey = [[UITextField alloc] init];
    self.tfKey.placeholder = @"XXXX-XXXX-XXXX-XXXX";
    self.tfKey.font = [UIFont fontWithName:@"Menlo-Bold" size:15] ?: [UIFont systemFontOfSize:15 weight:UIFontWeightBold];
    self.tfKey.textColor = [UIColor colorWithRed:0.0 green:0.95 blue:0.5 alpha:1.0];
    self.tfKey.textAlignment = NSTextAlignmentLeft;
    self.tfKey.autocapitalizationType = UITextAutocapitalizationTypeAllCharacters;
    self.tfKey.autocorrectionType = UITextAutocorrectionTypeNo;
    self.tfKey.delegate = self;
    [self.tfKey addTarget:self action:@selector(formatearTextoKey:) forControlEvents:UIControlEventEditingChanged];
    self.tfKey.translatesAutoresizingMaskIntoConstraints = NO;
    [inputContainer addSubview:self.tfKey];

    // Botón con Icono de Portapapeles (Copiar/Pegar Documentos Superpuestos)
    self.btnPegar = [UIButton buttonWithType:UIButtonTypeSystem];
    UIImageSymbolConfiguration *config = [UIImageSymbolConfiguration configurationWithPointSize:15 weight:UIImageSymbolWeightSemibold];
    UIImage *imgPaste = [UIImage systemImageNamed:@"doc.on.doc" withConfiguration:config];
    [self.btnPegar setImage:imgPaste forState:UIControlStateNormal];
    self.btnPegar.tintColor = [UIColor colorWithRed:0.0 green:0.95 blue:0.5 alpha:1.0];
    self.btnPegar.backgroundColor = [UIColor colorWithRed:0.0 green:0.25 blue:0.12 alpha:0.4];
    self.btnPegar.layer.cornerRadius = 11;
    self.btnPegar.layer.borderWidth = 1;
    self.btnPegar.layer.borderColor = [UIColor colorWithRed:0.0 green:0.85 blue:0.45 alpha:0.4].CGColor;
    [self.btnPegar addTarget:self action:@selector(pegarPortapapeles) forControlEvents:UIControlEventTouchUpInside];
    self.btnPegar.translatesAutoresizingMaskIntoConstraints = NO;
    [inputContainer addSubview:self.btnPegar];

    // Botón Principal: ACTIVAR
    self.btnActivar = [UIButton buttonWithType:UIButtonTypeSystem];
    [self.btnActivar setTitle:@"ACTIVAR" forState:UIControlStateNormal];
    self.btnActivar.titleLabel.font = [UIFont systemFontOfSize:15 weight:UIFontWeightBold];
    [self.btnActivar setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    self.btnActivar.backgroundColor = [UIColor colorWithRed:0.0 green:0.95 blue:0.5 alpha:1.0];
    self.btnActivar.layer.cornerRadius = 16;
    [self.btnActivar addTarget:self action:@selector(tocarActivar) forControlEvents:UIControlEventTouchUpInside];
    self.btnActivar.translatesAutoresizingMaskIntoConstraints = NO;
    [contentView addSubview:self.btnActivar];

    // Mensaje de Error
    self.lblError = [[UILabel alloc] init];
    self.lblError.text = @"";
    self.lblError.font = [UIFont systemFontOfSize:12 weight:UIFontWeightMedium];
    self.lblError.textColor = [UIColor systemRedColor];
    self.lblError.textAlignment = NSTextAlignmentCenter;
    self.lblError.numberOfLines = 2;
    self.lblError.translatesAutoresizingMaskIntoConstraints = NO;
    [contentView addSubview:self.lblError];

    // =========================================================================
    // TARJETA DE DETECCIÓN REAL DE DISPOSITIVO & COMPATIBILIDAD (HASTA iOS 27 BETA 4)
    // =========================================================================
    UIView *cardDevice = [[UIView alloc] init];
    cardDevice.backgroundColor = [UIColor colorWithWhite:0.06 alpha:1.0];
    cardDevice.layer.cornerRadius = 16;
    cardDevice.layer.borderWidth = 1;
    cardDevice.layer.borderColor = [UIColor colorWithWhite:0.14 alpha:1.0].CGColor;
    cardDevice.translatesAutoresizingMaskIntoConstraints = NO;
    [contentView addSubview:cardDevice];

    // Consultas REALES del hardware físico y versión de iOS
    NSString *modeloReal = obtenerModeloDispositivo();
    NSString *versionReal = [UIDevice currentDevice].systemVersion;
    BOOL esCompatible = verificarCompatibilidad(versionReal);

    UIImageView *ivPhone = [[UIImageView alloc] initWithImage:[UIImage systemImageNamed:@"iphone"]];
    ivPhone.tintColor = [UIColor colorWithRed:0.0 green:0.95 blue:0.5 alpha:1.0];
    ivPhone.contentMode = UIViewContentModeScaleAspectFit;
    ivPhone.translatesAutoresizingMaskIntoConstraints = NO;
    [cardDevice addSubview:ivPhone];

    self.lblDispositivo = [[UILabel alloc] init];
    self.lblDispositivo.text = [NSString stringWithFormat:@"%@  •  iOS %@", modeloReal, versionReal];
    self.lblDispositivo.font = [UIFont fontWithName:@"Menlo-Bold" size:11] ?: [UIFont systemFontOfSize:11 weight:UIFontWeightBold];
    self.lblDispositivo.textColor = [UIColor whiteColor];
    self.lblDispositivo.translatesAutoresizingMaskIntoConstraints = NO;
    [cardDevice addSubview:self.lblDispositivo];

    // Badge de Compatibilidad Dinámico
    UIView *badgeCompat = [[UIView alloc] init];
    badgeCompat.backgroundColor = esCompatible ? [UIColor colorWithRed:0.0 green:0.25 blue:0.12 alpha:0.4] : [UIColor colorWithRed:0.3 green:0.0 blue:0.0 alpha:0.4];
    badgeCompat.layer.cornerRadius = 8;
    badgeCompat.layer.borderWidth = 1;
    badgeCompat.layer.borderColor = esCompatible ? [UIColor colorWithRed:0.0 green:0.85 blue:0.45 alpha:0.4].CGColor : [UIColor systemRedColor].CGColor;
    badgeCompat.translatesAutoresizingMaskIntoConstraints = NO;
    [cardDevice addSubview:badgeCompat];

    self.lblCompatibilidad = [[UILabel alloc] init];
    self.lblCompatibilidad.text = esCompatible ? @"✓ COMPATIBLE (Hasta iOS 27 Beta 4)" : @"✕ NO COMPATIBLE (> iOS 27 Beta 4)";
    self.lblCompatibilidad.font = [UIFont fontWithName:@"Menlo-Bold" size:10] ?: [UIFont systemFontOfSize:10 weight:UIFontWeightBold];
    self.lblCompatibilidad.textColor = esCompatible ? [UIColor colorWithRed:0.0 green:0.95 blue:0.5 alpha:1.0] : [UIColor systemRedColor];
    self.lblCompatibilidad.textAlignment = NSTextAlignmentCenter;
    self.lblCompatibilidad.translatesAutoresizingMaskIntoConstraints = NO;
    [badgeCompat addSubview:self.lblCompatibilidad];

    // Auto Layout constraints
    [NSLayoutConstraint activateConstraints:@[
        [scrollView.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor],
        [scrollView.bottomAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.bottomAnchor],
        [scrollView.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],
        [scrollView.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],

        [contentView.topAnchor constraintEqualToAnchor:scrollView.contentLayoutGuide.topAnchor],
        [contentView.bottomAnchor constraintEqualToAnchor:scrollView.contentLayoutGuide.bottomAnchor],
        [contentView.leadingAnchor constraintEqualToAnchor:scrollView.contentLayoutGuide.leadingAnchor],
        [contentView.trailingAnchor constraintEqualToAnchor:scrollView.contentLayoutGuide.trailingAnchor],
        [contentView.widthAnchor constraintEqualToAnchor:scrollView.frameLayoutGuide.widthAnchor],

        [iconBox.topAnchor constraintEqualToAnchor:contentView.topAnchor constant:40],
        [iconBox.centerXAnchor constraintEqualToAnchor:contentView.centerXAnchor],
        [iconBox.widthAnchor constraintEqualToConstant:70],
        [iconBox.heightAnchor constraintEqualToConstant:70],

        [ivIcon.centerXAnchor constraintEqualToAnchor:iconBox.centerXAnchor],
        [ivIcon.centerYAnchor constraintEqualToAnchor:iconBox.centerYAnchor],
        [ivIcon.widthAnchor constraintEqualToConstant:36],
        [ivIcon.heightAnchor constraintEqualToConstant:36],

        [lblTitulo.topAnchor constraintEqualToAnchor:iconBox.bottomAnchor constant:14],
        [lblTitulo.leadingAnchor constraintEqualToAnchor:contentView.leadingAnchor constant:20],
        [lblTitulo.trailingAnchor constraintEqualToAnchor:contentView.trailingAnchor constant:-20],

        [lblSub.topAnchor constraintEqualToAnchor:lblTitulo.bottomAnchor constant:4],
        [lblSub.leadingAnchor constraintEqualToAnchor:contentView.leadingAnchor constant:20],
        [lblSub.trailingAnchor constraintEqualToAnchor:contentView.trailingAnchor constant:-20],

        [inputContainer.topAnchor constraintEqualToAnchor:lblSub.bottomAnchor constant:28],
        [inputContainer.leadingAnchor constraintEqualToAnchor:contentView.leadingAnchor constant:24],
        [inputContainer.trailingAnchor constraintEqualToAnchor:contentView.trailingAnchor constant:-24],
        [inputContainer.heightAnchor constraintEqualToConstant:50],

        [self.tfKey.leadingAnchor constraintEqualToAnchor:inputContainer.leadingAnchor constant:16],
        [self.tfKey.trailingAnchor constraintEqualToAnchor:self.btnPegar.leadingAnchor constant:-8],
        [self.tfKey.topAnchor constraintEqualToAnchor:inputContainer.topAnchor],
        [self.tfKey.bottomAnchor constraintEqualToAnchor:inputContainer.bottomAnchor],

        [self.btnPegar.trailingAnchor constraintEqualToAnchor:inputContainer.trailingAnchor constant:-8],
        [self.btnPegar.centerYAnchor constraintEqualToAnchor:inputContainer.centerYAnchor],
        [self.btnPegar.widthAnchor constraintEqualToConstant:36],
        [self.btnPegar.heightAnchor constraintEqualToConstant:36],

        [self.btnActivar.topAnchor constraintEqualToAnchor:inputContainer.bottomAnchor constant:16],
        [self.btnActivar.leadingAnchor constraintEqualToAnchor:contentView.leadingAnchor constant:24],
        [self.btnActivar.trailingAnchor constraintEqualToAnchor:contentView.trailingAnchor constant:-24],
        [self.btnActivar.heightAnchor constraintEqualToConstant:48],

        [self.lblError.topAnchor constraintEqualToAnchor:self.btnActivar.bottomAnchor constant:10],
        [self.lblError.leadingAnchor constraintEqualToAnchor:contentView.leadingAnchor constant:24],
        [self.lblError.trailingAnchor constraintEqualToAnchor:contentView.trailingAnchor constant:-24],

        // Constraints de Card Dispositivo
        [cardDevice.topAnchor constraintEqualToAnchor:self.lblError.bottomAnchor constant:24],
        [cardDevice.leadingAnchor constraintEqualToAnchor:contentView.leadingAnchor constant:24],
        [cardDevice.trailingAnchor constraintEqualToAnchor:contentView.trailingAnchor constant:-24],
        [cardDevice.bottomAnchor constraintEqualToAnchor:contentView.bottomAnchor constant:-40],

        [ivPhone.leadingAnchor constraintEqualToAnchor:cardDevice.leadingAnchor constant:14],
        [ivPhone.topAnchor constraintEqualToAnchor:cardDevice.topAnchor constant:14],
        [ivPhone.widthAnchor constraintEqualToConstant:20],
        [ivPhone.heightAnchor constraintEqualToConstant:20],

        [self.lblDispositivo.leadingAnchor constraintEqualToAnchor:ivPhone.trailingAnchor constant:10],
        [self.lblDispositivo.centerYAnchor constraintEqualToAnchor:ivPhone.centerYAnchor],
        [self.lblDispositivo.trailingAnchor constraintEqualToAnchor:cardDevice.trailingAnchor constant:-14],

        [badgeCompat.topAnchor constraintEqualToAnchor:self.lblDispositivo.bottomAnchor constant:12],
        [badgeCompat.leadingAnchor constraintEqualToAnchor:cardDevice.leadingAnchor constant:12],
        [badgeCompat.trailingAnchor constraintEqualToAnchor:cardDevice.trailingAnchor constant:-12],
        [badgeCompat.heightAnchor constraintEqualToConstant:28],
        [badgeCompat.bottomAnchor constraintEqualToAnchor:cardDevice.bottomAnchor constant:-12],

        [self.lblCompatibilidad.centerXAnchor constraintEqualToAnchor:badgeCompat.centerXAnchor],
        [self.lblCompatibilidad.centerYAnchor constraintEqualToAnchor:badgeCompat.centerYAnchor]
    ]];
}

- (void)pegarPortapapeles {
    NSString *clip = [UIPasteboard generalPasteboard].string;
    if (clip.length) {
        self.tfKey.text = clip;
        [self formatearTextoKey:self.tfKey];
        
        UIImpactFeedbackGenerator *gen = [[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleMedium];
        [gen impactOccurred];
    }
}

- (void)formatearTextoKey:(UITextField *)tf {
    NSString *clean = [[tf.text uppercaseString] stringByReplacingOccurrencesOfString:@"-" withString:@""];
    clean = [clean stringByReplacingOccurrencesOfString:@" " withString:@""];
    if (clean.length > 16) {
        clean = [clean substringToIndex:16];
    }
    
    NSMutableString *formatted = [NSMutableString new];
    for (NSUInteger i = 0; i < clean.length; i++) {
        if (i > 0 && i % 4 == 0) {
            [formatted appendString:@"-"];
        }
        [formatted appendFormat:@"%C", [clean characterAtIndex:i]];
    }
    tf.text = formatted;
}

- (void)tocarActivar {
    [self.view endEditing:YES];
    NSString *k = self.tfKey.text;
    NSString *err = nil;
    BOOL ok = [[KeyManager sharedManager] activarKey:k error:&err];
    if (ok) {
        [self pasarAlExplorador];
    } else {
        self.lblError.text = err ?: @"Key inválida.";
    }
}

- (void)pasarAlExplorador {
    if (self.onKeyActivada) {
        self.onKeyActivada();
    } else {
        ViewController *vc = [[ViewController alloc] init];
        UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:vc];
        [UIApplication sharedApplication].windows.firstObject.rootViewController = nav;
    }
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    [self tocarActivar];
    return YES;
}

@end
