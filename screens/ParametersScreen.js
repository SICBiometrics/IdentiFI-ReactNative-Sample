import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import IdentiFIService from '../src/services/IdentiFIService';

export default function ParametersScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [ledBrightness, setLedBrightness] = useState(50);
  const [currentLedBrightness, setCurrentLedBrightness] = useState(null);
  const [nfiqScore, setNfiqScore] = useState('3');

  useEffect(() => {
    // Monitor connection status
    const connectionListener = IdentiFIService.addEventListener('onConnection', () => {
      setIsConnected(true);
      loadCurrentSettings();
    });

    const disconnectionListener = IdentiFIService.addEventListener('onDisconnection', () => {
      setIsConnected(false);
      setCurrentLedBrightness(null);
    });

    // Check initial connection status
    setIsConnected(IdentiFIService.getConnectionStatus());
    if (IdentiFIService.getConnectionStatus()) {
      loadCurrentSettings();
    }

    return () => {
      connectionListener.remove();
      disconnectionListener.remove();
    };
  }, []);

  useEffect(() => {
    // Listen for settings events
    const setBrightnessListener = IdentiFIService.addEventListener('onSetLEDBrightness', () => {
      loadCurrentSettings(); // Refresh current brightness only, no alert
    });

    const getBrightnessListener = IdentiFIService.addEventListener('onGetLEDBrightness', (data) => {
      setCurrentLedBrightness(data.brightness);
    });

    const setNfiqListener = IdentiFIService.addEventListener('onSetMinimumNFIQScore', (data) => {
      console.log('Minimum NFIQ score set to:', data);
      Alert.alert('Success', `Minimum NFIQ score set to ${data["score"]}`);
    });


    return () => {
      setBrightnessListener.remove();
      getBrightnessListener.remove();
      setNfiqListener.remove();
    };
  }, []);

  const loadCurrentSettings = async () => {
    try {
      await IdentiFIService.getLEDBrightness();
    } catch (error) {
      console.error('Failed to load current settings:', error);
    }
  };

  const handleSetLedBrightness = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    try {
      await IdentiFIService.setLEDBrightness(ledBrightness);
      Alert.alert('Success', `LED brightness updated successfully, value: ${ledBrightness}`);
      loadCurrentSettings(); // Refresh current brightness
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to set LED brightness');
    }
  };

  const handleSetNfiqScore = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to device first');
      return;
    }

    const score = parseInt(nfiqScore);
    if (isNaN(score) || score < 1 || score > 5) {
      Alert.alert('Invalid Input', 'NFIQ score must be between 1 and 5');
      return;
    }

    try {
      await IdentiFIService.setMinimumNFIQScore(score);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to set minimum NFIQ score');
    }
  };



  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Parameters</Text>
        <Text style={styles.subtitle}>Please connect to device first</Text>
        <Text style={styles.instruction}>Go to Network tab to connect</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Device Parameters</Text>

      {/* LED Brightness Control */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LED Brightness</Text>
        <Text style={styles.sectionDescription}>
          Control the brightness of all device LEDs (0-100%)
        </Text>
        
        {currentLedBrightness !== null && (
          <Text style={styles.currentValue}>
            Current: {currentLedBrightness}%
          </Text>
        )}

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>0%</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            value={ledBrightness}
            onValueChange={setLedBrightness}
            step={1}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#ccc"
            thumbStyle={{ backgroundColor: '#2196F3' }}
          />
          <Text style={styles.sliderLabel}>100%</Text>
        </View>

        <Text style={styles.currentValue}>Selected: {Math.round(ledBrightness)}%</Text>

        <TouchableOpacity style={styles.button} onPress={handleSetLedBrightness}>
          <Text style={styles.buttonText}>Set LED Brightness</Text>
        </TouchableOpacity>
      </View>

      {/* NFIQ Score Setting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minimum NFIQ Score</Text>
        <Text style={styles.sectionDescription}>
          Set minimum fingerprint quality score (1=Excellent, 5=Poor)
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>NFIQ Score (1-5):</Text>
          <TextInput
            style={styles.textInput}
            value={nfiqScore}
            onChangeText={setNfiqScore}
            keyboardType="numeric"
            maxLength={1}
            placeholder="3"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSetNfiqScore}>
          <Text style={styles.buttonText}>Set NFIQ Score</Text>
        </TouchableOpacity>
      </View>



      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructionText}>• NFIQ: Lower numbers = higher quality required</Text>
        <Text style={styles.instructionText}>• Changes take effect immediately</Text>
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
    marginBottom: 20,
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  currentValue: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 10,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    minWidth: 60,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});