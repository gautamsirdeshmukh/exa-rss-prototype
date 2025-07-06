import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import { FeedScreen } from './src/screens/FeedScreen';
import { TopicsScreen } from './src/screens/TopicsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ExaApiService } from './src/services/ExaApiService';
import { NotificationService } from './src/services/NotificationService';

const Tab = createBottomTabNavigator();

export default function App() {
  const [exaApiService, setExaApiService] = useState<ExaApiService | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize ExaApiService with hardcoded company key
      const service = new ExaApiService();
      setExaApiService(service);
      
      // Initialize notification service
      const notificationService = NotificationService.getInstance();
      notificationService.setExaApiService(service);
      await notificationService.requestPermissions();
      
      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsReady(true);
    }
  };

  if (!isReady) {
    return null;
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
          children={() => <FeedScreen exaApiService={exaApiService!} />}
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
          component={SettingsScreen}
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