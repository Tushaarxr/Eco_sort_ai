import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  // If already signed in, redirect to home/scan page
  if (isSignedIn) {
    return <Redirect href={'/(main)/scan'} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: 'Sign In',
          headerShown: true
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Create Account',
          headerShown: true
        }}
      />
      <Stack.Screen
        name="password-reset"
        options={{
          title: 'Reset Password',
          headerShown: true
        }}
      />
    </Stack>
  );
}
