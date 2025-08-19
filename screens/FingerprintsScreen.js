import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, Modal } from 'react-native';
import IdentiFIService from '../src/services/IdentiFIService';
import ResilientApiService, { PRIORITY } from '../src/services/ResilientApiService';
import ConnectivityService from '../src/services/ConnectivityService';
import ConnectivityIndicator from '../src/components/ConnectivityIndicator';

export default function FingerprintsScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureType, setCaptureType] = useState(null);
  const [captureStatus, setCaptureStatus] = useState('');
  const [streamingImage, setStreamingImage] = useState(null);
  const [lastCapturedImage, setLastCapturedImage] = useState(null);
  const [fpPowerStatus, setFpPowerStatus] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);
  
  // Roll finger specific state
  const [rollingState, setRollingState] = useState(0);
  const [verticalLineX, setVerticalLineX] = useState(0);
  const [rolledImage, setRolledImage] = useState(null);
  const [rawImageData, setRawImageData] = useState(null);
  
  // Buffer index tracking
  const [lastImageBufferIndex, setLastImageBufferIndex] = useState(null);
  const [rolledImageBufferIndex, setRolledImageBufferIndex] = useState(null);
  const [lastUsedCaptureIndex, setLastUsedCaptureIndex] = useState(null);

  useEffect(() => {
    // Monitor connection status
    const connectionListener = IdentiFIService.addEventListener('onConnection', () => {
      setIsConnected(true);
      checkFpPowerStatus();
    });

    const disconnectionListener = IdentiFIService.addEventListener('onDisconnection', () => {
      setIsConnected(false);
      setIsCapturing(false);
      setCaptureType(null);
      setStreamingImage(null);
      setLastCapturedImage(null);
      setRolledImage(null);
      setRawImageData(null);
      setRollingState(0);
      setVerticalLineX(0);
      setLastImageBufferIndex(null);
      setRolledImageBufferIndex(null);
      setLastUsedCaptureIndex(null);
    });

    // Check initial connection status
    setIsConnected(IdentiFIService.getConnectionStatus());
    if (IdentiFIService.getConnectionStatus()) {
      checkFpPowerStatus();
    }

    // Initialize resilient API service
    initializeResilientApi();

    return () => {
      connectionListener.remove();
      disconnectionListener.remove();
    };
  }, []);

  const initializeResilientApi = async () => {
    try {
      await ResilientApiService.initialize();
    } catch (error) {
      console.error('Failed to initialize ResilientApiService:', error);
    }
  };

  useEffect(() => {
    // Listen for fingerprint capture events
    const statusListener = IdentiFIService.addEventListener('onFpCaptureStatus', (data) => {
      const statusMessages = {
        0: 'Capture started - Place finger on sensor',
        1: 'Capture in progress...',
        2: 'Capture completed successfully',
        3: 'Capture error occurred',
        4: 'Finger removed too early',
        5: 'Fingerprint quality too low (NFIQ)',
        6: 'Rolling smear detected',
        7: 'Finger not detected',
      };
      
      setCaptureStatus(statusMessages[data.status] || `Status: ${data.status}`);
      console.log('Capture status:', data.status, statusMessages[data.status]);
      if (data.status === 2) { // Completed
        setIsCapturing(false);
        setCaptureType(null);
      } else if (data.status === 3 || data.status === 5 || data.status === 6) { // Errors
        setIsCapturing(false);
        setCaptureType(null);
        Alert.alert('Capture Error', statusMessages[data.status]);
      }
    });

    const streamingListener = IdentiFIService.addEventListener('onStreaming', (data) => {
      if (data.imageData) {
        setStreamingImage(data.imageData);
      }
    });

    // Cancel capture event listener
    const cancelCaptureListener = IdentiFIService.addEventListener('onCancelFpCapture', () => {
      console.log('🔴 onCancelFpCapture callback received');
      setIsCapturing(false);
      setCaptureType(null);
      setStreamingImage(null);
      setCaptureStatus('❌ Capture cancelled');
    });

    const lastFrameListener = IdentiFIService.addEventListener('onLastFrame', (data) => {
      console.log('🔍 onLastFrame callback received:', JSON.stringify(data, null, 2));
      if (data.imageData) {
        setLastCapturedImage(data.imageData);
        
        // Essayons différentes variations possibles du nom de propriété
        let bufferIndex = 'Unknown';
        if (data.savedAtIndex !== undefined) {
          bufferIndex = data.savedAtIndex;
        } else if (data.fpImageSavedAt !== undefined) {
          bufferIndex = data.fpImageSavedAt;
        } else if (data.index !== undefined) {
          bufferIndex = data.index;
        } else if (data.savedIndex !== undefined) {
          bufferIndex = data.savedIndex;
        } else if (lastUsedCaptureIndex !== null) {
          // Fallback : utiliser l'index de la capture
          bufferIndex = lastUsedCaptureIndex;
          console.log(`🔍 Using fallback lastUsedCaptureIndex: ${bufferIndex}`);
        }
        
        console.log(`🔍 Raw savedAtIndex from data: ${data.savedAtIndex}`);
        console.log(`🔍 Raw fpImageSavedAt from data: ${data.fpImageSavedAt}`);
        console.log(`🔍 Raw index from data: ${data.index}`);
        console.log(`🔍 Processed bufferIndex: ${bufferIndex}`);
        
        setLastImageBufferIndex(bufferIndex);
        setCaptureStatus(`✅ Capture completed - Image saved in buffer at index ${bufferIndex}`);
        console.log(`🖼️ Image saved at buffer index: ${bufferIndex}`);
        // Retour à l'état initial après capture
        setIsCapturing(false);
        setCaptureType(null);
        setStreamingImage(null);
        // Afficher la modal de fin de capture
        setShowCaptureModal(true);
        setApiTestResult(null);
      }
    });


    const powerOnListener = IdentiFIService.addEventListener('onSetFpPowerOn', (data) => {
      setFpPowerStatus(data.powerStatus);
    });

    const powerOffListener = IdentiFIService.addEventListener('onSetFpPowerOff', () => {
      setFpPowerStatus(false);
    });

    const powerStatusListener = IdentiFIService.addEventListener('onGetFpPowerStatus', (data) => {
      setFpPowerStatus(data.powerStatus);
    });

    // Roll finger specific event listeners (from official header)
    const streamingRolledListener = IdentiFIService.addEventListener('onStreamingRolledFp', (data) => {
      if (data.imageData || data.fpImage) {
        setStreamingImage(data.imageData || data.fpImage);
        setRollingState(data.rollingState || 0);
        setVerticalLineX(data.verticalLineX || 0);
      }
    });

    const lastFrameRolledListener = IdentiFIService.addEventListener('onLastFrameRolledFp', (data) => {
      console.log('🔍 onLastFrameRolledFp callback received:', JSON.stringify(data, null, 2));
      if (data.imageData || data.fpImage) {
        setRolledImage(data.imageData || data.fpImage);
        
        // Essayons différentes variations possibles du nom de propriété
        let bufferIndex = 'Unknown';
        if (data.savedAtIndex !== undefined) {
          bufferIndex = data.savedAtIndex;
        } else if (data.fpImageSavedAt !== undefined) {
          bufferIndex = data.fpImageSavedAt;
        } else if (data.index !== undefined) {
          bufferIndex = data.index;
        } else if (data.savedIndex !== undefined) {
          bufferIndex = data.savedIndex;
        } else if (lastUsedCaptureIndex !== null) {
          // Fallback : utiliser l'index de la capture
          bufferIndex = lastUsedCaptureIndex;
          console.log(`🔍 Rolled FP - Using fallback lastUsedCaptureIndex: ${bufferIndex}`);
        }
        
        console.log(`🔍 Rolled FP - Processed bufferIndex: ${bufferIndex}`);
        setRolledImageBufferIndex(bufferIndex);
        setCaptureStatus(`✅ Roll finger capture completed - Image saved in buffer at index ${bufferIndex}`);
        console.log(`🖼️ Rolled finger image saved at buffer index: ${bufferIndex}`);
        setIsCapturing(false);
        setCaptureType(null);
        setStreamingImage(null);
        setShowCaptureModal(true);
      }
    });

    const lastFrameRolledRawListener = IdentiFIService.addEventListener('onLastFrameRolledFp_RAW', (data) => {
      if (data.rawFpImageData) {
        setRawImageData(data.rawFpImageData);
        console.log('Raw rolled finger data received, size:', data.rawFpImageData.length);
      }
    });

    // Raw data event listener (from official header)
    const lastFrameRawListener = IdentiFIService.addEventListener('onLastFrame_RAW', (data) => {
      if (data.rawFpImageData) {
        setRawImageData(data.rawFpImageData);
        console.log('Raw image data received, size:', data.rawFpImageData.length);
      }
    });

    // Saved images events listeners
    const nfiqScoreListener = IdentiFIService.addEventListener('onGetNfiqScore', (data) => {
      console.log('NFIQ Score callback received:', data);
      Alert.alert('NFIQ Score Received', 
        `Score: ${data.nfiqScore}\nIndex: ${data.savedAtIndex || 'Unknown'}`);
    });

    const segmentedImageListener = IdentiFIService.addEventListener('onGetSegmentedFpImage_RAW', (data) => {
      console.log('Segmented image callback received:', data);
      Alert.alert('Segmented Image Received', 
        `Data size: ${data.rawImageData ? data.rawImageData.length : 0} bytes\nIndex: ${data.savedAtIndex || 'Unknown'}`);
    });

    const wsqImageListener = IdentiFIService.addEventListener('onGetWSQEncodedFpImage', (data) => {
      console.log('WSQ image callback received:', data);
      Alert.alert('WSQ Image Received', 
        `Data size: ${data.wsqData ? data.wsqData.length : 0} bytes\nIndex: ${data.savedAtIndex || 'Unknown'}`);
    });

    // Finger duplication test listener
    const fingerDuplicationListener = IdentiFIService.addEventListener('onIsFingerDuplicated', (data) => {
      console.log('Finger duplication callback received:', data);
      const isDuplicated = data.isDuplicated || data.isFingerDuplicated || false;
      Alert.alert('Finger Duplication Result', 
        `Is duplicated: ${isDuplicated ? 'YES' : 'NO'}\nResult: ${JSON.stringify(data, null, 2)}`);
    });

    // Clear saved images listener
    const clearSavedImagesListener = IdentiFIService.addEventListener('onSavedFpImagesCleared', (data) => {
      console.log('Saved FP images cleared callback received:', data);
      Alert.alert('Images Cleared', 
        `Successfully cleared saved images at index: ${data.savedAtIndex || 'Unknown'}`);
    });


    return () => {
      statusListener.remove();
      streamingListener.remove();
      cancelCaptureListener.remove();
      lastFrameListener.remove();
      powerOnListener.remove();
      powerOffListener.remove();
      powerStatusListener.remove();
      streamingRolledListener.remove();
      lastFrameRolledListener.remove();
      lastFrameRolledRawListener.remove();
      lastFrameRawListener.remove();
      nfiqScoreListener.remove();
      segmentedImageListener.remove();
      wsqImageListener.remove();
      fingerDuplicationListener.remove();
      clearSavedImagesListener.remove();
    };
  }, []);

  const checkFpPowerStatus = async () => {
    try {
      await IdentiFIService.getFpPowerStatus();
    } catch (error) {
      console.error('Failed to check FP power status:', error);
    }
  };

  const handlePowerToggle = async () => {
    try {
      console.log('Toggling fingerprint power status...', fpPowerStatus);
      if (fpPowerStatus) {
        await IdentiFIService.setFpPowerOff();
      } else {
        await IdentiFIService.setFpPowerOn();
      }
    } catch (error) {
      Alert.alert('Power Control Error', error.message || 'Failed to control fingerprint sensor power');
    }
  };

  const startCapture = async (type, savedIndex = 0) => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    if (!fpPowerStatus) {
      Alert.alert('Sensor Off', 'Please turn on fingerprint sensor first');
      return;
    }

    setIsCapturing(true);
    setCaptureType(type);
    setStreamingImage(null);
    setCaptureStatus('Initializing capture...');
    
    // Sauvegarder l'index utilisé pour la capture comme fallback
    setLastUsedCaptureIndex(savedIndex);
    console.log(`🔍 Starting capture with savedIndex: ${savedIndex}`);
    console.log(`Capture type: ${type}`);

    try {
      switch (type) {
        case 'one':
          await IdentiFIService.startCaptureOneFinger(savedIndex);
          break;
        case 'two':
          await IdentiFIService.startCaptureTwoFinger(savedIndex);
          break;
        case 'four':
          await IdentiFIService.startCaptureFourFinger(savedIndex);
          break;
        case 'roll':
          await IdentiFIService.startCaptureRollFinger(savedIndex);
          break;
        default:
          throw new Error('Invalid capture type');
      }
    } catch (error) {
      setIsCapturing(false);
      setCaptureType(null);
      Alert.alert('Capture Failed', error.message || 'Failed to start fingerprint capture');
    }
  };


  const clearImages = () => {
    setStreamingImage(null);
    setLastCapturedImage(null);
    setRolledImage(null);
    setRawImageData(null);
    setCaptureStatus('');
    setRollingState(0);
    setVerticalLineX(0);
    setLastImageBufferIndex(null);
    setRolledImageBufferIndex(null);
    setLastUsedCaptureIndex(null);
  };

  const testApiConnection = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    
    try {
      console.log('[FingerprintsScreen] Starting resilient API test...');
      
      // Get current network status to determine strategy
      const networkInfo = ConnectivityService.getCurrentNetworkInfo();
      const currentNetworkType = networkInfo?.state?.type;
      const hasInternetReachable = networkInfo?.state?.isInternetReachable;
      
      console.log(`[FingerprintsScreen] Current network: ${currentNetworkType}, Internet: ${hasInternetReachable}`);
      
      // If no cellular network or no internet, force WiFi backup network switch
      if (currentNetworkType !== 'cellular' || !hasInternetReachable) {
        console.log('[FingerprintsScreen] No cellular/internet detected, forcing WiFi backup switch...');
        
        setApiTestResult({
          success: false,
          error: 'Switching to WiFi backup...',
          note: 'Attempting connection via backup networks'
        });
        
        // Trigger immediate network switch to WiFi backup
        try {
          await ConnectivityService.triggerNetworkSwitch();
          console.log('[FingerprintsScreen] Network switch triggered');
          
          // Wait a moment for switch to complete
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Update result to show switching progress
          setApiTestResult({
            success: false,
            error: 'Testing WiFi connection...',
            note: 'Verifying backup network connectivity'
          });
          
        } catch (switchError) {
          console.error('[FingerprintsScreen] Network switch failed:', switchError);
        }
      }
      
      // Use ResilientApiService for automatic retry and network switching
      const temperature = await ResilientApiService.makeResilientCall(
        'https://wttr.in/Washington?format=%t',
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        },
        PRIORITY.HIGH,
        {
          description: 'Weather API test from fingerprint capture',
          source: 'FingerprintsScreen',
          forceWiFiBackup: currentNetworkType !== 'cellular' || !hasInternetReachable
        }
      );
      
      // Determine which network was used for the successful call
      const finalNetworkInfo = ConnectivityService.getCurrentNetworkInfo();
      const finalNetworkType = finalNetworkInfo?.state?.type;
      const networkUsed = finalNetworkType === 'wifi' ? 'WiFi backup network' : 
                          finalNetworkType === 'cellular' ? 'Cellular network' : 
                          `${finalNetworkType} network`;
      
      setApiTestResult({
        success: true,
        data: {
          city: 'Washington DC',
          temperature: typeof temperature === 'string' ? temperature.trim() : String(temperature).trim(),
          message: `Weather data retrieved successfully via ${networkUsed}`,
          networkUsed: finalNetworkType,
          note: finalNetworkType === 'wifi' ? 
                'Successfully switched to WiFi backup for data transmission' :
                'Connection confirmed with automatic failover support'
        }
      });
      
      console.log(`[FingerprintsScreen] Resilient API test successful via ${networkUsed}`);
    } catch (error) {
      console.error('[FingerprintsScreen] Resilient API test failed:', error);
      
      // Get final network info for error reporting
      const finalNetworkInfo = ConnectivityService.getCurrentNetworkInfo();
      const finalNetworkType = finalNetworkInfo?.state?.type || 'unknown';
      
      setApiTestResult({
        success: false,
        error: error.message || 'Connection error',
        networkAttempted: finalNetworkType,
        note: finalNetworkType === 'wifi' ? 
              'Failed even after switching to WiFi backup networks' :
              'Failed even with network switching and retry mechanisms'
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Test functions for saved images
  const testNfiqScore = async (bufferIndex) => {
    console.log('🔍 testNfiqScore called with bufferIndex:', bufferIndex);
    console.log('🔍 Current lastImageBufferIndex state:', lastImageBufferIndex);
    console.log('🔍 Current rolledImageBufferIndex state:', rolledImageBufferIndex);
    
    if (bufferIndex === null || bufferIndex === undefined) {
      Alert.alert('No Image', `No image saved in buffer to test. Last: ${lastImageBufferIndex}, Rolled: ${rolledImageBufferIndex}`);
      return;
    }

    try {
      console.log(`Testing NFIQ score for buffer index: ${bufferIndex}`);
      const result = await IdentiFIService.getNfiqScoreFromImageSavedAt(bufferIndex);
      console.log('NFIQ score result:', result);
      Alert.alert('NFIQ Score Test', `Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('NFIQ score test failed:', error);
      Alert.alert('NFIQ Score Test Failed', error.message || 'Unknown error');
    }
  };

  const testSegmentedImage = async (bufferIndex) => {
    if (bufferIndex === null || bufferIndex === undefined) {
      Alert.alert('No Image', 'No image saved in buffer to test');
      return;
    }

    try {
      console.log(`Testing segmented image for buffer index: ${bufferIndex}`);
      const result = await IdentiFIService.getSegmentedFpImageSavedAt(bufferIndex);
      console.log('Segmented image result:', result);
      Alert.alert('Segmented Image Test', `Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('Segmented image test failed:', error);
      Alert.alert('Segmented Image Test Failed', error.message || 'Unknown error');
    }
  };

  const testWSQImage = async (bufferIndex) => {
    if (bufferIndex === null || bufferIndex === undefined) {
      Alert.alert('No Image', 'No image saved in buffer to test');
      return;
    }

    try {
      console.log(`Testing WSQ image for buffer index: ${bufferIndex}`);
      const result = await IdentiFIService.getWSQEncodedFpImageFromImageSavedAt(bufferIndex, false);
      console.log('WSQ image result:', result);
      Alert.alert('WSQ Image Test', `Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('WSQ image test failed:', error);
      Alert.alert('WSQ Image Test Failed', error.message || 'Unknown error');
    }
  };

  // Cancel capture function
  const cancelCapture = async () => {
    if (!isCapturing) {
      return;
    }

    try {
      console.log('🔴 Cancelling fingerprint capture...');
      await IdentiFIService.cancelFpCapture();
      
      // Reset capture state immediately
      setIsCapturing(false);
      setCaptureType(null);
      setStreamingImage(null);
      setCaptureStatus('❌ Capture cancelled by user');
      
      console.log('✅ Capture cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel capture:', error);
      Alert.alert('Cancel Failed', error.message || 'Failed to cancel fingerprint capture');
      
      // Reset state anyway in case of error
      setIsCapturing(false);
      setCaptureType(null);
      setStreamingImage(null);
      setCaptureStatus('❌ Capture cancelled (with errors)');
    }
  };

  // Test finger duplication function
  const testFingerDuplication = async (bufferIndex) => {
    if (bufferIndex === null || bufferIndex === undefined) {
      Alert.alert('No Image', 'No image saved in buffer to test');
      return;
    }

    try {
      console.log(`Testing finger duplication for buffer index: ${bufferIndex} with security level 2`);
      const result = await IdentiFIService.isFingerDuplicated(bufferIndex, 2);
      console.log('Finger duplication result:', result);
      Alert.alert('Finger Duplication Test', `Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('Finger duplication test failed:', error);
      Alert.alert('Finger Duplication Test Failed', error.message || 'Unknown error');
    }
  };

  // Clear saved image function
  const clearSavedImage = async (bufferIndex) => {
    if (bufferIndex === null || bufferIndex === undefined) {
      Alert.alert('No Image', 'No image saved in buffer to clear');
      return;
    }

    try {
      console.log(`Clearing saved image at buffer index: ${bufferIndex}`);
      const result = await IdentiFIService.clearSavedFpImages(bufferIndex);
      console.log('Clear saved image result:', result);
      Alert.alert('Clear Saved Image', `Image at index ${bufferIndex} cleared successfully`);
      
      // Reset local state for the cleared image
      if (lastImageBufferIndex === bufferIndex) {
        setLastImageBufferIndex(null);
        setLastCapturedImage(null);
      }
      if (rolledImageBufferIndex === bufferIndex) {
        setRolledImageBufferIndex(null);
        setRolledImage(null);
      }
    } catch (error) {
      console.error('Clear saved image failed:', error);
      Alert.alert('Clear Saved Image Failed', error.message || 'Unknown error');
    }
  };

  const closeCaptureModal = () => {
    setShowCaptureModal(false);
    setApiTestResult(null);
  };

  const handleConnectivityPress = (networkInfo, queueStatus) => {
    let message = `Network: ${networkInfo?.state?.type || 'Unknown'}\n`;
    message += `Quality: ${networkInfo?.quality || 'Unknown'}\n`;
    message += `Internet: ${networkInfo?.state?.isInternetReachable ? 'Available' : 'Not available'}\n`;
    
    if (queueStatus && queueStatus.total > 0) {
      message += `\nPending requests: ${queueStatus.total}\n`;
      message += `Processing: ${queueStatus.isProcessing ? 'Yes' : 'No'}`;
    }
    
    Alert.alert('Network Status', message);
  };

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Fingerprints</Text>
        <Text style={styles.subtitle}>Please connect to device first</Text>
        <Text style={styles.instruction}>Go to Network tab to connect</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Fingerprint Capture</Text>
        <ConnectivityIndicator 
          compact={true}
          onPress={handleConnectivityPress}
          style={styles.connectivityIndicator}
        />
      </View>
      
      {/* Power Control */}
      <View style={styles.powerContainer}>
        <Text style={styles.powerLabel}>Fingerprint Sensor:</Text>
        <TouchableOpacity
          style={[styles.powerButton, { backgroundColor: fpPowerStatus ? '#4CAF50' : '#F44336' }]}
          onPress={handlePowerToggle}
          disabled={isCapturing}
        >
          <Text style={styles.powerButtonText}>
            {fpPowerStatus ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Capture Status */}
      {captureStatus ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{captureStatus}</Text>
        </View>
      ) : null}

      {/* Capture Buttons */}
      <View style={styles.captureButtonsContainer}>
        <TouchableOpacity
          style={[styles.captureButton, { backgroundColor: isCapturing && captureType === 'one' ? '#FF9800' : '#2196F3' }]}
          onPress={() => startCapture('one', 0)}
          disabled={isCapturing || !fpPowerStatus}
        >
          <Text style={styles.captureButtonText}>One Finger</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, { backgroundColor: isCapturing && captureType === 'two' ? '#FF9800' : '#2196F3' }]}
          onPress={() => startCapture('two', 1)}
          disabled={isCapturing || !fpPowerStatus}
        >
          <Text style={styles.captureButtonText}>Two Fingers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, { backgroundColor: isCapturing && captureType === 'four' ? '#FF9800' : '#2196F3' }]}
          onPress={() => startCapture('four', 2)}
          disabled={isCapturing || !fpPowerStatus}
        >
          <Text style={styles.captureButtonText}>Four Fingers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, { backgroundColor: isCapturing && captureType === 'roll' ? '#FF9800' : '#2196F3' }]}
          onPress={() => startCapture('roll', 3)}
          disabled={isCapturing || !fpPowerStatus}
        >
          <Text style={styles.captureButtonText}>Roll Finger</Text>
        </TouchableOpacity>
      </View>

      {/* Cancel Capture Button - Only visible during capture */}
      {isCapturing && (
        <TouchableOpacity
          style={[styles.captureButton, styles.cancelCaptureButton]}
          onPress={cancelCapture}
        >
          <Text style={styles.captureButtonText}>❌ Cancel Capture</Text>
        </TouchableOpacity>
      )}


      <TouchableOpacity
        style={[styles.captureButton, styles.clearButton]}
        onPress={clearImages}
        disabled={isCapturing}
      >
        <Text style={styles.captureButtonText}>Clear Images</Text>
      </TouchableOpacity>

      {/* Saved Images Management */}
      {(lastImageBufferIndex !== null || rolledImageBufferIndex !== null) && (
        <View style={styles.savedImagesSection}>
          <Text style={styles.savedImagesTitle}>Saved Images Management</Text>
          
          <View style={styles.savedImagesButtonsContainer}>
            <TouchableOpacity
              style={[styles.captureButton, styles.testButton]}
              onPress={() => testNfiqScore(lastImageBufferIndex !== null ? lastImageBufferIndex : rolledImageBufferIndex)}
              disabled={isCapturing}
            >
              <Text style={styles.captureButtonText}>Get NFIQ Score</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, styles.testButton]}
              onPress={() => testSegmentedImage(lastImageBufferIndex !== null ? lastImageBufferIndex : rolledImageBufferIndex)}
              disabled={isCapturing}
            >
              <Text style={styles.captureButtonText}>Get Segmented Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, styles.testButton]}
              onPress={() => testWSQImage(lastImageBufferIndex !== null ? lastImageBufferIndex : rolledImageBufferIndex)}
              disabled={isCapturing}
            >
              <Text style={styles.captureButtonText}>Get WSQ Image</Text>
            </TouchableOpacity>
          </View>
          
          {/* Second row of buttons */}
          <View style={[styles.savedImagesButtonsContainer, { marginTop: 10 }]}>
            <TouchableOpacity
              style={[styles.captureButton, styles.testButton, styles.duplicateButton]}
              onPress={() => testFingerDuplication(lastImageBufferIndex !== null ? lastImageBufferIndex : rolledImageBufferIndex)}
              disabled={isCapturing}
            >
              <Text style={styles.captureButtonText}>Is Finger Duplicated</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, styles.testButton, styles.clearSavedButton]}
              onPress={() => clearSavedImage(lastImageBufferIndex !== null ? lastImageBufferIndex : rolledImageBufferIndex)}
              disabled={isCapturing}
            >
              <Text style={styles.captureButtonText}>Clear Saved Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            <Text style={styles.imageTitle}>Captured Image</Text>
            {lastImageBufferIndex !== null && (
              <View style={styles.bufferInfoContainer}>
                <Text style={styles.bufferInfoText}>
                  📁 Saved in buffer at index: <Text style={styles.bufferIndex}>{lastImageBufferIndex}</Text>
                </Text>
              </View>
            )}
            <Image
              source={{ uri: `data:image/png;base64,${lastCapturedImage}` }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}

        {rolledImage && (
          <View style={styles.imageSection}>
            <Text style={styles.imageTitle}>Rolled Finger Image</Text>
            {rolledImageBufferIndex !== null && (
              <View style={styles.bufferInfoContainer}>
                <Text style={styles.bufferInfoText}>
                  📁 Saved in buffer at index: <Text style={styles.bufferIndex}>{rolledImageBufferIndex}</Text>
                </Text>
              </View>
            )}
            <Image
              source={{ uri: `data:image/png;base64,${rolledImage}` }}
              style={styles.image}
              resizeMode="contain"
            />
            {rollingState > 0 && (
              <Text style={styles.rollingInfo}>Rolling State: {rollingState}</Text>
            )}
          </View>
        )}
      </View>

      {/* Modal de fin de capture */}
      <Modal
        visible={showCaptureModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCaptureModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Capture Done</Text>
            <Text style={styles.modalMessage}>
              Fingerprint captured successfully!
            </Text>
            
            {/* Buffer Index Information */}
            {(lastImageBufferIndex !== null || rolledImageBufferIndex !== null) && (
              <View style={styles.modalBufferInfo}>
                <Text style={styles.modalBufferText}>
                  📁 Image saved in device buffer at index: 
                </Text>
                <Text style={styles.modalBufferIndex}>
                  {lastImageBufferIndex !== null ? lastImageBufferIndex : rolledImageBufferIndex}
                </Text>
              </View>
            )}
            
            {/* Test API */}
            <View style={styles.apiTestSection}>
              <Text style={styles.apiTestTitle}>
Internet connectivity test:</Text>
              
              <TouchableOpacity
                style={[styles.apiTestButton, isTestingApi && styles.apiTestButtonLoading]}
                onPress={testApiConnection}
                disabled={isTestingApi}
              >
                <Text style={styles.apiTestButtonText}>
                  {isTestingApi ? 'Testing...' : 'Test API Connection'}
                </Text>
              </TouchableOpacity>
              
              {/* Résultat du test API */}
              {apiTestResult && (
                <View style={[styles.apiResult, apiTestResult.success ? styles.apiResultSuccess : styles.apiResultError]}>
                  <Text style={styles.apiResultTitle}>
                    {apiTestResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}
                  </Text>
                  
                  {apiTestResult.success && apiTestResult.data && (
                    <View style={styles.apiResultData}>
                      <Text style={styles.apiResultText}>
                        🌆 City: {apiTestResult.data.city}
                      </Text>
                      {apiTestResult.data.temperature && (
                        <Text style={styles.apiResultText}>
                          🌡️ Temperature: {apiTestResult.data.temperature}
                        </Text>
                      )}
                      {apiTestResult.data.networkUsed && (
                        <Text style={styles.apiResultText}>
                          📡 Network: {apiTestResult.data.networkUsed.toUpperCase()}
                          {apiTestResult.data.networkUsed === 'wifi' && ' 📶'}
                        </Text>
                      )}
                      {apiTestResult.data.message && (
                        <Text style={styles.apiResultText}>
                          📝 {apiTestResult.data.message}
                        </Text>
                      )}
                      {apiTestResult.data.note && (
                        <Text style={[styles.apiResultNote, 
                          apiTestResult.data.networkUsed === 'wifi' && {color: '#4CAF50', fontWeight: '500'}
                        ]}>
                          {apiTestResult.data.note}
                        </Text>
                      )}
                    </View>
                  )}
                  
                  {!apiTestResult.success && (
                    <View style={styles.apiResultData}>
                      <Text style={styles.apiResultText}>
                        Error: {apiTestResult.error}
                      </Text>
                      <Text style={styles.apiResultNote}>
                        {apiTestResult.note}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            
            {/* Bouton de fermeture */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeCaptureModal}
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
  captureButtonsContainer: {
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF9800',
  },
  cancelCaptureButton: {
    backgroundColor: '#F44336',
    marginTop: 10,
  },
  testButton: {
    backgroundColor: '#9C27B0',
    marginHorizontal: 5,
    flex: 1,
  },
  duplicateButton: {
    backgroundColor: '#FF5722',
  },
  clearSavedButton: {
    backgroundColor: '#795548',
  },
  savedImagesSection: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  savedImagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  savedImagesButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  rollingInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  bufferInfoContainer: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  bufferInfoText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  bufferIndex: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  // Styles pour la modal
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
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalBufferInfo: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  modalBufferText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBufferIndex: {
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: 'bold',
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    textAlign: 'center',
  },
  apiTestSection: {
    width: '100%',
    marginBottom: 25,
  },
  apiTestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  apiTestButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  apiTestButtonLoading: {
    backgroundColor: '#FF9800',
  },
  apiTestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  apiResult: {
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  apiResultSuccess: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  apiResultError: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  apiResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  apiResultData: {
    marginTop: 5,
  },
  apiResultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 20,
  },
  apiResultNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  apiResultStatus: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#4CAF50',
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