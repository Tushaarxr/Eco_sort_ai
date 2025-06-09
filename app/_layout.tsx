import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../src/context/AuthContext';
import { theme } from '../src/styles/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <StatusBar style="auto" />
          <Slot />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
