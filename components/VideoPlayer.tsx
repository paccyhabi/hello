import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Play, Pause } from 'lucide-react-native';

interface VideoPlayerProps {
  uri: string;
  isPlaying: boolean;
  style?: ViewStyle;
}

export default function VideoPlayer({ uri, isPlaying, style }: VideoPlayerProps) {
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [localPlaying, setLocalPlaying] = useState(false);

  useEffect(() => {
    setLocalPlaying(isPlaying);
  }, [isPlaying]);

  const handlePress = () => {
    setLocalPlaying(!localPlaying);
    setShowPlayButton(!showPlayButton);
    
    // Hide play button after 2 seconds
    if (!localPlaying) {
      setTimeout(() => setShowPlayButton(false), 2000);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Video placeholder - would be replaced with actual video component */}
      <View style={styles.videoPlaceholder}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePress}
          activeOpacity={0.7}>
          {(!localPlaying || showPlayButton) && (
            <View style={styles.playButtonContainer}>
              {localPlaying ? (
                <Pause size={32} color="#fff" />
              ) : (
                <Play size={32} color="#fff" />
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});