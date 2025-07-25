import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, CreditCard as Edit, Crown, Gift, CreditCard, Wallet, Award, Star, Grid3x3, Heart } from 'lucide-react-native';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('videos');
  const [user] = useState({
    id: 'user123',
    username: 'john_doe',
    displayName: 'John Doe',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    followers: 12500,
    following: 892,
    points: 25480,
    level: 'Gold',
    videos: 45,
    likes: 156789,
    bio: 'Content creator | Dancing enthusiast | Spreading positivity ✨',
    achievements: [
      { id: '1', title: 'Viral Video', description: '100K+ views', icon: '🔥' },
      { id: '2', title: 'Popular Creator', description: '10K+ followers', icon: '⭐' },
      { id: '3', title: 'Engagement King', description: '50K+ likes', icon: '❤️' },
    ],
  });

  const renderVideo = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.videoThumbnail}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnailImage} />
      <View style={styles.videoStats}>
        <Text style={styles.videoViews}>{item.views}</Text>
      </View>
    </TouchableOpacity>
  );

  const mockVideos = [
    { id: '1', thumbnail: 'https://images.pexels.com/photos/3030256/pexels-photo-3030256.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1', views: '12K' },
    { id: '2', thumbnail: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1', views: '8.5K' },
    { id: '3', thumbnail: 'https://images.pexels.com/photos/1701202/pexels-photo-1701202.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1', views: '25K' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.username}>@{user.username}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Edit size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.levelBadge}>
              <Crown size={16} color="#FFD700" />
              <Text style={styles.levelText}>{user.level}</Text>
            </View>
          </View>

          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.bio}>{user.bio}</Text>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.followers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.following.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.videos}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.likes.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>

          <View style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <View style={styles.pointsInfo}>
                <Text style={styles.pointsValue}>{user.points.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>Points</Text>
              </View>
              <TouchableOpacity style={styles.withdrawButton}>
                <Wallet size={20} color="#fff" />
                <Text style={styles.withdrawText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pointsActions}>
              <TouchableOpacity style={styles.pointsAction}>
                <CreditCard size={20} color="#4ECDC4" />
                <Text style={styles.pointsActionText}>Buy Points</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pointsAction}>
                <Gift size={20} color="#FFE66D" />
                <Text style={styles.pointsActionText}>Send Gift</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.achievements}>
            <Text style={styles.achievementsTitle}>Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.achievementsList}>
                {user.achievements.map((achievement) => (
                  <View key={achievement.id} style={styles.achievementItem}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
            onPress={() => setActiveTab('videos')}>
            <Grid3x3 size={20} color={activeTab === 'videos' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
              Videos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
            onPress={() => setActiveTab('liked')}>
            <Heart size={20} color={activeTab === 'liked' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'liked' && styles.activeTabText]}>
              Liked
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={mockVideos}
          renderItem={renderVideo}
          keyExtractor={item => item.id}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.videoGrid}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: '#000',
  },
  levelText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
  },
  displayName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  pointsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsInfo: {
    alignItems: 'center',
  },
  pointsValue: {
    color: '#FFE66D',
    fontSize: 24,
    fontWeight: 'bold',
  },
  pointsLabel: {
    color: '#666',
    fontSize: 12,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  withdrawText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pointsActions: {
    flexDirection: 'row',
    gap: 16,
  },
  pointsAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  pointsActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  achievements: {
    width: '100%',
    marginBottom: 24,
  },
  achievementsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  achievementsList: {
    flexDirection: 'row',
    gap: 12,
  },
  achievementItem: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDescription: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  videoGrid: {
    paddingHorizontal: 16,
  },
  videoThumbnail: {
    flex: 1,
    aspectRatio: 9 / 16,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoStats: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoViews: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});