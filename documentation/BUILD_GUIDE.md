# IdentiFI React Native App - Build Guide

## Overview

This guide covers building and deploying the IdentiFI React Native application that integrates with IdentiFI biometric devices for fingerprint and iris capture.

## Prerequisites

- **macOS** with Xcode 15+ installed
- **iOS 13.0+** target device or simulator
- **React Native development environment** properly configured
- **IdentiFI hardware device** for real testing
- **Node.js 18+** and npm/yarn

## Project Structure

```
IdentifiApp/
├── ios/
│   ├── IdentifiApp/
│   │   ├── IdentiFiModule.m       # Native bridge module
│   │   ├── IdentiFi.h             # Header file
│   │   └── AppDelegate.swift      # iOS app delegate
│   ├── IdentiFi.xcframework/      # IdentiFI SDK framework (device only)
│   └── IdentifiApp.xcworkspace    # Xcode workspace
├── screens/
│   ├── NetworkScreen.js           # Device connection
│   ├── FingerprintsScreen.js      # Fingerprint capture
│   ├── EyesScreen.js              # Iris capture
│   └── ParametersScreen.js        # Settings management
├── src/services/
│   └── IdentiFIService.js         # JavaScript service layer
└── App.js                         # Main app navigation
```

## Step 1: Install Dependencies

```bash
# Navigate to project directory
cd IdentifiApp

# Install JavaScript dependencies
npm install

# Install iOS dependencies
cd ios
pod install
cd ..
```

## Step 2: Framework Integration

### 2.1 IdentiFI Framework Setup

The `IdentiFi.xcframework` is already integrated in the project:

- **Location**: `ios/IdentiFi.xcframework/`
- **Target**: Device builds only (no simulator support)
- **Integration**: Embedded & Signed in Xcode project

### 2.2 Conditional Compilation

The native module uses conditional compilation for simulator vs device:

```objc
#if TARGET_OS_SIMULATOR
    // Mock implementation for development
    NSLog(@"[Simulator] Mock SDK method called");
#else
    // Real SDK calls for physical devices
    if ([self.identifiSDK respondsToSelector:@selector(methodName)]) {
        [self.identifiSDK performSelector:@selector(methodName)];
    }
#endif
```

## Step 3: Build Configuration

### 3.1 iOS Permissions

The app requires network access permissions in `Info.plist`:

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>This app uses local network access to discover and connect to IdentiFI biometric devices on the same WiFi network.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app uses location to access WiFi network information for device connectivity management.</string>
```

### 3.2 Build Settings

Key Xcode build settings:
- **Framework Search Paths**: `$(SRCROOT)/../ios`
- **Header Search Paths**: `$(SRCROOT)/IdentifiApp`
- **Objective-C Bridging Header**: `IdentifiApp/IdentifiApp-Bridging-Header.h`

## Step 4: Building the App

### 4.1 Simulator Build

For UI development and testing without hardware:

```bash
# Start Metro bundler
npx react-native start
# OR with Expo
npx expo start

# Build for simulator (in new terminal)
npx react-native run-ios --simulator "iPhone 16"
# OR with Expo
npx expo run:ios --simulator
```

**Note**: Simulator uses mock data since IdentiFI framework is device-only.

### 4.2 Device Build

For testing with real IdentiFI hardware:

```bash
# Build for connected iOS device
npx react-native run-ios --device
# OR with Expo
npx expo run:ios --device

# Or specify device by name
npx react-native run-ios --device "iPhone de Jean-Baptiste"
# OR with Expo (device will be auto-detected)
npx expo run:ios --device
```

### 4.3 Xcode Build

Alternative build method:

1. Open `ios/IdentifiApp.xcworkspace` in Xcode
2. Select your target device
3. Press **Cmd+R** to build and run

## Step 5: App Architecture

### 5.1 Navigation Structure

Tab-based navigation with 4 main screens:

1. **Network** (Default) - Device connection and info
2. **Fingerprints** - Fingerprint capture interface  
3. **Eyes** - Iris capture interface
4. **Settings** - LED brightness and NFIQ configuration

### 5.2 Data Flow

```
React Native JavaScript
        ↓
IdentiFIService.js (Abstraction Layer)
        ↓
IdentiFiModule.m (Native Bridge)
        ↓
IdentiFI SDK (Device) / Mock (Simulator)
        ↓
Hardware Device Communication
```

### 5.3 Event System

Real-time communication using React Native events:

```javascript
// Listen for device events
IdentiFIService.addEventListener('onConnection', () => {
  console.log('Device connected');
});

IdentiFIService.addEventListener('onLastFrame', (data) => {
  setImage(data.imageData);
});
```

## Step 6: Network Configuration for Device Testing

### 6.1 Hotspot Setup for IdentiFI Device Connectivity

When testing with real IdentiFI hardware, you may need to configure a hotspot to ensure both your iPhone and the IdentiFI device can communicate effectively.

#### 6.1.1 iPhone Hotspot Configuration

1. **Enable Personal Hotspot on iPhone**:
   ```
   Settings → Personal Hotspot → Allow Others to Join (ON)
   ```

2. **Configure Hotspot Settings**:
   - **Network Name**: Keep default or set custom name
   - **Password**: Use a secure password (minimum 8 characters)
   - **Maximize Compatibility**: Enable for better device support

3. **Connection Verification**:
   ```bash
   # Check iPhone IP address when hotspot is active
   # iPhone will typically get: 172.20.10.1
   # Connected devices get: 172.20.10.2, 172.20.10.3, etc.
   ```

#### 6.1.2 IdentiFI Device WiFi Configuration

1. **Connect IdentiFI Device to iPhone Hotspot**:
   - Power on the IdentiFI device
   - Access device WiFi settings (refer to device manual)
   - Select your iPhone's hotspot network
   - Enter the hotspot password

2. **Verify Network Connection**:
   - Both iPhone and IdentiFI device should be on same subnet (172.20.10.x)
   - Test connectivity using Network tab in the app

#### 6.1.3 Alternative: External WiFi Network

If hotspot is not suitable, use a shared WiFi network:

1. **Connect Both Devices to Same WiFi**:
   - Connect iPhone to WiFi network
   - Connect IdentiFI device to same WiFi network
   - Ensure both devices can reach each other

2. **Network Requirements**:
   - Both devices on same subnet
   - No firewall blocking device communication
   - Stable internet connection for API testing

#### 6.1.4 Troubleshooting Network Issues

| Issue | Solution |
|-------|----------|
| Device not found | Check both devices on same network |
| Connection timeout | Verify hotspot/WiFi stability |
| Intermittent connection | Switch between WiFi and hotspot |
| API test fails | Confirm internet connectivity |

**Important Notes**:
- Hotspot method provides controlled network environment
- External WiFi may have better performance for large data transfers
- Always test API connectivity after network setup
- Monitor battery usage when using hotspot extensively

## Step 7: Testing Procedures

### 7.1 Simulator Testing

Tests available without hardware:

- ✅ **UI Navigation**: All tabs and screens
- ✅ **Mock Responses**: Simulated device info
- ✅ **Error Handling**: Connection timeouts
- ✅ **State Management**: React state updates

### 7.2 Device Testing

Full integration testing with IdentiFI device (requires network setup from Step 6):

1. **Network Setup Prerequisites**:
   - Configure hotspot or shared WiFi (see Step 6)
   - Ensure both iPhone and IdentiFI device are connected
   - Verify network connectivity between devices

2. **Connection Test**:
   - Power on IdentiFI device
   - Enable WiFi on iOS device
   - Use Network tab to connect
   - Verify device information display

3. **Fingerprint Capture**:
   - Test all capture modes (1, 2, 4 fingers, roll)
   - Verify image preview and final capture
   - Check automatic modal with API test
   - Validate image quality feedback

4. **Iris Capture**:
   - Test iris sensor power management
   - Capture iris images
   - Verify quality metrics

5. **Settings Configuration**:
   - Adjust LED brightness
   - Modify NFIQ score requirements
   - Test power management controls

### 7.3 API Integration Test

After each fingerprint capture, the app demonstrates API connectivity:

- **Modal Display**: "Capture Done" with success message
- **API Test**: Calls `https://wttr.in/Washington?format=%t`
- **Result Display**: Shows Washington DC temperature
- **Connectivity Proof**: Confirms internet access for data upload

## Step 8: Debugging

### 8.1 JavaScript Debugging

Monitor React Native logs:

```bash
# Metro bundler console shows:
npx react-native start
# OR with Expo
npx expo start --dev-client
# - Connection events
# - Capture status updates  
# - Error messages
# - API responses
```

### 8.2 Native Debugging

Xcode console provides detailed logging:

```objc
// Example native logs:
[IdentiFI] 🚀 IdentiFiModule initializing...
[IdentiFI] 📱 DEVICE MODE - Attempting real connection
[IdentiFI] ✅ SDK method called successfully
[IdentiFI] 👆 Delegate: onFpCaptureStatus called with status: 2
```

### 8.3 Common Issues

**Build Errors**:
- `IdentiFI.h not found`: Check framework integration
- `Undefined symbols`: Verify framework embedding
- `Module not found`: Check bridging header

**Runtime Errors**:
- `Connection failed`: Check WiFi network setup and device connectivity
- `SDK not available`: Device vs simulator mismatch
- `Images not displaying`: Base64 encoding issues
- `Device not found`: Verify hotspot/WiFi configuration
- `Network timeout`: Check internet connectivity

## Step 9: Production Considerations

### 9.1 Code Signing

For distribution:

1. Configure Apple Developer account
2. Set up provisioning profiles
3. Enable required capabilities (WiFi and Local Network)
4. Sign with distribution certificate

### 9.2 Performance Optimization

- **Release builds**: Use `--mode Release` for testing or `npx expo run:ios --configuration Release`
- **Bundle size**: Framework adds ~50MB to app
- **Memory usage**: Monitor image processing
- **Battery impact**: Optimize WiFi and network usage

### 9.3 Security

- **Data encryption**: Implement for biometric templates
- **Secure storage**: Use iOS Keychain for sensitive data
- **Network security**: HTTPS for API communications
- **Access control**: Implement user authentication

## Step 10: Deployment

### 10.1 Internal Testing

```bash
# Build for TestFlight
# Option 1: In Xcode: Product → Archive → Distribute App
# Option 2: With Expo
npx expo build:ios --type archive
# OR for EAS Build (recommended)
npx eas build --platform ios
```

### 10.2 App Store Requirements

- Privacy manifest for network usage
- App Transport Security configuration
- Accessibility compliance
- iOS version compatibility testing

## Troubleshooting Reference

| Issue | Simulator | Device | Solution |
|-------|-----------|--------|----------|
| Build fails | ❌ | ❌ | Check framework integration |
| Connection fails | N/A | ❌ | Verify WiFi network setup |
| No capture images | ✅ Mock | ❌ | Check delegate callbacks |
| SDK errors | N/A | ❌ | Review method signatures |
| UI not responding | ❌ | ❌ | Check JavaScript errors |

## Support Resources

- **API Documentation**: `API_DOCUMENTATION.md`
- **Integration Details**: `README_IDENTIFI.md`
- **IdentiFI SDK**: Official documentation from S.I.C. Biometrics
- **React Native**: Official RN documentation
- **Xcode**: Apple developer documentation

## Build Verification Checklist

- [ ] All dependencies installed successfully
- [ ] Framework properly integrated in Xcode
- [ ] WiFi and network permissions configured
- [ ] App builds for both simulator and device
- [ ] Navigation works between all tabs
- [ ] Mock data displays in simulator
- [ ] Real device connection successful
- [ ] Fingerprint capture functional
- [ ] Iris capture operational (if supported)
- [ ] Settings modifications work
- [ ] API test modal displays
- [ ] Error handling graceful
- [ ] Performance acceptable

Your IdentiFI React Native app is now ready for comprehensive testing and deployment!