import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import WiFiService from './WiFiService';

// Network types and quality levels
const NETWORK_TYPES = {
  NONE: 'none',
  CELLULAR: 'cellular',
  WIFI: 'wifi',
  ETHERNET: 'ethernet',
  BLUETOOTH: 'bluetooth',
  WIMAX: 'wimax',
  VPN: 'vpn',
  OTHER: 'other',
  UNKNOWN: 'unknown'
};

const CONNECTIVITY_STATUS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  POOR: 'poor',
  DISCONNECTED: 'disconnected',
  SWITCHING: 'switching'
};

class ConnectivityService {
  constructor() {
    this.currentState = null;
    this.listeners = [];
    this.connectivityHistory = [];
    this.isMonitoring = false;
    this.switchInProgress = false;
    this.lastConnectivityTest = null;
    
    // Retry configuration
    this.retryConfig = {
      maxAttempts: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      backoffMultiplier: 2
    };
  }

  // Initialize the connectivity service
  async initialize() {
    try {
      console.log('[ConnectivityService] Initializing...');
      
      // Get initial network state
      this.currentState = await NetInfo.fetch();
      this.addToHistory(this.currentState);
      
      // Start monitoring
      this.startMonitoring();
      
      console.log('[ConnectivityService] Initialized with state:', this.currentState);
      return this.currentState;
    } catch (error) {
      console.error('[ConnectivityService] Initialization failed:', error);
      throw error;
    }
  }

  // Start network monitoring
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener(state => {
      console.log('[ConnectivityService] Network state changed:', state);
      this.handleStateChange(state);
    });

    console.log('[ConnectivityService] Started monitoring network changes');
  }

  // Stop network monitoring
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    console.log('[ConnectivityService] Stopped monitoring network changes');
  }

  // Handle network state changes
  async handleStateChange(newState) {
    const previousState = this.currentState;
    this.currentState = newState;
    this.addToHistory(newState);

    // Notify listeners
    this.notifyListeners('stateChange', {
      current: newState,
      previous: previousState
    });

    // Check if we need to switch networks
    if (this.shouldSwitchNetwork(previousState, newState)) {
      await this.attemptNetworkSwitch();
    }
  }

  // Determine if network switching is needed
  shouldSwitchNetwork(previousState, newState) {
    // Don't switch if already switching
    if (this.switchInProgress) return false;

    // Switch if we lost connectivity
    if (previousState?.isConnected && !newState.isConnected) {
      console.log('[ConnectivityService] Lost connectivity, attempting switch');
      return true;
    }

    // Switch if internet became unreachable
    if (previousState?.isInternetReachable && !newState.isInternetReachable) {
      console.log('[ConnectivityService] Lost internet access, attempting switch');
      return true;
    }

    // Switch if cellular network is poor and WiFi backups are available
    if (newState.type === NETWORK_TYPES.CELLULAR && this.isConnectionPoor(newState)) {
      console.log('[ConnectivityService] Poor cellular connection, checking WiFi alternatives');
      return true;
    }

    return false;
  }

  // Attempt to switch to a better network
  async attemptNetworkSwitch() {
    if (this.switchInProgress) {
      console.log('[ConnectivityService] Switch already in progress');
      return;
    }

    this.switchInProgress = true;
    this.notifyListeners('switchStarted');

    try {
      console.log('[ConnectivityService] Starting network switch attempt');

      // Get backup networks from WiFi service
      await WiFiService.initialize();
      const backupNetworks = WiFiService.getSavedNetworks();
      
      if (backupNetworks.length === 0) {
        console.log('[ConnectivityService] No backup networks available');
        this.notifyListeners('switchFailed', { reason: 'No backup networks' });
        return;
      }

      // Sort networks by priority
      const sortedNetworks = backupNetworks.sort((a, b) => b.priority - a.priority);
      
      // Try each network in order
      for (const network of sortedNetworks) {
        console.log(`[ConnectivityService] Attempting connection to ${network.ssid} (priority: ${network.priority})`);
        
        const success = await this.tryConnectToNetwork(network);
        if (success) {
          console.log(`[ConnectivityService] Successfully connected to ${network.ssid}`);
          this.notifyListeners('switchSuccess', { network });
          return;
        }
      }

      console.log('[ConnectivityService] All backup networks failed');
      this.notifyListeners('switchFailed', { reason: 'All networks failed' });

    } catch (error) {
      console.error('[ConnectivityService] Switch attempt failed:', error);
      this.notifyListeners('switchFailed', { reason: error.message });
    } finally {
      this.switchInProgress = false;
    }
  }

  // Try to connect to a specific network
  async tryConnectToNetwork(network, attempt = 1) {
    try {
      console.log(`[ConnectivityService] Connecting to ${network.ssid} (attempt ${attempt})`);

      // On Android, try automatic connection
      if (Platform.OS === 'android' && WiFiService.supportsScan()) {
        const password = await WiFiService.getNetworkPassword(network.id);
        if (password || !network.isSecure) {
          try {
            await WiFiService.connectToNetwork(network.ssid, password);
            
            // Wait a moment for connection to establish
            await this.delay(3000);
            
            // Test connectivity
            const isConnected = await this.testConnectivity();
            if (isConnected) {
              return true;
            }
          } catch (connectError) {
            console.error(`[ConnectivityService] Auto-connect failed for ${network.ssid}:`, connectError);
          }
        }
      }

      // For iOS, try NEHotspotConfiguration or manual connection prompt
      try {
        const connectResult = await WiFiService.connectToNetwork(network.ssid, 
          await WiFiService.getNetworkPassword(network.id));
        
        if (connectResult) {
          // Wait for connection to establish
          await this.delay(3000);
          
          // Test connectivity
          const isConnected = await this.testConnectivity();
          if (isConnected) {
            return true;
          }
        }
      } catch (connectError) {
        console.log(`[ConnectivityService] iOS connection attempt failed for ${network.ssid}:`, connectError.message);
        
        // Fallback: Check if already connected to this network
        const currentNetwork = await WiFiService.getCurrentNetworkInfo();
        if (currentNetwork && currentNetwork.ssid === network.ssid) {
          const isConnected = await this.testConnectivity();
          return isConnected;
        }
      }

      return false;
    } catch (error) {
      console.error(`[ConnectivityService] Connection attempt failed for ${network.ssid}:`, error);
      
      // Retry with exponential backoff
      if (attempt < this.retryConfig.maxAttempts) {
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
          this.retryConfig.maxDelay
        );
        
        console.log(`[ConnectivityService] Retrying ${network.ssid} in ${delay}ms`);
        await this.delay(delay);
        return this.tryConnectToNetwork(network, attempt + 1);
      }
      
      return false;
    }
  }

  // Test actual internet connectivity
  async testConnectivity(timeout = 10000) {
    try {
      console.log('[ConnectivityService] Testing connectivity...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Test with weather API (same as in FingerprintsScreen)
      const response = await fetch('https://wttr.in/Washington?format=%t', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.text();
        this.lastConnectivityTest = {
          success: true,
          timestamp: Date.now(),
          latency: Date.now() - this.lastConnectivityTest?.timestamp || 0,
          response: result.trim()
        };
        
        console.log('[ConnectivityService] Connectivity test successful');
        return true;
      }

      console.log('[ConnectivityService] Connectivity test failed - bad response');
      return false;
    } catch (error) {
      console.log('[ConnectivityService] Connectivity test failed:', error.message);
      this.lastConnectivityTest = {
        success: false,
        timestamp: Date.now(),
        error: error.message
      };
      return false;
    }
  }

  // Check if connection quality is poor
  isConnectionPoor(state) {
    // Basic check based on NetInfo details
    if (state.details) {
      // For cellular connections
      if (state.type === NETWORK_TYPES.CELLULAR && state.details.cellularGeneration) {
        // Consider 2G as poor
        return state.details.cellularGeneration === '2g';
      }
      
      // For WiFi connections
      if (state.type === NETWORK_TYPES.WIFI && state.details.strength !== undefined) {
        // Consider signal strength below 30% as poor
        return state.details.strength < 30;
      }
    }

    // Fallback: consider unreachable internet as poor
    return !state.isInternetReachable;
  }

  // Get connectivity quality assessment
  getConnectivityQuality() {
    if (!this.currentState || !this.currentState.isConnected) {
      return CONNECTIVITY_STATUS.DISCONNECTED;
    }

    if (this.switchInProgress) {
      return CONNECTIVITY_STATUS.SWITCHING;
    }

    if (!this.currentState.isInternetReachable) {
      return CONNECTIVITY_STATUS.POOR;
    }

    if (this.isConnectionPoor(this.currentState)) {
      return CONNECTIVITY_STATUS.POOR;
    }

    // Check recent connectivity test results
    if (this.lastConnectivityTest && this.lastConnectivityTest.success) {
      const latency = this.lastConnectivityTest.latency;
      if (latency < 1000) return CONNECTIVITY_STATUS.EXCELLENT;
      if (latency < 3000) return CONNECTIVITY_STATUS.GOOD;
      return CONNECTIVITY_STATUS.POOR;
    }

    return CONNECTIVITY_STATUS.GOOD;
  }

  // Get current network information
  getCurrentNetworkInfo() {
    return {
      state: this.currentState,
      quality: this.getConnectivityQuality(),
      lastTest: this.lastConnectivityTest,
      isSwitching: this.switchInProgress,
      history: this.connectivityHistory.slice(-5) // Last 5 states
    };
  }

  // Add event listener
  addEventListener(eventType, callback) {
    const listener = { eventType, callback, id: Date.now() + Math.random() };
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l.id !== listener.id);
    };
  }

  // Notify all listeners
  notifyListeners(eventType, data = null) {
    this.listeners
      .filter(listener => listener.eventType === eventType)
      .forEach(listener => {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('[ConnectivityService] Listener error:', error);
        }
      });
  }

  // Add state to history
  addToHistory(state) {
    this.connectivityHistory.push({
      ...state,
      timestamp: Date.now()
    });

    // Keep only last 20 entries
    if (this.connectivityHistory.length > 20) {
      this.connectivityHistory = this.connectivityHistory.slice(-20);
    }
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Force a connectivity test
  async forceConnectivityTest() {
    console.log('[ConnectivityService] Forcing connectivity test');
    return await this.testConnectivity();
  }

  // Manual network switch trigger
  async triggerNetworkSwitch() {
    console.log('[ConnectivityService] Manual network switch triggered');
    await this.attemptNetworkSwitch();
  }

  // Get network statistics
  getNetworkStatistics() {
    const totalConnections = this.connectivityHistory.length;
    const successfulConnections = this.connectivityHistory.filter(h => h.isConnected).length;
    const internetReachable = this.connectivityHistory.filter(h => h.isInternetReachable).length;
    
    const typeDistribution = this.connectivityHistory.reduce((acc, h) => {
      acc[h.type] = (acc[h.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalConnections,
      successRate: totalConnections > 0 ? (successfulConnections / totalConnections) * 100 : 0,
      internetSuccessRate: totalConnections > 0 ? (internetReachable / totalConnections) * 100 : 0,
      typeDistribution,
      currentQuality: this.getConnectivityQuality(),
      lastSwitchAttempt: this.switchInProgress ? 'In Progress' : 'None'
    };
  }

  // Cleanup
  destroy() {
    this.stopMonitoring();
    this.listeners = [];
    this.connectivityHistory = [];
    console.log('[ConnectivityService] Service destroyed');
  }
}

export default new ConnectivityService();