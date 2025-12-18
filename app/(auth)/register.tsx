import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { COLORS } from '../../src/styles/colors';

export default function RegisterScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [pendingVerification, setPendingVerification] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState<boolean>(true);

  // Handle sign-up form submission
  const handleRegister = async () => {
    if (!isLoaded) return;

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Start the sign-up process with username
      await signUp.create({
        username,
        emailAddress: email,
        password,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Switch to verification form
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      // Handle specific error codes
      const errorCode = err.errors?.[0]?.code;
      let message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Registration failed';

      if (errorCode === 'form_password_pwned') {
        message = 'This password was found in a data breach. Please use a different, unique password.';
      } else if (errorCode === 'form_identifier_exists') {
        message = 'This email or username is already taken.';
      } else if (errorCode === 'form_username_invalid_length') {
        message = 'Username must be between 4 and 64 characters.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle verification code submission
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/(main)/scan');
      } else {
        console.log('Sign up attempt result:', JSON.stringify(signUpAttempt, null, 2));

        // Check if username is still missing
        if (signUpAttempt.missingFields?.includes('username')) {
          setError('Username is required. Please go back and add a username.');
        } else {
          setError('Verification incomplete. Please try again.');
        }
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      const errorCode = err.errors?.[0]?.code;
      let message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Verification failed';

      if (errorCode === 'verification_already_verified') {
        // Email already verified, try to complete signup
        try {
          if (signUp.status === 'complete' && signUp.createdSessionId) {
            await setActive({ session: signUp.createdSessionId });
            router.replace('/(main)/scan');
            return;
          }
        } catch {
          // ignore
        }
        message = 'Email already verified. Try signing in instead.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the e-waste recycling community</Text>

        {!pendingVerification ? (
          <>
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

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

            <Text style={styles.passwordHint}>
              Use a unique password (not used on other sites)
            </Text>

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
          </>
        ) : (
          <>
            <Text style={styles.verifyText}>
              A verification code has been sent to {email}
            </Text>
            <TextInput
              label="Verification Code"
              value={code}
              onChangeText={setCode}
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
              left={<TextInput.Icon icon="shield-check" />}
            />

            {error ? <HelperText type="error">{error}</HelperText> : null}

            <Button
              mode="contained"
              onPress={onVerifyPress}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Verify Email
            </Button>

            <Button
              mode="text"
              onPress={() => setPendingVerification(false)}
              style={styles.backButton}
            >
              Back to Registration
            </Button>
          </>
        )}

        <View style={styles.loginContainer}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
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
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 10,
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
  verifyText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontSize: 16,
  },
  passwordHint: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    marginLeft: 4,
  },
});
