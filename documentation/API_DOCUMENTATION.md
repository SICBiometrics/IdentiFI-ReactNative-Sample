# IdentiFI SDK API Documentation

Complete guide for using the IdentiFI SDK v1.6.0.0 methods in React Native applications.

## Table of Contents

1. [Overview](#overview)
2. [Connection Management](#connection-management)
3. [Fingerprint Capture](#fingerprint-capture)
4. [Iris Capture](#iris-capture)
5. [Device Information](#device-information)
6. [Settings Management](#settings-management)
7. [Power Management](#power-management)
8. [Saved Images Management](#saved-images-management)
10. [Firmware Update](#firmware-update)
11. [Event Callbacks](#event-callbacks)
12. [Error Handling](#error-handling)
13. [Best Practices](#best-practices)

## Overview

The IdentiFI SDK provides comprehensive biometric capture capabilities for fingerprint and iris recognition. This documentation covers all available methods and their proper usage in React Native applications.

### SDK Architecture

```
React Native App
       ↓
IdentiFIService (TypeScript)
       ↓
RNIdentiFIModule (Native Bridge)
       ↓
IdentiFI SDK (Native iOS)
       ↓
IdentiFI Hardware Device
```

## Connection Management

### connect()

Establishes Wifi connection to the IdentiFI device.

**Usage:**
```typescript
import IdentiFIService from './src/services/IdentiFIService';

// Connect to device
try {
  await IdentiFIService.connect();
  console.log('Connection initiated');
} catch (error) {
  console.error('Connection failed:', error);
}
```

**Events:**
- `onConnection` - Connection successful
- `onConnectionError` - Connection failed with error message
- `onConnectionTimeOut` - Connection timeout (default: 10 seconds)

**Notes:**
- Device must be powered on and in pairing mode
- Wifi must be enabled on mobile device
- Only one connection at a time is supported

### disconnect()

Disconnects from the IdentiFI device.

**Usage:**
```typescript
try {
  await IdentiFIService.disconnect();
  console.log('Disconnection initiated');
} catch (error) {
  console.error('Disconnection failed:', error);
}
```

**Events:**
- `onDisconnection` - Device disconnected

**Notes:**
- Safe to call even if not connected
- Automatically cancels any ongoing captures

## Fingerprint Capture

### startCaptureOneFinger(savedAtIndex)

Captures a single fingerprint image.

**Parameters:**
- `savedAtIndex` (number): Storage index (0-9) for the captured image

**Usage:**
```typescript
try {
  await IdentiFIService.startCaptureOneFinger(0);
  console.log('Single finger capture started');
} catch (error) {
  console.error('Capture failed:', error);
}
```

**Events:**
- `onFpCaptureStatus` - Capture status updates
- `onStreaming` - Real-time preview images
- `onLastFrame` - Final captured image
- `onLastFrame_RAW` - Raw image data

### startCaptureTwoFinger(savedAtIndex)

Captures two fingerprint images simultaneously.

**Parameters:**
- `savedAtIndex` (number): Storage index (0-9) for the captured images

**Usage:**
```typescript
try {
  await IdentiFIService.startCaptureTwoFinger(1);
  console.log('Two finger capture started');
} catch (error) {
  console.error('Capture failed:', error);
}
```

**Notes:**
- Typically used for index and middle fingers
- Both fingers must be placed simultaneously
- Same events as single finger capture

### startCaptureFourFinger(savedAtIndex)

Captures four fingerprint images (slap capture).

**Parameters:**
- `savedAtIndex` (number): Storage index (0-9) for the captured images

**Usage:**
```typescript
try {
  await IdentiFIService.startCaptureFourFinger(2);
  console.log('Four finger capture started');
} catch (error) {
  console.error('Capture failed:', error);
}
```

**Notes:**
- Captures four fingers excluding thumb
- Requires proper hand positioning
- Larger capture area needed

### startCaptureRollFinger(savedAtIndex)

Captures a rolled fingerprint (nail-to-nail).

**Parameters:**
- `savedAtIndex` (number): Storage index (0-9) for the captured image

**Usage:**
```typescript
try {
  await IdentiFIService.startCaptureRollFinger(3);
  console.log('Roll finger capture started');
} catch (error) {
  console.error('Capture failed:', error);
}
```

**Events:**
- `onStreamingRolledFp` - Real-time rolling preview with position data
- `onLastFrameRolledFp` - Final rolled image
- `onLastFrameRolledFp_RAW` - Raw rolled image data

**Notes:**
- Requires finger rolling motion from nail to nail
- Provides additional position feedback
- Higher quality capture for identification

### cancelFpCapture()

Cancels any ongoing fingerprint capture.

**Usage:**
```typescript
try {
  await IdentiFIService.cancelFpCapture();
  console.log('Fingerprint capture cancelled');
} catch (error) {
  console.error('Cancel failed:', error);
}
```

**Events:**
- `onCancelFpCapture` - Capture successfully cancelled

## Iris Capture

### startCaptureIris()

Captures both iris images simultaneously.

**Usage:**
```typescript
try {
  await IdentiFIService.startCaptureIris();
  console.log('Iris capture started');
} catch (error) {
  console.error('Iris capture failed:', error);
}
```

**Events:**
- `onIrisCaptureStatus` - Capture status updates
- `onStreamingLeftIris` - Real-time iris preview
- `onLastFrameLeftIris` - Final iris images with quality scores

**Notes:**
- Only available on IdentiFI-45I and IdentiFI-50I models
- Requires iris sensor to be powered on
- Eyes should be 6-8 inches from device

### cancelIrisCapture()

Cancels ongoing iris capture.

**Usage:**
```typescript
try {
  await IdentiFIService.cancelIrisCapture();
  console.log('Iris capture cancelled');
} catch (error) {
  console.error('Cancel failed:', error);
}
```

**Events:**
- `onCancelIrisCapture` - Capture successfully cancelled

## Device Information

### getBatteryPercentage()

Retrieves current battery level.

**Usage:**
```typescript
try {
  await IdentiFIService.getBatteryPercentage();
  console.log('Battery request sent');
} catch (error) {
  console.error('Battery request failed:', error);
}
```

**Events:**
- `onGetBatteryPercentage` - Returns battery percentage (0-100)

### getDeviceSerialNumber()

Retrieves device serial number.

**Usage:**
```typescript
try {
  await IdentiFIService.getDeviceSerialNumber();
  console.log('Serial number request sent');
} catch (error) {
  console.error('Serial number request failed:', error);
}
```

**Events:**
- `onGetDeviceSerialNumber` - Returns serial number string

### getFirmwareVersion()

Retrieves device firmware version.

**Usage:**
```typescript
try {
  await IdentiFIService.getFirmwareVersion();
  console.log('Firmware version request sent');
} catch (error) {
  console.error('Firmware version request failed:', error);
}
```

**Events:**
- `onGetFirmwareVersion` - Returns firmware version string

### getLibraryVersion()

Retrieves SDK library version (synchronous).

**Usage:**
```typescript
try {
  const version = await IdentiFIService.getLibraryVersion();
  console.log('Library version:', version); // "1.6.0.0"
} catch (error) {
  console.error('Library version failed:', error);
}
```

**Notes:**
- Returns immediately without device communication
- Current version: 1.6.0.0

### getModelNumber()

Retrieves device model number.

**Usage:**
```typescript
try {
  await IdentiFIService.getModelNumber();
  console.log('Model number request sent');
} catch (error) {
  console.error('Model number request failed:', error);
}
```

**Events:**
- `onGetModelNumber` - Returns model string (e.g., "IdentiFI-45I")

### getReaderDescription()

Retrieves device description.

**Usage:**
```typescript
try {
  await IdentiFIService.getReaderDescription();
  console.log('Reader description request sent');
} catch (error) {
  console.error('Reader description request failed:', error);
}
```

**Events:**
- `onGetReaderDescription` - Returns device description string

## Settings Management

### setLEDBrightness(brightness)

Sets LED brightness level.

**Parameters:**
- `brightness` (number): Brightness level (0-100)

**Usage:**
```typescript
try {
  await IdentiFIService.setLEDBrightness(75);
  console.log('LED brightness set to 75%');
} catch (error) {
  console.error('Set LED brightness failed:', error);
}
```

**Events:**
- `onSetLEDBrightness` - Brightness successfully set

**Notes:**
- Affects all device LEDs (power, fingerprint, communication, iris)
- Changes take effect immediately
- Setting persists until device restart

### getLEDBrightness()

Retrieves current LED brightness.

**Usage:**
```typescript
try {
  await IdentiFIService.getLEDBrightness();
  console.log('LED brightness request sent');
} catch (error) {
  console.error('Get LED brightness failed:', error);
}
```

**Events:**
- `onGetLEDBrightness` - Returns current brightness level (0-100)

### setMinimumNFIQScore(score)

Sets minimum acceptable NFIQ quality score.

**Parameters:**
- `score` (number): Minimum NFIQ score (1-5, where 1 is highest quality)

**Usage:**
```typescript
try {
  await IdentiFIService.setMinimumNFIQScore(3);
  console.log('Minimum NFIQ score set to 3');
} catch (error) {
  console.error('Set NFIQ score failed:', error);
}
```

**Events:**
- `onSetMinimumNFIQScore` - Score successfully set

**Notes:**
- Fingerprints below this quality will be rejected
- Lower numbers require higher quality
- Recommended range: 2-4 for most applications

## Power Management

### setFpPowerOn()

Powers on the fingerprint sensor.

**Usage:**
```typescript
try {
  await IdentiFIService.setFpPowerOn();
  console.log('Fingerprint sensor powered on');
} catch (error) {
  console.error('FP power on failed:', error);
}
```

**Events:**
- `onSetFpPowerOn` - Returns power status (boolean)

### setFpPowerOff()

Powers off the fingerprint sensor.

**Usage:**
```typescript
try {
  await IdentiFIService.setFpPowerOff();
  console.log('Fingerprint sensor powered off');
} catch (error) {
  console.error('FP power off failed:', error);
}
```

**Events:**
- `onSetFpPowerOff` - Sensor powered off

**Notes:**
- Saves battery when fingerprint capture not needed
- Sensor must be powered on before capture

### getFpPowerStatus()

Retrieves fingerprint sensor power status.

**Usage:**
```typescript
try {
  await IdentiFIService.getFpPowerStatus();
  console.log('FP power status request sent');
} catch (error) {
  console.error('Get FP power status failed:', error);
}
```

**Events:**
- `onGetFpPowerStatus` - Returns power status (boolean)

### setIrisPowerOn()

Powers on the iris sensor (IdentiFI-45I/50I only).

**Usage:**
```typescript
try {
  await IdentiFIService.setIrisPowerOn();
  console.log('Iris sensor powered on');
} catch (error) {
  console.error('Iris power on failed:', error);
}
```

**Events:**
- `onSetIrisPowerOn` - Returns power status (boolean)

### setIrisPowerOff()

Powers off the iris sensor.

**Usage:**
```typescript
try {
  await IdentiFIService.setIrisPowerOff();
  console.log('Iris sensor powered off');
} catch (error) {
  console.error('Iris power off failed:', error);
}
```

**Events:**
- `onSetIrisPowerOff` - Sensor powered off

### getIrisPowerStatus()

Retrieves iris sensor power status.

**Usage:**
```typescript
try {
  await IdentiFIService.getIrisPowerStatus();
  console.log('Iris power status request sent');
} catch (error) {
  console.error('Get iris power status failed:', error);
}
```

**Events:**
- `onGetIrisPowerStatus` - Returns power status (boolean)

## Saved Images Management

### clearSavedFpImages(savedAtIndex)

Clears saved fingerprint images at specified index.

**Parameters:**
- `savedAtIndex` (number): Storage index to clear (0-9)

**Usage:**
```typescript
try {
  await IdentiFIService.clearSavedFpImages(0);
  console.log('Saved images cleared at index 0');
} catch (error) {
  console.error('Clear images failed:', error);
}
```

**Events:**
- `onSavedFpImagesCleared` - Images successfully cleared

**Notes:**
- Only clears specified index
- Required when storage slots are full
- Images are stored in volatile memory

### getNfiqScoreFromImageSavedAt(savedAtIndex)

Retrieves NFIQ quality score for saved image.

**Parameters:**
- `savedAtIndex` (number): Storage index (0-9)

**Usage:**
```typescript
try {
  await IdentiFIService.getNfiqScoreFromImageSavedAt(0);
  console.log('NFIQ score request sent for index 0');
} catch (error) {
  console.error('Get NFIQ score failed:', error);
}
```

**Events:**
- `onGetNfiqScore` - Returns NFIQ score (1-5) and index

**Notes:**
- NFIQ: NIST Fingerprint Image Quality
- 1 = Excellent, 5 = Poor quality
- Must have saved image at specified index

### getSegmentedFpImageSavedAt(savedAtIndex)

Retrieves segmented fingerprint image data.

**Parameters:**
- `savedAtIndex` (number): Storage index (0-9)

**Usage:**
```typescript
try {
  await IdentiFIService.getSegmentedFpImageSavedAt(0);
  console.log('Segmented image request sent');
} catch (error) {
  console.error('Get segmented image failed:', error);
}
```

**Events:**
- `onGetSegmentedFpImage_RAW` - Returns raw image data and index

### getWSQEncodedFpImageFromImageSavedAt(savedAtIndex, croppedImage)

Retrieves WSQ-encoded fingerprint image.

**Parameters:**
- `savedAtIndex` (number): Storage index (0-9)
- `croppedImage` (boolean): Whether to crop the image (default: false)

**Usage:**
```typescript
try {
  // Get full WSQ image
  await IdentiFIService.getWSQEncodedFpImageFromImageSavedAt(0, false);
  
  // Get cropped WSQ image
  await IdentiFIService.getWSQEncodedFpImageFromImageSavedAt(0, true);
} catch (error) {
  console.error('Get WSQ image failed:', error);
}
```

**Events:**
- `onGetWSQEncodedFpImage` - Returns WSQ data and index

**Notes:**
- WSQ: Wavelet Scalar Quantization (FBI standard)
- Cropped images are smaller but may lose edge data
- Compression ratio varies by device model

### isFingerDuplicated(savedAtIndex, securityLevel)

Checks if fingerprint is duplicated in storage.

**Parameters:**
- `savedAtIndex` (number): Storage index to check (0-9)
- `securityLevel` (number): Security level (1-4, where 4 is most strict)

**Usage:**
```typescript
try {
  // Check with medium security
  await IdentiFIService.isFingerDuplicated(0, 3);
  console.log('Duplication check started');
} catch (error) {
  console.error('Duplication check failed:', error);
}
```

**Events:**
- `onIsFingerDuplicated` - Returns duplication result (0 = not duplicate, 1 = duplicate)

**Notes:**
- Compares against all other saved images
- Higher security levels are more strict
- Useful for enrollment systems


## Firmware Update

### startFirmwareUpdate(newFirmware, toLegacyFirmware)

Updates device firmware.

**Parameters:**
- `newFirmware` (NSData): Firmware binary data
- `toLegacyFirmware` (boolean): True for firmware < v2.3.0

**Usage:**
```typescript
// Note: This method requires binary firmware data
// Implementation would depend on how firmware is loaded
try {
  // For legacy firmware (< v2.3.0)
  await IdentiFIService.startFirmwareUpdate(firmwareData, true);
  
  // For modern firmware (>= v2.3.0)
  await IdentiFIService.startFirmwareUpdate(firmwareData, false);
} catch (error) {
  console.error('Firmware update failed:', error);
}
```

**Events:**
- `onFirmwareTransferCompleted` - Returns transfer result

**Notes:**
- Extremely dangerous operation - can brick device
- Requires official firmware from S.I.C. Biometrics
- Device must remain connected during entire process
- Legacy flag must be set correctly for firmware version

## Event Callbacks

### Setting Up Event Listeners

**Using the Service:**
```typescript
import IdentiFIService from './src/services/IdentiFIService';

// Add event listener
const subscription = IdentiFIService.addEventListener('onConnection', () => {
  console.log('Device connected!');
});

// Remove specific listener
IdentiFIService.removeEventListener('onConnection');

// Remove all listeners
IdentiFIService.removeAllEventListeners();

// Don't forget to clean up
subscription.remove();
```

**Using the Hook:**
```typescript
import { useIdentiFI } from './src/hooks/useIdentiFI';

function MyComponent() {
  const { isConnected, streamingImage, lastCapturedImage } = useIdentiFI();
  
  // Hook automatically manages listeners
  return (
    <div>
      {isConnected && <Text>Device Connected</Text>}
      {streamingImage && <Image source={{uri: `data:image/png;base64,${streamingImage}`}} />}
    </div>
  );
}
```

### Available Events

**Connection Events:**
- `onConnection` - Device connected
- `onConnectionError` - Connection failed
- `onConnectionTimeOut` - Connection timeout
- `onDisconnection` - Device disconnected

**Fingerprint Events:**
- `onFpCaptureStatus` - Capture status (0=started, 1=progress, 2=completed, etc.)
- `onStreaming` - Real-time preview images
- `onLastFrame` - Final captured image
- `onCancelFpCapture` - Capture cancelled

**Iris Events:**
- `onIrisCaptureStatus` - Iris capture status
- `onStreamingLeftIris` - Real-time iris preview
- `onLastFrameLeftIris` - Final iris images with scores
- `onCancelIrisCapture` - Iris capture cancelled

**Device Info Events:**
- `onGetBatteryPercentage` - Battery level
- `onGetDeviceSerialNumber` - Serial number
- `onGetFirmwareVersion` - Firmware version
- `onGetModelNumber` - Model number

## Error Handling

### Common Error Scenarios

**Connection Errors:**
```typescript
try {
  await IdentiFIService.connect();
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle connection timeout
    console.log('Device not responding - check if powered on');
  } else if (error.message.includes('wifi')) {
    // Handle wifi issues
    console.log('Enable wifi and try again');
  } else {
    // Handle other connection errors
    console.log('Connection failed:', error.message);
  }
}
```

**Capture Errors:**
```typescript
// Listen for capture status
IdentiFIService.addEventListener('onFpCaptureStatus', (data) => {
  switch (data.status) {
    case 0: // Started
      console.log('Capture started');
      break;
    case 2: // Completed
      console.log('Capture completed');
      break;
    case 3: // Error
      console.log('Capture error occurred');
      break;
    case 5: // NFIQ too low
      console.log('Fingerprint quality too low');
      break;
    case 6: // Rolling smear
      console.log('Rolling smear detected');
      break;
  }
});
```

**Device Not Connected:**
```typescript
// Always check connection before operations
if (!isConnected) {
  throw new Error('Device not connected');
}

try {
  await IdentiFIService.startCaptureOneFinger(0);
} catch (error) {
  if (error.message.includes('not connected')) {
    // Prompt user to connect device
    showConnectionDialog();
  }
}
```

## Best Practices

### Connection Management

1. **Always check connection status** before performing operations
2. **Handle connection timeouts** gracefully with retry logic
3. **Disconnect properly** when app goes to background
4. **Monitor connection events** to update UI state

```typescript
// Good practice
const connectWithRetry = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await IdentiFIService.connect();
      return; // Success
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
    }
  }
};
```

### Capture Operations

1. **Manage storage indexes** to avoid overwriting important captures
2. **Cancel captures** when switching operations or disconnecting
3. **Handle quality feedback** from NFIQ scores
4. **Provide user guidance** during capture process

```typescript
// Good practice
const captureWithQualityCheck = async (index: number) => {
  try {
    await IdentiFIService.startCaptureOneFinger(index);
    
    // Listen for completion
    const subscription = IdentiFIService.addEventListener('onLastFrame', async (data) => {
      // Get quality score
      await IdentiFIService.getNfiqScoreFromImageSavedAt(data.savedAtIndex);
      subscription.remove();
    });
    
  } catch (error) {
    console.error('Capture failed:', error);
  }
};
```

### Memory Management

1. **Clear old images** when storage is full
2. **Remove event listeners** when components unmount
3. **Limit concurrent operations** to avoid conflicts

```typescript
// Good practice - cleanup
useEffect(() => {
  return () => {
    IdentiFIService.removeAllEventListeners();
    if (isConnected) {
      IdentiFIService.disconnect();
    }
  };
}, []);
```

### Power Management

1. **Power off sensors** when not needed to save battery
2. **Check power status** before capture operations
3. **Monitor battery levels** and warn users

```typescript
// Good practice
const ensurePowerForCapture = async (captureType: 'fingerprint' | 'iris') => {
  if (captureType === 'fingerprint') {
    await IdentiFIService.setFpPowerOn();
  } else {
    await IdentiFIService.setIrisPowerOn();
  }
  
  // Wait a moment for sensor to stabilize
  await new Promise(resolve => setTimeout(resolve, 1000));
};
```

### Error Recovery

1. **Implement retry logic** for transient failures
2. **Provide clear error messages** to users
3. **Log errors** for debugging
4. **Graceful degradation** when features unavailable

```typescript
// Good practice
const robustOperation = async (operation: () => Promise<void>, retries = 2) => {
  try {
    await operation();
  } catch (error) {
    if (retries > 0 && error.message.includes('timeout')) {
      console.log(`Retrying operation, ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return robustOperation(operation, retries - 1);
    }
    throw error;
  }
};
```

## Conclusion

This documentation covers all available methods in the IdentiFI SDK v1.6.0.0. For additional support:

- Check device compatibility requirements
- Ensure proper Xcode integration
- Monitor device power levels
- Implement proper error handling
- Follow security best practices for biometric data

For technical support, contact S.I.C. Biometrics or refer to the official SDK documentation.