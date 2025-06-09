import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS } from '../../src/styles/colors';
import { FirebaseError } from 'firebase/app';

export default function RegisterScreen() {
  const { register } = useAuth();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState<boolean>(true);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await register(email, password);
      // Successful registration will automatically redirect via useEffect in root
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if ((error as FirebaseError).code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      } else if ((error as FirebaseError).code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email';
      } else if ((error as FirebaseError).code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the e-waste recycling community</Text>
        
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
        
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={secureConfirmTextEntry}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="lock-check" />}
          right={
            <TextInput.Icon
              icon={secureConfirmTextEntry ? 'eye' : 'eye-off'}
              onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
            />
          }
        />
        
        {error ? <HelperText type="error">{error}</HelperText> : null}
        
        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Sign Up
        </Button>
        
        <View style={styles.loginContainer}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
