import { Stack } from 'expo-router';

export default function RepositoryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'E-Waste Repository',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          title: 'Browse Categories',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[itemId]"
        options={{
          title: 'Item Details',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
