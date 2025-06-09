// src/navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../components/auth/LoginScreen';
import RegisterScreen from '../components/auth/RegisterScreen';
import PasswordResetScreen from '../components/auth/PasswordResetScreen';
import { ROUTES } from '../constants/routes';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName={ROUTES.LOGIN}
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name={ROUTES.LOGIN} 
        component={LoginScreen} 
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen 
        name={ROUTES.REGISTER} 
        component={RegisterScreen} 
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen 
        name={ROUTES.PASSWORD_RESET} 
        component={PasswordResetScreen} 
        options={{ title: 'Reset Password' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
