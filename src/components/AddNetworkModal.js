import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';

export default function AddNetworkModal({ 
  visible, 
  onClose, 
  onAddNetwork, 
  availableNetworks = [], 
  supportsScan = false 
}) {
  const [ssid, setSSID] = useState('');
  const [password, setPassword] = useState('');
  const [priority, setPriority] = useState(3);
  const [isSecure, setIsSecure] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFromScan, setSelectedFromScan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setSSID('');
    setPassword('');
    setPriority(3);
    setIsSecure(true);
    setShowPassword(false);
    setSelectedFromScan(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!ssid.trim()) {
      Alert.alert('Validation Error', 'Please enter a network name (SSID)');
      return false;
    }

    if (isSecure && !password.trim()) {
      Alert.alert('Validation Error', 'Please enter a password for the secured network');
      return false;
    }

    return true;
  };

  const handleAddNetwork = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onAddNetwork(
        ssid.trim(), 
        isSecure ? password.trim() : null, 
        priority
      );
      
      Alert.alert('Success', 'Network added successfully!', [
        { text: 'OK', onPress: handleClose }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add network');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScannedNetwork = (network) => {
    setSSID(network.ssid);
    setSelectedFromScan(network);
    setIsSecure(network.security && network.security.includes('WPA'));
  };

  const getPriorityText = (value) => {
    if (value >= 5) return 'High';
    if (value >= 3) return 'Medium';
    return 'Low';
  };

  const getPriorityColor = (value) => {
    if (value >= 5) return '#4CAF50';
    if (value >= 3) return '#FF9800';
    return '#666';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add WiFi Network</Text>
          <TouchableOpacity 
            onPress={handleAddNetwork} 
            style={[styles.addButton, isLoading && styles.addButtonDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.addText}>{isLoading ? 'Adding...' : 'Add'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Scanned Networks Section (Android only) */}
          {supportsScan && availableNetworks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Networks</Text>
              <Text style={styles.sectionDescription}>
                Tap a network to auto-fill the form
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.scannedNetworks}
              >
                {availableNetworks.map((network, index) => (
                  <TouchableOpacity
                    key={`${network.ssid}-${index}`}
                    style={[
                      styles.scannedNetworkItem,
                      selectedFromScan?.ssid === network.ssid && styles.selectedNetwork
                    ]}
                    onPress={() => handleSelectScannedNetwork(network)}
                  >
                    <View style={styles.scannedNetworkInfo}>
                      <Text style={styles.scannedSSID} numberOfLines={1}>
                        {network.ssid}
                      </Text>
                      <View style={styles.networkMeta}>
                        <Ionicons 
                          name={network.security && network.security.includes('WPA') ? "lock-closed" : "lock-open"} 
                          size={12} 
                          color="#666" 
                        />
                        <Text style={styles.signalStrength}>
                          {network.level ? `${network.level}dBm` : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Manual Network Entry */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Network Details</Text>
            
            {/* SSID Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Network Name (SSID) *</Text>
              <TextInput
                style={styles.textInput}
                value={ssid}
                onChangeText={setSSID}
                placeholder="Enter WiFi network name"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Security Toggle */}
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Secured Network</Text>
                <Text style={styles.switchDescription}>
                  Enable if the network requires a password
                </Text>
              </View>
              <Switch
                value={isSecure}
                onValueChange={setIsSecure}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                thumbColor={isSecure ? '#fff' : '#f4f3f4'}
              />
            </View>

            {/* Password Input */}
            {isSecure && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.textInput, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter network password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Priority Slider */}
            <View style={styles.sliderContainer}>
              <Text style={styles.inputLabel}>Priority Level</Text>
              <Text style={styles.sliderDescription}>
                Higher priority networks will be tried first
              </Text>
              
              <View style={styles.sliderWrapper}>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>Low</Text>
                  <Text style={[styles.priorityValue, { color: getPriorityColor(priority) }]}>
                    {priority} - {getPriorityText(priority)}
                  </Text>
                  <Text style={styles.sliderLabelText}>High</Text>
                </View>
                
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={5}
                  value={priority}
                  onValueChange={setPriority}
                  step={1}
                  minimumTrackTintColor={getPriorityColor(priority)}
                  maximumTrackTintColor="#ccc"
                  thumbStyle={{ backgroundColor: getPriorityColor(priority) }}
                />
              </View>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Backup networks are used when the primary connection fails. 
              {Platform.OS === 'ios' 
                ? ' On iOS, you\'ll need to manually connect in Settings.' 
                : ' On Android, automatic connection is supported.'
              }
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
  },
  cancelButton: {
    paddingVertical: 5,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    paddingVertical: 5,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  scannedNetworks: {
    marginBottom: 10,
  },
  scannedNetworkItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedNetwork: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  scannedNetworkInfo: {
    alignItems: 'center',
  },
  scannedSSID: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  networkMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalStrength: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 15,
    top: 12,
    padding: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  switchInfo: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  sliderContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sliderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  sliderWrapper: {
    marginTop: 10,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#666',
  },
  priorityValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  slider: {
    height: 40,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});