import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { NotificationSettings, UserProfile } from '../types';
import { StorageService } from '../services/StorageService';
import { NotificationService } from '../services/NotificationService';

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    frequency: 'hourly',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    createdAt: new Date(),
  });
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [cacheSize, setCacheSize] = useState<string>('0 KB');

  useEffect(() => {
    loadSettings();
    loadLastSync();
    loadUserProfile();
    calculateCacheSize();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await StorageService.getNotificationSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadLastSync = async () => {
    try {
      const lastSyncData = await StorageService.getLastSync();
      setLastSync(lastSyncData);
    } catch (error) {
      console.error('Error loading last sync:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profileData = await StorageService.getUserProfile();
      if (profileData) {
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const calculateCacheSize = async () => {
    try {
      const [articles, topics] = await Promise.all([
        StorageService.getArticles(),
        StorageService.getTopics(),
      ]);
      
      const dataSize = JSON.stringify({ articles, topics }).length;
      const sizeInKB = (dataSize / 1024).toFixed(1);
      setCacheSize(`${sizeInKB} KB`);
    } catch (error) {
      console.error('Error calculating cache size:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await StorageService.saveNotificationSettings(settings);
      
      const notificationService = NotificationService.getInstance();
      
      if (settings.enabled) {
        const hasPermission = await notificationService.requestPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive updates.'
          );
          return;
        }
        await notificationService.registerBackgroundTask();
      } else {
        await notificationService.unregisterBackgroundTask();
      }
      
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await StorageService.saveUserProfile(userProfile);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleClearCache = async () => {
    try {
      const articles = await StorageService.getArticles();
      await StorageService.saveArticles([]);
      await calculateCacheSize();
      Alert.alert('Success', `Cleared ${articles.length} cached articles`);
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              setLastSync(null);
              setCacheSize('0 KB');
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...updates,
    }));
  };

  const updateQuietHours = (updates: Partial<NotificationSettings['quietHours']>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      quietHours: {
        ...prevSettings.quietHours,
        ...updates,
      },
    }));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      ...updates,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 User Profile</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={userProfile.email}
            onChangeText={(email) => updateProfile({ email })}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={userProfile.username}
            onChangeText={(username) => updateProfile({ username })}
            placeholder="Enter your username"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.nameRow}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={userProfile.firstName}
              onChangeText={(firstName) => updateProfile({ firstName })}
              placeholder="First name"
            />
          </View>
          
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={userProfile.lastName}
              onChangeText={(lastName) => updateProfile({ lastName })}
              placeholder="Last name"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={settings.enabled}
            onValueChange={(enabled) => updateSettings({ enabled })}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.enabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Frequency</Text>
          <View style={styles.frequencyButtons}>
            {(['immediate', 'hourly', 'daily'] as const).map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyButton,
                  settings.frequency === freq && styles.activeFrequencyButton,
                ]}
                onPress={() => updateSettings({ frequency: freq })}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    settings.frequency === freq && styles.activeFrequencyButtonText,
                  ]}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Quiet Hours</Text>
          <Switch
            value={settings.quietHours.enabled}
            onValueChange={(enabled) => updateQuietHours({ enabled })}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.quietHours.enabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        {settings.quietHours.enabled && (
          <View style={styles.quietHoursContainer}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Start:</Text>
              <TextInput
                style={styles.timeInput}
                value={settings.quietHours.start}
                onChangeText={(start) => updateQuietHours({ start })}
                placeholder="22:00"
              />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>End:</Text>
              <TextInput
                style={styles.timeInput}
                value={settings.quietHours.end}
                onChangeText={(end) => updateQuietHours({ end })}
                placeholder="08:00"
              />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSaveSettings}>
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💾 Data & Storage</Text>
        
        {lastSync && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Sync:</Text>
            <Text style={styles.infoValue}>
              {lastSync.toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cache Size:</Text>
          <Text style={styles.infoValue}>{cacheSize}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleClearCache}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Clear Cache
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearData}
        >
          <Text style={[styles.buttonText, styles.dangerButtonText]}>
            Clear All Data
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFrequencyButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activeFrequencyButtonText: {
    color: 'white',
  },
  quietHoursContainer: {
    marginLeft: 16,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: '#333',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  dangerButtonText: {
    color: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
});