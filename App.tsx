import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FeedScreen } from './src/screens/FeedScreen';
import { TopicsScreen } from './src/screens/TopicsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ExaApiService } from './src/services/ExaApiService';
import { NotificationService } from './src/services/NotificationService';

const Tab = createBottomTabNavigator();

export default function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [exaApiService, setExaApiService] = useState<ExaApiService | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (apiKey) {
      const service = new ExaApiService(apiKey);
      setExaApiService(service);
      
      const notificationService = NotificationService.getInstance();
      notificationService.setExaApiService(service);
      
      saveApiKey(apiKey);
    }
  }, [apiKey]);

  const initializeApp = async () => {
    try {
      const savedApiKey = await AsyncStorage.getItem('exa_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      
      const notificationService = NotificationService.getInstance();
      await notificationService.requestPermissions();
      
      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsReady(true);
    }
  };

  const saveApiKey = async (key: string) => {
    try {
      await AsyncStorage.setItem('exa_api_key', key);
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  const handleSetApiKey = (key: string) => {
    setApiKey(key);
  };

  if (!isReady) {
    return null;
  }

  if (!apiKey || !exaApiService) {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            headerShown: true,
          }}
        >
          <Tab.Screen
            name="Settings"
            children={() => (
              <SettingsScreen
                apiKey={apiKey}
                setApiKey={handleSetApiKey}
              />
            )}
            options={{
              title: 'Settings',
              headerTitle: 'Exa RSS Feed - Settings',
              tabBarLabel: 'Settings',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: true,
        }}
      >
        <Tab.Screen
          name="Feed"
          children={() => <FeedScreen exaApiService={exaApiService} />}
          options={{
            title: 'Feed',
            headerTitle: 'Exa RSS Feed',
            tabBarLabel: 'Feed',
          }}
        />
        <Tab.Screen
          name="Topics"
          component={TopicsScreen}
          options={{
            title: 'Topics',
            headerTitle: 'Manage Topics',
            tabBarLabel: 'Topics',
          }}
        />
        <Tab.Screen
          name="Settings"
          children={() => (
            <SettingsScreen
              apiKey={apiKey}
              setApiKey={handleSetApiKey}
            />
          )}
          options={{
            title: 'Settings',
            headerTitle: 'Settings',
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}