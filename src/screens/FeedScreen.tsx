import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { Article, Topic } from '../types';
import { StorageService } from '../services/StorageService';
import { ExaApiService } from '../services/ExaApiService';

interface FeedScreenProps {
  exaApiService: ExaApiService;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ exaApiService }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [articlesData, topicsData] = await Promise.all([
        StorageService.getArticles(),
        StorageService.getTopics(),
      ]);
      setArticles(articlesData.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNewArticles();
    await loadData();
    setRefreshing(false);
  };

  const fetchNewArticles = async () => {
    try {
      const activeTopics = topics.filter(topic => topic.isActive);
      
      if (activeTopics.length === 0) {
        Alert.alert('No Active Topics', 'Please add and activate topics in the Topics tab to see articles.');
        return;
      }

      const newArticles: Article[] = [];

      for (const topic of activeTopics) {
        console.log(`Fetching articles for topic: ${topic.name}`);
        const searchResults = await exaApiService.searchContent(topic.query, {
          numResults: 10,
        });

        console.log(`Found ${searchResults.results.length} results for ${topic.name}`);

        for (const result of searchResults.results) {
          const existingArticle = articles.find(
            article => article.url === result.url
          );

          if (!existingArticle) {
            const article: Article = {
              id: result.id,
              title: result.title,
              url: result.url,
              description: exaApiService.generateDescription(result.text || ''),
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
        const allArticles = [...articles, ...newArticles];
        await StorageService.saveArticles(allArticles);
        setArticles(allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
        Alert.alert('Success', `Found ${newArticles.length} new articles!`);
      } else {
        Alert.alert('No New Articles', 'No new articles found for your topics.');
      }
    } catch (error) {
      console.error('Error fetching new articles:', error);
      Alert.alert('Error', `Failed to fetch new articles: ${error.message}`);
    }
  };

  const handleArticlePress = async (article: Article) => {
    try {
      await Linking.openURL(article.url);
      
      if (!article.isRead) {
        const updatedArticles = articles.map(a => 
          a.id === article.id ? { ...a, isRead: true } : a
        );
        setArticles(updatedArticles);
        await StorageService.saveArticles(updatedArticles);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open article');
    }
  };

  const getTopicName = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.name : 'Unknown Topic';
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={[styles.articleCard, item.isRead && styles.readArticle]}
      onPress={() => handleArticlePress(item)}
    >
      <View style={styles.articleHeader}>
        <Text style={styles.topicTag}>{getTopicName(item.topicId)}</Text>
        <Text style={styles.publishedDate}>
          {new Date(item.publishedAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.articleTitle}>{item.title}</Text>
      <Text style={styles.articleDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading articles...</Text>
      </View>
    );
  }

  if (articles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Articles Yet</Text>
        <Text style={styles.emptyText}>
          Add topics and pull to refresh to fetch articles
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh Feed</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  articleCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
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
  readArticle: {
    opacity: 0.7,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicTag: {
    backgroundColor: '#007AFF',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  publishedDate: {
    fontSize: 12,
    color: '#666',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  articleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});