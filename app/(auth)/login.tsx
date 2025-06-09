import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS } from '../../src/styles/colors';
import { FirebaseError } from 'firebase/app';
import NetInfo from '@react-native-community/netinfo';

export default function LoginScreen() {
  const { login } = useAuth();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Check network connection
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      setError('No internet connection');
      return;
    }

    // Simple email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      router.replace('/(main)/scan'); // Explicit navigation
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      const firebaseError = error as FirebaseError;
      
      switch(firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Try again later';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Check your connection';
          break;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icons/app-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>E-Waste Assistant</Text>
          <Text style={styles.tagline}>Responsible recycling made easy</Text>
        </View>

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
            disabled={loading}
            style={styles.button}
          >
            Sign In
          </Button>
          
          <TouchableOpacity
            onPress={() => router.push('/password-reset')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <View style={styles.registerContainer}>
            <Text>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPassword: {
    color: COLORS.primary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});


