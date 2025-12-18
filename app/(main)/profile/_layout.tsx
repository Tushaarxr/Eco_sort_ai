import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="api-test"
        options={{
          title: 'API Test',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
