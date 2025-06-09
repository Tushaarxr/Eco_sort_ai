import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Avatar, Divider, ActivityIndicator, List } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../../src/hooks/useAuth';
import { getUserScans } from '../../../src/api/firebaseService';
import { COLORS } from '../../../src/styles/colors';
import { ScanResult } from '../../../src/types';

interface ScanStatistics {
  totalScans: number;
  itemsByHazard: {
    Low: number;
    Medium: number;
    High: number;
    [key: string]: number;
  };
  mostScannedItem: string | null;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<ScanStatistics>({
    totalScans: 0,
    itemsByHazard: { Low: 0, Medium: 0, High: 0 },
    mostScannedItem: null,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userScans = await getUserScans(user.uid);
      setScans(userScans);
      
      // Calculate stats
      const itemCount: Record<string, number> = {};
      const hazardCount: { [key: string]: number; Low: number; Medium: number; High: number; } = { 
        Low: 0, 
        Medium: 0, 
        High: 0 
      };
      
      userScans.forEach(scan => {
        // Count item types
        const itemType = scan.itemType || scan.type || 'Unknown';
        itemCount[itemType] = (itemCount[itemType] || 0) + 1;
        
        // Count hazard levels
        const hazardLevel = scan.hazardLevel || 'Unknown';
        if (hazardLevel in hazardCount) {
          hazardCount[hazardLevel]++;
        }
      });
      
      // Find most scanned item
      let mostScannedItem: string | null = null;
      let maxCount = 0;
      
      Object.entries(itemCount).forEach(([item, count]) => {
        if (count > maxCount) {
          mostScannedItem = item;
          maxCount = count;
        }
      });
      
      setStats({
        totalScans: userScans.length,
        itemsByHazard: hazardCount,
        mostScannedItem: mostScannedItem ? `${mostScannedItem} (${maxCount})` : 'None',
      });
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert(
        'Error',
        'Failed to load your profile data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      // Redirect will happen automatically through auth context
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const renderScanItem = ({ item }: { item: ScanResult }) => (
    <Card 
      style={styles.scanCard}
      onPress={() => router.push({
        pathname: '/scan/disposal-guide',
        params: { itemData: JSON.stringify(item) }
      })}
    >
      {item.imageUrl && (
        <Card.Cover source={{ uri: item.imageUrl }} style={styles.scanImage} />
      )}
      <Card.Content>
        <Text style={styles.scanType}>{item.itemType || item.type || 'Unknown Item'}</Text>
        <Text style={styles.scanDate}>
          {item.timestamp && typeof item.timestamp.toDate === 'function' 
            ? new Date(item.timestamp.toDate()).toLocaleString()
            : 'Unknown date'}
        </Text>
        
        <View style={styles.hazardView}>
          <Text>Hazard: </Text>
          <View style={[
            styles.hazardBadge,
            item.hazardLevel === 'Low' && styles.lowHazard,
            item.hazardLevel === 'Medium' && styles.mediumHazard,
            item.hazardLevel === 'High' && styles.highHazard,
          ]}>
            <Text style={styles.hazardText}>{item.hazardLevel || 'Unknown'}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user?.email?.charAt(0)?.toUpperCase() || 'U'}
          style={{ backgroundColor: COLORS.primary }}
        />
        <View style={styles.userInfo}>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.memberSince}>
            Member since {user?.metadata?.creationTime 
              ? new Date(user.metadata.creationTime).toLocaleDateString() 
              : 'Unknown'}
          </Text>
        </View>
      </View>
      
      <Card style={styles.statsCard}>
        <Card.Title title="Your Recycling Impact" />
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalScans}</Text>
              <Text style={styles.statLabel}>Items Scanned</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.itemsByHazard.High}</Text>
              <Text style={styles.statLabel}>High Hazard Items</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.itemsByHazard.Low + stats.itemsByHazard.Medium}</Text>
              <Text style={styles.statLabel}>Safe Disposals</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Most Scanned Item"
            description={stats.mostScannedItem}
            left={props => <List.Icon {...props} icon="trending-up" />}
          />
        </Card.Content>
      </Card>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        <TouchableOpacity onPress={fetchUserData}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {scans.length > 0 ? (
        <FlatList
          data={scans.slice(0, 5)}
          renderItem={renderScanItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          scrollEnabled={false}
        />
      ) : (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>You haven't scanned any items yet.</Text>
            <Button
              mode="contained"
              icon="camera"
              onPress={() => router.push('/scan')}
              style={styles.scanButton}
            >
              Scan an Item
            </Button>
          </Card.Content>
        </Card>
      )}
      
      <Button
        mode="outlined"
        icon="logout"
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Log Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberSince: {
    color: '#666',
    marginTop: 4,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshText: {
    color: COLORS.primary,
  },
  scanCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  scanImage: {
    height: 120,
  },
  scanType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  scanDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  hazardView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  hazardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hazardText: {
    fontSize: 12,
    color: '#fff',
  },
  lowHazard: {
    backgroundColor: COLORS.hazardLow,
  },
  mediumHazard: {
    backgroundColor: COLORS.hazardMedium,
  },
  highHazard: {
    backgroundColor: COLORS.hazardHigh,
  },
  emptyCard: {
    margin: 16,
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  scanButton: {
    marginTop: 8,
  },
  logoutButton: {
    margin: 16,
    marginTop: 24,
    marginBottom: 32,
  },
});
