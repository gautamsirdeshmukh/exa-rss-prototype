import AsyncStorage from '@react-native-async-storage/async-storage';
import { Topic, Article, NotificationSettings } from '../types';

const STORAGE_KEYS = {
  TOPICS: 'topics',
  ARTICLES: 'articles',
  NOTIFICATION_SETTINGS: 'notificationSettings',
  LAST_SYNC: 'lastSync',
};

export class StorageService {
  static async getTopics(): Promise<Topic[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TOPICS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting topics:', error);
      return [];
    }
  }

  static async saveTopics(topics: Topic[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
    } catch (error) {
      console.error('Error saving topics:', error);
    }
  }

  static async getArticles(): Promise<Article[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ARTICLES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting articles:', error);
      return [];
    }
  }

  static async saveArticles(articles: Article[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    } catch (error) {
      console.error('Error saving articles:', error);
    }
  }

  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      return data ? JSON.parse(data) : {
        enabled: true,
        frequency: 'hourly',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        enabled: true,
        frequency: 'hourly',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
      };
    }
  }

  static async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  static async getLastSync(): Promise<Date | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return data ? new Date(data) : null;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  }

  static async saveLastSync(date: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, date.toISOString());
    } catch (error) {
      console.error('Error saving last sync:', error);
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}