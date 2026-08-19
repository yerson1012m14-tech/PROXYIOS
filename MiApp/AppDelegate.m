#import "AppDelegate.h"
#import "ViewController.h"
#import "LoginKeyViewController.h"
#import "KeyManager.h"
#import "ScreenShieldManager.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    UINavigationBarAppearance *ap = [[UINavigationBarAppearance alloc] init];
    [ap configureWithDefaultBackground];
    [[UINavigationBar appearance] setStandardAppearance:ap];
    [[UINavigationBar appearance] setScrollEdgeAppearance:ap];
    [[UINavigationBar appearance] setTintColor:[UIColor colorWithRed:0.0 green:0.95 blue:0.5 alpha:1.0]];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];

    if ([[KeyManager sharedManager] isKeyValida]) {
        [self mostrarExplorador];
    } else {
        [self mostrarPantallaLoginKey];
    }

    [self.window makeKeyAndVisible];
    
    // Inicializar protección de pantalla y grabación
    [[ScreenShieldManager sharedManager] inicializarProteccionEnVentana:self.window];

    return YES;
}

- (void)mostrarPantallaLoginKey {
    LoginKeyViewController *login = [[LoginKeyViewController alloc] init];
    __weak typeof(self) weakSelf = self;
    login.onKeyActivada = ^{
        [weakSelf mostrarExplorador];
    };
    self.window.rootViewController = login;
}

- (void)mostrarExplorador {
    ViewController *vc = [[ViewController alloc] init];
    UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:vc];
    self.window.rootViewController = nav;
}

@end
