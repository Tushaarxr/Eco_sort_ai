import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../styles/colors';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      // Navigation not needed as the AuthContext will automatically update
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/icons/app-logo.png')}
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
          onPress={() => navigation.navigate(ROUTES.PASSWORD_RESET)}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
            <Text style={styles.registerText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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

export default LoginScreen;
