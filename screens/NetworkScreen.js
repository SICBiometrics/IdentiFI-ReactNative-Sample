import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IdentiFIService from '../src/services/IdentiFIService';
import ConnectivityService from '../src/services/ConnectivityService';
import ResilientApiService from '../src/services/ResilientApiService';
import ConnectivityIndicator from '../src/components/ConnectivityIndicator';
import WiFiService from '../src/services/WiFiService';
import WiFiNetworkList from '../src/components/WiFiNetworkList';
import AddNetworkModal from '../src/components/AddNetworkModal';

export default function NetworkScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    battery: null,
    serialNumber: null,
    firmwareVersion: null,
    libraryVersion: null,
    modelNumber: null,
  });
  const [queueStatus, setQueueStatus] = useState(null);
  
  // WiFi state
  const [wifiNetworks, setWifiNetworks] = useState([]);
  const [currentWifiNetwork, setCurrentWifiNetwork] = useState(null);
  const [showAddNetworkModal, setShowAddNetworkModal] = useState(false);
  const [availableNetworks, setAvailableNetworks] = useState([]);
  const [wifiFeatures, setWifiFeatures] = useState(null);
  const [isLoadingWifi, setIsLoadingWifi] = useState(false);

  useEffect(() => {
    // Setup connection listeners
    IdentiFIService.setupConnectionListeners();

    const connectionListener = IdentiFIService.addEventListener('onConnection', () => {
      setIsConnected(true);
      setIsConnecting(false);
      loadDeviceInfo();
    });

    const disconnectionListener = IdentiFIService.addEventListener('onDisconnection', () => {
      setIsConnected(false);
      setIsConnecting(false);
      setDeviceInfo({
        battery: null,
        serialNumber: null,
        firmwareVersion: null,
        libraryVersion: null,
        modelNumber: null,
      });
    });

    const errorListener = IdentiFIService.addEventListener('onConnectionError', (error) => {
      setIsConnected(false);
      setIsConnecting(false);
      Alert.alert('Connection Error', error.message || 'Failed to connect to device');
    });

    const timeoutListener = IdentiFIService.addEventListener('onConnectionTimeOut', () => {
      setIsConnected(false);
      setIsConnecting(false);
      Alert.alert('Connection Timeout', 'Device not responding. Please check if device is powered on.');
    });

    // Initialize connectivity services
    initializeConnectivityServices();
    
    // Initialize WiFi service
    initializeWiFiService();

    return () => {
      connectionListener.remove();
      disconnectionListener.remove();
      errorListener.remove();
      timeoutListener.remove();
    };
  }, []);

  const initializeConnectivityServices = async () => {
    try {
      await ConnectivityService.initialize();
      await ResilientApiService.initialize();
      
      updateQueueStatus();
      
      // Set up listeners for queue changes
      ResilientApiService.addEventListener('requestQueued', updateQueueStatus);
      ResilientApiService.addEventListener('requestCompleted', updateQueueStatus);
    } catch (error) {
      console.error('Failed to initialize connectivity services:', error);
    }
  };

  const updateQueueStatus = () => {
    setQueueStatus(ResilientApiService.getQueueStatus());
  };

  const loadDeviceInfo = async () => {
    try {
      // Get library version (synchronous)
      const libVersion = await IdentiFIService.getLibraryVersion();
      setDeviceInfo(prev => ({ ...prev, libraryVersion: libVersion }));

      // Get device info (async with events)
      await IdentiFIService.getBatteryPercentage();
      await IdentiFIService.getDeviceSerialNumber();
      await IdentiFIService.getFirmwareVersion();
      await IdentiFIService.getModelNumber();
    } catch (error) {
      console.error('Failed to load device info:', error);
    }
  };

  useEffect(() => {
    // Listen for device info events
    const batteryListener = IdentiFIService.addEventListener('onGetBatteryPercentage', (data) => {
      setDeviceInfo(prev => ({ ...prev, battery: data.percentage }));
    });

    const serialListener = IdentiFIService.addEventListener('onGetDeviceSerialNumber', (data) => {
      setDeviceInfo(prev => ({ ...prev, serialNumber: data.serialNumber }));
    });

    const firmwareListener = IdentiFIService.addEventListener('onGetFirmwareVersion', (data) => {
      setDeviceInfo(prev => ({ ...prev, firmwareVersion: data.version }));
    });

    const modelListener = IdentiFIService.addEventListener('onGetModelNumber', (data) => {
      setDeviceInfo(prev => ({ ...prev, modelNumber: data.model }));
    });

    return () => {
      batteryListener.remove();
      serialListener.remove();
      firmwareListener.remove();
      modelListener.remove();
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await IdentiFIService.connect();
      console.log('Connected to device');
    } catch (error) {
      setIsConnecting(false);
      Alert.alert('Connection Failed', error.message || 'Failed to connect to device');
    }
  };

  const handleDisconnect = async () => {
    try {
      await IdentiFIService.disconnect();
    } catch (error) {
      Alert.alert('Disconnection Failed', error.message || 'Failed to disconnect from device');
    }
  };

  const refreshDeviceInfo = () => {
    if (isConnected) {
      loadDeviceInfo();
    }
  };

  const debugPlatform = async () => {
    try {
      const platformInfo = await IdentiFIService.checkPlatform();
      Alert.alert('Platform Debug', JSON.stringify(platformInfo, null, 2));
    } catch (error) {
      Alert.alert('Debug Error', error.message || 'Failed to check platform');
    }
  };

  // WiFi Functions
  const initializeWiFiService = async () => {
    try {
      await WiFiService.initialize();
      setWifiFeatures(WiFiService.getPlatformFeatures());
      await loadWiFiData();
    } catch (error) {
      console.error('Failed to initialize WiFi service:', error);
    }
  };

  const loadWiFiData = async () => {
    try {
      const networks = await WiFiService.loadSavedNetworks();
      setWifiNetworks(networks);
      
      const current = await WiFiService.getCurrentNetworkInfo();
      setCurrentWifiNetwork(current);
    } catch (error) {
      console.error('Failed to load WiFi data:', error);
    }
  };

  const handleAddNetwork = async (ssid, password, priority) => {
    try {
      await WiFiService.addNetwork(ssid, password, priority);
      await loadWiFiData();
    } catch (error) {
      throw error;
    }
  };

  const handleRemoveNetwork = async (networkId) => {
    try {
      await WiFiService.removeNetwork(networkId);
      await loadWiFiData();
      Alert.alert('Success', 'Network removed successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to remove network');
    }
  };

  const handleUpdatePriority = async (networkId, newPriority) => {
    try {
      await WiFiService.updateNetworkPriority(networkId, newPriority);
      await loadWiFiData();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update priority');
    }
  };

  const handleSaveCurrentNetwork = async () => {
    try {
      setIsLoadingWifi(true);
      await WiFiService.saveCurrentNetworkAsBackup();
      await loadWiFiData();
      Alert.alert('Success', 'Current network saved as backup');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save current network');
    } finally {
      setIsLoadingWifi(false);
    }
  };

  const handleScanNetworks = async () => {
    if (!wifiFeatures?.scan) {
      Alert.alert('Not Available', 'WiFi scanning is not available on this platform');
      return;
    }

    try {
      setIsLoadingWifi(true);
      const networks = await WiFiService.scanWifiNetworks();
      setAvailableNetworks(networks);
      setShowAddNetworkModal(true);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to scan WiFi networks');
    } finally {
      setIsLoadingWifi(false);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network & Device</Text>
      
      {/* Enhanced Connectivity Status */}
      <View style={styles.connectivitySection}>
        <ConnectivityIndicator 
          showDetails={true} 
          style={styles.connectivityIndicator}
        />
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Connection Status:</Text>
        <Text style={[styles.statusText, { color: isConnected ? '#4CAF50' : '#F44336' }]}>
          {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {!isConnected ? (
          <TouchableOpacity 
            style={[styles.button, styles.connectButton]} 
            onPress={handleConnect}
            disabled={isConnecting}
          >
            <Text style={styles.buttonText}>
              {isConnecting ? 'Connecting...' : 'Connect Device'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.disconnectButton]} 
            onPress={handleDisconnect}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.debugButton]} 
          onPress={debugPlatform}
        >
          <Text style={styles.buttonText}>🔍 Debug Platform</Text>
        </TouchableOpacity>
      </View>


      {/* Request Queue Status */}
      {queueStatus && queueStatus.total > 0 && (
        <View style={styles.queueStatusContainer}>
          <Text style={styles.sectionTitle}>Request Queue</Text>
          
          <View style={styles.queueInfo}>
            <View style={styles.queueStat}>
              <Ionicons name="list" size={20} color="#666" />
              <Text style={styles.queueStatText}>Total: {queueStatus.total}</Text>
            </View>
            
            <View style={styles.queueStat}>
              <Ionicons 
                name={queueStatus.isProcessing ? "play" : "pause"} 
                size={20} 
                color={queueStatus.isProcessing ? "#4CAF50" : "#FF9800"} 
              />
              <Text style={styles.queueStatText}>
                {queueStatus.isProcessing ? 'Processing' : 'Paused'}
              </Text>
            </View>
          </View>
          
          {queueStatus.statusCounts && (
            <View style={styles.statusCounts}>
              {Object.entries(queueStatus.statusCounts).map(([status, count]) => (
                <View key={status} style={styles.statusItem}>
                  <Text style={styles.statusLabel}>{status.replace('_', ' ')}</Text>
                  <Text style={styles.statusCount}>{count}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {isConnected && (
        <View style={styles.deviceInfoContainer}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Device Information</Text>
            {<TouchableOpacity onPress={refreshDeviceInfo} style={styles.refreshButton}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Battery:</Text>
            <Text style={styles.infoValue}>
              {deviceInfo.battery !== null ? `${deviceInfo.battery}%` : 'Loading...'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Model:</Text>
            <Text style={styles.infoValue}>
              {deviceInfo.modelNumber || 'Loading...'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Serial Number:</Text>
            <Text style={styles.infoValue}>
              {deviceInfo.serialNumber || 'Loading...'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Firmware:</Text>
            <Text style={styles.infoValue}>
              {deviceInfo.firmwareVersion || 'Loading...'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SDK Version:</Text>
            <Text style={styles.infoValue}>
              {deviceInfo.libraryVersion || 'Loading...'}
            </Text>
          </View>
        </View>
      )}

      {/* WiFi Backup Networks Section */}
      <View style={styles.deviceInfoContainer}>
        <Text style={styles.sectionTitle}>WiFi Backup Networks</Text>
        <Text style={styles.sectionDescription}>
          Manage backup WiFi networks for automatic failover when cellular is unavailable
        </Text>

        {/* Current Network Display */}
        {currentWifiNetwork && (
          <View style={styles.currentNetworkContainer}>
            <View style={styles.currentNetworkInfo}>
              <Ionicons name="wifi" size={20} color="#4CAF50" />
              <View style={styles.currentNetworkText}>
                <Text style={styles.currentNetworkLabel}>Current Network</Text>
                <Text style={styles.currentNetworkSSID}>{currentWifiNetwork.ssid}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.saveCurrentButton}
              onPress={handleSaveCurrentNetwork}
              disabled={isLoadingWifi}
            >
              <Text style={styles.saveCurrentButtonText}>
                {isLoadingWifi ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.wifiActions}>
          <TouchableOpacity
            style={[styles.wifiButton, styles.addNetworkButton]}
            onPress={() => setShowAddNetworkModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.wifiButtonText}>Add Network</Text>
          </TouchableOpacity>

          {wifiFeatures?.scan && (
            <TouchableOpacity
              style={[styles.wifiButton, styles.scanButton]}
              onPress={handleScanNetworks}
              disabled={isLoadingWifi}
            >
              <Ionicons name="scan" size={20} color="#fff" />
              <Text style={styles.wifiButtonText}>
                {isLoadingWifi ? 'Scanning...' : 'Scan Networks'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Saved Networks List */}
        <WiFiNetworkList
          networks={wifiNetworks}
          currentNetwork={currentWifiNetwork}
          onRemoveNetwork={handleRemoveNetwork}
          onUpdatePriority={handleUpdatePriority}
        />

        {/* Platform Info */}
        {wifiFeatures && (
          <View style={styles.platformInfo}>
            <Ionicons name="information-circle-outline" size={16} color="#666" />
            <Text style={styles.platformInfoText}>
              Platform: {wifiFeatures.platform.toUpperCase()} • 
              Scan: {wifiFeatures.scan ? 'Available' : 'Not Available'} • 
              Auto-connect: {wifiFeatures.connect ? 'Supported' : 'Manual Only'}
            </Text>
          </View>
        )}
      </View>

      {/* Add Network Modal */}
      <AddNetworkModal
        visible={showAddNetworkModal}
        onClose={() => {
          setShowAddNetworkModal(false);
          setAvailableNetworks([]);
        }}
        onAddNetwork={handleAddNetwork}
        availableNetworks={availableNetworks}
        supportsScan={wifiFeatures?.scan || false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  debugButton: {
    backgroundColor: '#FF9800',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  refreshText: {
    color: '#fff',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  // New connectivity styles
  connectivitySection: {
    marginBottom: 20,
  },
  connectivityIndicator: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  queueStatusContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  queueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  queueStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueStatText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  statusCounts: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  // WiFi Styles
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  currentNetworkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currentNetworkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currentNetworkText: {
    marginLeft: 10,
    flex: 1,
  },
  currentNetworkLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  currentNetworkSSID: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  saveCurrentButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveCurrentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  wifiActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  wifiButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  addNetworkButton: {
    backgroundColor: '#4CAF50',
  },
  scanButton: {
    backgroundColor: '#FF9800',
  },
  wifiButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  platformInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    flex: 1,
  },
});