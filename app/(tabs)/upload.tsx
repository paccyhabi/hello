import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Video, Music, Hash, MapPin, Users } from 'lucide-react-native';

export default function UploadScreen() {
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleRecord = () => {
    Alert.alert('Camera', 'Opening camera to record video...');
  };

  const handleUpload = () => {
    Alert.alert('Upload', 'Uploading video...');
  };

  const handleAddMusic = () => {
    Alert.alert('Music', 'Select music for your video...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Video</Text>
          <TouchableOpacity style={styles.publishButton} onPress={handleUpload}>
            <Text style={styles.publishButtonText}>Publish</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recordSection}>
          <TouchableOpacity style={styles.recordButton} onPress={handleRecord}>
            <Camera size={32} color="#fff" />
            <Text style={styles.recordButtonText}>Record Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadButton}>
            <Video size={24} color="#FF6B6B" />
            <Text style={styles.uploadButtonText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell us about your video..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hashtags</Text>
            <View style={styles.hashtagInput}>
              <Hash size={20} color="#FF6B6B" />
              <TextInput
                style={styles.input}
                placeholder="trending dance challenge"
                placeholderTextColor="#666"
                value={hashtags}
                onChangeText={setHashtags}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.optionButton} onPress={handleAddMusic}>
            <Music size={24} color="#4ECDC4" />
            <Text style={styles.optionText}>Add Music</Text>
            <Text style={styles.optionSubtext}>Choose from trending sounds</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <MapPin size={24} color="#FFE66D" />
            <Text style={styles.optionText}>Add Location</Text>
            <Text style={styles.optionSubtext}>Let people know where you are</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setIsPrivate(!isPrivate)}>
            <Users size={24} color={isPrivate ? '#666' : '#4ECDC4'} />
            <Text style={styles.optionText}>
              {isPrivate ? 'Private' : 'Public'}
            </Text>
            <Text style={styles.optionSubtext}>
              {isPrivate ? 'Only you can see this' : 'Everyone can see this'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips for viral videos:</Text>
          <Text style={styles.tip}>• Keep it under 30 seconds</Text>
          <Text style={styles.tip}>• Use trending sounds</Text>
          <Text style={styles.tip}>• Add engaging captions</Text>
          <Text style={styles.tip}>• Post at peak hours</Text>
        </View>
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
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  publishButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recordSection: {
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  uploadButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hashtagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    gap: 16,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  optionSubtext: {
    color: '#666',
    fontSize: 12,
    flex: 1,
  },
  tips: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    margin: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tip: {
    color: '#4ECDC4',
    fontSize: 14,
    marginBottom: 4,
  },
});