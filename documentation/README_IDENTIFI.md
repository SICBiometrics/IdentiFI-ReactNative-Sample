# IdentiFI Test App

React Native demonstration application for IdentiFI SDK v1.6.0.0 integration.

## Description

This application demonstrates how to integrate the IdentiFI library from S.I.C. Biometrics into a React Native application. It provides a complete interface for:

- Connection and management of IdentiFI devices
- Fingerprint capture (1, 2, 4 fingers, roll)
- Iris capture (IdentiFI-45I/50I)
- Device settings management
- Device information visualization

## Features

### 🔗 Connection
- WiFi device connection/disconnection
- Connection status monitoring
- Connection error handling

### 👆 Fingerprints
- 1, 2, 4 finger or roll capture
- Real-time preview
- Save with index (0-9)
- NFIQ score retrieval
- WSQ compression
- Duplication detection

### 👁 Iris
- Simultaneous dual iris capture
- Quality scoring
- Sensor power management

### ⚙️ Settings
- LED brightness control
- Minimum NFIQ score
- Sensor power management

### ℹ️ Device Information
- Serial number, model, firmware
- Battery level
- Sensor status
- Device capabilities

## Architecture

### File Structure

```
src/
├── components/
│   └── common/           # Reusable UI components
├── hooks/
│   └── useIdentiFI.ts    # Main React hook
├── navigation/
│   └── AppNavigator.tsx  # Tab navigation
├── screens/              # Application screens
├── services/
│   └── IdentiFIService.ts # TypeScript service
└── types/
    └── IdentiFI.ts       # TypeScript types
```

### Technical Architecture

1. **Native iOS Module** (`RNIdentiFIModule`)
   - Objective-C bridge between React Native and IdentiFI SDK
   - Callback handling via RCTEventEmitter
   - Asynchronous methods with Promise

2. **Service Layer** (`IdentiFIService`)
   - TypeScript interface for the native module
   - Event handling and subscriptions
   - Parameter validation and error handling

3. **React Hook** (`useIdentiFI`)
   - Global application state
   - Simplified methods for components
   - Automatic listener management

4. **User Interface**
   - Tab navigation with React Navigation
   - Reusable components (Button, StatusCard, ImageDisplay)
   - Real-time captured image display

## Installation and Configuration

### Prerequisites

- React Native 0.80+
- iOS 13.0+
- Xcode 14+
- IdentiFI xcframework v1.6.0.0

### Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   cd ios && pod install
   ```

2. **Xcode Configuration**
   - Follow the guide in `INTEGRATION_GUIDE.md`
   - Add the xcframework to the project
   - Configure Header Search Paths
   - Enable the bridging header

3. **iOS Permissions**
   Add to `Info.plist`:
   ```xml
   <key>NSLocalNetworkUsageDescription</key>
   <string>This app uses local network access to discover and connect to IdentiFI biometric devices on the same WiFi network.</string>
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>This app uses location to access WiFi network information for device connectivity management.</string>
   ```

4. **Launch**
   ```bash
   npx react-native run-ios
   ```

## Usage

### Initial Connection

1. Power on the IdentiFI device
2. Open the "Connection" tab
3. Tap "Connect to Device"
4. Wait for connection confirmation

### Fingerprint Capture

1. Go to the "Fingerprint" tab
2. Choose the save index (0-9)
3. Select the capture type
4. Follow device instructions
5. View the captured image

### Iris Capture

1. Go to the "Iris" tab
2. Turn on the iris sensor
3. Start capture
4. Position eyes according to instructions
5. View images and quality scores

### Configuration

1. Use the "Settings" tab
2. Adjust LED brightness (0-100%)
3. Set minimum NFIQ score (1-5)
4. Manage sensor power

## Main Dependencies

```json
{
  "@react-navigation/native": "^7.1.14",
  "@react-navigation/bottom-tabs": "^7.4.2",
  "react-native-gesture-handler": "^2.27.2",
  "react-native-safe-area-context": "^5.5.2",
  "react-native-screens": "^4.13.1"
}
```

## Device Compatibility

- **IdentiFI-30**: Fingerprints only
- **IdentiFI-45**: Fingerprints only
- **IdentiFI-45I**: Fingerprints + iris
- **IdentiFI-50**: Fingerprints only
- **IdentiFI-50I**: Fingerprints + iris
- **IdentiFI-60**: Fingerprints only

## Development

### Available Scripts

```bash
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run start      # Start Metro bundler
npm run test       # Run tests
npm run lint       # Check code
```

### Debugging

- Use React Native Debugger
- Check Xcode logs for native errors
- Use `console.log` in the service layer

### Testing

Tests can be added for:
- Services and hooks
- UI components
- Native module integration

## Support and Troubleshooting

### Common Issues

1. **Module not found**
   - Verify that the native module is properly added to the Xcode project
   - Clean and rebuild the project

2. **Connection error**
   - Check that WiFi is enabled and connected
   - Ensure the device is in pairing mode
   - Restart the device if necessary

3. **Images not displaying**
   - Verify the base64 format of images
   - Check native module callbacks

### Contact

For technical support:
- IdentiFI SDK Documentation
- S.I.C. Biometrics Support
- Project GitHub Issues

## License

This demonstration application is provided for educational and testing purposes only.

© 2025 - Test application for IdentiFI SDK v1.6.0.0