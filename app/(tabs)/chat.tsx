import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, MessageCircle, Users, Send } from 'lucide-react-native';
import { mockChats } from '@/data/mockData';

export default function ChatScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('chats');

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderChat = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.chatItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
          onPress={() => setActiveTab('chats')}>
          <MessageCircle size={20} color={activeTab === 'chats' ? '#fff' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>
            Chats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}>
          <Users size={20} color={activeTab === 'groups' ? '#fff' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            Groups
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChat}
        keyExtractor={item => item.id}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <Send size={20} color="#4ECDC4" />
          <Text style={styles.quickActionText}>Send Points</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Users size={20} color="#FFE66D" />
          <Text style={styles.quickActionText}>Create Group</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  newChatButton: {
    backgroundColor: '#FF6B6B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
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
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
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
  chatList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: '#000',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatTime: {
    color: '#666',
    fontSize: 12,
  },
  lastMessage: {
    color: '#666',
    fontSize: 14,
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});