#import "KeyManager.h"
#import <UIKit/UIKit.h>

static NSString *const kPrefKeyAlmacenada = @"mifilza_license_key";
static NSString *const kPrefKeyExpira = @"mifilza_license_expira";
static NSString *const kPrefKeyTipo = @"mifilza_license_tipo";

@implementation KeyManager

+ (instancetype)sharedManager {
    static KeyManager *inst = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        inst = [[KeyManager alloc] init];
    });
    return inst;
}

- (NSString *)deviceId {
    NSString *u = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
    if (!u.length) u = @"MIFILZA-DEV-001";
    return [u substringToIndex:MIN((NSUInteger)8, u.length)];
}

- (NSString *)keyActual {
    return [[NSUserDefaults standardUserDefaults] stringForKey:kPrefKeyAlmacenada] ?: @"";
}

- (NSString *)tipoLicencia {
    return [[NSUserDefaults standardUserDefaults] stringForKey:kPrefKeyTipo] ?: @"Sin Licencia";
}

- (BOOL)isKeyValida {
    NSString *key = self.keyActual;
    if (!key.length) return NO;

    NSDate *expira = [[NSUserDefaults standardUserDefaults] objectForKey:kPrefKeyExpira];
    if (expira) {
        if ([[NSDate date] compare:expira] == NSOrderedDescending) {
            return NO; // Expirada
        }
    }
    return YES;
}

- (BOOL)esModoPrueba {
    return [self.tipoLicencia isEqualToString:@"Prueba (Trial)"];
}

- (NSTimeInterval)segundosRestantes {
    NSDate *expira = [[NSUserDefaults standardUserDefaults] objectForKey:kPrefKeyExpira];
    if (!expira) return -1; // Vitalicia
    NSTimeInterval diff = [expira timeIntervalSinceDate:[NSDate date]];
    return diff > 0 ? diff : 0;
}

- (NSString *)tiempoRestanteFormateado {
    NSDate *expira = [[NSUserDefaults standardUserDefaults] objectForKey:kPrefKeyExpira];
    if (!expira) return @"♾️ Vitalicia (Ilimitada)";
    
    NSTimeInterval diff = [expira timeIntervalSinceDate:[NSDate date]];
    if (diff <= 0) return @"⚠️ Expirada";
    
    NSInteger dias = (NSInteger)(diff / 86400);
    NSInteger horas = (NSInteger)((diff - (dias * 86400)) / 3600);
    NSInteger minutos = (NSInteger)((diff - (dias * 86400) - (horas * 3600)) / 60);
    NSInteger segundos = (NSInteger)diff % 60;
    
    if (dias > 0) {
        return [NSString stringWithFormat:@"%ldd %02ldh %02ldm %02lds", (long)dias, (long)horas, (long)minutos, (long)segundos];
    } else {
        return [NSString stringWithFormat:@"%02ldh %02ldm %02lds", (long)horas, (long)minutos, (long)segundos];
    }
}

- (NSInteger)diasRestantes {
    NSDate *expira = [[NSUserDefaults standardUserDefaults] objectForKey:kPrefKeyExpira];
    if (!expira) return 999; // Vitalicia
    NSTimeInterval diff = [expira timeIntervalSinceDate:[NSDate date]];
    if (diff <= 0) return 0;
    return (NSInteger)ceil(diff / 86400.0);
}

- (NSString *)fechaExpiracionStr {
    NSDate *expira = [[NSUserDefaults standardUserDefaults] objectForKey:kPrefKeyExpira];
    if (!expira) return @"Vitalicia (Ilimitada)";
    NSDateFormatter *df = [[NSDateFormatter alloc] init];
    [df setDateFormat:@"yyyy-MM-dd HH:mm"];
    return [df stringFromDate:expira];
}

- (BOOL)activarKey:(NSString *)key error:(NSString **)errorMsg {
    NSString *limpia = [[key stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] uppercaseString];
    
    if (!limpia.length) {
        if (errorMsg) *errorMsg = @"La llave no puede estar vacía.";
        return NO;
    }

    // Validación de keys
    if ([limpia hasPrefix:@"VIP-"] || [limpia isEqualToString:@"MIFILZA-VIP-2026"] || [limpia isEqualToString:@"MASTER-KEY"]) {
        // Licencia VIP Permanente
        [[NSUserDefaults standardUserDefaults] setObject:limpia forKey:kPrefKeyAlmacenada];
        [[NSUserDefaults standardUserDefaults] setObject:@"VIP Permanente" forKey:kPrefKeyTipo];
        [[NSUserDefaults standardUserDefaults] removeObjectForKey:kPrefKeyExpira];
        [[NSUserDefaults standardUserDefaults] synchronize];
        return YES;
    }

    if ([limpia hasPrefix:@"TRIAL-"] || [limpia isEqualToString:@"TEST-KEY"] || [limpia isEqualToString:@"PRUEBA-3DIAS"]) {
        // Licencia de Prueba de 3 Días
        NSDate *exp = [[NSDate date] dateByAddingTimeInterval:3 * 86400];
        [[NSUserDefaults standardUserDefaults] setObject:limpia forKey:kPrefKeyAlmacenada];
        [[NSUserDefaults standardUserDefaults] setObject:@"Prueba (Trial)" forKey:kPrefKeyTipo];
        [[NSUserDefaults standardUserDefaults] setObject:exp forKey:kPrefKeyExpira];
        [[NSUserDefaults standardUserDefaults] synchronize];
        return YES;
    }

    if ([limpia hasPrefix:@"EXP-"] || [limpia isEqualToString:@"KEY-EXPIRADA"]) {
        // Simulación de Key Expirada para pruebas
        NSDate *exp = [[NSDate date] dateByAddingTimeInterval:-3600]; // Expiró hace 1 hora
        [[NSUserDefaults standardUserDefaults] setObject:limpia forKey:kPrefKeyAlmacenada];
        [[NSUserDefaults standardUserDefaults] setObject:@"Expirada" forKey:kPrefKeyTipo];
        [[NSUserDefaults standardUserDefaults] setObject:exp forKey:kPrefKeyExpira];
        [[NSUserDefaults standardUserDefaults] synchronize];
        if (errorMsg) *errorMsg = @"Esta llave de prueba ha expirado.";
        return NO;
    }

    // Key genérica válida de 16 caracteres (formato XXXX-XXXX-XXXX-XXXX)
    if (limpia.length >= 10) {
        NSDate *exp = [[NSDate date] dateByAddingTimeInterval:7 * 86400]; // 7 días
        [[NSUserDefaults standardUserDefaults] setObject:limpia forKey:kPrefKeyAlmacenada];
        [[NSUserDefaults standardUserDefaults] setObject:@"Licencia Pro (7 Días)" forKey:kPrefKeyTipo];
        [[NSUserDefaults standardUserDefaults] setObject:exp forKey:kPrefKeyExpira];
        [[NSUserDefaults standardUserDefaults] synchronize];
        return YES;
    }

    if (errorMsg) *errorMsg = @"Código de llave inválido. Usa una key de prueba como 'TRIAL-MIFILZA' o 'MIFILZA-VIP-2026'.";
    return NO;
}

- (void)activarKeyPrueba {
    [self activarKey:@"TRIAL-MIFILZA-TEST" error:nil];
}

- (void)desactivarKey {
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:kPrefKeyAlmacenada];
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:kPrefKeyExpira];
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:kPrefKeyTipo];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

@end
