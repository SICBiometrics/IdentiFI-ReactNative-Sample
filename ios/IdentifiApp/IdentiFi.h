//
//  IdentiFi.h
//  IdentiFi Framework Header
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

//! Project version number for IdentiFI.
FOUNDATION_EXPORT double IdentiFIVersionNumber;

//! Project version string for IdentiFI.
FOUNDATION_EXPORT const unsigned char IdentiFIVersionString[];

// Forward declarations for IdentiFI SDK
@class IdentiFi;

@protocol IdentiFiDelegate <NSObject>
@optional
// Connection
- (void)onConnection;
- (void)onDisconnection;
- (void)onConnectionError:(NSString *)error;
- (void)onConnectionTimeOut;

// Capture status
- (void)onFpCaptureStatus:(int)status message:(NSString *)message;
- (void)onCancelFpCapture;
- (void)onStreaming:(UIImage *)fpImage;
- (void)onStreamingRolledFp:(UIImage *)fpImage rollingState:(int)currentState verticalLineX:(int)currentXPosition;
- (void)onLastFrame:(UIImage *)fpImage fpImageSavedAt:(int)savedAtIndex;
- (void)onLastFrame_RAW:(NSData *)rawFpImageData fpImageSavedAt:(int)savedAtIndex;
- (void)onLastFrameRolledFp:(UIImage *)fpImage fpImageSavedAt:(int)savedAtIndex;
- (void)onLastFrameRolledFp_RAW:(NSData *)rawFpImageData fpImageSavedAt:(int)savedAtIndex;

- (void)onIrisCaptureStatus:(int)status message:(NSString *)message;

// Device information
- (void)onGetBatteryPercentage:(int)percentage;
- (void)onGetDeviceSerialNumber:(NSString *)serialNumber;
- (void)onGetFirmwareVersion:(NSString *)version;
- (void)onGetModelNumber:(NSString *)model;
- (void)onGetReaderDescription:(NSString *)description;

// Settings
- (void)onSetMinimumNFIQScore:(int)minimumNFIQScore;
- (void)onGetPowerOffMode:(int)secondsToPowerOff;
- (void)onSetPowerOffMode:(int)secondsToPowerOff;
- (void)onSetLEDControlForPowerLED:(int)power fp:(int)fp com:(int)com iris:(int)iris;

// Power management
- (void)onGetFpPowerStatus:(Boolean)fpPowerStatus;
- (void)onSetFpPowerOn:(Boolean)fpPowerStatus;
- (void)onSetFpPowerOff;

// Saved fingerprint images
- (void)onGetNfiqScore:(int)nfiqScore fromImageSavedAt:(int)savedAtIndex;
- (void)onGetSegmentedFpImage_RAW:(NSData *)rawFpImageData fromImageSavedAt:(int)savedAtIndex;
- (void)onGetWSQEncodedFpImage:(NSData *)wsqEncodedFpImageData fromImageSavedAt:(int)savedAtIndex;
- (void)onIsFingerDuplicated:(int)isFingerDuplicated;
- (void)onSavedFpImagesCleared:(int)savedAtIndex;

// Firmware update
- (void)onFirmwareTransferCompleted:(long)transferResult;

@end

@interface IdentiFi : NSObject
@property (nonatomic, weak) id<IdentiFiDelegate> delegate;

// Connection Management
- (void)connect;
- (void)disconnect;
- (void)close;

// Device Information
- (void)getBatteryPercentage;
- (void)getDeviceSerialNumber;
- (void)getFirmwareVersion;
- (void)getModelNumber;
- (void)getReaderDescription;

// Fingerprint Capture
- (void)startCaptureOneFinger:(int)savedAtIndex;
- (void)startCaptureTwoFinger:(int)savedAtIndex;
- (void)startCaptureFourFinger:(int)savedAtIndex;
- (void)startCaptureRollFinger:(int)savedAtIndex;
- (void)cancelFpCapture;

// Iris Capture
- (void)startCaptureIris;
- (void)cancelIrisCapture;

// Power Management
- (void)setFpPowerOn;
- (void)setFpPowerOff;
- (void)getFpPowerStatus;
- (void)setIrisPowerOn;
- (void)setIrisPowerOff;
- (void)getIrisPowerStatus;

// Settings Management
- (void)setLEDBrightness:(int)brightness;
- (void)getLEDBrightness;
- (void)setMinimumNFIQScore:(int)score;
- (void)getPowerOffMode;
- (void)setPowerOffMode:(int)secondsToPowerOff;

// Advanced LED Control
- (void)setLEDControlForPowerLED:(int)power fp:(int)fp com:(int)com iris:(int)iris mSecOn:(int)mSecOn mSecOff:(int)mSecOff;

// Saved fingerprint images (volatile memory)
- (void)clearSavedFpImages:(int)savedAtIndex;
- (void)getNfiqScoreFromImageSavedAt:(int)savedAtIndex;
- (void)getSegmentedFpImageSavedAt:(int)savedAtIndex;
- (void)getWSQEncodedFpImageFromImageSavedAt:(int)savedAtIndex croppedImage:(BOOL)croppedImage;
- (void)isFingerDuplicated:(int)savedAtIndex securityLevel:(int)securityLevel;

// Library version
- (NSString *)getLibraryVersion;

// Firmware update
- (void)startFirmwareUpdate:(NSData *)newFirmware toLegacyFirmware:(BOOL)legacyFirmwareUpdateMethod;

@end
