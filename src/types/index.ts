export interface Topic {
  id: string;
  name: string;
  query: string;
  isActive: boolean;
  notificationsEnabled: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  description: string;
  topicId: string;
  publishedAt: Date;
  fetchedAt: Date;
  isRead: boolean;
}

export interface ExaSearchResult {
  id: string;
  title: string;
  url: string;
  publishedDate: string;
  author?: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  score?: number;
}

export interface ExaSearchResponse {
  results: ExaSearchResult[];
  autopromptString?: string;
  requestId?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface AppState {
  topics: Topic[];
  articles: Article[];
  notificationSettings: NotificationSettings;
  lastSync: Date | null;
}