import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { Topic } from '../types';
import { StorageService } from '../services/StorageService';

export const TopicsScreen: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicName, setTopicName] = useState('');
  const [topicQuery, setTopicQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const topicsData = await StorageService.getTopics();
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const handleAddTopic = () => {
    setEditingTopic(null);
    setTopicName('');
    setTopicQuery('');
    setNotificationsEnabled(true);
    setModalVisible(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicName(topic.name);
    setTopicQuery(topic.query);
    setNotificationsEnabled(topic.notificationsEnabled);
    setModalVisible(true);
  };

  const handleSaveTopic = async () => {
    if (!topicName.trim() || !topicQuery.trim()) {
      Alert.alert('Error', 'Please fill in both topic name and search query');
      return;
    }

    try {
      const now = new Date();
      
      if (editingTopic) {
        const updatedTopics = topics.map(topic =>
          topic.id === editingTopic.id
            ? {
                ...topic,
                name: topicName.trim(),
                query: topicQuery.trim(),
                notificationsEnabled,
                lastUpdated: now,
              }
            : topic
        );
        setTopics(updatedTopics);
        await StorageService.saveTopics(updatedTopics);
      } else {
        const newTopic: Topic = {
          id: Date.now().toString(),
          name: topicName.trim(),
          query: topicQuery.trim(),
          isActive: true,
          notificationsEnabled,
          createdAt: now,
          lastUpdated: now,
        };
        const updatedTopics = [...topics, newTopic];
        setTopics(updatedTopics);
        await StorageService.saveTopics(updatedTopics);
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error saving topic:', error);
      Alert.alert('Error', 'Failed to save topic');
    }
  };

  const handleDeleteTopic = (topic: Topic) => {
    Alert.alert(
      'Delete Topic',
      `Are you sure you want to delete "${topic.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTopics = topics.filter(t => t.id !== topic.id);
              setTopics(updatedTopics);
              await StorageService.saveTopics(updatedTopics);
            } catch (error) {
              console.error('Error deleting topic:', error);
              Alert.alert('Error', 'Failed to delete topic');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (topic: Topic) => {
    try {
      const updatedTopics = topics.map(t =>
        t.id === topic.id
          ? { ...t, isActive: !t.isActive, lastUpdated: new Date() }
          : t
      );
      setTopics(updatedTopics);
      await StorageService.saveTopics(updatedTopics);
    } catch (error) {
      console.error('Error toggling topic:', error);
      Alert.alert('Error', 'Failed to update topic');
    }
  };

  const renderTopic = ({ item }: { item: Topic }) => (
    <View style={styles.topicCard}>
      <View style={styles.topicHeader}>
        <Text style={styles.topicName}>{item.name}</Text>
        <Switch
          value={item.isActive}
          onValueChange={() => handleToggleActive(item)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={item.isActive ? '#007AFF' : '#f4f3f4'}
        />
      </View>
      <Text style={styles.topicQuery}>{item.query}</Text>
      <View style={styles.topicFooter}>
        <View style={styles.topicMeta}>
          <Text style={styles.metaText}>
            Notifications: {item.notificationsEnabled ? 'On' : 'Off'}
          </Text>
          <Text style={styles.metaText}>
            Updated: {new Date(item.lastUpdated).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.topicActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditTopic(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteTopic(item)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={topics}
        renderItem={renderTopic}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity style={styles.addButton} onPress={handleAddTopic}>
        <Text style={styles.addButtonText}>+ Add Topic</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTopic ? 'Edit Topic' : 'Add New Topic'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Topic Name"
              value={topicName}
              onChangeText={setTopicName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Search Query"
              value={topicQuery}
              onChangeText={setTopicQuery}
              multiline
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Enable Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={notificationsEnabled ? '#007AFF' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTopic}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  topicCard: {
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
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  topicQuery: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  topicFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicMeta: {
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  topicActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: 'white',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});