import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSignIn, useOAuth, useAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { COLORS } from '../../src/styles/colors';

// Warm up the browser for faster OAuth - MUST be called at module level
WebBrowser.maybeCompleteAuthSession();

// Custom hook for warming up browser
const useWarmUpBrowser = () => {
  useEffect(() => {
    // Warm up browser on Android for faster OAuth
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function LoginScreen() {
  // Warm up browser for OAuth
  useWarmUpBrowser();

  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(main)/scan');
    }
  }, [isSignedIn]);

  const handleLogin = async () => {
    if (!isLoaded) return;

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(main)/scan');
      } else {
        setError('Sign in incomplete. Please try again.');
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setGoogleLoading(true);
      setError('');

      // Create the OAuth redirect URL using the app scheme
      const redirectUrl = Linking.createURL('/');
      console.log('OAuth redirect URL:', redirectUrl);

      const result = await startOAuthFlow({
        redirectUrl,
      });

      console.log('OAuth result:', JSON.stringify(result, null, 2));

      const { createdSessionId, signIn: oAuthSignIn, signUp: oAuthSignUp, setActive: setOAuthActive } = result;

      // If we have a created session, set it as active
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        console.log('Session activated, redirecting...');
        router.replace('/(main)/scan');
        return;
      }

      // If sign up has missing requirements (like username), complete it
      if (oAuthSignUp && oAuthSignUp.status === 'missing_requirements') {
        console.log('Sign up missing requirements:', oAuthSignUp.missingFields);

        // Check if username is the missing field
        if (oAuthSignUp.missingFields?.includes('username')) {
          // Generate a unique username from email or name
          const emailBase = oAuthSignUp.emailAddress?.split('@')[0] || '';
          const randomSuffix = Math.floor(Math.random() * 10000);
          const generatedUsername = `${emailBase}${randomSuffix}`.toLowerCase().replace(/[^a-z0-9_]/g, '');

          console.log('Auto-generating username:', generatedUsername);

          try {
            // Update the sign-up with the generated username
            const updatedSignUp = await oAuthSignUp.update({
              username: generatedUsername,
            });

            console.log('Sign up updated, status:', updatedSignUp.status);

            // If complete now, set session active
            if (updatedSignUp.status === 'complete' && updatedSignUp.createdSessionId) {
              await setOAuthActive?.({ session: updatedSignUp.createdSessionId });
              router.replace('/(main)/scan');
              return;
            }
          } catch (updateError: any) {
            console.error('Error updating sign-up:', updateError);
            // If username generation failed, ask user to register normally
            setError('Please complete registration with email.');
            return;
          }
        }
      }

      // If sign up is complete (new user)
      if (oAuthSignUp && oAuthSignUp.status === 'complete' && oAuthSignUp.createdSessionId) {
        await setOAuthActive?.({ session: oAuthSignUp.createdSessionId });
        router.replace('/(main)/scan');
        return;
      }

      // If sign in is complete (existing user)
      if (oAuthSignIn && oAuthSignIn.status === 'complete' && oAuthSignIn.createdSessionId) {
        await setOAuthActive?.({ session: oAuthSignIn.createdSessionId });
        router.replace('/(main)/scan');
        return;
      }

      // Check for transferable verification (user exists but needs to be linked)
      if (oAuthSignIn?.firstFactorVerification?.status === 'transferable') {
        console.log('Transferable verification - attempting to transfer to sign up');

        try {
          // Transfer the external account to sign up
          const transferResult = await oAuthSignUp?.update({});
          console.log('Transfer result:', transferResult?.status);

          if (transferResult?.status === 'complete' && transferResult?.createdSessionId) {
            await setOAuthActive?.({ session: transferResult.createdSessionId });
            router.replace('/(main)/scan');
            return;
          }
        } catch (transferError) {
          console.error('Transfer error:', transferError);
        }
      }

      // If we get here, something went wrong
      console.log('OAuth flow did not complete.');
      setError('Sign in was cancelled or incomplete. Please try again.');

    } catch (err: any) {
      console.error('Google OAuth error:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));

      // Handle specific error cases
      if (err.message?.includes('cancelled') || err.message?.includes('dismissed')) {
        setError('Sign in was cancelled.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [startOAuthFlow, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/icons/app-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>E-Waste Assistant</Text>
            <Text style={styles.tagline}>Responsible recycling made easy</Text>
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#333" />
            ) : (
              <>
                <Image
                  source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email/Password Form */}
          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? 'eye' : 'eye-off'}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
            />

            {error ? <HelperText type="error">{error}</HelperText> : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading || googleLoading}
              style={styles.button}
            >
              Sign In
            </Button>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/password-reset')}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerLabel}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 12,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 14,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPassword: {
    color: COLORS.primary,
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerLabel: {
    fontSize: 14,
    color: '#666',
  },
  registerText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
