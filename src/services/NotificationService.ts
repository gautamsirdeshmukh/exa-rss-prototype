import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { ExaApiService } from './ExaApiService';
import { StorageService } from './StorageService';
import { Topic, Article } from '../types';

const BACKGROUND_FETCH_TASK = 'background-fetch-articles';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private exaApiService: ExaApiService | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  setExaApiService(exaApiService: ExaApiService): void {
    this.exaApiService = exaApiService;
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async scheduleNotification(title: string, body: string, data?: any): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null,
    });
  }

  async registerBackgroundTask(): Promise<void> {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 60 * 1000, // 1 hour
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch (error) {
      console.error('Failed to register background task:', error);
    }
  }

  async unregisterBackgroundTask(): Promise<void> {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    } catch (error) {
      console.error('Failed to unregister background task:', error);
    }
  }

  private async fetchNewArticles(): Promise<void> {
    if (!this.exaApiService) {
      console.error('Exa API service not initialized');
      return;
    }

    try {
      const topics = await StorageService.getTopics();
      const activeTopics = topics.filter(topic => topic.isActive);
      const existingArticles = await StorageService.getArticles();
      const newArticles: Article[] = [];

      for (const topic of activeTopics) {
        const lastHour = new Date();
        lastHour.setHours(lastHour.getHours() - 1);

        const searchResults = await this.exaApiService.searchContent(topic.query, {
          numResults: 5,
          publishedAfter: lastHour.toISOString(),
        });

        for (const result of searchResults.results) {
          const existingArticle = existingArticles.find(
            article => article.url === result.url
          );

          if (!existingArticle) {
            const article: Article = {
              id: result.id,
              title: result.title,
              url: result.url,
              description: this.exaApiService.generateDescription(result.text || ''),
              topicId: topic.id,
              publishedAt: new Date(result.publishedDate),
              fetchedAt: new Date(),
              isRead: false,
            };

            newArticles.push(article);
          }
        }
      }

      if (newArticles.length > 0) {
        const allArticles = [...existingArticles, ...newArticles];
        await StorageService.saveArticles(allArticles);
        await StorageService.saveLastSync(new Date());

        await this.scheduleNotification(
          'New Articles Available',
          `Found ${newArticles.length} new articles across your topics`,
          { newArticleCount: newArticles.length }
        );
      }
    } catch (error) {
      console.error('Error fetching new articles:', error);
    }
  }
}

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const notificationService = NotificationService.getInstance();
    await notificationService['fetchNewArticles']();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});