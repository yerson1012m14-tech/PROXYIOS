#import <Foundation/Foundation.h>

@interface KeyManager : NSObject

+ (instancetype)sharedManager;

@property (nonatomic, readonly) BOOL isKeyValida;
@property (nonatomic, readonly) BOOL esModoPrueba;
@property (nonatomic, copy, readonly) NSString *keyActual;
@property (nonatomic, copy, readonly) NSString *tipoLicencia;
@property (nonatomic, copy, readonly) NSString *fechaExpiracionStr;
@property (nonatomic, readonly) NSInteger diasRestantes;
@property (nonatomic, copy, readonly) NSString *tiempoRestanteFormateado;
@property (nonatomic, readonly) NSTimeInterval segundosRestantes;
@property (nonatomic, copy, readonly) NSString *deviceId;

- (BOOL)activarKey:(NSString *)key error:(NSString **)errorMsg;
- (void)activarKeyPrueba;
- (void)desactivarKey;

@end
