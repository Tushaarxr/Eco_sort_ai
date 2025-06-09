import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../src/styles/colors';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Redirect based on authentication status
  if (user) {
    return <Redirect href="/(main)/scan" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
