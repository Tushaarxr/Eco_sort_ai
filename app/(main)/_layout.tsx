import React, { useEffect } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS } from '../../src/styles/colors';

export default function MainLayout() {
  const { user, loading } = useAuth();

  // Check if user is authenticated
  if (!loading && !user) {
    return <Redirect href="/login" />;
  }

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="camera" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="repository"
        options={{
          title: 'Repository',
          tabBarLabel: 'Repository',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="database-search" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="recycling-centers/index"
        options={{
          title: 'Recycling Centers',
          tabBarLabel: 'Recycling',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="recycle-variant" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
