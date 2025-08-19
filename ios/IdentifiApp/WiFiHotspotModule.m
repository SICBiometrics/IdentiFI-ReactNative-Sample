//
//  WiFiHotspotModule.m
//  IdentifiApp
//

#import "WiFiHotspotModule.h"
#import <NetworkExtension/NetworkExtension.h>

@implementation WiFiHotspotModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(connectToWiFi:(NSString *)ssid
                  password:(NSString *)password
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (@available(iOS 11.0, *)) {
        NEHotspotConfiguration *configuration;
        
        if (password && password.length > 0) {
            // WPA/WPA2 Personal network
            configuration = [[NEHotspotConfiguration alloc] initWithSSID:ssid passphrase:password isWEP:NO];
        } else {
            // Open network
            configuration = [[NEHotspotConfiguration alloc] initWithSSID:ssid];
        }
        
        // Configure to not join automatically to avoid conflicts
        configuration.joinOnce = YES;
        
        [[NEHotspotConfigurationManager sharedManager] applyConfiguration:configuration completionHandler:^(NSError * _Nullable error) {
            dispatch_async(dispatch_get_main_queue(), ^{
                if (error) {
                    NSLog(@"[WiFiHotspotModule] Failed to connect to %@: %@", ssid, error.localizedDescription);
                    
                    // Check for specific error types
                    if (error.code == NEHotspotConfigurationErrorAlreadyAssociated) {
                        NSLog(@"[WiFiHotspotModule] Already connected to %@", ssid);
                        resolve(@{@"success": @YES, @"message": @"Already connected"});
                    } else if (error.code == NEHotspotConfigurationErrorUserDenied) {
                        reject(@"USER_DENIED", @"User denied WiFi connection request", error);
                    } else if (error.code == NEHotspotConfigurationErrorInvalidSSID) {
                        reject(@"INVALID_SSID", @"Invalid SSID provided", error);
                    } else if (error.code == NEHotspotConfigurationErrorInvalidPassphrase) {
                        reject(@"INVALID_PASSWORD", @"Invalid password provided", error);
                    } else {
                        reject(@"CONNECTION_FAILED", [NSString stringWithFormat:@"Failed to connect: %@", error.localizedDescription], error);
                    }
                } else {
                    NSLog(@"[WiFiHotspotModule] Successfully connected to %@", ssid);
                    resolve(@{@"success": @YES, @"message": @"Connected successfully"});
                }
            });
        }];
    } else {
        reject(@"UNSUPPORTED_VERSION", @"NEHotspotConfiguration requires iOS 11.0 or later", nil);
    }
}

RCT_EXPORT_METHOD(removeWiFiConfiguration:(NSString *)ssid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (@available(iOS 11.0, *)) {
        [[NEHotspotConfigurationManager sharedManager] removeConfigurationForSSID:ssid];
        NSLog(@"[WiFiHotspotModule] Removed configuration for %@", ssid);
        resolve(@{@"success": @YES, @"message": @"Configuration removed"});
    } else {
        reject(@"UNSUPPORTED_VERSION", @"NEHotspotConfiguration requires iOS 11.0 or later", nil);
    }
}

RCT_EXPORT_METHOD(getConfiguredNetworks:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (@available(iOS 11.0, *)) {
        [[NEHotspotConfigurationManager sharedManager] getConfiguredSSIDsWithCompletionHandler:^(NSArray<NSString *> * _Nullable ssids) {
            dispatch_async(dispatch_get_main_queue(), ^{
                if (ssids) {
                    NSLog(@"[WiFiHotspotModule] Found configured networks: %@", ssids);
                    resolve(@{@"success": @YES, @"ssids": ssids});
                } else {
                    resolve(@{@"success": @YES, @"ssids": @[]});
                }
            });
        }];
    } else {
        reject(@"UNSUPPORTED_VERSION", @"NEHotspotConfiguration requires iOS 11.0 or later", nil);
    }
}

@end