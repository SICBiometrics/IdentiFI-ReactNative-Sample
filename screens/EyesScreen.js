import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import IdentiFIService from '../src/services/IdentiFIService';

export default function EyesScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState('');
  const [streamingImage, setStreamingImage] = useState(null);
  const [lastCapturedImage, setLastCapturedImage] = useState(null);
  const [irisPowerStatus, setIrisPowerStatus] = useState(false);
  const [qualityScores, setQualityScores] = useState({ left: null, right: null });

  useEffect(() => {
    // Monitor connection status
    const connectionListener = IdentiFIService.addEventListener('onConnection', () => {
      setIsConnected(true);
      checkIrisPowerStatus();
    });

    const disconnectionListener = IdentiFIService.addEventListener('onDisconnection', () => {
      setIsConnected(false);
      setIsCapturing(false);
      setStreamingImage(null);
      setLastCapturedImage(null);
      setQualityScores({ left: null, right: null });
    });

    // Check initial connection status
    setIsConnected(IdentiFIService.getConnectionStatus());
    if (IdentiFIService.getConnectionStatus()) {
      checkIrisPowerStatus();
    }

    return () => {
      connectionListener.remove();
      disconnectionListener.remove();
    };
  }, []);

  useEffect(() => {
    // Listen for iris capture events
    const statusListener = IdentiFIService.addEventListener('onIrisCaptureStatus', (data) => {
      const statusMessages = {
        0: 'Iris capture started - Position eyes 6-8 inches from device',
        1: 'Iris capture in progress...',
        2: 'Iris capture completed successfully',
        3: 'Iris capture error occurred',
        4: 'Eyes not properly positioned',
        5: 'Lighting conditions not suitable',
        6: 'Eyes moved during capture',
        7: 'Quality not sufficient for enrollment',
      };
      
      setCaptureStatus(statusMessages[data.status] || `Status: ${data.status}`);
      
      if (data.status === 2) { // Completed
        setIsCapturing(false);
      } else if (data.status === 3 || data.status === 5 || data.status === 7) { // Errors
        setIsCapturing(false);
        Alert.alert('Iris Capture Error', statusMessages[data.status]);
      }
    });

    const streamingListener = IdentiFIService.addEventListener('onStreamingLeftIris', (data) => {
      if (data.imageData) {
        setStreamingImage(data.imageData);
      }
    });

    const lastFrameListener = IdentiFIService.addEventListener('onLastFrameLeftIris', (data) => {
      if (data.imageData) {
        setLastCapturedImage(data.imageData);
        setCaptureStatus('Iris capture completed - Images saved');
        
        // Update quality scores if available
        if (data.leftQuality !== undefined || data.rightQuality !== undefined) {
          setQualityScores({
            left: data.leftQuality,
            right: data.rightQuality
          });
        }
      }
    });

    const cancelListener = IdentiFIService.addEventListener('onCancelIrisCapture', () => {
      setIsCapturing(false);
      setCaptureStatus('Iris capture cancelled');
      setStreamingImage(null);
    });

    const powerOnListener = IdentiFIService.addEventListener('onSetIrisPowerOn', (data) => {
      setIrisPowerStatus(data.powerStatus);
    });

    const powerOffListener = IdentiFIService.addEventListener('onSetIrisPowerOff', () => {
      setIrisPowerStatus(false);
    });

    const powerStatusListener = IdentiFIService.addEventListener('onGetIrisPowerStatus', (data) => {
      setIrisPowerStatus(data.powerStatus);
    });


    return () => {
      statusListener.remove();
      streamingListener.remove();
      lastFrameListener.remove();
      cancelListener.remove();
      powerOnListener.remove();
      powerOffListener.remove();
      powerStatusListener.remove();
    };
  }, []);

  const checkIrisPowerStatus = async () => {
    try {
      await IdentiFIService.getIrisPowerStatus();
    } catch (error) {
      console.error('Failed to check iris power status:', error);
    }
  };

  const handlePowerToggle = async () => {
    try {
      if (irisPowerStatus) {
        await IdentiFIService.setIrisPowerOff();
      } else {
        await IdentiFIService.setIrisPowerOn();
      }
    } catch (error) {
      Alert.alert('Power Control Error', error.message || 'Failed to control iris sensor power');
    }
  };

  const startIrisCapture = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    if (!irisPowerStatus) {
      Alert.alert('Sensor Off', 'Please turn on iris sensor first');
      return;
    }

    setIsCapturing(true);
    setStreamingImage(null);
    setQualityScores({ left: null, right: null });
    setCaptureStatus('Initializing iris capture...');

    try {
      await IdentiFIService.startCaptureIris();
    } catch (error) {
      setIsCapturing(false);
      Alert.alert('Iris Capture Failed', error.message || 'Failed to start iris capture');
    }
  };

  const cancelCapture = async () => {
    try {
      await IdentiFIService.cancelIrisCapture();
    } catch (error) {
      Alert.alert('Cancel Failed', error.message || 'Failed to cancel iris capture');
    }
  };

  const clearImages = () => {
    setStreamingImage(null);
    setLastCapturedImage(null);
    setCaptureStatus('');
    setQualityScores({ left: null, right: null });
  };

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Eyes Recognition</Text>
        <Text style={styles.subtitle}>Please connect to device first</Text>
        <Text style={styles.instruction}>Go to Network tab to connect</Text>
        <Text style={styles.note}>Note: Iris capture is only available on IdentiFI-45I and IdentiFI-50I models</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Iris Capture</Text>
      
      <Text style={styles.infoText}>
        Only available on IdentiFI-45I and IdentiFI-50I models
      </Text>

      {/* Power Control */}
      <View style={styles.powerContainer}>
        <Text style={styles.powerLabel}>Iris Sensor:</Text>
        <TouchableOpacity
          style={[styles.powerButton, { backgroundColor: irisPowerStatus ? '#4CAF50' : '#F44336' }]}
          onPress={handlePowerToggle}
          disabled={isCapturing}
        >
          <Text style={styles.powerButtonText}>
            {irisPowerStatus ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Capture Status */}
      {captureStatus ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{captureStatus}</Text>
        </View>
      ) : null}

      {/* Quality Scores */}
      {(qualityScores.left !== null || qualityScores.right !== null) && (
        <View style={styles.qualityContainer}>
          <Text style={styles.qualityTitle}>Quality Scores</Text>
          <View style={styles.qualityRow}>
            <Text style={styles.qualityLabel}>Left Eye:</Text>
            <Text style={styles.qualityValue}>
              {qualityScores.left !== null ? qualityScores.left.toFixed(2) : 'N/A'}
            </Text>
          </View>
          <View style={styles.qualityRow}>
            <Text style={styles.qualityLabel}>Right Eye:</Text>
            <Text style={styles.qualityValue}>
              {qualityScores.right !== null ? qualityScores.right.toFixed(2) : 'N/A'}
            </Text>
          </View>
        </View>
      )}

      {/* Capture Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Capture Instructions:</Text>
        <Text style={styles.instructionText}>• Position your eyes 6-8 inches from the device</Text>
        <Text style={styles.instructionText}>• Look directly at the iris sensor</Text>
        <Text style={styles.instructionText}>• Keep your eyes open and steady</Text>
        <Text style={styles.instructionText}>• Avoid reflections from glasses or contacts</Text>
        <Text style={styles.instructionText}>• Ensure good lighting conditions</Text>
      </View>

      {/* Capture Button */}
      <TouchableOpacity
        style={[styles.captureButton, { backgroundColor: isCapturing ? '#FF9800' : '#2196F3' }]}
        onPress={startIrisCapture}
        disabled={isCapturing || !irisPowerStatus}
      >
        <Text style={styles.captureButtonText}>
          {isCapturing ? 'Capturing Iris...' : 'Start Iris Capture'}
        </Text>
      </TouchableOpacity>

      {/* Control Buttons */}
      {isCapturing && (
        <TouchableOpacity
          style={[styles.captureButton, styles.cancelButton]}
          onPress={cancelCapture}
        >
          <Text style={styles.captureButtonText}>Cancel Capture</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.captureButton, styles.clearButton]}
        onPress={clearImages}
        disabled={isCapturing}
      >
        <Text style={styles.captureButtonText}>Clear Images</Text>
      </TouchableOpacity>

      {/* Image Display */}
      <View style={styles.imageContainer}>
        {streamingImage && (
          <View style={styles.imageSection}>
            <Text style={styles.imageTitle}>Live Preview</Text>
            <Image
              source={{ uri: `data:image/png;base64,${streamingImage}` }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}

        {lastCapturedImage && (
          <View style={styles.imageSection}>
            <Text style={styles.imageTitle}>Captured Iris</Text>
            <Image
              source={{ uri: `data:image/png;base64,${lastCapturedImage}` }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
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
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
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
    marginBottom: 10,
  },
  note: {
    fontSize: 12,
    color: '#FF9800',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  powerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  powerLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  powerButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  powerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    fontWeight: '500',
  },
  qualityContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  qualityLabel: {
    fontSize: 14,
    color: '#666',
  },
  qualityValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  captureButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  clearButton: {
    backgroundColor: '#FF9800',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: 20,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});