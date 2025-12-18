// src/navigation/MainNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CameraScreen from '../components/scanning/CameraScreen';
import ResultScreen from '../components/scanning/ResultScreen';
import DisposalGuideScreen from '../components/solutions/DisposalGuideScreen';
import RecyclingCentersScreen from '../components/solutions/RecyclingCentersScreen';
import SearchScreen from '../components/repository/SearchScreen';
import CategoryBrowserScreen from '../components/repository/CategoryBrowserScreen';
import ProfileScreen from '../components/profile/ProfileScreen';
import { ROUTES } from '../constants/routes';
import FirebaseTestScreen from '../components/FirebaseTestScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each main section
const ScanningStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FirebaseTest" component={FirebaseTestScreen} />
    <Stack.Screen name={ROUTES.CAMERA} component={CameraScreen} options={{ headerShown: false }} />
    <Stack.Screen name={ROUTES.RESULT} component={ResultScreen} options={{ title: 'Analysis Results' }} />
    <Stack.Screen name={ROUTES.DISPOSAL_GUIDE} component={DisposalGuideScreen} options={{ title: 'Disposal Guide' }} />
  </Stack.Navigator>
);

const RepositoryStack = () => (
  <Stack.Navigator>
    <Stack.Screen name={ROUTES.SEARCH} component={SearchScreen} options={{ title: 'E-Waste Repository' }} />
    <Stack.Screen name={ROUTES.CATEGORIES} component={CategoryBrowserScreen} options={{ title: 'Browse Categories' }} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen 
        name="ScanTab" 
        component={ScanningStack} 
        options={{
          tabBarLabel: 'Scan',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="camera" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="RepositoryTab" 
        component={RepositoryStack} 
        options={{
          tabBarLabel: 'Repository',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="database-search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="RecyclingCenters" 
        component={RecyclingCentersScreen} 
        options={{
          tabBarLabel: 'Recycling',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="recycle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
