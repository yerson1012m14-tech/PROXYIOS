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

@end
