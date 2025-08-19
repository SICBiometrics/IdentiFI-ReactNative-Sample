import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  TextInput,
  Image,
  Modal,
  Switch,
  Platform
} from 'react-native';
import Slider from '@react-native-community/slider';
import IdentiFIService from '../src/services/IdentiFIService';
import ConnectivityIndicator from '../src/components/ConnectivityIndicator';

export default function AdvancedScreen() {
  const [isConnected, setIsConnected] = useState(false);
  
  // Saved Images Management State
  const [savedImages, setSavedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [nfiqScore, setNfiqScore] = useState(null);
  const [wsqImage, setWsqImage] = useState(null);
  const [segmentedImage, setSegmentedImage] = useState(null);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState(null);
  const [securityLevel, setSecurityLevel] = useState(3);
  
  // Power Management State
  const [powerOffMode, setPowerOffMode] = useState(0);
  const [currentPowerOffMode, setCurrentPowerOffMode] = useState(null);
  
  // Device Info State
  const [readerDescription, setReaderDescription] = useState(null);
  
  // LED Control State
  const [ledControl, setLedControl] = useState({
    power: 0,
    fp: 0,
    com: 0,
    iris: 0,
    mSecOn: 500,
    mSecOff: 500
  });
  
  // Temporary LED input states for editing
  const [ledInputs, setLedInputs] = useState({
    power: '0',
    fp: '0',
    com: '0',
    iris: '0',
    mSecOn: '500',
    mSecOff: '500'
  });
  
  // Temporary input states for other numeric inputs
  const [imageIndexInput, setImageIndexInput] = useState('0');
  const [securityLevelInput, setSecurityLevelInput] = useState('3');
  
  // Modals
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageData, setModalImageData] = useState(null);
  const [modalImageTitle, setModalImageTitle] = useState('');

  useEffect(() => {
    // Monitor connection status
    const connectionListener = IdentiFIService.addEventListener('onConnection', () => {
      setIsConnected(true);
      loadAdvancedInfo();
    });

    const disconnectionListener = IdentiFIService.addEventListener('onDisconnection', () => {
      setIsConnected(false);
      resetState();
    });

    // Check initial connection status
    setIsConnected(IdentiFIService.getConnectionStatus());
    if (IdentiFIService.getConnectionStatus()) {
      loadAdvancedInfo();
    }

    return () => {
      connectionListener.remove();
      disconnectionListener.remove();
    };
  }, []);

  useEffect(() => {
    // Official event listeners from the header file
    const getPowerOffModeListener = IdentiFIService.addEventListener('onGetPowerOffMode', (data) => {
      setCurrentPowerOffMode(data.secondsToPowerOff);
    });

    const setPowerOffModeListener = IdentiFIService.addEventListener('onSetPowerOffMode', (data) => {
      setCurrentPowerOffMode(data.secondsToPowerOff);
      Alert.alert('Success', `Power off mode set to ${data.secondsToPowerOff} seconds`);
    });

    const savedImagesListener = IdentiFIService.addEventListener('onSavedFpImagesCleared', (data) => {
      Alert.alert('Success', `Saved images cleared at index: ${data.savedAtIndex}`);
      setSavedImages([]);
    });

    const nfiqScoreListener = IdentiFIService.addEventListener('onGetNfiqScore', (data) => {
      setNfiqScore(data.nfiqScore);
    });

    const segmentedImageListener = IdentiFIService.addEventListener('onGetSegmentedFpImage_RAW', (data) => {
      if (data.rawFpImageData) {
        setSegmentedImage(data.rawFpImageData);
      }
    });

    const wsqImageListener = IdentiFIService.addEventListener('onGetWSQEncodedFpImage', (data) => {
      if (data.wsqEncodedFpImageData) {
        setWsqImage(data.wsqEncodedFpImageData);
      }
    });

    const duplicateListener = IdentiFIService.addEventListener('onIsFingerDuplicated', (data) => {
      const resultText = data.isFingerDuplicated === 1 ? 'Duplicate detected' :
                        data.isFingerDuplicated === 0 ? 'No duplicate found' :
                        'No image at index';
      setDuplicateCheckResult(resultText);
    });

    const readerDescriptionListener = IdentiFIService.addEventListener('onGetReaderDescription', (data) => {
      setReaderDescription(data.deviceDescription);
    });

    const firmwareUpdateListener = IdentiFIService.addEventListener('onFirmwareTransferCompleted', (data) => {
      const messages = {
        0: 'Firmware update transfer completed; unit is powering down',
        1: 'Error with firmware update file decryption',
        2: 'Firmware update unauthorized for this device',
        3: 'Invalid serial number decoding',
        4: 'Error in serial number verification',
        5: 'Error with update extraction'
      };
      
      Alert.alert(
        data.transferResult === 0 ? 'Success' : 'Error',
        messages[data.transferResult] || `Unknown result: ${data.transferResult}`
      );
    });

    return () => {
      getPowerOffModeListener.remove();
      setPowerOffModeListener.remove();
      savedImagesListener.remove();
      nfiqScoreListener.remove();
      segmentedImageListener.remove();
      wsqImageListener.remove();
      duplicateListener.remove();
      readerDescriptionListener.remove();
      firmwareUpdateListener.remove();
    };
  }, []);

  // Sync ledInputs with ledControl when ledControl changes externally
  useEffect(() => {
    setLedInputs({
      power: ledControl.power.toString(),
      fp: ledControl.fp.toString(),
      com: ledControl.com.toString(),
      iris: ledControl.iris.toString(),
      mSecOn: ledControl.mSecOn.toString(),
      mSecOff: ledControl.mSecOff.toString()
    });
  }, [ledControl]);

  // Sync other inputs with their respective states
  useEffect(() => {
    setImageIndexInput(selectedImageIndex.toString());
  }, [selectedImageIndex]);

  useEffect(() => {
    setSecurityLevelInput(securityLevel.toString());
  }, [securityLevel]);

  const loadAdvancedInfo = async () => {
    try {
      // These calls will trigger corresponding event callbacks
      await IdentiFIService.getPowerOffMode();
      await IdentiFIService.getReaderDescription();
    } catch (error) {
      if (error.message && error.message.includes('is not a function')) {
        console.log('Some advanced features not supported in this version of the SDK');
        // Show user-friendly message about simulator mode
        if (Platform.OS === 'ios') {
          Alert.alert(
            'Simulator Mode', 
            'Advanced features are limited in simulator mode. Connect a real device for full functionality.',
            [{text: 'OK'}]
          );
        }
      } else {
        console.error('Failed to load advanced info:', error);
        Alert.alert('Connection Error', 'Failed to load device information. Please check your connection.');
      }
    }
  };

  const resetState = () => {
    setSavedImages([]);
    setNfiqScore(null);
    setWsqImage(null);
    setSegmentedImage(null);
    setDuplicateCheckResult(null);
    setCurrentPowerOffMode(null);
    setReaderDescription(null);
  };

  // LED input validation helpers
  const updateLedInput = (field, text, min = 0, max = 3) => {
    console.log(`[LED] Updating ${field} input:`, text);
    
    // Always update the input display value
    setLedInputs(prev => ({...prev, [field]: text}));
    
    // Only validate and update actual state for valid numbers
    if (text === '') {
      // Allow empty input temporarily, don't update ledControl
      return;
    }
    
    const num = parseInt(text);
    if (!isNaN(num) && num >= min && num <= max) {
      console.log(`[LED] Valid ${field} value:`, num);
      setLedControl(prev => ({...prev, [field]: num}));
    } else {
      console.log(`[LED] Invalid ${field} value ignored:`, text);
    }
  };

  const updateTimingInput = (field, text) => {
    console.log(`[LED] Updating timing ${field}:`, text);
    
    // Always update the input display value
    setLedInputs(prev => ({...prev, [field]: text}));
    
    // Only validate and update actual state for valid numbers
    if (text === '') {
      return;
    }
    
    const num = parseInt(text);
    if (!isNaN(num) && num >= 0) {
      console.log(`[LED] Valid timing ${field}:`, num);
      setLedControl(prev => ({...prev, [field]: num}));
    } else {
      console.log(`[LED] Invalid timing ${field} ignored:`, text);
    }
  };

  // Helper functions for other numeric inputs
  const updateImageIndex = (text) => {
    console.log('[INPUT] Image index changed:', text);
    setImageIndexInput(text);
    
    if (text === '') {
      return;
    }
    
    const num = parseInt(text);
    if (!isNaN(num) && num >= 0 && num <= 9) {
      console.log('[INPUT] Valid image index:', num);
      setSelectedImageIndex(num);
    }
  };

  const updateSecurityLevel = (text) => {
    console.log('[INPUT] Security level changed:', text);
    setSecurityLevelInput(text);
    
    if (text === '') {
      return;
    }
    
    const num = parseInt(text);
    if (!isNaN(num) && num >= 1 && num <= 7) {
      console.log('[INPUT] Valid security level:', num);
      setSecurityLevel(num);
    }
  };

  // Saved Images Management Functions
  const handleClearSavedImages = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    Alert.alert(
      'Clear Saved Images',
      'Are you sure you want to clear all saved fingerprint images?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          onPress: async () => {
            try {
              await IdentiFIService.clearSavedFpImages(-1);
              Alert.alert('Success', 'Saved images cleared successfully');
              setSavedImages([]);
            } catch (error) {
              if (error.message && error.message.includes('is not a function')) {
                Alert.alert('Not Supported', 'Clearing saved images is not supported in this version of the SDK');
              } else {
                Alert.alert('Error', error.message || 'Failed to clear saved images');
              }
            }
          }
        }
      ]
    );
  };

  const handleGetNfiqScore = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    try {
      // This will trigger onGetNfiqScore event callback
      await IdentiFIService.getNfiqScoreFromImageSavedAt(selectedImageIndex);
    } catch (error) {
      if (error.message && error.message.includes('is not a function')) {
        Alert.alert('Not Supported', 'NFIQ score retrieval is not supported in this version of the SDK');
      } else {
        Alert.alert('Error', error.message || 'Failed to get NFIQ score');
      }
    }
  };

  const handleGetSegmentedImage = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    try {
      // This will trigger onGetSegmentedFpImage_RAW event callback
      await IdentiFIService.getSegmentedFpImageSavedAt(selectedImageIndex);
    } catch (error) {
      if (error.message && error.message.includes('is not a function')) {
        Alert.alert('Not Supported', 'Segmented image retrieval is not supported in this version of the SDK');
      } else {
        Alert.alert('Error', error.message || 'Failed to get segmented image');
      }
    }
  };

  const handleGetWSQImage = async (cropped = false) => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    try {
      // This will trigger onGetWSQEncodedFpImage event callback
      await IdentiFIService.getWSQEncodedFpImageFromImageSavedAt(selectedImageIndex, cropped);
    } catch (error) {
      if (error.message && error.message.includes('is not a function')) {
        Alert.alert('Not Supported', 'WSQ encoding is not supported in this version of the SDK');
      } else {
        Alert.alert('Error', error.message || 'Failed to get WSQ encoded image');
      }
    }
  };

  const handleCheckDuplicate = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    try {
      // This will trigger onIsFingerDuplicated event callback
      await IdentiFIService.isFingerDuplicated(selectedImageIndex, securityLevel);
    } catch (error) {
      if (error.message && error.message.includes('is not a function')) {
        Alert.alert('Not Supported', 'Duplicate detection is not supported in this version of the SDK');
      } else {
        Alert.alert('Error', error.message || 'Failed to check for duplicates');
      }
    }
  };

  // Power Management Functions
  const handleSetPowerOffMode = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    try {
      await IdentiFIService.setPowerOffMode(powerOffMode);
      setCurrentPowerOffMode(powerOffMode);
      Alert.alert('Success', `Power off mode set to ${powerOffMode} seconds`);
    } catch (error) {
      if (error.message && error.message.includes('is not a function')) {
        Alert.alert('Not Supported', 'Power off mode control is not supported in this version of the SDK');
      } else {
        Alert.alert('Error', error.message || 'Failed to set power off mode');
      }
    }
  };

  // LED Control Functions
  const handleSetLEDControl = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    try {
      await IdentiFIService.setLEDControlForPowerLED(
        ledControl.power,
        ledControl.fp,
        ledControl.com,
        ledControl.iris,
        ledControl.mSecOn,
        ledControl.mSecOff
      );
      Alert.alert('Success', 'LED control settings applied');
    } catch (error) {
      if (error.message && error.message.includes('is not a function')) {
        Alert.alert('Not Supported', 'Advanced LED control is not supported in this version of the SDK');
      } else {
        Alert.alert('Error', error.message || 'Failed to set LED control');
      }
    }
  };

  const showImageInModal = (imageData, title) => {
    setModalImageData(imageData);
    setModalImageTitle(title);
    setShowImageModal(true);
  };

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Advanced Features</Text>
        <Text style={styles.subtitle}>Please connect to device first</Text>
        <Text style={styles.instruction}>Go to Network tab to connect</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Advanced Features</Text>
        <ConnectivityIndicator 
          compact={true}
          style={styles.connectivityIndicator}
        />
      </View>

      {/* Saved Fingerprint Images Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Fingerprint Images</Text>
        <Text style={styles.sectionDescription}>
          Manage fingerprint images stored in device's circular buffer (0-9)
        </Text>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Image Index (0-9):</Text>
          <TextInput
            style={styles.textInput}
            value={imageIndexInput}
            onChangeText={updateImageIndex}
            keyboardType="numeric"
            maxLength={1}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleGetNfiqScore}>
            <Text style={styles.buttonText}>Get NFIQ Score</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleGetSegmentedImage}>
            <Text style={styles.buttonText}>Get Segmented</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => handleGetWSQImage(false)}>
            <Text style={styles.buttonText}>Get WSQ Full</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => handleGetWSQImage(true)}>
            <Text style={styles.buttonText}>Get WSQ Cropped</Text>
          </TouchableOpacity>
        </View>

        {/* Duplicate Check */}
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Security Level (1-7):</Text>
          <TextInput
            style={styles.textInput}
            value={securityLevelInput}
            onChangeText={updateSecurityLevel}
            keyboardType="numeric"
            maxLength={1}
          />
        </View>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleCheckDuplicate}>
          <Text style={styles.buttonText}>Check Duplicate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={handleClearSavedImages}>
          <Text style={styles.buttonText}>Clear All Images</Text>
        </TouchableOpacity>

        {/* Results Display */}
        {nfiqScore !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>NFIQ Score:</Text>
            <Text style={styles.resultValue}>{nfiqScore}</Text>
          </View>
        )}

        {duplicateCheckResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Duplicate Check:</Text>
            <Text style={styles.resultValue}>{duplicateCheckResult}</Text>
          </View>
        )}

        {/* Image Display Buttons */}
        <View style={styles.imageButtonRow}>
          {segmentedImage && (
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={() => showImageInModal(segmentedImage, 'Segmented Image')}
            >
              <Text style={styles.imageButtonText}>View Segmented</Text>
            </TouchableOpacity>
          )}
          
          {wsqImage && (
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={() => showImageInModal(wsqImage, 'WSQ Encoded Image')}
            >
              <Text style={styles.imageButtonText}>View WSQ</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Power Management Extensions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Power Management</Text>
        <Text style={styles.sectionDescription}>
          Configure automatic power-off timing (0 = disabled, 60-86400 seconds)
        </Text>

        {currentPowerOffMode !== null && (
          <Text style={styles.currentValue}>
            Current: {currentPowerOffMode === 0 ? 'Disabled' : `${currentPowerOffMode} seconds`}
          </Text>
        )}

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>0s</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={3600}
            value={powerOffMode}
            onValueChange={setPowerOffMode}
            step={60}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#ccc"
          />
          <Text style={styles.sliderLabel}>1h</Text>
        </View>

        <Text style={styles.currentValue}>
          Selected: {powerOffMode === 0 ? 'Disabled' : `${powerOffMode} seconds`}
        </Text>

        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleSetPowerOffMode}>
          <Text style={styles.buttonText}>Set Power Off Mode</Text>
        </TouchableOpacity>
      </View>

      {/* Device Information Extensions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>
        
        {readerDescription && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Reader Description:</Text>
            <Text style={styles.infoText}>{readerDescription}</Text>
          </View>
        )}
      </View>

      {/* Advanced LED Control */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced LED Control</Text>
        <Text style={styles.sectionDescription}>
          Control individual LEDs with custom blinking patterns
        </Text>

        <View style={styles.ledControlGrid}>
          <View style={styles.ledControlItem}>
            <Text style={styles.ledLabel}>Power LED (0-3):</Text>
            <TextInput
              style={styles.textInput}
              value={ledInputs.power}
              onChangeText={(text) => updateLedInput('power', text, 0, 3)}
              keyboardType="numeric"
              maxLength={1}
            />
          </View>

          <View style={styles.ledControlItem}>
            <Text style={styles.ledLabel}>FP LED (0-3):</Text>
            <TextInput
              style={styles.textInput}
              value={ledInputs.fp}
              onChangeText={(text) => updateLedInput('fp', text, 0, 3)}
              keyboardType="numeric"
              maxLength={1}
            />
          </View>

          <View style={styles.ledControlItem}>
            <Text style={styles.ledLabel}>Com LED (0-1):</Text>
            <TextInput
              style={styles.textInput}
              value={ledInputs.com}
              onChangeText={(text) => updateLedInput('com', text, 0, 1)}
              keyboardType="numeric"
              maxLength={1}
            />
          </View>

          <View style={styles.ledControlItem}>
            <Text style={styles.ledLabel}>Iris LED (0-1):</Text>
            <TextInput
              style={styles.textInput}
              value={ledInputs.iris}
              onChangeText={(text) => updateLedInput('iris', text, 0, 1)}
              keyboardType="numeric"
              maxLength={1}
            />
          </View>
        </View>

        <View style={styles.timingControls}>
          <View style={styles.timingItem}>
            <Text style={styles.timingLabel}>On Time (ms):</Text>
            <TextInput
              style={styles.timingInput}
              value={ledInputs.mSecOn}
              onChangeText={(text) => updateTimingInput('mSecOn', text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.timingItem}>
            <Text style={styles.timingLabel}>Off Time (ms):</Text>
            <TextInput
              style={styles.timingInput}
              value={ledInputs.mSecOff}
              onChangeText={(text) => updateTimingInput('mSecOff', text)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.ledHelpText}>
          LED Values: 0=Off, 1=Green, 2=Amber, 3=Red (Power/FP) | 0=Off, 1=Blue/Red (Com/Iris)
        </Text>

        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleSetLEDControl}>
          <Text style={styles.buttonText}>Apply LED Control</Text>
        </TouchableOpacity>
      </View>

      {/* Firmware Update Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firmware Update</Text>
        <Text style={styles.sectionDescription}>
          Update device firmware (requires firmware file)
        </Text>
        
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠️ Warning: Firmware updates are irreversible</Text>
          <Text style={styles.warningSubtext}>
            • Device will power down during update{'\n'}
            • Ensure stable power source{'\n'}
            • Do not disconnect during update
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={() => Alert.alert(
            'Firmware Update', 
            'Firmware update functionality requires implementation of file picker and update logic specific to your use case.',
            [{text: 'OK'}]
          )}
        >
          <Text style={styles.buttonText}>Start Firmware Update</Text>
        </TouchableOpacity>
      </View>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalImageTitle}</Text>
            
            {modalImageData && (
              <Image
                source={{ uri: `data:image/png;base64,${modalImageData}` }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowImageModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  connectivityIndicator: {
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
    minWidth: 60,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  imageButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#9C27B0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  currentValue: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
    minWidth: 30,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ledControlGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
  },
  ledControlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  ledLabel: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  timingControls: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  timingItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timingLabel: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  timingInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    fontSize: 12,
    minWidth: 80,
    textAlign: 'center',
  },
  ledHelpText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 15,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FF9800',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  warningText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  warningSubtext: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 15,
  },
  modalCloseButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});