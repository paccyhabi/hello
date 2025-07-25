import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Share, UserPlus, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import VideoPlayer from '@/components/VideoPlayer';
import { mockVideos } from '@/data/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [videos, setVideos] = useState(mockVideos);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleLike = (videoId: string) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.id === videoId
          ? { ...video, likes: video.isLiked ? video.likes - 1 : video.likes + 1, isLiked: !video.isLiked }
          : video
      )
    );
  };

  const handleFollow = (userId: string) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.user.id === userId
          ? { ...video, user: { ...video.user, isFollowing: !video.user.isFollowing } }
          : video
      )
    );
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / SCREEN_HEIGHT);
    setCurrentVideoIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* 🔍 Search Icon Top Right */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('../search/')}>
          <Search size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}>
        {videos.map((video, index) => (
          <View key={video.id} style={styles.videoContainer}>
            <VideoPlayer
              uri={video.videoUrl}
              isPlaying={index === currentVideoIndex}
              style={styles.video}
            />

            <View style={styles.overlay}>
              <View style={styles.rightActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(video.id)}>
                  <Heart
                    size={32}
                    color={video.isLiked ? '#FF6B6B' : '#fff'}
                    fill={video.isLiked ? '#FF6B6B' : 'none'}
                  />
                  <Text style={styles.actionText}>{video.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <MessageCircle size={32} color="#fff" />
                  <Text style={styles.actionText}>{video.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Share size={32} color="#fff" />
                  <Text style={styles.actionText}>{video.shares}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.profileButton}>
                  <Image source={{ uri: video.user.avatar }} style={styles.avatar} />
                  {!video.user.isFollowing && (
                    <TouchableOpacity
                      style={styles.followButton}
                      onPress={() => handleFollow(video.user.id)}>
                      <UserPlus size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.bottomInfo}>
                <Text style={styles.username}>@{video.user.username}</Text>
                <Text style={styles.description}>{video.description}</Text>
                <Text style={styles.music}>♪ {video.music}</Text>
              </View>
            </View>
          </View>
        ))}
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
  topBar: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  rightActions: {
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileButton: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  followButton: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    flex: 1,
    paddingRight: 80,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  music: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
});
