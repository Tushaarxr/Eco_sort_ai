import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  // If already signed in, redirect to home/scan page
  if (isSignedIn) {
    return <Redirect href={'/(main)/scan'} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="password-reset" />
    </Stack>
  );
}
