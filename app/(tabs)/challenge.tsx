import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const challenges = [
  {
    id: '1',
    title: '🔥 Trending Dance Challenge',
    description: 'Upload a short dance video under 30 seconds.',
    reward: '+50 Points',
  },
  {
    id: '2',
    title: '🎤 Voice-over Skit',
    description: 'Create a funny voice-over using our sound bank.',
    reward: '+30 Points',
  },
  {
    id: '3',
    title: '🤳 15s Funny Clip',
    description: 'Make people laugh with your quick comedy.',
    reward: '+40 Points',
  },
];

const Challenge = () => {
  const renderChallenge = ({ item }: { item: typeof challenges[0] }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Text style={styles.reward}>{item.reward}</Text>
      <Text style={styles.cta}>Participate →</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔥 Featured Challenges</Text>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={renderChallenge}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default Challenge;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: '#ccc',
  },
  reward: {
    marginTop: 8,
    color: '#00FF99',
    fontWeight: 'bold',
  },
  cta: {
    marginTop: 6,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
});
