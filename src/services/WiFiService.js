import AsyncStorage from '@react-native-async-storage/async-storage';
import Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

// Android-only import
let WifiManager = null;
if (Platform.OS === 'android') {
  try {
    WifiManager = require('react-native-wifi-reborn').default;
  } catch (error) {
    console.log('WiFi reborn not available on this platform');
  }
}

const WIFI_NETWORKS_KEY = 'wifi_backup_networks';
const WIFI_PASSWORD_PREFIX = 'wifi_password_';

class WiFiService {
  constructor() {
    this.networks = [];
    this.currentNetwork = null;
    this.isAndroid = Platform.OS === 'android';
  }

  // Initialize service and load saved networks
  async initialize() {
    try {
      await this.loadSavedNetworks();
      await this.getCurrentNetworkInfo();
    } catch (error) {
      console.error('Failed to initialize WiFi service:', error);
    }
  }

  // Get current WiFi network information
  async getCurrentNetworkInfo() {
    try {
      if (this.isAndroid && WifiManager) {
        // Android: Get current WiFi info
        const ssid = await WifiManager.getCurrentWifiSSID();
        const bssid = await WifiManager.getBSSID();
        
        if (ssid && ssid !== '<unknown ssid>') {
          this.currentNetwork = {
            ssid: ssid.replace(/"/g, ''), // Remove quotes
            bssid: bssid,
            platform: 'android'
          };
        }
      } else {
        // iOS: Use NetInfo or similar for basic network info
        // Note: iOS doesn't provide WiFi SSID without additional permissions
        this.currentNetwork = {
          ssid: 'Current Network', // Placeholder - iOS limitations
          platform: 'ios'
        };
      }
      
      return this.currentNetwork;
    } catch (error) {
      console.error('Failed to get current network info:', error);
      return null;
    }
  }

  // Load saved networks from AsyncStorage
  async loadSavedNetworks() {
    try {
      const networksJson = await AsyncStorage.getItem(WIFI_NETWORKS_KEY);
      if (networksJson) {
        this.networks = JSON.parse(networksJson);
      } else {
        this.networks = [];
      }
      return this.networks;
    } catch (error) {
      console.error('Failed to load saved networks:', error);
      this.networks = [];
      return [];
    }
  }

  // Save networks to AsyncStorage
  async saveNetworks() {
    try {
      await AsyncStorage.setItem(WIFI_NETWORKS_KEY, JSON.stringify(this.networks));
    } catch (error) {
      console.error('Failed to save networks:', error);
      throw error;
    }
  }

  // Add a new network
  async addNetwork(ssid, password = null, priority = 1) {
    try {
      // Check if network already exists
      const existingIndex = this.networks.findIndex(network => network.ssid === ssid);
      
      const networkData = {
        id: Date.now().toString(),
        ssid: ssid.trim(),
        priority: priority,
        dateAdded: new Date().toISOString(),
        isSecure: password !== null && password !== '',
        platform: this.isAndroid ? 'android' : 'ios'
      };

      if (existingIndex !== -1) {
        // Update existing network
        networkData.id = this.networks[existingIndex].id;
        this.networks[existingIndex] = networkData;
      } else {
        // Add new network
        this.networks.push(networkData);
      }

      // Save password securely if provided
      if (password && password.trim() !== '') {
        await Keychain.setInternetCredentials(`${WIFI_PASSWORD_PREFIX}${networkData.id}`, '', password.trim());
      }

      // Sort by priority (higher priority first)
      this.networks.sort((a, b) => b.priority - a.priority);

      await this.saveNetworks();
      return networkData;
    } catch (error) {
      console.error('Failed to add network:', error);
      throw error;
    }
  }

  // Remove a network
  async removeNetwork(networkId) {
    try {
      const networkIndex = this.networks.findIndex(network => network.id === networkId);
      if (networkIndex === -1) {
        throw new Error('Network not found');
      }

      // Remove password from secure storage
      try {
        await Keychain.resetInternetCredentials(`${WIFI_PASSWORD_PREFIX}${networkId}`);
      } catch (error) {
        // Password might not exist, continue
      }

      // Remove from networks list
      this.networks.splice(networkIndex, 1);
      await this.saveNetworks();
      
      return true;
    } catch (error) {
      console.error('Failed to remove network:', error);
      throw error;
    }
  }

  // Get password for a network
  async getNetworkPassword(networkId) {
    try {
      const credentials = await Keychain.getInternetCredentials(`${WIFI_PASSWORD_PREFIX}${networkId}`);
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Failed to get network password:', error);
      return null;
    }
  }

  // Update network priority
  async updateNetworkPriority(networkId, newPriority) {
    try {
      const network = this.networks.find(n => n.id === networkId);
      if (!network) {
        throw new Error('Network not found');
      }

      network.priority = newPriority;
      
      // Sort by priority
      this.networks.sort((a, b) => b.priority - a.priority);
      
      await this.saveNetworks();
      return network;
    } catch (error) {
      console.error('Failed to update network priority:', error);
      throw error;
    }
  }

  // Get all saved networks
  getSavedNetworks() {
    return this.networks;
  }

  // Save current network as backup (if available)
  async saveCurrentNetworkAsBackup(priority = 1) {
    try {
      await this.getCurrentNetworkInfo();
      
      if (!this.currentNetwork || !this.currentNetwork.ssid || this.currentNetwork.ssid === 'Current Network') {
        throw new Error('No current network information available');
      }

      return await this.addNetwork(this.currentNetwork.ssid, null, priority);
    } catch (error) {
      console.error('Failed to save current network as backup:', error);
      throw error;
    }
  }

  // Get available WiFi networks (Android only)
  async scanWifiNetworks() {
    if (!this.isAndroid || !WifiManager) {
      throw new Error('WiFi scanning not available on this platform');
    }

    try {
      const networks = await WifiManager.loadWifiList();
      return networks.map(network => ({
        ssid: network.SSID,
        bssid: network.BSSID,
        frequency: network.frequency,
        level: network.level,
        security: network.capabilities
      }));
    } catch (error) {
      console.error('Failed to scan WiFi networks:', error);
      throw error;
    }
  }

  // Connect to a WiFi network (cross-platform)
  async connectToNetwork(ssid, password) {
    try {
      console.log(`[WiFiService] Attempting to connect to ${ssid}`);
      
      if (this.isAndroid && WifiManager) {
        // Android: Use WiFi reborn
        const result = await WifiManager.connectToProtectedSSID(ssid, password, false);
        console.log(`[WiFiService] Android connection result for ${ssid}:`, result);
        return result;
      } else {
        // iOS: Use NEHotspotConfiguration
        return await this.connectToNetworkIOS(ssid, password);
      }
    } catch (error) {
      console.error(`[WiFiService] Failed to connect to ${ssid}:`, error);
      throw error;
    }
  }

  // iOS-specific WiFi connection using NEHotspotConfiguration
  async connectToNetworkIOS(ssid, password) {
    try {
      console.log(`[WiFiService] iOS: Attempting to connect to ${ssid}`);
      
      // Call native iOS method through bridge
      const { NativeModules } = require('react-native');
      
      if (!NativeModules.WiFiHotspotModule) {
        throw new Error('WiFiHotspotModule not available - requires native implementation');
      }
      
      const result = await NativeModules.WiFiHotspotModule.connectToWiFi(ssid, password);
      console.log(`[WiFiService] iOS connection result for ${ssid}:`, result);
      return result;
    } catch (error) {
      console.error(`[WiFiService] iOS connection failed for ${ssid}:`, error);
      
      // Fallback: Prompt user to connect manually
      const { Alert } = require('react-native');
      Alert.alert(
        'WiFi Connection Required',
        `Please manually connect to WiFi network "${ssid}" in Settings to enable data transmission.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => this.openWiFiSettings() }
        ]
      );
      
      throw error;
    }
  }

  // Open WiFi settings on iOS
  async openWiFiSettings() {
    try {
      const { Linking } = require('react-native');
      await Linking.openURL('App-Prefs:WIFI');
    } catch (error) {
      console.error('[WiFiService] Failed to open WiFi settings:', error);
    }
  }

  // Auto-connect to the best available backup network
  async autoConnectToBestNetwork() {

    try {
      await this.loadSavedNetworks();
      
      if (this.networks.length === 0) {
        return { success: false, reason: 'No backup networks configured' };
      }

      // Sort networks by priority (highest first)
      const sortedNetworks = [...this.networks].sort((a, b) => b.priority - a.priority);
      
      console.log(`[WiFiService] Attempting auto-connect to ${sortedNetworks.length} networks`);

      for (const network of sortedNetworks) {
        try {
          console.log(`[WiFiService] Trying network: ${network.ssid} (priority: ${network.priority})`);
          
          // Get password if network is secured
          let password = null;
          if (network.isSecure) {
            password = await this.getNetworkPassword(network.id);
            if (!password) {
              console.log(`[WiFiService] No password found for secured network: ${network.ssid}`);
              continue;
            }
          }

          // Attempt connection
          const result = await this.connectToNetwork(network.ssid, password);
          
          if (result) {
            // Wait a moment for connection to establish
            await this.delay(3000);
            
            // Verify connection
            const currentInfo = await this.getCurrentNetworkInfo();
            if (currentInfo && currentInfo.ssid === network.ssid) {
              console.log(`[WiFiService] Successfully connected to ${network.ssid}`);
              return { 
                success: true, 
                network: network,
                ssid: network.ssid 
              };
            }
          }
        } catch (error) {
          console.log(`[WiFiService] Connection failed for ${network.ssid}:`, error.message);
          continue;
        }
      }

      return { success: false, reason: 'All networks failed' };
    } catch (error) {
      console.error('[WiFiService] Auto-connect error:', error);
      return { success: false, reason: error.message };
    }
  }

  // Test network connectivity for a specific network
  async testNetworkConnectivity(networkId) {
    try {
      const network = this.networks.find(n => n.id === networkId);
      if (!network) {
        throw new Error('Network not found');
      }

      // Check if we're currently connected to this network
      const currentNetwork = await this.getCurrentNetworkInfo();
      if (!currentNetwork || currentNetwork.ssid !== network.ssid) {
        return { connected: false, reason: 'Not connected to this network' };
      }

      // Test internet connectivity
      const response = await fetch('https://wttr.in/test?format=%t', {
        method: 'HEAD',
        timeout: 10000
      });

      if (response.ok) {
        return { 
          connected: true, 
          latency: Date.now() - startTime,
          quality: 'good'
        };
      } else {
        return { connected: false, reason: 'No internet access' };
      }
    } catch (error) {
      return { connected: false, reason: error.message };
    }
  }

  // Get network recommendations based on performance history
  getNetworkRecommendations() {
    // This could be enhanced with historical performance data
    const recommendations = this.networks.map(network => ({
      ...network,
      score: this.calculateNetworkScore(network),
      recommended: network.priority >= 3
    }));

    return recommendations.sort((a, b) => b.score - a.score);
  }

  // Calculate a score for a network based on priority and other factors
  calculateNetworkScore(network) {
    let score = network.priority * 10;
    
    // Bonus for recently added networks (they might be more reliable)
    const daysSinceAdded = (Date.now() - new Date(network.dateAdded).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceAdded < 7) {
      score += 5;
    }

    // Penalty for very old networks
    if (daysSinceAdded > 30) {
      score -= 2;
    }

    return Math.max(0, score);
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check if platform supports WiFi scanning
  supportsScan() {
    return this.isAndroid && WifiManager !== null;
  }

  // Get platform-specific features
  getPlatformFeatures() {
    return {
      scan: this.supportsScan(),
      connect: this.isAndroid && WifiManager !== null,
      getCurrentNetwork: true,
      manualAdd: true,
      platform: this.isAndroid ? 'android' : 'ios'
    };
  }
}

export default new WiFiService();