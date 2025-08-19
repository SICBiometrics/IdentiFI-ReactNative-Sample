import { NativeModules, NativeEventEmitter } from 'react-native';

const { IdentiFiModule } = NativeModules;

class IdentiFIService {
  constructor() {
    // Check if the native module is available
    console.log('Initializing IdentiFIService...');
    if (IdentiFiModule) {
      console.log('IdentiFiModule is available');
      this.eventEmitter = new NativeEventEmitter(IdentiFiModule);
    } else {
      console.warn('IdentiFiModule is not available. Make sure the native module is properly linked.');
      this.eventEmitter = null;
    }
    this.listeners = new Map();
    this.isConnected = false;
  }

  // Check if native module is available
  _checkNativeModule() {
    if (!IdentiFiModule) {
      throw new Error('IdentiFi native module is not available. Please check the installation.');
    }
  }

  // Connection Management
  async connect() {
    console.log('Attempting to connect to IdentiFi device...');
    this._checkNativeModule();
    try {
      const result = await IdentiFiModule.connect();
      console.log('Connection initiated:', result);
      return result;
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    this._checkNativeModule();
    try {
      const result = await IdentiFiModule.disconnect();
      this.isConnected = false;
      console.log('Disconnection initiated:', result);
      return result;
    } catch (error) {
      console.error('Disconnection failed:', error);
      throw error;
    }
  }

  // Device Information
  async getBatteryPercentage() {
    this._checkNativeModule();
    try {
      return await IdentiFiModule.getBatteryPercentage();
    } catch (error) {
      console.error('Get battery percentage failed:', error);
      throw error;
    }
  }

  async getDeviceSerialNumber() {
    try {
      console.log('Fetching device serial number...');
      return await IdentiFiModule.getDeviceSerialNumber();
    } catch (error) {
      console.error('Get device serial number failed:', error);
      throw error;
    }
  }

  async getFirmwareVersion() {
    try {
      return await IdentiFiModule.getFirmwareVersion();
    } catch (error) {
      console.error('Get firmware version failed:', error);
      throw error;
    }
  }

  async getLibraryVersion() {
    try {
      return await IdentiFiModule.getLibraryVersion();
    } catch (error) {
      console.error('Get library version failed:', error);
      throw error;
    }
  }

  async checkPlatform() {
    if (!IdentiFiModule) {
      return Promise.resolve({
        platform: 'unknown',
        hasSDK: false,
        sdkClass: 'none',
        error: 'IdentiFiModule not available'
      });
    }
    
    try {
      return await IdentiFiModule.checkPlatform();
    } catch (error) {
      console.error('Check platform failed:', error);
      throw error;
    }
  }

  async getModelNumber() {
    try {
      return await IdentiFiModule.getModelNumber();
    } catch (error) {
      console.error('Get model number failed:', error);
      throw error;
    }
  }

  async getReaderDescription() {
    try {
      return await IdentiFiModule.getReaderDescription();
    } catch (error) {
      console.error('Get reader description failed:', error);
      throw error;
    }
  }

  // Fingerprint Capture
  async startCaptureOneFinger(savedAtIndex = 0) {
    try {
      return await IdentiFiModule.startCaptureOneFinger(savedAtIndex);
    } catch (error) {
      console.error('Start capture one finger failed:', error);
      throw error;
    }
  }

  async startCaptureTwoFinger(savedAtIndex = 0) {
    try {
      return await IdentiFiModule.startCaptureTwoFinger(savedAtIndex);
    } catch (error) {
      console.error('Start capture two finger failed:', error);
      throw error;
    }
  }

  async startCaptureFourFinger(savedAtIndex = 0) {
    try {
      return await IdentiFiModule.startCaptureFourFinger(savedAtIndex);
    } catch (error) {
      console.error('Start capture four finger failed:', error);
      throw error;
    }
  }

  async startCaptureRollFinger(savedAtIndex = 0) {
    try {
      return await IdentiFiModule.startCaptureRollFinger(savedAtIndex);
    } catch (error) {
      console.error('Start capture roll finger failed:', error);
      throw error;
    }
  }

  async cancelFpCapture() {
    try {
      return await IdentiFiModule.cancelFpCapture();
    } catch (error) {
      console.error('Cancel fingerprint capture failed:', error);
      throw error;
    }
  }

  // Iris Capture
  async startCaptureIris() {
    try {
      return await IdentiFiModule.startCaptureIris();
    } catch (error) {
      console.error('Start capture iris failed:', error);
      throw error;
    }
  }

  async cancelIrisCapture() {
    try {
      return await IdentiFiModule.cancelIrisCapture();
    } catch (error) {
      console.error('Cancel iris capture failed:', error);
      throw error;
    }
  }

  // Power Management
  async setFpPowerOn() {
    try {
      return await IdentiFiModule.setFpPowerOn();
    } catch (error) {
      console.error('Set FP power on failed:', error);
      throw error;
    }
  }

  async setFpPowerOff() {
    try {
      return await IdentiFiModule.setFpPowerOff();
    } catch (error) {
      console.error('Set FP power off failed:', error);
      throw error;
    }
  }

  async getFpPowerStatus() {
    try {
      return await IdentiFiModule.getFpPowerStatus();
    } catch (error) {
      console.error('Get FP power status failed:', error);
      throw error;
    }
  }

  async setIrisPowerOn() {
    try {
      return await IdentiFiModule.setIrisPowerOn();
    } catch (error) {
      console.error('Set iris power on failed:', error);
      throw error;
    }
  }

  async setIrisPowerOff() {
    try {
      return await IdentiFiModule.setIrisPowerOff();
    } catch (error) {
      console.error('Set iris power off failed:', error);
      throw error;
    }
  }

  async getIrisPowerStatus() {
    try {
      return await IdentiFiModule.getIrisPowerStatus();
    } catch (error) {
      console.error('Get iris power status failed:', error);
      throw error;
    }
  }

  // Settings Management
  async setLEDBrightness(brightness) {
    try {
      return await IdentiFiModule.setLEDBrightness(brightness);
    } catch (error) {
      console.error('Set LED brightness failed:', error);
      throw error;
    }
  }

  async getLEDBrightness() {
    try {
      return await IdentiFiModule.getLEDBrightness();
    } catch (error) {
      console.error('Get LED brightness failed:', error);
      throw error;
    }
  }

  async setMinimumNFIQScore(score) {
    try {
      console.log('Setting minimum NFIQ score to:', score);
      return await IdentiFiModule.setMinimumNFIQScore(score);
    } catch (error) {
      console.error('Set minimum NFIQ score failed:', error);
      throw error;
    }
  }

  // Event Management
  addEventListener(eventName, callback) {
    if (!this.eventEmitter) {
      console.warn('Event emitter not available. Event listeners will not work.');
      return { remove: () => {} }; // Return a dummy subscription
    }
    
    const subscription = this.eventEmitter.addListener(eventName, callback);
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(subscription);
    
    return subscription;
  }

  removeEventListener(eventName) {
    if (this.listeners.has(eventName)) {
      const eventListeners = this.listeners.get(eventName);
      eventListeners.forEach(listener => listener.remove());
      this.listeners.delete(eventName);
    }
  }

  removeAllEventListeners() {
    this.listeners.forEach((eventListeners, eventName) => {
      eventListeners.forEach(listener => listener.remove());
    });
    this.listeners.clear();
  }

  // Saved Fingerprint Images Management
  async clearSavedFpImages(savedAtIndex = -1) {
    this._checkNativeModule();
    try {
      return await IdentiFiModule.clearSavedFpImages(savedAtIndex);
    } catch (error) {
      console.error('Clear saved FP images failed:', error);
      throw error;
    }
  }

  async getNfiqScoreFromImageSavedAt(savedAtIndex) {
    this._checkNativeModule();
    try {
      return await IdentiFiModule.getNfiqScoreFromImageSavedAt(savedAtIndex);
    } catch (error) {
      console.error('Get NFIQ score failed:', error);
      throw error;
    }
  }

  async getSegmentedFpImageSavedAt(savedAtIndex) {
    this._checkNativeModule();
    try {
      return await IdentiFiModule.getSegmentedFpImageSavedAt(savedAtIndex);
    } catch (error) {
      console.error('Get segmented FP image failed:', error);
      throw error;
    }
  }

  async getWSQEncodedFpImageFromImageSavedAt(savedAtIndex, croppedImage = false) {
    this._checkNativeModule();
    try {
      return await IdentiFiModule.getWSQEncodedFpImageFromImageSavedAt(savedAtIndex, croppedImage);
    } catch (error) {
      console.error('Get WSQ encoded FP image failed:', error);
      throw error;
    }
  }

  async isFingerDuplicated(savedAtIndex, securityLevel = 3) {
    this._checkNativeModule();
    try {
      return await IdentiFiModule.isFingerDuplicated(savedAtIndex, securityLevel);
    } catch (error) {
      console.error('Check finger duplicated failed:', error);
      throw error;
    }
  }

  // Power Management Extensions
  async getPowerOffMode() {
    this._checkNativeModule();
    try {
      return await IdentiFiModule.getPowerOffMode();
    } catch (error) {
      console.error('Get power off mode failed:', error);
      throw error;
    }
  }

  async setPowerOffMode(secondsToPowerOff) {
    this._checkNativeModule();
    try {
      return await IdentiFiModule.setPowerOffMode(secondsToPowerOff);
    } catch (error) {
      console.error('Set power off mode failed:', error);
      throw error;
    }
  }


  // Device Information Extensions - getReaderDescription() already exists above

  // Advanced LED Control
  async setLEDControlForPowerLED(power, fp, com, iris, mSecOn, mSecOff) {
    this._checkNativeModule();
    try {
      return await IdentiFiModule.setLEDControlForPowerLED(power, fp, com, iris, mSecOn, mSecOff);
    } catch (error) {
      console.error('Set LED control failed:', error);
      throw error;
    }
  }

  // Firmware Update
  async startFirmwareUpdate(firmwareData, toLegacyFirmware = false) {
    this._checkNativeModule();
    try {
      return await IdentiFiModule.startFirmwareUpdate(firmwareData, toLegacyFirmware);
    } catch (error) {
      console.error('Start firmware update failed:', error);
      throw error;
    }
  }

  // Close connection (additional to disconnect)
  async close() {
    this._checkNativeModule();
    try {
      const result = await IdentiFiModule.close();
      this.isConnected = false;
      console.log('Connection closed:', result);
      return result;
    } catch (error) {
      console.error('Close connection failed:', error);
      throw error;
    }
  }

  // Connection status tracking
  setupConnectionListeners() {
    this.addEventListener('onConnection', () => {
      this.isConnected = true;
      console.log('Device connected successfully');
    });

    this.addEventListener('onDisconnection', () => {
      this.isConnected = false;
      console.log('Device disconnected');
    });

    this.addEventListener('onConnectionError', (error) => {
      this.isConnected = false;
      console.log('Connection error:', error);
    });

    this.addEventListener('onConnectionTimeOut', () => {
      this.isConnected = false;
      console.log('Connection timeout');
    });
  }

  // Setup all IdentiFI event listeners for comprehensive callback handling
  setupAllEventListeners() {
    this.setupConnectionListeners();

    // Fingerprint capture events
    this.addEventListener('onCancelFpCapture', () => {
      console.log('Fingerprint capture cancelled');
    });

    this.addEventListener('onStreaming', (fpImage) => {
      console.log('Streaming fingerprint image received');
    });

    this.addEventListener('onStreamingRolledFp', (data) => {
      console.log('Streaming rolled fingerprint:', data);
    });

    this.addEventListener('onLastFrame', (data) => {
      console.log('Last frame received:', data);
    });

    this.addEventListener('onLastFrame_RAW', (data) => {
      console.log('Last frame RAW received:', data);
    });

    this.addEventListener('onLastFrameRolledFp', (data) => {
      console.log('Last frame rolled FP received:', data);
    });

    this.addEventListener('onLastFrameRolledFp_RAW', (data) => {
      console.log('Last frame rolled FP RAW received:', data);
    });

    // Settings events
    this.addEventListener('onSetMinimumNFIQScore', (score) => {
      console.log('Minimum NFIQ score set:', score);
    });

    this.addEventListener('onGetPowerOffMode', (seconds) => {
      console.log('Power off mode:', seconds);
    });

    this.addEventListener('onSetPowerOffMode', (seconds) => {
      console.log('Power off mode set to:', seconds);
    });

    // Power management events
    this.addEventListener('onGetFpPowerStatus', (status) => {
      console.log('FP power status:', status);
    });

    this.addEventListener('onSetFpPowerOn', (status) => {
      console.log('FP power on status:', status);
    });

    this.addEventListener('onSetFpPowerOff', () => {
      console.log('FP power turned off');
    });

    // Saved fingerprint images events
    this.addEventListener('onGetNfiqScore', (data) => {
      console.log('NFIQ score received:', data);
    });

    this.addEventListener('onGetSegmentedFpImage_RAW', (data) => {
      console.log('Segmented FP image RAW received:', data);
    });

    this.addEventListener('onGetWSQEncodedFpImage', (data) => {
      console.log('WSQ encoded FP image received:', data);
    });

    this.addEventListener('onIsFingerDuplicated', (result) => {
      console.log('Finger duplication check result:', result);
    });

    this.addEventListener('onSavedFpImagesCleared', (index) => {
      console.log('Saved FP images cleared at index:', index);
    });

    // Firmware update events
    this.addEventListener('onFirmwareTransferCompleted', (result) => {
      console.log('Firmware transfer completed:', result);
    });

    // Standard device info events (already handled above)
    this.addEventListener('onGetBatteryPercentage', (percentage) => {
      console.log('Battery percentage:', percentage);
    });

    this.addEventListener('onGetDeviceSerialNumber', (serial) => {
      console.log('Device serial number:', serial);
    });

    this.addEventListener('onGetFirmwareVersion', (version) => {
      console.log('Firmware version:', version);
    });

    this.addEventListener('onGetModelNumber', (model) => {
      console.log('Model number:', model);
    });

    this.addEventListener('onGetReaderDescription', (description) => {
      console.log('Reader description:', description);
    });

    // Fingerprint capture status events
    this.addEventListener('onFpCaptureStatus', (data) => {
      console.log('FP capture status:', data);
    });

    // Iris capture events
    this.addEventListener('onIrisCaptureStatus', (data) => {
      console.log('Iris capture status:', data);
    });
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export default new IdentiFIService();