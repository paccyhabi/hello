import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',      // Dark background
        },
        headerTintColor: '#fff',         // White text & icons
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Discover' }} />
    </Stack>
  );
}
