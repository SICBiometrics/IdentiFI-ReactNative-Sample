import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import EyesScreen from './screens/EyesScreen';
import NetworkScreen from './screens/NetworkScreen';
import FingerprintsScreen from './screens/FingerprintsScreen';
import ParametersScreen from './screens/ParametersScreen';
import AdvancedScreen from './screens/AdvancedScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Eyes') {
              iconName = focused ? 'eye' : 'eye-outline';
            } else if (route.name === 'Network') {
              iconName = focused ? 'wifi' : 'wifi-outline';
            } else if (route.name === 'Fingerprints') {
              iconName = focused ? 'finger-print' : 'finger-print-outline';
            } else if (route.name === 'Advanced') {
              iconName = focused ? 'build' : 'build-outline';
            } else if (route.name === 'Parameters') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            paddingBottom: 15,
            paddingTop: 15,
            height: 100,
          },
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Network" 
          component={NetworkScreen}
          options={{ title: 'Network' }}
        />
        <Tab.Screen 
          name="Fingerprints" 
          component={FingerprintsScreen}
          options={{ title: 'Fingerprints' }}
        />
        <Tab.Screen 
          name="Eyes" 
          component={EyesScreen}
          options={{ title: 'Eyes Recognition' }}
        />
        <Tab.Screen 
          name="Advanced" 
          component={AdvancedScreen}
          options={{ title: 'Advanced Features' }}
        />
        <Tab.Screen 
          name="Parameters" 
          component={ParametersScreen}
          options={{ title: 'Settings' }}
        />
      </Tab.Navigator>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
    </NavigationContainer>
  );
}
