import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, TrendingUp, Hash, Music } from 'lucide-react-native';
import { mockUsers, mockTrends } from '@/data/mockData';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderUser = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.userItem}>
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userStats}>
          {item.followers} followers • {item.points} points
        </Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTrend = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.trendItem}>
      <View style={styles.trendIcon}>
        {item.type === 'hashtag' ? (
          <Hash size={20} color="#FF6B6B" />
        ) : (
          <Music size={20} color="#4ECDC4" />
        )}
      </View>
      <View style={styles.trendInfo}>
        <Text style={styles.trendTitle}>{item.title}</Text>
        <Text style={styles.trendStats}>{item.count} videos</Text>
      </View>
      <TrendingUp size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users, hashtags, music..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}>
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trends' && styles.activeTab]}
          onPress={() => setActiveTab('trends')}>
          <Text style={[styles.tabText, activeTab === 'trends' && styles.activeTabText]}>
            Trending
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'users' ? (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={item => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={mockTrends}
          renderItem={renderTrend}
          keyExtractor={item => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeTab: {
    backgroundColor: '#FF6B6B',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userStats: {
    color: '#666',
    fontSize: 12,
  },
  followButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  trendIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trendInfo: {
    flex: 1,
  },
  trendTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendStats: {
    color: '#666',
    fontSize: 12,
  },
});