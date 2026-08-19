#import "ScreenShieldManager.h"

static NSString *const kAntiCapturaKey = @"kXITFORGE_AntiCapturaHabilitado";

@interface ScreenShieldManager ()
@property (nonatomic, weak) UIWindow *mainWindow;
@property (nonatomic, strong) UIView *shieldOverlayView;
@property (nonatomic, strong) UITextField *secureTextField;
@end

@implementation ScreenShieldManager

+ (instancetype)sharedManager {
    static ScreenShieldManager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[ScreenShieldManager alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        // Cargar estado guardado (por defecto desactivado para control del usuario)
        _antiCapturaHabilitado = [[NSUserDefaults standardUserDefaults] boolForKey:kAntiCapturaKey];

        // Observar cuando se inicia o detiene una grabación de pantalla en iOS
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(pantallaGrabandoCambio:)
                                                     name:UIScreenCapturedDidChangeNotification
                                                   object:nil];

        // Observar captura de pantalla
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(usuarioTomoCaptura:)
                                                     name:UIApplicationUserDidTakeScreenshotNotification
                                                   object:nil];
    }
    return self;
}

- (void)setAntiCapturaHabilitado:(BOOL)habilitado {
    _antiCapturaHabilitado = habilitado;
    [[NSUserDefaults standardUserDefaults] setBool:habilitado forKey:kAntiCapturaKey];
    [[NSUserDefaults standardUserDefaults] synchronize];
    [self aplicarEstadoProteccion];
}

- (void)inicializarProteccionEnVentana:(UIWindow *)window {
    self.mainWindow = window;
    [self aplicarEstadoProteccion];
}

- (void)aplicarEstadoProteccion {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!self.mainWindow) {
            self.mainWindow = [UIApplication sharedApplication].windows.firstObject;
        }

        if (self.antiCapturaHabilitado) {
            // Verificar si actualmente se está grabando la pantalla
            [self verificarGrabacionActiva];
            [self habilitarCapaSeguraiOS];
        } else {
            [self removerCapaSegura];
            [self removerOverlayEscudo];
        }
    });
}

// Técnica nativa de iOS: Capa de Seguridad de UITextField (isSecureTextEntry)
// Hace que el compositor gráfico del chip de Apple oculte el contenido en capturas y grabaciones
- (void)habilitarCapaSeguraiOS {
    if (self.secureTextField) return;
    if (!self.mainWindow) return;

    self.secureTextField = [[UITextField alloc] init];
    self.secureTextField.secureTextEntry = YES;
    self.secureTextField.userInteractionEnabled = NO;
    [self.mainWindow addSubview:self.secureTextField];
    [self.mainWindow sendSubviewToBack:self.secureTextField];

    self.secureTextField.layer.sublayers.firstObject.sublayerTransform = CATransform3DMakeTranslation(0, 0, 0);
}

- (void)removerCapaSegura {
    if (self.secureTextField) {
        [self.secureTextField removeFromSuperview];
        self.secureTextField = nil;
    }
}

// Notificación de inicio o fin de grabación de pantalla de iOS
- (void)pantallaGrabandoCambio:(NSNotification *)notif {
    if (self.antiCapturaHabilitado) {
        [self verificarGrabacionActiva];
    }
}

- (void)verificarGrabacionActiva {
    BOOL estaGrabando = [UIScreen mainScreen].isCaptured;
    if (estaGrabando && self.antiCapturaHabilitado) {
        [self mostrarOverlayEscudo];
    } else {
        [self removerOverlayEscudo];
    }
}

- (void)mostrarOverlayEscudo {
    if (self.shieldOverlayView) return;
    UIWindow *w = self.mainWindow ?: [UIApplication sharedApplication].windows.firstObject;
    if (!w) return;

    self.shieldOverlayView = [[UIView alloc] initWithFrame:w.bounds];
    self.shieldOverlayView.backgroundColor = [UIColor blackColor];
    self.shieldOverlayView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.shieldOverlayView.tag = 999111;

    UIImageView *iv = [[UIImageView alloc] initWithImage:[UIImage systemImageNamed:@"shield.slash.fill"]];
    iv.tintColor = [UIColor systemRedColor];
    iv.contentMode = UIViewContentModeScaleAspectFit;
    iv.translatesAutoresizingMaskIntoConstraints = NO;
    [self.shieldOverlayView addSubview:iv];

    UILabel *lbl = [[UILabel alloc] init];
    lbl.text = @"CONTENIDO PROTEGIDO";
    lbl.font = [UIFont fontWithName:@"Menlo-Bold" size:16] ?: [UIFont systemFontOfSize:16 weight:UIFontWeightBold];
    lbl.textColor = [UIColor whiteColor];
    lbl.textAlignment = NSTextAlignmentCenter;
    lbl.translatesAutoresizingMaskIntoConstraints = NO;
    [self.shieldOverlayView addSubview:lbl];

    UILabel *lblSub = [[UILabel alloc] init];
    lblSub.text = @"La grabación y captura de pantalla están bloqueadas por XITFORGE.";
    lblSub.font = [UIFont systemFontOfSize:12 weight:UIFontWeightMedium];
    lblSub.textColor = [UIColor colorWithWhite:0.6 alpha:1.0];
    lblSub.textAlignment = NSTextAlignmentCenter;
    lblSub.numberOfLines = 2;
    lblSub.translatesAutoresizingMaskIntoConstraints = NO;
    [self.shieldOverlayView addSubview:lblSub];

    [w addSubview:self.shieldOverlayView];
    [w bringSubviewToFront:self.shieldOverlayView];

    [NSLayoutConstraint activateConstraints:@[
        [iv.centerXAnchor constraintEqualToAnchor:self.shieldOverlayView.centerXAnchor],
        [iv.centerYAnchor constraintEqualToAnchor:self.shieldOverlayView.centerYAnchor constant:-40],
        [iv.widthAnchor constraintEqualToConstant:60],
        [iv.heightAnchor constraintEqualToConstant:60],

        [lbl.topAnchor constraintEqualToAnchor:iv.bottomAnchor constant:16],
        [lbl.leadingAnchor constraintEqualToAnchor:self.shieldOverlayView.leadingAnchor constant:24],
        [lbl.trailingAnchor constraintEqualToAnchor:self.shieldOverlayView.trailingAnchor constant:-24],

        [lblSub.topAnchor constraintEqualToAnchor:lbl.bottomAnchor constant:8],
        [lblSub.leadingAnchor constraintEqualToAnchor:self.shieldOverlayView.leadingAnchor constant:24],
        [lblSub.trailingAnchor constraintEqualToAnchor:self.shieldOverlayView.trailingAnchor constant:-24]
    ]];
}

- (void)removerOverlayEscudo {
    if (self.shieldOverlayView) {
        [self.shieldOverlayView removeFromSuperview];
        self.shieldOverlayView = nil;
    }
}

// Evento cuando se detecta una foto/screenshot
- (void)usuarioTomoCaptura:(NSNotification *)notif {
    if (self.antiCapturaHabilitado) {
        // Breve blackout para asegurar protección
        [self mostrarOverlayEscudo];
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.8 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            if (![UIScreen mainScreen].isCaptured) {
                [self removerOverlayEscudo];
            }
        });
    }
}

@end
