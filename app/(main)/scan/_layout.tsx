import { Stack } from 'expo-router';

export default function ScanLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Scan E-Waste',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: 'Analysis Results',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="disposal-guide"
        options={{
          title: 'Disposal Guide',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
