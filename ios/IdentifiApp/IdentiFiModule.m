#import <RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <objc/runtime.h>

// Conditional import for device vs simulator
#if TARGET_OS_SIMULATOR
// For simulator, we'll create a mock interface
@protocol IdentiFiDelegate <NSObject>
@optional
// Communication link callbacks
- (void)onConnection;
- (void)onConnectionError:(NSString *)errorDescription;
- (void)onConnectionTimeOut;
- (void)onDisconnection;
// Fingerprint capture callbacks
- (void)onStreaming:(UIImage *)fpImage;
- (void)onLastFrame:(UIImage *)fpImage fpImageSavedAt:(int)savedAtIndex;
- (void)onLastFrame_RAW:(NSData *)rawFpImageData fpImageSavedAt:(int)savedAtIndex;
- (void)onFpCaptureStatus:(int)fpCaptureStatus;
- (void)onCancelFpCapture;
// Rolled fingerprint callbacks
- (void)onStreamingRolledFp:(UIImage *)fpImage;
- (void)onLastFrameRolledFp:(UIImage *)fpImage fpImageSavedAt:(int)savedAtIndex;
- (void)onLastFrameRolledFp_RAW:(NSData *)rawFpImageData fpImageSavedAt:(int)savedAtIndex;
// Iris capture callbacks
- (void)onIrisCaptureStatus:(int)irisCaptureStatus;
- (void)onStreamingLeftIris:(UIImage *)leftIrisImage;
- (void)onStreamingRightIris:(UIImage *)rightIrisImage;
- (void)onLastFrameLeftIris:(UIImage *)leftIrisImage qualityLeft:(double)qualityLeft qualityRight:(double)qualityRight;
- (void)onCancelIrisCapture;
// Iris power callbacks
- (void)onSetIrisPowerOn:(Boolean)irisPowerStatus;
- (void)onSetIrisPowerOff;
- (void)onGetIrisPowerStatus:(Boolean)irisPowerStatus;
// Device information callbacks
- (void)onGetBatteryPercentage:(int)percentLevel;
- (void)onGetDeviceSerialNumber:(NSString *)serialNumber;
- (void)onGetFirmwareVersion:(NSString *)firmwareVersion;
- (void)onGetModelNumber:(NSString *)model;
- (void)onGetReaderDescription:(NSString *)deviceDescription;
// Settings callbacks
- (void)onSetLEDBrightness:(int)ledBrightness;
- (void)onGetLEDBrightness:(int)ledBrightness;
- (void)onSetMinimumNFIQScore:(int)minimumNFIQScore;
// Power management callbacks
- (void)onGetFpPowerStatus:(Boolean)fpPowerStatus;
- (void)onSetFpPowerOn:(Boolean)fpPowerStatus;
- (void)onSetFpPowerOff;
@end

@interface IdentiFi : NSObject
@property (nonatomic, weak) id<IdentiFiDelegate> delegate;
// Communication methods
- (void)connect;
- (void)disconnect;
// Device information methods
- (void)getBatteryPercentage;
- (void)getDeviceSerialNumber;
- (void)getFirmwareVersion;
- (NSString *)getLibraryVersion;
- (void)getModelNumber;
- (void)getReaderDescription;
// Fingerprint capture methods
- (void)startCaptureOneFinger:(int)savedAtIndex;
- (void)startCaptureTwoFinger:(int)savedAtIndex;
- (void)startCaptureFourFinger:(int)savedAtIndex;
- (void)startCaptureRollFinger:(int)savedAtIndex;
- (void)cancelFpCapture;
// Iris capture methods
- (void)startCaptureIris;
- (void)cancelIrisCapture;
// Iris power management
- (void)getIrisPowerStatus;
- (void)setIrisPowerOn;
- (void)setIrisPowerOff;
// Power management methods
- (void)getFpPowerStatus;
- (void)setFpPowerOn;
- (void)setFpPowerOff;
// Settings methods
- (void)setLEDBrightness:(int)ledBrightness;
- (void)getLEDBrightness;
- (void)setMinimumNFIQScore:(int)minimumNFIQScore;
@end

// Mock implementation for simulator
@implementation IdentiFi
- (void)connect { NSLog(@"[Simulator] IdentiFi connect called"); }
- (void)disconnect { NSLog(@"[Simulator] IdentiFi disconnect called"); }
- (void)getBatteryPercentage { NSLog(@"[Simulator] getBatteryPercentage called"); }
- (void)getDeviceSerialNumber { NSLog(@"[Simulator] getDeviceSerialNumber called"); }
- (void)getFirmwareVersion { NSLog(@"[Simulator] getFirmwareVersion called"); }
- (void)getModelNumber { NSLog(@"[Simulator] getModelNumber called"); }
- (void)getReaderDescription { NSLog(@"[Simulator] getReaderDescription called"); }
- (void)startCaptureOneFinger:(int)savedAtIndex { NSLog(@"[Simulator] startCaptureOneFinger: %d", savedAtIndex); }
- (void)startCaptureTwoFinger:(int)savedAtIndex { NSLog(@"[Simulator] startCaptureTwoFinger: %d", savedAtIndex); }
- (void)startCaptureFourFinger:(int)savedAtIndex { NSLog(@"[Simulator] startCaptureFourFinger: %d", savedAtIndex); }
- (void)startCaptureRollFinger:(int)savedAtIndex { NSLog(@"[Simulator] startCaptureRollFinger: %d", savedAtIndex); }
- (void)cancelFpCapture { NSLog(@"[Simulator] cancelFpCapture called"); }
- (void)startCaptureIris { NSLog(@"[Simulator] startCaptureIris called"); }
- (void)cancelIrisCapture { NSLog(@"[Simulator] cancelIrisCapture called"); }
- (void)setFpPowerOn { NSLog(@"[Simulator] setFpPowerOn called"); }
- (void)setFpPowerOff { NSLog(@"[Simulator] setFpPowerOff called"); }
- (void)getFpPowerStatus { NSLog(@"[Simulator] getFpPowerStatus called"); }
- (void)setIrisPowerOn { NSLog(@"[Simulator] setIrisPowerOn called"); }
- (void)setIrisPowerOff { NSLog(@"[Simulator] setIrisPowerOff called"); }
- (void)getIrisPowerStatus { NSLog(@"[Simulator] getIrisPowerStatus called"); }
- (void)setLEDBrightness:(int)brightness { NSLog(@"[Simulator] setLEDBrightness: %d", brightness); }
- (void)getLEDBrightness { NSLog(@"[Simulator] getLEDBrightness called"); }
- (void)setMinimumNFIQScore:(int)score { NSLog(@"[Simulator] setMinimumNFIQScore: %d", score); }
- (void)setLEDControlForPowerLED:(int)power fp:(int)fp com:(int)com iris:(int)iris mSecOn:(int)mSecOn mSecOff:(int)mSecOff { 
    NSLog(@"[Simulator] setLEDControlForPowerLED: power:%d fp:%d com:%d iris:%d mSecOn:%d mSecOff:%d", power, fp, com, iris, mSecOn, mSecOff); 
}
- (NSString *)getLibraryVersion { NSLog(@"[Simulator] getLibraryVersion called"); return @"1.6.0.0"; }
@end

#else
// For device, we'll use runtime loading of the Swift framework
// No compile-time imports needed since we use NSClassFromString
#endif

// Define a unified interface that works for both simulator and device
@interface IdentiFiModule : RCTEventEmitter <RCTBridgeModule>

#if TARGET_OS_SIMULATOR
@property (nonatomic, strong) IdentiFi *identifiSDK;
#else
// For device, we need to use the real IdentiFI Swift class
@property (nonatomic, strong) id identifiSDK;
#endif

@end

@implementation IdentiFiModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        NSLog(@"[IdentiFI] 🚀 IdentiFiModule initializing...");
        
#if TARGET_OS_SIMULATOR
        NSLog(@"[IdentiFI] 🖥️ SIMULATOR MODE - Creating mock SDK instance");
        self.identifiSDK = [[IdentiFi alloc] init];
        self.identifiSDK.delegate = self;
        NSLog(@"[IdentiFI] ✅ Mock SDK instance created and delegate set");
#else
        NSLog(@"[IdentiFI] 📱 DEVICE MODE - Attempting to load real IdentiFI framework");
        NSLog(@"[IdentiFI] 🔍 Searching for IdentiFI framework classes...");
        
        // Try different class name variations
        NSArray *classNames = @[@"IdentiFI", @"IdentiFi.IdentiFI", @"IdentiFI.IdentiFI", @"IdentiFi"];
        Class IdentiFIClass = nil;
        
        for (NSString *className in classNames) {
            IdentiFIClass = NSClassFromString(className);
            NSLog(@"[IdentiFI] 🔎 Trying class name: '%@' - Found: %@", className, IdentiFIClass ? @"✅ YES" : @"❌ NO");
            if (IdentiFIClass) {
                NSLog(@"[IdentiFI] 🎯 Found working class name: %@", className);
                break;
            }
        }
        
        if (IdentiFIClass) {
            NSLog(@"[IdentiFI] ✅ Successfully found IdentiFI class: %@", IdentiFIClass);
            @try {
                self.identifiSDK = [[IdentiFIClass alloc] init];
                NSLog(@"[IdentiFI] ✅ Created IdentiFI instance: %@", self.identifiSDK);
                NSLog(@"[IdentiFI] 📋 Instance class: %@", NSStringFromClass([self.identifiSDK class]));
                
                // Log available methods
                unsigned int methodCount;
                Method *methods = class_copyMethodList([self.identifiSDK class], &methodCount);
                NSMutableArray *methodNames = [NSMutableArray array];
                NSMutableArray *serialMethods = [NSMutableArray array];
                for (unsigned int i = 0; i < methodCount; i++) {
                    NSString *methodName = NSStringFromSelector(method_getName(methods[i]));
                    [methodNames addObject:methodName];
                    
                    // Look specifically for serial number related methods
                    if ([[methodName lowercaseString] rangeOfString:@"serial"].location != NSNotFound) {
                        [serialMethods addObject:methodName];
                    }
                }
                free(methods);
                NSLog(@"[IdentiFI] 📋 Available methods: %@", [methodNames componentsJoinedByString:@", "]);
                NSLog(@"[IdentiFI] 🏷️ Serial number related methods: %@", [serialMethods componentsJoinedByString:@", "]);
                
                // Try to set delegate if the property exists
                if ([self.identifiSDK respondsToSelector:@selector(setDelegate:)]) {
                    [self.identifiSDK performSelector:@selector(setDelegate:) withObject:self];
                    NSLog(@"[IdentiFI] ✅ Delegate set successfully");
                } else {
                    NSLog(@"[IdentiFI] ⚠️ Warning: IdentiFI instance does not respond to setDelegate:");
                }
                
                NSLog(@"[IdentiFI] 🎉 Device SDK initialization complete!");
            } @catch (NSException *exception) {
                NSLog(@"[IdentiFI] ❌ Exception during SDK initialization: %@", exception);
                self.identifiSDK = nil;
            }
        } else {
            NSLog(@"[IdentiFI] ❌ CRITICAL ERROR: No IdentiFI class found");
            NSLog(@"[IdentiFI] 🔧 Framework may not be properly linked or loaded");
            NSLog(@"[IdentiFI] 💡 Check that IdentiFI.xcframework is correctly integrated");
            self.identifiSDK = nil;
        }
#endif
        
        NSLog(@"[IdentiFI] 🏁 Initialization complete. SDK instance: %@", self.identifiSDK ? @"✅ Available" : @"❌ NULL");
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        // Connection Events
        @"onConnection",
        @"onConnectionError", 
        @"onConnectionTimeOut",
        @"onDisconnection",
        
        // Fingerprint Events
        @"onFpCaptureStatus",
        @"onStreaming",
        @"onLastFrame",
        @"onLastFrame_RAW",
        @"onStreamingRolledFp",
        @"onLastFrameRolledFp",
        @"onLastFrameRolledFp_RAW",
        @"onCancelFpCapture",
        
        // Iris Events
        @"onIrisCaptureStatus",
        @"onStreamingLeftIris", 
        @"onLastFrameLeftIris",
        @"onCancelIrisCapture",
        
        // Device Info Events
        @"onGetBatteryPercentage",
        @"onGetDeviceSerialNumber",
        @"onGetFirmwareVersion",
        @"onGetModelNumber",
        @"onGetReaderDescription",
        
        // Power Events
        @"onSetFpPowerOn",
        @"onSetFpPowerOff", 
        @"onGetFpPowerStatus",
        @"onSetIrisPowerOn",
        @"onSetIrisPowerOff",
        @"onGetIrisPowerStatus",
        @"onGetPowerOffMode",
        @"onSetPowerOffMode",
        
        // Settings Events
        @"onSetLEDBrightness",
        @"onGetLEDBrightness",
        @"onSetMinimumNFIQScore",
        @"onSetLEDControlForPowerLED",
        
        // Saved Fingerprint Images Events
        @"onGetNfiqScore",
        @"onGetSegmentedFpImage_RAW",
        @"onGetWSQEncodedFpImage",
        @"onIsFingerDuplicated",
        @"onSavedFpImagesCleared",
        
        // Firmware Update Events
        @"onFirmwareTransferCompleted",
    ];
}

// MARK: - Connection Management
RCT_EXPORT_METHOD(connect:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    NSLog(@"[IdentiFI] 🔌 Connect method called");
    
#if TARGET_OS_SIMULATOR
    NSLog(@"[IdentiFI] 🖥️ SIMULATOR MODE - Mock connection");
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            NSLog(@"[IdentiFI] ✅ [Simulator] Mock connection successful");
            [self sendEventWithName:@"onConnection" body:@{@"status": @"connected", @"mode": @"simulator"}];
            resolve(@{@"status": @"connection_initiated", @"mode": @"simulator"});
        });
    });
#else
    NSLog(@"[IdentiFI] 📱 DEVICE MODE - Attempting real connection");
    NSLog(@"[IdentiFI] 🔍 SDK Instance: %@", self.identifiSDK);
    NSLog(@"[IdentiFI] 🔗 SDK responds to connect: %@", [self.identifiSDK respondsToSelector:@selector(connect)] ? @"YES" : @"NO");
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        if (self.identifiSDK && [self.identifiSDK respondsToSelector:@selector(connect)]) {
            NSLog(@"[IdentiFI] ✅ Calling real SDK connect method");
            [self.identifiSDK performSelector:@selector(connect)];
            
            // Real SDK will respond via delegate methods
            NSLog(@"[IdentiFI] ⏳ Waiting for real SDK connection delegate callbacks...");
            
            resolve(@{@"status": @"connection_initiated", @"mode": @"device", @"note": @"Waiting for delegate response"});
        } else {
            NSLog(@"[IdentiFI] ❌ ERROR - SDK not available for connection");
            NSLog(@"[IdentiFI] 📊 SDK Status - Instance: %@, Class: %@", 
                  self.identifiSDK ? @"Found" : @"NULL", 
                  self.identifiSDK ? NSStringFromClass([self.identifiSDK class]) : @"N/A");
            
            [self sendEventWithName:@"onConnectionError" body:@{@"message": @"SDK not available", @"error": @"framework_not_loaded"}];
            reject(@"SDK_ERROR", @"IdentiFI SDK not available for connection", nil);
        }
    });
#endif
}

RCT_EXPORT_METHOD(disconnect:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(disconnect)]) {
            [self.identifiSDK performSelector:@selector(disconnect)];
        }
        [self sendEventWithName:@"onDisconnection" body:@{@"status": @"disconnected"}];
        resolve(@{@"status": @"disconnection_initiated"});
    });
}

// MARK: - Device Information
RCT_EXPORT_METHOD(getBatteryPercentage:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    // SIMULATEUR : données simulées
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        int batteryLevel = arc4random_uniform(81) + 20; // 20-100
        [self sendEventWithName:@"onGetBatteryPercentage" body:@{@"percentage": @(batteryLevel)}];
        resolve(@{@"percentage": @(batteryLevel)});
    });
#else
    // DEVICE : appel SDK réel uniquement
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.identifiSDK && [self.identifiSDK respondsToSelector:@selector(getBatteryPercentage)]) {
            NSLog(@"[IdentiFI] ✅ Calling real SDK getBatteryPercentage");
            
            @try {
                NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(getBatteryPercentage)]];
                [invocation setTarget:self.identifiSDK];
                [invocation setSelector:@selector(getBatteryPercentage)];
                [invocation invoke];
                
                NSLog(@"[IdentiFI] ✅ SDK getBatteryPercentage called successfully");
                resolve(@{@"status": @"request_sent"});
                // La vraie réponse viendra via le delegate onGetBatteryPercentage
                
            } @catch (NSException *exception) {
                NSLog(@"[IdentiFI] ❌ EXCEPTION during SDK getBatteryPercentage call: %@", exception);
                reject(@"SDK_EXCEPTION", exception.reason ?: @"Unknown SDK exception", nil);
            }
        } else {
            NSLog(@"[IdentiFI] ❌ ERROR - SDK not available or getBatteryPercentage method not found");
            reject(@"SDK_ERROR", @"getBatteryPercentage method not available", nil);
        }
    });
#endif
}

RCT_EXPORT_METHOD(getDeviceSerialNumber:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    // SIMULATEUR : données simulées
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSString *serialNumber = @"SIC-IF-12345";
        [self sendEventWithName:@"onGetDeviceSerialNumber" body:@{@"serialNumber": serialNumber}];
        resolve(@{@"serialNumber": serialNumber});
    });
#else
    // DEVICE : appel SDK réel uniquement
    dispatch_async(dispatch_get_main_queue(), ^{
        NSLog(@"[IdentiFI] 🔍 Checking SDK availability for getDeviceSerialNumber...");
        NSLog(@"[IdentiFI] 📊 SDK Instance: %@", self.identifiSDK ? @"Available" : @"NULL");
        
        if (self.identifiSDK) {
            NSLog(@"[IdentiFI] 🔗 SDK responds to getDeviceSerialNumber: %@", [self.identifiSDK respondsToSelector:@selector(getDeviceSerialNumber)] ? @"YES" : @"NO");
            
            // Try different possible method names for serial number
            NSArray *possibleSelectors = @[
                @"getDeviceSerialNumber",
                @"getSerialNumber", 
                @"deviceSerialNumber",
                @"serialNumber"
            ];
            
            SEL workingSelector = nil;
            for (NSString *selectorName in possibleSelectors) {
                SEL selector = NSSelectorFromString(selectorName);
                if ([self.identifiSDK respondsToSelector:selector]) {
                    NSLog(@"[IdentiFI] ✅ Found working selector: %@", selectorName);
                    workingSelector = selector;
                    break;
                }
                NSLog(@"[IdentiFI] ❌ Selector %@ not available", selectorName);
            }
            
            if (workingSelector) {
                NSLog(@"[IdentiFI] ✅ Calling real SDK method with selector: %@", NSStringFromSelector(workingSelector));
                
                @try {
                    NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:workingSelector]];
                    [invocation setTarget:self.identifiSDK];
                    [invocation setSelector:workingSelector];
                    [invocation invoke];
                    
                    NSLog(@"[IdentiFI] ✅ SDK getDeviceSerialNumber called successfully");
                    resolve(@{@"status": @"request_sent", @"method": NSStringFromSelector(workingSelector)});
                    // La vraie réponse viendra via le delegate onGetDeviceSerialNumber
                    
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ EXCEPTION during SDK getDeviceSerialNumber call: %@", exception);
                    reject(@"SDK_EXCEPTION", exception.reason ?: @"Unknown SDK exception", nil);
                }
            } else {
                NSLog(@"[IdentiFI] ❌ ERROR - No suitable getDeviceSerialNumber method found");
                reject(@"SDK_ERROR", @"getDeviceSerialNumber method not available", nil);
            }
        } else {
            NSLog(@"[IdentiFI] ❌ ERROR - SDK instance is NULL");
            reject(@"SDK_ERROR", @"SDK not available", nil);
        }
    });
#endif
}

RCT_EXPORT_METHOD(getFirmwareVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    // SIMULATEUR : données simulées
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSString *version = @"2.3.1";
        [self sendEventWithName:@"onGetFirmwareVersion" body:@{@"version": version}];
        resolve(@{@"version": version});
    });
#else
    // DEVICE : appel SDK réel uniquement
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.identifiSDK && [self.identifiSDK respondsToSelector:@selector(getFirmwareVersion)]) {
            NSLog(@"[IdentiFI] ✅ Calling real SDK getFirmwareVersion");
            
            @try {
                NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(getFirmwareVersion)]];
                [invocation setTarget:self.identifiSDK];
                [invocation setSelector:@selector(getFirmwareVersion)];
                [invocation invoke];
                
                NSLog(@"[IdentiFI] ✅ SDK getFirmwareVersion called successfully");
                resolve(@{@"status": @"request_sent"});
                // La vraie réponse viendra via le delegate onGetFirmwareVersion
                
            } @catch (NSException *exception) {
                NSLog(@"[IdentiFI] ❌ EXCEPTION during SDK getFirmwareVersion call: %@", exception);
                reject(@"SDK_EXCEPTION", exception.reason ?: @"Unknown SDK exception", nil);
            }
        } else {
            NSLog(@"[IdentiFI] ❌ ERROR - SDK not available or getFirmwareVersion method not found");
            reject(@"SDK_ERROR", @"getFirmwareVersion method not available", nil);
        }
    });
#endif
}

RCT_EXPORT_METHOD(getLibraryVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    NSString *version = @"1.6.0.0";
    resolve(version);
}

RCT_EXPORT_METHOD(checkPlatform:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    NSString *platform = @"simulator";
    NSLog(@"[DEBUG] Running on SIMULATOR");
#else
    NSString *platform = @"device";
    NSLog(@"[DEBUG] Running on PHYSICAL DEVICE");
    NSLog(@"[DEBUG] IdentiFI SDK instance: %@", self.identifiSDK);
#endif
    
    resolve(@{
        @"platform": platform,
        @"hasSDK": self.identifiSDK ? @YES : @NO,
        @"sdkClass": self.identifiSDK ? NSStringFromClass([self.identifiSDK class]) : @"none"
    });
}

RCT_EXPORT_METHOD(getModelNumber:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    // SIMULATEUR : données simulées
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSString *model = @"IdentiFI-45I";
        [self sendEventWithName:@"onGetModelNumber" body:@{@"model": model}];
        resolve(@{@"model": model});
    });
#else
    // DEVICE : appel SDK réel uniquement
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.identifiSDK && [self.identifiSDK respondsToSelector:@selector(getModelNumber)]) {
            NSLog(@"[IdentiFI] ✅ Calling real SDK getModelNumber");
            
            @try {
                NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(getModelNumber)]];
                [invocation setTarget:self.identifiSDK];
                [invocation setSelector:@selector(getModelNumber)];
                [invocation invoke];
                
                NSLog(@"[IdentiFI] ✅ SDK getModelNumber called successfully");
                resolve(@{@"status": @"request_sent"});
                // La vraie réponse viendra via le delegate onGetModelNumber
                
            } @catch (NSException *exception) {
                NSLog(@"[IdentiFI] ❌ EXCEPTION during SDK getModelNumber call: %@", exception);
                reject(@"SDK_EXCEPTION", exception.reason ?: @"Unknown SDK exception", nil);
            }
        } else {
            NSLog(@"[IdentiFI] ❌ ERROR - SDK not available or getModelNumber method not found");
            reject(@"SDK_ERROR", @"getModelNumber method not available", nil);
        }
    });
#endif
}

RCT_EXPORT_METHOD(getReaderDescription:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if ([self.identifiSDK respondsToSelector:@selector(getReaderDescription)]) {
        [self.identifiSDK performSelector:@selector(getReaderDescription)];
    }
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSString *description = @"IdentiFI Iris & Fingerprint Scanner";
        [self sendEventWithName:@"onGetReaderDescription" body:@{@"description": description}];
        resolve(@{@"description": description});
    });
}

// MARK: - Fingerprint Capture
RCT_EXPORT_METHOD(startCaptureOneFinger:(NSInteger)savedAtIndex
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    NSLog(@"[IdentiFI] 📱 startCaptureOneFinger called with index: %ld", (long)savedAtIndex);
    
#if TARGET_OS_SIMULATOR
    NSLog(@"[IdentiFI] 🖥️ SIMULATOR MODE - Using mock fingerprint capture");
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @0, @"message": @"[Simulator] Capture started"}];
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @2, @"message": @"[Simulator] Capture completed"}];
            [self sendEventWithName:@"onLastFrame" body:@{@"imageData": @"base64_simulated_image", @"savedAtIndex": @(savedAtIndex)}];
        });
        
        resolve(@{@"status": @"capture_started", @"savedAtIndex": @(savedAtIndex), @"mode": @"simulator"});
    });
#else
    NSLog(@"[IdentiFI] 📱 DEVICE MODE - Attempting real SDK fingerprint capture");
    NSLog(@"[IdentiFI] 🔍 SDK Instance: %@", self.identifiSDK);
    NSLog(@"[IdentiFI] 🔗 SDK responds to startCaptureOneFinger: %@", [self.identifiSDK respondsToSelector:@selector(startCaptureOneFinger:)] ? @"YES" : @"NO");
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.identifiSDK && [self.identifiSDK respondsToSelector:@selector(startCaptureOneFinger:)]) {
            NSLog(@"[IdentiFI] ✅ Calling real SDK startCaptureOneFinger with index: %d", (int)savedAtIndex);
            
            @try {
                // Try the most common method signature first
                NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(startCaptureOneFinger:)]];
                [invocation setTarget:self.identifiSDK];
                [invocation setSelector:@selector(startCaptureOneFinger:)];
                
                int indexValue = (int)savedAtIndex;
                [invocation setArgument:&indexValue atIndex:2];
                [invocation invoke];
                
                NSLog(@"[IdentiFI] ✅ SDK method called successfully");
                NSLog(@"[IdentiFI] ⏳ Waiting for real SDK delegate callbacks...");
                
                resolve(@{@"status": @"capture_started", @"savedAtIndex": @(savedAtIndex), @"mode": @"device"});
                
            } @catch (NSException *exception) {
                NSLog(@"[IdentiFI] ❌ EXCEPTION during SDK call: %@", exception);
                NSLog(@"[IdentiFI] 🛡️ Exception reason: %@", exception.reason);
                
                [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @3, @"message": [NSString stringWithFormat:@"SDK call failed: %@", exception.reason]}];
                reject(@"SDK_EXCEPTION", exception.reason ?: @"Unknown SDK exception", nil);
            }
        } else {
            NSLog(@"[IdentiFI] ❌ ERROR - SDK not available or method not found");
            NSLog(@"[IdentiFI] 📊 SDK Status - Instance: %@, Class: %@", 
                  self.identifiSDK ? @"Found" : @"NULL", 
                  self.identifiSDK ? NSStringFromClass([self.identifiSDK class]) : @"N/A");
                  
            [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @3, @"message": @"[Device] SDK not available - Check framework integration"}];
            reject(@"SDK_ERROR", @"IdentiFI SDK not available", nil);
        }
    });
#endif
}

RCT_EXPORT_METHOD(startCaptureTwoFinger:(NSInteger)savedAtIndex
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    NSLog(@"[IdentiFI] 📱 startCaptureTwoFinger called with index: %ld", (long)savedAtIndex);
    
#if TARGET_OS_SIMULATOR
    NSLog(@"[IdentiFI] 🖥️ SIMULATOR MODE - Using mock two finger capture");
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @0, @"message": @"[Simulator] Two finger capture started"}];
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @2, @"message": @"[Simulator] Two finger capture completed"}];
            [self sendEventWithName:@"onLastFrame" body:@{@"imageData": @"base64_simulated_two_finger_image", @"savedAtIndex": @(savedAtIndex)}];
        });
        
        resolve(@{@"status": @"capture_started", @"savedAtIndex": @(savedAtIndex), @"mode": @"simulator"});
    });
#else
    NSLog(@"[IdentiFI] 📱 DEVICE MODE - Attempting real SDK two finger capture");
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.identifiSDK && [self.identifiSDK respondsToSelector:@selector(startCaptureTwoFinger:)]) {
            NSLog(@"[IdentiFI] ✅ Calling real SDK startCaptureTwoFinger with index: %d", (int)savedAtIndex);
            
            @try {
                NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(startCaptureTwoFinger:)]];
                [invocation setTarget:self.identifiSDK];
                [invocation setSelector:@selector(startCaptureTwoFinger:)];
                
                int indexValue = (int)savedAtIndex;
                [invocation setArgument:&indexValue atIndex:2];
                [invocation invoke];
                
                NSLog(@"[IdentiFI] ✅ SDK two finger method called successfully");
                resolve(@{@"status": @"capture_started", @"savedAtIndex": @(savedAtIndex), @"mode": @"device"});
                
            } @catch (NSException *exception) {
                NSLog(@"[IdentiFI] ❌ EXCEPTION during SDK two finger call: %@", exception);
                [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @3, @"message": [NSString stringWithFormat:@"Two finger SDK call failed: %@", exception.reason]}];
                reject(@"SDK_EXCEPTION", exception.reason ?: @"Unknown SDK exception", nil);
            }
        } else {
            NSLog(@"[IdentiFI] ❌ ERROR - SDK not available or startCaptureTwoFinger method not found");
            [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @3, @"message": @"[Device] Two finger SDK not available"}];
            reject(@"SDK_ERROR", @"IdentiFI SDK not available for two finger capture", nil);
        }
    });
#endif
}

RCT_EXPORT_METHOD(startCaptureFourFinger:(NSInteger)savedAtIndex
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    NSLog(@"[IdentiFI] 📱 startCaptureFourFinger called with index: %ld", (long)savedAtIndex);
    
#if TARGET_OS_SIMULATOR
    NSLog(@"[IdentiFI] 🖥️ SIMULATOR MODE - Using mock four finger capture");
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @0, @"message": @"[Simulator] Four finger capture started"}];
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @2, @"message": @"[Simulator] Four finger capture completed"}];
            [self sendEventWithName:@"onLastFrame" body:@{@"imageData": @"base64_simulated_four_finger_image", @"savedAtIndex": @(savedAtIndex)}];
        });
        
        resolve(@{@"status": @"capture_started", @"savedAtIndex": @(savedAtIndex), @"mode": @"simulator"});
    });
#else
    NSLog(@"[IdentiFI] 📱 DEVICE MODE - Attempting real SDK four finger capture");
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.identifiSDK && [self.identifiSDK respondsToSelector:@selector(startCaptureFourFinger:)]) {
            NSLog(@"[IdentiFI] ✅ Calling real SDK startCaptureFourFinger with index: %d", (int)savedAtIndex);
            
            @try {
                NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(startCaptureFourFinger:)]];
                [invocation setTarget:self.identifiSDK];
                [invocation setSelector:@selector(startCaptureFourFinger:)];
                
                int indexValue = (int)savedAtIndex;
                [invocation setArgument:&indexValue atIndex:2];
                [invocation invoke];
                
                NSLog(@"[IdentiFI] ✅ SDK four finger method called successfully");
                resolve(@{@"status": @"capture_started", @"savedAtIndex": @(savedAtIndex), @"mode": @"device"});
                
            } @catch (NSException *exception) {
                NSLog(@"[IdentiFI] ❌ EXCEPTION during SDK four finger call: %@", exception);
                [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @3, @"message": [NSString stringWithFormat:@"Four finger SDK call failed: %@", exception.reason]}];
                reject(@"SDK_EXCEPTION", exception.reason ?: @"Unknown SDK exception", nil);
            }
        } else {
            NSLog(@"[IdentiFI] ❌ ERROR - SDK not available or startCaptureFourFinger method not found");
            [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @3, @"message": @"[Device] Four finger SDK not available"}];
            reject(@"SDK_ERROR", @"IdentiFI SDK not available for four finger capture", nil);
        }
    });
#endif
}

RCT_EXPORT_METHOD(startCaptureRollFinger:(NSInteger)savedAtIndex
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {

    NSLog(@"[IdentiFI] 📱 startCaptureRollFinger called with index: %ld", (long)savedAtIndex);
    
#if TARGET_OS_SIMULATOR
    NSLog(@"[IdentiFI] 🖥️ SIMULATOR MODE - Using mock roll finger capture");
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @0, @"message": @"[Simulator] Roll finger capture started"}];
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @2, @"message": @"[Simulator] Roll finger capture completed"}];
            [self sendEventWithName:@"onLastFrameRolledFp" body:@{@"imageData": @"base64_simulated_roll_finger_image", @"savedAtIndex": @(savedAtIndex)}];
        });
        
        resolve(@{@"status": @"capture_started", @"savedAtIndex": @(savedAtIndex), @"mode": @"simulator"});
    });
#else
    NSLog(@"[IdentiFI] 📱 DEVICE MODE - Attempting real SDK roll finger capture");
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.identifiSDK && [self.identifiSDK respondsToSelector:@selector(startCaptureRollFinger:)]) {
            NSLog(@"[IdentiFI] ✅ Calling real SDK startCaptureRollFinger with index: %d", (int)savedAtIndex);
            
            @try {
                NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(startCaptureRollFinger:)]];
                [invocation setTarget:self.identifiSDK];
                [invocation setSelector:@selector(startCaptureRollFinger:)];
                
                int indexValue = (int)savedAtIndex;
                [invocation setArgument:&indexValue atIndex:2];
                [invocation invoke];
                
                NSLog(@"[IdentiFI] ✅ SDK roll finger method called successfully");
                resolve(@{@"status": @"capture_started", @"savedAtIndex": @(savedAtIndex), @"mode": @"device"});
                
            } @catch (NSException *exception) {
                NSLog(@"[IdentiFI] ❌ EXCEPTION during SDK roll finger call: %@", exception);
                [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @3, @"message": [NSString stringWithFormat:@"Roll finger SDK call failed: %@", exception.reason]}];
                reject(@"SDK_EXCEPTION", exception.reason ?: @"Unknown SDK exception", nil);
            }
        } else {
            NSLog(@"[IdentiFI] ❌ ERROR - SDK not available or startCaptureRollFinger method not found");
            [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @3, @"message": @"[Device] Roll finger SDK not available"}];
            reject(@"SDK_ERROR", @"IdentiFI SDK not available for roll finger capture", nil);
        }
    });
#endif
}

RCT_EXPORT_METHOD(cancelFpCapture:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(cancelFpCapture)]) {
            [self.identifiSDK performSelector:@selector(cancelFpCapture)];
        }
        [self sendEventWithName:@"onCancelFpCapture" body:@{@"status": @"cancelled"}];
        resolve(@{@"status": @"capture_cancelled"});
    });
}

// MARK: - Iris Capture
RCT_EXPORT_METHOD(startCaptureIris:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(startCaptureIris)]) {
            [self.identifiSDK performSelector:@selector(startCaptureIris)];
        }
        
        [self sendEventWithName:@"onIrisCaptureStatus" body:@{@"status": @0, @"message": @"Iris capture started"}];
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [self sendEventWithName:@"onIrisCaptureStatus" body:@{@"status": @2, @"message": @"Iris capture completed"}];
            [self sendEventWithName:@"onLastFrameLeftIris" body:@{
                @"imageData": @"base64_simulated_iris",
                @"leftQuality": @0.95,
                @"rightQuality": @0.88
            }];
        });
        
        resolve(@{@"status": @"iris_capture_started"});
    });
}

RCT_EXPORT_METHOD(cancelIrisCapture:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(cancelIrisCapture)]) {
            [self.identifiSDK performSelector:@selector(cancelIrisCapture)];
        }
        [self sendEventWithName:@"onCancelIrisCapture" body:@{@"status": @"cancelled"}];
        resolve(@{@"status": @"iris_capture_cancelled"});
    });
}

// MARK: - Power Management
RCT_EXPORT_METHOD(setFpPowerOn:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(setFpPowerOn)]) {
            [self.identifiSDK performSelector:@selector(setFpPowerOn)];
        }
        [self sendEventWithName:@"onSetFpPowerOn" body:@{@"powerStatus": @YES}];
        resolve(@{@"powerStatus": @YES});
    });
}

RCT_EXPORT_METHOD(setFpPowerOff:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(setFpPowerOff)]) {
            [self.identifiSDK performSelector:@selector(setFpPowerOff)];
        }
        [self sendEventWithName:@"onSetFpPowerOff" body:@{@"powerStatus": @NO}];
        resolve(@{@"powerStatus": @NO});
    });
}

RCT_EXPORT_METHOD(getFpPowerStatus:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(getFpPowerStatus)]) {
            [self.identifiSDK performSelector:@selector(getFpPowerStatus)];
        }
        BOOL powerStatus = YES; // Simuler le statut
        [self sendEventWithName:@"onGetFpPowerStatus" body:@{@"powerStatus": @(powerStatus)}];
        resolve(@{@"powerStatus": @(powerStatus)});
    });
}

RCT_EXPORT_METHOD(setIrisPowerOn:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(setIrisPowerOn)]) {
            [self.identifiSDK performSelector:@selector(setIrisPowerOn)];
        }
        [self sendEventWithName:@"onSetIrisPowerOn" body:@{@"powerStatus": @YES}];
        resolve(@{@"powerStatus": @YES});
    });
}

RCT_EXPORT_METHOD(setIrisPowerOff:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(setIrisPowerOff)]) {
            [self.identifiSDK performSelector:@selector(setIrisPowerOff)];
        }
        [self sendEventWithName:@"onSetIrisPowerOff" body:@{@"powerStatus": @NO}];
        resolve(@{@"powerStatus": @NO});
    });
}

RCT_EXPORT_METHOD(getIrisPowerStatus:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(getIrisPowerStatus)]) {
            [self.identifiSDK performSelector:@selector(getIrisPowerStatus)];
        }
        BOOL powerStatus = NO; // Simuler le statut iris
        [self sendEventWithName:@"onGetIrisPowerStatus" body:@{@"powerStatus": @(powerStatus)}];
        resolve(@{@"powerStatus": @(powerStatus)});
    });
}

// MARK: - Settings Management
RCT_EXPORT_METHOD(setLEDBrightness:(NSInteger)brightness
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(setLEDBrightness:)]) {
            [self.identifiSDK performSelector:@selector(setLEDBrightness:) withObject:@((int)brightness)];
        }
        [self sendEventWithName:@"onSetLEDBrightness" body:@{@"brightness": @(brightness)}];
        resolve(@{@"brightness": @(brightness)});
    });
}

RCT_EXPORT_METHOD(getLEDBrightness:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(getLEDBrightness)]) {
            [self.identifiSDK performSelector:@selector(getLEDBrightness)];
        }
        NSInteger brightness = 75; // Simuler la luminosité actuelle
        [self sendEventWithName:@"onGetLEDBrightness" body:@{@"brightness": @(brightness)}];
        resolve(@{@"brightness": @(brightness)});
    });
}

RCT_EXPORT_METHOD(setMinimumNFIQScore:(NSInteger)score
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(setMinimumNFIQScore:)]) {
            [self.identifiSDK performSelector:@selector(setMinimumNFIQScore:) withObject:@((int)score)];
        }
        [self sendEventWithName:@"onSetMinimumNFIQScore" body:@{@"score": @(score)}];
        resolve(@{@"score": @(score)});
    });
}

// MARK: - Advanced LED Control
RCT_REMAP_METHOD(setLEDControlForPowerLED,
                 setLEDControlForPowerLEDWithPower:(NSInteger)power
                 fp:(NSInteger)fp
                 com:(NSInteger)com
                 iris:(NSInteger)iris
                 mSecOn:(NSInteger)mSecOn
                 mSecOff:(NSInteger)mSecOff
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSLog(@"[IdentiFI] 🖥️ SIMULATOR MODE - setLEDControlForPowerLED called with power:%ld fp:%ld com:%ld iris:%ld mSecOn:%ld mSecOff:%ld", 
              (long)power, (long)fp, (long)com, (long)iris, (long)mSecOn, (long)mSecOff);
        [self sendEventWithName:@"onSetLEDControlForPowerLED" body:@{
            @"power": @(power),
            @"fp": @(fp),
            @"com": @(com),
            @"iris": @(iris)
        }];
        resolve(@{@"status": @"LED control applied", @"mode": @"simulator"});
    });
#else
    dispatch_async(dispatch_get_main_queue(), ^{
        NSLog(@"[IdentiFI] 📱 DEVICE MODE - setLEDControlForPowerLED called");
        NSLog(@"[IdentiFI] 💡 LED Control params - power:%ld fp:%ld com:%ld iris:%ld mSecOn:%ld mSecOff:%ld", 
              (long)power, (long)fp, (long)com, (long)iris, (long)mSecOn, (long)mSecOff);
        
        if (self.identifiSDK && [self.identifiSDK respondsToSelector:@selector(setLEDControlForPowerLED:fp:com:iris:mSecOn:mSecOff:)]) {
            NSLog(@"[IdentiFI] ✅ Calling real SDK setLEDControlForPowerLED");
            
            @try {
                NSMethodSignature *signature = [self.identifiSDK methodSignatureForSelector:@selector(setLEDControlForPowerLED:fp:com:iris:mSecOn:mSecOff:)];
                NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];
                [invocation setTarget:self.identifiSDK];
                [invocation setSelector:@selector(setLEDControlForPowerLED:fp:com:iris:mSecOn:mSecOff:)];
                
                int powerVal = (int)power;
                int fpVal = (int)fp;
                int comVal = (int)com;
                int irisVal = (int)iris;
                int mSecOnVal = (int)mSecOn;
                int mSecOffVal = (int)mSecOff;
                
                [invocation setArgument:&powerVal atIndex:2];
                [invocation setArgument:&fpVal atIndex:3];
                [invocation setArgument:&comVal atIndex:4];
                [invocation setArgument:&irisVal atIndex:5];
                [invocation setArgument:&mSecOnVal atIndex:6];
                [invocation setArgument:&mSecOffVal atIndex:7];
                [invocation invoke];
                
                NSLog(@"[IdentiFI] ✅ SDK setLEDControlForPowerLED called successfully");
                resolve(@{@"status": @"LED control applied", @"mode": @"device"});
                
            } @catch (NSException *exception) {
                NSLog(@"[IdentiFI] ❌ EXCEPTION during SDK setLEDControlForPowerLED call: %@", exception);
                reject(@"SDK_EXCEPTION", exception.reason ?: @"Unknown SDK exception", nil);
            }
        } else {
            NSLog(@"[IdentiFI] ❌ ERROR - SDK not available or setLEDControlForPowerLED method not found");
            reject(@"SDK_ERROR", @"setLEDControlForPowerLED method not available", nil);
        }
    });
#endif
}

// MARK: - Power Off Mode Management
RCT_EXPORT_METHOD(getPowerOffMode:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        int powerOffSeconds = 300; // 5 minutes default
        [self sendEventWithName:@"onGetPowerOffMode" body:@{@"seconds": @(powerOffSeconds)}];
        resolve(@{@"seconds": @(powerOffSeconds)});
    });
#else
    if ([self.identifiSDK respondsToSelector:@selector(getPowerOffMode)]) {
        [self.identifiSDK performSelector:@selector(getPowerOffMode)];
        resolve(@{@"status": @"request_sent"});
    } else {
        reject(@"SDK_ERROR", @"getPowerOffMode method not available", nil);
    }
#endif
}

RCT_REMAP_METHOD(setPowerOffMode,
                 setPowerOffModeWithSeconds:(NSInteger)secondsToPowerOff
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onSetPowerOffMode" body:@{@"seconds": @(secondsToPowerOff)}];
        resolve(@{@"seconds": @(secondsToPowerOff)});
    });
#else
    if ([self.identifiSDK respondsToSelector:@selector(setPowerOffMode:)]) {
        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(setPowerOffMode:)]];
        [invocation setTarget:self.identifiSDK];
        [invocation setSelector:@selector(setPowerOffMode:)];
        int seconds = (int)secondsToPowerOff;
        [invocation setArgument:&seconds atIndex:2];
        [invocation invoke];
        resolve(@{@"status": @"request_sent"});
    } else {
        reject(@"SDK_ERROR", @"setPowerOffMode method not available", nil);
    }
#endif
}

// MARK: - Saved Fingerprint Images Management
RCT_REMAP_METHOD(clearSavedFpImages,
                 clearSavedFpImagesAtIndex:(NSInteger)savedAtIndex
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onSavedFpImagesCleared" body:@{@"savedAtIndex": @(savedAtIndex)}];
        resolve(@{@"savedAtIndex": @(savedAtIndex)});
    });
#else
    if ([self.identifiSDK respondsToSelector:@selector(clearSavedFpImages:)]) {
        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(clearSavedFpImages:)]];
        [invocation setTarget:self.identifiSDK];
        [invocation setSelector:@selector(clearSavedFpImages:)];
        int index = (int)savedAtIndex;
        [invocation setArgument:&index atIndex:2];
        [invocation invoke];
        resolve(@{@"status": @"request_sent"});
    } else {
        reject(@"SDK_ERROR", @"clearSavedFpImages method not available", nil);
    }
#endif
}

RCT_REMAP_METHOD(getNfiqScoreFromImageSavedAt,
                 getNfiqScoreFromImageSavedAtWithIndex:(NSInteger)savedAtIndex
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        int nfiqScore = 2 + (arc4random_uniform(3)); // Score between 2-4
        [self sendEventWithName:@"onGetNfiqScore" body:@{@"nfiqScore": @(nfiqScore), @"savedAtIndex": @(savedAtIndex)}];
        resolve(@{@"nfiqScore": @(nfiqScore), @"savedAtIndex": @(savedAtIndex)});
    });
#else
    if ([self.identifiSDK respondsToSelector:@selector(getNfiqScoreFromImageSavedAt:)]) {
        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(getNfiqScoreFromImageSavedAt:)]];
        [invocation setTarget:self.identifiSDK];
        [invocation setSelector:@selector(getNfiqScoreFromImageSavedAt:)];
        int index = (int)savedAtIndex;
        [invocation setArgument:&index atIndex:2];
        [invocation invoke];
        resolve(@{@"status": @"request_sent"});
    } else {
        reject(@"SDK_ERROR", @"getNfiqScoreFromImageSavedAt method not available", nil);
    }
#endif
}

RCT_REMAP_METHOD(getSegmentedFpImageSavedAt,
                 getSegmentedFpImageSavedAtWithIndex:(NSInteger)savedAtIndex
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSString *mockImageData = @"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
        [self sendEventWithName:@"onGetSegmentedFpImage_RAW" body:@{@"rawImageData": mockImageData, @"savedAtIndex": @(savedAtIndex)}];
        resolve(@{@"rawImageData": mockImageData, @"savedAtIndex": @(savedAtIndex)});
    });
#else
    if ([self.identifiSDK respondsToSelector:@selector(getSegmentedFpImageSavedAt:)]) {
        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self.identifiSDK methodSignatureForSelector:@selector(getSegmentedFpImageSavedAt:)]];
        [invocation setTarget:self.identifiSDK];
        [invocation setSelector:@selector(getSegmentedFpImageSavedAt:)];
        int index = (int)savedAtIndex;
        [invocation setArgument:&index atIndex:2];
        [invocation invoke];
        resolve(@{@"status": @"request_sent"});
    } else {
        reject(@"SDK_ERROR", @"getSegmentedFpImageSavedAt method not available", nil);
    }
#endif
}

RCT_REMAP_METHOD(getWSQEncodedFpImageFromImageSavedAt,
                 getWSQEncodedFpImageFromImageSavedAtWithIndex:(NSInteger)savedAtIndex
                 croppedImage:(BOOL)croppedImage
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSString *mockWSQData = @"WSQEncodedDataMockString12345";
        [self sendEventWithName:@"onGetWSQEncodedFpImage" body:@{@"wsqData": mockWSQData, @"savedAtIndex": @(savedAtIndex)}];
        resolve(@{@"wsqData": mockWSQData, @"savedAtIndex": @(savedAtIndex)});
    });
#else
    if ([self.identifiSDK respondsToSelector:@selector(getWSQEncodedFpImageFromImageSavedAt:croppedImage:)]) {
        NSMethodSignature *signature = [self.identifiSDK methodSignatureForSelector:@selector(getWSQEncodedFpImageFromImageSavedAt:croppedImage:)];
        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];
        [invocation setTarget:self.identifiSDK];
        [invocation setSelector:@selector(getWSQEncodedFpImageFromImageSavedAt:croppedImage:)];
        int index = (int)savedAtIndex;
        [invocation setArgument:&index atIndex:2];
        [invocation setArgument:&croppedImage atIndex:3];
        [invocation invoke];
        resolve(@{@"status": @"request_sent"});
    } else {
        reject(@"SDK_ERROR", @"getWSQEncodedFpImageFromImageSavedAt method not available", nil);
    }
#endif
}

RCT_REMAP_METHOD(isFingerDuplicated,
                 isFingerDuplicatedAtIndex:(NSInteger)savedAtIndex
                 securityLevel:(NSInteger)securityLevel
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        BOOL isDuplicated = (arc4random_uniform(100) < 10); // 10% chance of duplication
        [self sendEventWithName:@"onIsFingerDuplicated" body:@{@"isDuplicated": @(isDuplicated)}];
        resolve(@{@"isDuplicated": @(isDuplicated)});
    });
#else
    if ([self.identifiSDK respondsToSelector:@selector(isFingerDuplicated:securityLevel:)]) {
        NSMethodSignature *signature = [self.identifiSDK methodSignatureForSelector:@selector(isFingerDuplicated:securityLevel:)];
        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];
        [invocation setTarget:self.identifiSDK];
        [invocation setSelector:@selector(isFingerDuplicated:securityLevel:)];
        int index = (int)savedAtIndex;
        int level = (int)securityLevel;
        [invocation setArgument:&index atIndex:2];
        [invocation setArgument:&level atIndex:3];
        [invocation invoke];
        resolve(@{@"status": @"request_sent"});
    } else {
        reject(@"SDK_ERROR", @"isFingerDuplicated method not available", nil);
    }
#endif
}

// MARK: - Connection Management Extensions
RCT_EXPORT_METHOD(close:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([self.identifiSDK respondsToSelector:@selector(close)]) {
            [self.identifiSDK performSelector:@selector(close)];
        } else if ([self.identifiSDK respondsToSelector:@selector(disconnect)]) {
            [self.identifiSDK performSelector:@selector(disconnect)];
        }
        [self sendEventWithName:@"onDisconnection" body:@{@"status": @"closed"}];
        resolve(@{@"status": @"connection_closed"});
    });
}

// MARK: - Firmware Update
RCT_REMAP_METHOD(startFirmwareUpdate,
                 startFirmwareUpdateWithData:(NSString *)firmwareData
                 toLegacyFirmware:(BOOL)toLegacyFirmware
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
#if TARGET_OS_SIMULATOR
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self sendEventWithName:@"onFirmwareTransferCompleted" body:@{@"result": @1, @"message": @"[Simulator] Firmware update completed"}];
        resolve(@{@"status": @"firmware_update_started"});
    });
#else
    if ([self.identifiSDK respondsToSelector:@selector(startFirmwareUpdate:toLegacyFirmware:)]) {
        NSData *firmwareNSData = [[NSData alloc] initWithBase64EncodedString:firmwareData options:0];
        
        NSMethodSignature *signature = [self.identifiSDK methodSignatureForSelector:@selector(startFirmwareUpdate:toLegacyFirmware:)];
        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];
        [invocation setTarget:self.identifiSDK];
        [invocation setSelector:@selector(startFirmwareUpdate:toLegacyFirmware:)];
        [invocation setArgument:&firmwareNSData atIndex:2];
        [invocation setArgument:&toLegacyFirmware atIndex:3];
        [invocation invoke];
        
        resolve(@{@"status": @"firmware_update_started"});
    } else {
        reject(@"SDK_ERROR", @"startFirmwareUpdate method not available", nil);
    }
#endif
}


RCT_EXPORT_METHOD(resetSDKDelegate:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    NSLog(@"[IdentiFI] 🔄 Resetting SDK delegate for crash recovery");
    
    @try {
        if (self.identifiSDK && [self.identifiSDK respondsToSelector:@selector(setDelegate:)]) {
            [self.identifiSDK performSelector:@selector(setDelegate:) withObject:nil];
            NSLog(@"[IdentiFI] ✅ SDK delegate cleared");
            
            // Re-set delegate
            [self.identifiSDK performSelector:@selector(setDelegate:) withObject:self];
            NSLog(@"[IdentiFI] ✅ SDK delegate re-set");
            
            resolve(@{@"status": @"delegate_reset"});
        } else {
            reject(@"NO_SDK", @"SDK not available for delegate reset", nil);
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception during delegate reset: %@", exception);
        reject(@"RESET_ERROR", exception.reason ?: @"Unknown error", nil);
    }
}

// MARK: - IdentiFI Delegate Methods (Real SDK Callbacks)
- (void)onConnection {
    NSLog(@"[IdentiFI] 🔗 Delegate: onConnection called");
    [self sendEventWithName:@"onConnection" body:@{@"status": @"connected"}];
}

- (void)onDisconnection {
    NSLog(@"[IdentiFI] 💔 Delegate: onDisconnection called");
    [self sendEventWithName:@"onDisconnection" body:@{@"status": @"disconnected"}];
}

- (void)onConnectionError:(NSString *)error {
    NSLog(@"[IdentiFI] ❌ Delegate: onConnectionError called with: %@", error);
    [self sendEventWithName:@"onConnectionError" body:@{@"error": error ?: @"Unknown error"}];
}

- (void)onConnectionTimeOut {
    NSLog(@"[IdentiFI] ⏰ Delegate: onConnectionTimeOut called");
    [self sendEventWithName:@"onConnectionTimeOut" body:@{@"status": @"timeout"}];
}

// MARK: - Fingerprint Delegate Methods (With Crash Protection)
- (void)onFpCaptureStatus:(int)status {
    @try {
        NSLog(@"[IdentiFI] 👆 Delegate: onFpCaptureStatus called with status: %d", status);
        dispatch_async(dispatch_get_main_queue(), ^{
            [self sendEventWithName:@"onFpCaptureStatus" body:@{@"status": @(status)}];
        });
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onFpCaptureStatus: %@", exception);
    }
}

- (void)onStreaming:(UIImage *)fpImage {
    @try {
        NSLog(@"[IdentiFI] 📹 Delegate: onStreaming called with image: %@", fpImage);
        if (fpImage) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSData *imageData = UIImagePNGRepresentation(fpImage);
                    if (imageData) {
                        NSString *base64String = [imageData base64EncodedStringWithOptions:0];
                        dispatch_async(dispatch_get_main_queue(), ^{
                            [self sendEventWithName:@"onStreaming" body:@{@"imageData": base64String}];
                        });
                    }
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in image processing: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onStreaming: %@", exception);
    }
}

- (void)onLastFrame:(UIImage *)fpImage fpImageSavedAt:(int)savedAtIndex {
    @try {
        NSLog(@"[IdentiFI] 🖼️ Delegate: onLastFrame called with image: %@, index: %d", fpImage, savedAtIndex);
        if (fpImage) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSData *imageData = UIImagePNGRepresentation(fpImage);
                    if (imageData) {
                        NSString *base64String = [imageData base64EncodedStringWithOptions:0];
                        dispatch_async(dispatch_get_main_queue(), ^{
                            [self sendEventWithName:@"onLastFrame" body:@{@"imageData": base64String, @"savedAtIndex": @(savedAtIndex)}];
                        });
                    }
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in image processing for lastFrame: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onLastFrame: %@", exception);
    }
}

- (void)onCancelFpCapture {
    NSLog(@"[IdentiFI] ❌ Delegate: onCancelFpCapture called");
    [self sendEventWithName:@"onCancelFpCapture" body:@{@"status": @"cancelled"}];
}

- (void)onLastFrame_RAW:(NSData *)rawFpImageData fpImageSavedAt:(int)savedAtIndex {
    @try {
        NSLog(@"[IdentiFI] 🖼️ Delegate: onLastFrame_RAW called with raw data length: %lu, index: %d", (unsigned long)(rawFpImageData ? rawFpImageData.length : 0), savedAtIndex);
        if (rawFpImageData && rawFpImageData.length > 0) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSString *base64String = [rawFpImageData base64EncodedStringWithOptions:0];
                    dispatch_async(dispatch_get_main_queue(), ^{
                        [self sendEventWithName:@"onLastFrame_RAW" body:@{@"rawImageData": base64String, @"savedAtIndex": @(savedAtIndex)}];
                    });
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in raw data processing: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onLastFrame_RAW: %@", exception);
    }
}

// MARK: - Rolled Fingerprint Delegate Methods
- (void)onStreamingRolledFp:(UIImage *)fpImage {
    @try {
        NSLog(@"[IdentiFI] 📹 Delegate: onStreamingRolledFp called with image: %@", fpImage);
        if (fpImage) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSData *imageData = UIImagePNGRepresentation(fpImage);
                    if (imageData) {
                        NSString *base64String = [imageData base64EncodedStringWithOptions:0];
                        dispatch_async(dispatch_get_main_queue(), ^{
                            [self sendEventWithName:@"onStreamingRolledFp" body:@{@"imageData": base64String}];
                        });
                    }
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in rolled fp image processing: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onStreamingRolledFp: %@", exception);
    }
}

- (void)onLastFrameRolledFp:(UIImage *)fpImage fpImageSavedAt:(int)savedAtIndex {
    @try {
        NSLog(@"[IdentiFI] 🖼️ Delegate: onLastFrameRolledFp called with image: %@, index: %d", fpImage, savedAtIndex);
        if (fpImage) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSData *imageData = UIImagePNGRepresentation(fpImage);
                    if (imageData) {
                        NSString *base64String = [imageData base64EncodedStringWithOptions:0];
                        dispatch_async(dispatch_get_main_queue(), ^{
                            [self sendEventWithName:@"onLastFrameRolledFp" body:@{@"imageData": base64String, @"savedAtIndex": @(savedAtIndex)}];
                        });
                    }
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in rolled fp image processing: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onLastFrameRolledFp: %@", exception);
    }
}

- (void)onLastFrameRolledFp_RAW:(NSData *)rawFpImageData fpImageSavedAt:(int)savedAtIndex {
    @try {
        NSLog(@"[IdentiFI] 🖼️ Delegate: onLastFrameRolledFp_RAW called with raw data length: %lu, index: %d", (unsigned long)(rawFpImageData ? rawFpImageData.length : 0), savedAtIndex);
        if (rawFpImageData && rawFpImageData.length > 0) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSString *base64String = [rawFpImageData base64EncodedStringWithOptions:0];
                    dispatch_async(dispatch_get_main_queue(), ^{
                        [self sendEventWithName:@"onLastFrameRolledFp_RAW" body:@{@"rawImageData": base64String, @"savedAtIndex": @(savedAtIndex)}];
                    });
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in rolled fp raw data processing: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onLastFrameRolledFp_RAW: %@", exception);
    }
}

// MARK: - Power Management Delegate Methods
- (void)onSetFpPowerOn:(Boolean)fpPowerStatus {
    NSLog(@"[IdentiFI] 🔋 Delegate: onSetFpPowerOn called with status: %d", fpPowerStatus);
    [self sendEventWithName:@"onSetFpPowerOn" body:@{@"powerStatus": @(fpPowerStatus)}];
}

- (void)onSetFpPowerOff {
    NSLog(@"[IdentiFI] 🔋 Delegate: onSetFpPowerOff called");
    [self sendEventWithName:@"onSetFpPowerOff" body:@{@"powerStatus": @NO}];
}

- (void)onGetFpPowerStatus:(Boolean)fpPowerStatus {
    NSLog(@"[IdentiFI] 🔋 Delegate: onGetFpPowerStatus called with status: %d", fpPowerStatus);
    [self sendEventWithName:@"onGetFpPowerStatus" body:@{@"powerStatus": @(fpPowerStatus)}];
}

// MARK: - Iris Delegate Methods
- (void)onIrisCaptureStatus:(int)irisCaptureStatus {
    NSLog(@"[IdentiFI] 👁️ Delegate: onIrisCaptureStatus called with status: %d", irisCaptureStatus);
    [self sendEventWithName:@"onIrisCaptureStatus" body:@{@"status": @(irisCaptureStatus)}];
}

- (void)onStreamingLeftIris:(UIImage *)leftIrisImage {
    @try {
        NSLog(@"[IdentiFI] 👁️ Delegate: onStreamingLeftIris called with image: %@", leftIrisImage);
        if (leftIrisImage) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSData *imageData = UIImagePNGRepresentation(leftIrisImage);
                    if (imageData) {
                        NSString *base64String = [imageData base64EncodedStringWithOptions:0];
                        dispatch_async(dispatch_get_main_queue(), ^{
                            [self sendEventWithName:@"onStreamingLeftIris" body:@{@"imageData": base64String}];
                        });
                    }
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in left iris image processing: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onStreamingLeftIris: %@", exception);
    }
}

- (void)onStreamingRightIris:(UIImage *)rightIrisImage {
    @try {
        NSLog(@"[IdentiFI] 👁️ Delegate: onStreamingRightIris called with image: %@", rightIrisImage);
        if (rightIrisImage) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSData *imageData = UIImagePNGRepresentation(rightIrisImage);
                    if (imageData) {
                        NSString *base64String = [imageData base64EncodedStringWithOptions:0];
                        dispatch_async(dispatch_get_main_queue(), ^{
                            [self sendEventWithName:@"onStreamingRightIris" body:@{@"imageData": base64String}];
                        });
                    }
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in right iris image processing: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onStreamingRightIris: %@", exception);
    }
}

- (void)onLastFrameLeftIris:(UIImage *)leftIrisImage qualityLeft:(double)qualityLeft qualityRight:(double)qualityRight {
    @try {
        NSLog(@"[IdentiFI] 👁️ Delegate: onLastFrameLeftIris called with image: %@, qualityLeft: %.2f, qualityRight: %.2f", leftIrisImage, qualityLeft, qualityRight);
        if (leftIrisImage) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSData *imageData = UIImagePNGRepresentation(leftIrisImage);
                    if (imageData) {
                        NSString *base64String = [imageData base64EncodedStringWithOptions:0];
                        dispatch_async(dispatch_get_main_queue(), ^{
                            [self sendEventWithName:@"onLastFrameLeftIris" body:@{
                                @"imageData": base64String,
                                @"qualityLeft": @(qualityLeft),
                                @"qualityRight": @(qualityRight)
                            }];
                        });
                    }
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in iris final image processing: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onLastFrameLeftIris: %@", exception);
    }
}

- (void)onCancelIrisCapture {
    NSLog(@"[IdentiFI] ❌ Delegate: onCancelIrisCapture called");
    [self sendEventWithName:@"onCancelIrisCapture" body:@{@"status": @"cancelled"}];
}

- (void)onSetIrisPowerOn:(Boolean)irisPowerStatus {
    NSLog(@"[IdentiFI] 🔋 Delegate: onSetIrisPowerOn called with status: %d", irisPowerStatus);
    [self sendEventWithName:@"onSetIrisPowerOn" body:@{@"powerStatus": @(irisPowerStatus)}];
}

- (void)onSetIrisPowerOff {
    NSLog(@"[IdentiFI] 🔋 Delegate: onSetIrisPowerOff called");
    [self sendEventWithName:@"onSetIrisPowerOff" body:@{@"powerStatus": @NO}];
}

- (void)onGetIrisPowerStatus:(Boolean)irisPowerStatus {
    NSLog(@"[IdentiFI] 🔋 Delegate: onGetIrisPowerStatus called with status: %d", irisPowerStatus);
    [self sendEventWithName:@"onGetIrisPowerStatus" body:@{@"powerStatus": @(irisPowerStatus)}];
}

// MARK: - Device Info Delegate Methods
- (void)onGetBatteryPercentage:(int)percentLevel {
    NSLog(@"[IdentiFI] 🔋 Delegate: onGetBatteryPercentage called with: %d%%", percentLevel);
    [self sendEventWithName:@"onGetBatteryPercentage" body:@{@"percentage": @(percentLevel)}];
}

- (void)onGetDeviceSerialNumber:(NSString *)serialNumber {
    NSLog(@"[IdentiFI] 🏷️ Delegate: onGetDeviceSerialNumber called with: %@", serialNumber);
    NSLog(@"[IdentiFI] 📤 Sending onGetDeviceSerialNumber event to React Native");
    
    if (serialNumber && serialNumber.length > 0) {
        NSLog(@"[IdentiFI] ✅ Valid serial number received: %@", serialNumber);
        [self sendEventWithName:@"onGetDeviceSerialNumber" body:@{@"serialNumber": serialNumber}];
    } else {
        NSLog(@"[IdentiFI] ⚠️ Warning: Empty or nil serial number received");
        [self sendEventWithName:@"onGetDeviceSerialNumber" body:@{@"serialNumber": @"", @"error": @"Empty serial number"}];
    }
}

- (void)onGetFirmwareVersion:(NSString *)firmwareVersion {
    NSLog(@"[IdentiFI] 📦 Delegate: onGetFirmwareVersion called with: %@", firmwareVersion);
    [self sendEventWithName:@"onGetFirmwareVersion" body:@{@"version": firmwareVersion ?: @""}];
}

- (void)onGetModelNumber:(NSString *)model {
    NSLog(@"[IdentiFI] 📱 Delegate: onGetModelNumber called with: %@", model);
    [self sendEventWithName:@"onGetModelNumber" body:@{@"model": model ?: @""}];
}

- (void)onGetReaderDescription:(NSString *)deviceDescription {
    NSLog(@"[IdentiFI] 📝 Delegate: onGetReaderDescription called with: %@", deviceDescription);
    [self sendEventWithName:@"onGetReaderDescription" body:@{@"description": deviceDescription ?: @""}];
}

// MARK: - Settings Delegate Methods
- (void)onSetLEDBrightness:(int)ledBrightness {
    NSLog(@"[IdentiFI] 💡 Delegate: onSetLEDBrightness called with: %d", ledBrightness);
    [self sendEventWithName:@"onSetLEDBrightness" body:@{@"brightness": @(ledBrightness)}];
}

- (void)onGetLEDBrightness:(int)ledBrightness {
    NSLog(@"[IdentiFI] 💡 Delegate: onGetLEDBrightness called with: %d", ledBrightness);
    [self sendEventWithName:@"onGetLEDBrightness" body:@{@"brightness": @(ledBrightness)}];
}

- (void)onSetMinimumNFIQScore:(int)minimumNFIQScore {
    NSLog(@"[IdentiFI] 🎯 Delegate: onSetMinimumNFIQScore called with: %d", minimumNFIQScore);
    [self sendEventWithName:@"onSetMinimumNFIQScore" body:@{@"score": @(minimumNFIQScore)}];
}

// MARK: - Advanced LED Control Delegate Methods
- (void)onSetLEDControlForPowerLED:(int)power fp:(int)fp com:(int)com iris:(int)iris {
    NSLog(@"[IdentiFI] 💡 Delegate: onSetLEDControlForPowerLED called with power:%d fp:%d com:%d iris:%d", power, fp, com, iris);
    [self sendEventWithName:@"onSetLEDControlForPowerLED" body:@{
        @"power": @(power),
        @"fp": @(fp),
        @"com": @(com),
        @"iris": @(iris)
    }];
}

// MARK: - Power Off Mode Delegate Methods
- (void)onGetPowerOffMode:(int)secondsToPowerOff {
    NSLog(@"[IdentiFI] ⏰ Delegate: onGetPowerOffMode called with: %d seconds", secondsToPowerOff);
    [self sendEventWithName:@"onGetPowerOffMode" body:@{@"seconds": @(secondsToPowerOff)}];
}

- (void)onSetPowerOffMode:(int)secondsToPowerOff {
    NSLog(@"[IdentiFI] ⏰ Delegate: onSetPowerOffMode called with: %d seconds", secondsToPowerOff);
    [self sendEventWithName:@"onSetPowerOffMode" body:@{@"seconds": @(secondsToPowerOff)}];
}

// MARK: - Saved Fingerprint Images Delegate Methods
- (void)onGetNfiqScore:(int)nfiqScore fromImageSavedAt:(int)savedAtIndex {
    NSLog(@"[IdentiFI] 🎯 Delegate: onGetNfiqScore called with score: %d, index: %d", nfiqScore, savedAtIndex);
    [self sendEventWithName:@"onGetNfiqScore" body:@{@"nfiqScore": @(nfiqScore), @"savedAtIndex": @(savedAtIndex)}];
}

- (void)onGetSegmentedFpImage_RAW:(NSData *)rawFpImageData fromImageSavedAt:(int)savedAtIndex {
    @try {
        NSLog(@"[IdentiFI] 🖼️ Delegate: onGetSegmentedFpImage_RAW called with data length: %lu, index: %d", 
              (unsigned long)(rawFpImageData ? rawFpImageData.length : 0), savedAtIndex);
        if (rawFpImageData && rawFpImageData.length > 0) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSString *base64String = [rawFpImageData base64EncodedStringWithOptions:0];
                    dispatch_async(dispatch_get_main_queue(), ^{
                        [self sendEventWithName:@"onGetSegmentedFpImage_RAW" body:@{@"rawImageData": base64String, @"savedAtIndex": @(savedAtIndex)}];
                    });
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in segmented image processing: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onGetSegmentedFpImage_RAW: %@", exception);
    }
}

- (void)onGetWSQEncodedFpImage:(NSData *)wsqEncodedFpImageData fromImageSavedAt:(int)savedAtIndex {
    @try {
        NSLog(@"[IdentiFI] 🖼️ Delegate: onGetWSQEncodedFpImage called with WSQ data length: %lu, index: %d", 
              (unsigned long)(wsqEncodedFpImageData ? wsqEncodedFpImageData.length : 0), savedAtIndex);
        if (wsqEncodedFpImageData && wsqEncodedFpImageData.length > 0) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                @try {
                    NSString *base64String = [wsqEncodedFpImageData base64EncodedStringWithOptions:0];
                    dispatch_async(dispatch_get_main_queue(), ^{
                        [self sendEventWithName:@"onGetWSQEncodedFpImage" body:@{@"wsqData": base64String, @"savedAtIndex": @(savedAtIndex)}];
                    });
                } @catch (NSException *exception) {
                    NSLog(@"[IdentiFI] ❌ Exception in WSQ data processing: %@", exception);
                }
            });
        }
    } @catch (NSException *exception) {
        NSLog(@"[IdentiFI] ❌ Exception in onGetWSQEncodedFpImage: %@", exception);
    }
}

- (void)onIsFingerDuplicated:(int)isFingerDuplicated {
    NSLog(@"[IdentiFI] 🔍 Delegate: onIsFingerDuplicated called with result: %d", isFingerDuplicated);
    [self sendEventWithName:@"onIsFingerDuplicated" body:@{@"isDuplicated": @(isFingerDuplicated)}];
}

- (void)onSavedFpImagesCleared:(int)savedAtIndex {
    NSLog(@"[IdentiFI] 🗑️ Delegate: onSavedFpImagesCleared called with index: %d", savedAtIndex);
    [self sendEventWithName:@"onSavedFpImagesCleared" body:@{@"savedAtIndex": @(savedAtIndex)}];
}

// MARK: - Firmware Update Delegate Methods
- (void)onFirmwareTransferCompleted:(long)transferResult {
    NSLog(@"[IdentiFI] 📦 Delegate: onFirmwareTransferCompleted called with result: %ld", transferResult);
    [self sendEventWithName:@"onFirmwareTransferCompleted" body:@{@"result": @(transferResult)}];
}

@end
