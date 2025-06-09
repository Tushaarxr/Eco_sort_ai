import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TextInput, Button, Text, HelperText, Snackbar } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS } from '../../src/styles/colors';
import { FirebaseError } from 'firebase/app';

export default function PasswordResetScreen() {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await resetPassword(email);
      setShowSuccessMessage(true);
    } catch (error) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      if ((error as FirebaseError).code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if ((error as FirebaseError).code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Image
          source={require('../../assets/icons/reset-password.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password
        </Text>
        
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
        
        {error ? <HelperText type="error">{error}</HelperText> : null}
        
        <Button
          mode="contained"
          onPress={handlePasswordReset}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Send Reset Link
        </Button>
        
        <TouchableOpacity 
          onPress={() => router.push('/login')}
          style={styles.backContainer}
        >
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
      
      <Snackbar
        visible={showSuccessMessage}
        onDismiss={() => setShowSuccessMessage(false)}
        duration={4000}
        action={{
          label: 'OK',
          onPress: () => router.push('/login'),
        }}
      >
        Password reset email sent successfully!
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 8,
  },
  backContainer: {
    marginTop: 20,
  },
  backText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
