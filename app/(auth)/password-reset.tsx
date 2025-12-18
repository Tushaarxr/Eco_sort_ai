import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { COLORS } from '../../src/styles/colors';

export default function PasswordResetScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [successfulCreation, setSuccessfulCreation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Step 1: Request password reset code
  const sendResetCode = async () => {
    if (!isLoaded) return;

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setSuccessfulCreation(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Failed to send reset email';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with code
  const resetPassword = async () => {
    if (!isLoaded) return;

    if (!code || !password) {
      setError('Please provide code and new password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(main)/scan');
      } else {
        console.error(JSON.stringify(result, null, 2));
        setError('Password reset incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Failed to reset password';
      setError(message);
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
          {!successfulCreation
            ? "Enter your email address and we'll send you a code to reset your password"
            : `Enter the code sent to ${email} and your new password`}
        </Text>

        {!successfulCreation ? (
          <>
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
              onPress={sendResetCode}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Send Reset Code
            </Button>
          </>
        ) : (
          <>
            <TextInput
              label="Verification Code"
              value={code}
              onChangeText={setCode}
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
              left={<TextInput.Icon icon="shield-check" />}
            />

            <TextInput
              label="New Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
            />

            {error ? <HelperText type="error">{error}</HelperText> : null}

            <Button
              mode="contained"
              onPress={resetPassword}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Set New Password
            </Button>
          </>
        )}

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.backContainer}
        >
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
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
