import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function WiFiNetworkList({ 
  networks, 
  onRemoveNetwork, 
  onUpdatePriority, 
  currentNetwork 
}) {
  const handleRemoveNetwork = (network) => {
    Alert.alert(
      'Remove Network',
      `Are you sure you want to remove "${network.ssid}" from backup networks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => onRemoveNetwork(network.id)
        }
      ]
    );
  };

  const handlePriorityChange = (network, increase) => {
    const newPriority = increase ? network.priority + 1 : Math.max(1, network.priority - 1);
    onUpdatePriority(network.id, newPriority);
  };

  const isCurrentNetwork = (network) => {
    return currentNetwork && currentNetwork.ssid === network.ssid;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    if (priority >= 5) return '#4CAF50'; // High priority - Green
    if (priority >= 3) return '#FF9800'; // Medium priority - Orange
    return '#666'; // Low priority - Gray
  };

  if (!networks || networks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="wifi-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No backup networks saved</Text>
        <Text style={styles.emptySubtext}>Add networks to use as backup connections</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {networks.map((network, index) => (
        <View key={network.id} style={styles.networkItem}>
          <View style={styles.networkHeader}>
            <View style={styles.networkInfo}>
              <View style={styles.networkTitleRow}>
                <Text style={styles.networkSSID}>{network.ssid}</Text>
                {isCurrentNetwork(network) && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.networkDetails}>
                <View style={styles.priorityContainer}>
                  <Ionicons name="flag" size={14} color={getPriorityColor(network.priority)} />
                  <Text style={[styles.priorityText, { color: getPriorityColor(network.priority) }]}>
                    Priority: {network.priority}
                  </Text>
                </View>
                
                <View style={styles.securityContainer}>
                  <Ionicons 
                    name={network.isSecure ? "lock-closed" : "lock-open"} 
                    size={14} 
                    color={network.isSecure ? "#4CAF50" : "#FF9800"} 
                  />
                  <Text style={styles.securityText}>
                    {network.isSecure ? 'Secured' : 'Open'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.dateText}>Added: {formatDate(network.dateAdded)}</Text>
            </View>

            <View style={styles.networkActions}>
              {/* Priority controls */}
              <View style={styles.priorityControls}>
                <TouchableOpacity
                  style={[styles.priorityButton, styles.priorityUpButton]}
                  onPress={() => handlePriorityChange(network, true)}
                >
                  <Ionicons name="chevron-up" size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.priorityButton, styles.priorityDownButton]}
                  onPress={() => handlePriorityChange(network, false)}
                  disabled={network.priority <= 1}
                >
                  <Ionicons 
                    name="chevron-down" 
                    size={16} 
                    color={network.priority <= 1 ? "#ccc" : "#007AFF"} 
                  />
                </TouchableOpacity>
              </View>

              {/* Remove button */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveNetwork(network)}
              >
                <Ionicons name="trash-outline" size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Platform indicator */}
          <View style={styles.platformIndicator}>
            <Ionicons 
              name={network.platform === 'android' ? "logo-android" : "logo-apple"} 
              size={12} 
              color="#999" 
            />
            <Text style={styles.platformText}>{network.platform}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  networkItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  networkInfo: {
    flex: 1,
    marginRight: 15,
  },
  networkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  networkSSID: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  currentBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  networkDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  priorityText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
  },
  networkActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityControls: {
    marginRight: 10,
  },
  priorityButton: {
    width: 30,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginBottom: 2,
  },
  priorityUpButton: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  priorityDownButton: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  removeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 18,
  },
  platformIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  platformText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
});