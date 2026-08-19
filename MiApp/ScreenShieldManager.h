#import <UIKit/UIKit.h>

@interface ScreenShieldManager : NSObject

+ (instancetype)sharedManager;

@property (nonatomic, assign) BOOL antiCapturaHabilitado;

- (void)inicializarProteccionEnVentana:(UIWindow *)window;
- (void)aplicarEstadoProteccion;

@end
