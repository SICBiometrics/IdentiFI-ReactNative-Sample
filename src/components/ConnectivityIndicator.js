import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConnectivityService from '../services/ConnectivityService';
import ResilientApiService from '../services/ResilientApiService';

const CONNECTIVITY_COLORS = {
  excellent: '#4CAF50',
  good: '#8BC34A', 
  poor: '#FF9800',
  disconnected: '#F44336',
  switching: '#2196F3'
};

const CONNECTIVITY_ICONS = {
  excellent: 'wifi',
  good: 'wifi',
  poor: 'wifi-outline',
  disconnected: 'wifi-off',
  switching: 'refresh'
};

const NETWORK_TYPE_ICONS = {
  wifi: 'wifi',
  cellular: 'cellular',
  ethernet: 'hardware-chip',
  none: 'wifi-off',
  other: 'globe'
};

export default function ConnectivityIndicator({ 
  compact = false, 
  showDetails = false, 
  onPress = null,
  style = {} 
}) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [switchingAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Initialize services and get initial state
    const initializeServices = async () => {
      try {
        await ConnectivityService.initialize();
        await ResilientApiService.initialize();
        
        setNetworkInfo(ConnectivityService.getCurrentNetworkInfo());
        setQueueStatus(ResilientApiService.getQueueStatus());
      } catch (error) {
        console.error('[ConnectivityIndicator] Initialization failed:', error);
      }
    };

    initializeServices();

    // Set up listeners
    const connectivityUnsubscribe = ConnectivityService.addEventListener('stateChange', () => {
      setNetworkInfo(ConnectivityService.getCurrentNetworkInfo());
    });

    const switchStartedUnsubscribe = ConnectivityService.addEventListener('switchStarted', () => {
      setNetworkInfo(ConnectivityService.getCurrentNetworkInfo());
      startSwitchingAnimation();
    });

    const switchEndedUnsubscribe = ConnectivityService.addEventListener('switchSuccess', () => {
      setNetworkInfo(ConnectivityService.getCurrentNetworkInfo());
      stopSwitchingAnimation();
    });

    const switchFailedUnsubscribe = ConnectivityService.addEventListener('switchFailed', () => {
      setNetworkInfo(ConnectivityService.getCurrentNetworkInfo());
      stopSwitchingAnimation();
    });

    const queueUnsubscribe = ResilientApiService.addEventListener('requestQueued', () => {
      setQueueStatus(ResilientApiService.getQueueStatus());
    });

    const processUnsubscribe = ResilientApiService.addEventListener('requestCompleted', () => {
      setQueueStatus(ResilientApiService.getQueueStatus());
    });

    return () => {
      connectivityUnsubscribe();
      switchStartedUnsubscribe();
      switchEndedUnsubscribe(); 
      switchFailedUnsubscribe();
      queueUnsubscribe();
      processUnsubscribe();
    };
  }, []);

  useEffect(() => {
    // Start pulse animation for poor connectivity
    if (networkInfo?.quality === 'poor' || networkInfo?.quality === 'disconnected') {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [networkInfo?.quality]);

  const startPulseAnimation = () => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(pulse);
    };
    pulse();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startSwitchingAnimation = () => {
    const rotate = () => {
      Animated.timing(switchingAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        switchingAnim.setValue(0);
        if (networkInfo?.isSwitching) {
          rotate();
        }
      });
    };
    rotate();
  };

  const stopSwitchingAnimation = () => {
    switchingAnim.stopAnimation();
    switchingAnim.setValue(0);
  };

  const getConnectionText = () => {
    if (!networkInfo?.state) return 'Unknown';
    
    const { state, quality, isSwitching } = networkInfo;
    
    if (isSwitching) return 'Switching...';
    
    if (!state.isConnected) return 'Disconnected';
    
    if (!state.isInternetReachable) return 'No Internet';
    
    const typeText = state.type.charAt(0).toUpperCase() + state.type.slice(1);
    const qualityText = quality.charAt(0).toUpperCase() + quality.slice(1);
    
    return `${typeText} - ${qualityText}`;
  };

  const getQueueText = () => {
    if (!queueStatus || queueStatus.total === 0) return null;
    
    const { total, isProcessing } = queueStatus;
    
    if (isProcessing) {
      return `Syncing ${total} items...`;
    } else {
      return `${total} pending`;
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(networkInfo, queueStatus);
    }
  };

  if (!networkInfo) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loading}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
        </View>
      </View>
    );
  }

  const { state, quality, isSwitching } = networkInfo;
  const color = CONNECTIVITY_COLORS[quality] || CONNECTIVITY_COLORS.disconnected;
  const iconName = isSwitching ? 'refresh' : (CONNECTIVITY_ICONS[quality] || 'wifi-off');

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, style]} 
        onPress={handlePress}
        disabled={!onPress}
      >
        <Animated.View style={{ opacity: pulseAnim }}>
          {isSwitching ? (
            <Animated.View
              style={{
                transform: [{
                  rotate: switchingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }}
            >
              <Ionicons name={iconName} size={16} color={color} />
            </Animated.View>
          ) : (
            <Ionicons name={iconName} size={16} color={color} />
          )}
        </Animated.View>
        
        {queueStatus && queueStatus.total > 0 && (
          <View style={[styles.badge, { backgroundColor: queueStatus.isProcessing ? '#FF9800' : '#F44336' }]}>
            <Text style={styles.badgeText}>{queueStatus.total}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Animated.View style={{ opacity: pulseAnim }}>
            {isSwitching ? (
              <Animated.View
                style={{
                  transform: [{
                    rotate: switchingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }}
              >
                <Ionicons name={iconName} size={20} color={color} />
              </Animated.View>
            ) : (
              <Ionicons name={iconName} size={20} color={color} />
            )}
          </Animated.View>
          
          {state?.type && state.type !== 'none' && (
            <View style={styles.typeIndicator}>
              <Ionicons 
                name={NETWORK_TYPE_ICONS[state.type] || NETWORK_TYPE_ICONS.other} 
                size={12} 
                color="#666" 
              />
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.connectionText, { color }]}>
            {getConnectionText()}
          </Text>
          
          {showDetails && state && (
            <Text style={styles.detailsText}>
              {state.isConnected 
                ? `Connected • ${state.isInternetReachable ? 'Internet' : 'Local only'}`
                : 'No connection'
              }
            </Text>
          )}
          
          {queueStatus && queueStatus.total > 0 && (
            <Text style={styles.queueText}>
              {getQueueText()}
            </Text>
          )}
        </View>
      </View>

      {showDetails && networkInfo.lastTest && (
        <View style={styles.testInfo}>
          <Ionicons 
            name={networkInfo.lastTest.success ? "checkmark-circle" : "close-circle"} 
            size={12} 
            color={networkInfo.lastTest.success ? "#4CAF50" : "#F44336"} 
          />
          <Text style={styles.testText}>
            Last test: {networkInfo.lastTest.success ? 'OK' : 'Failed'}
            {networkInfo.lastTest.latency && ` (${networkInfo.lastTest.latency}ms)`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 10,
  },
  typeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 1,
  },
  textContainer: {
    flex: 1,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  queueText: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: '500',
  },
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  testText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F44336',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});