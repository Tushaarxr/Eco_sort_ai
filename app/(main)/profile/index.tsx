import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, SafeAreaView, StatusBar } from 'react-native';
import { Text, Card, Button, Avatar, Divider, ActivityIndicator, List, IconButton, TextInput, Portal, Modal } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { getUserScans } from '../../../src/api/supabaseService';
import { COLORS } from '../../../src/styles/colors';
import { ScanResult } from '../../../src/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ScanStatistics {
  totalScans: number;
  itemsByHazard: {
    low: number;
    medium: number;
    high: number;
  };
  mostScannedItem: string | null;
  lastScanDate: Date | null;
}

export default function ProfileScreen() {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [stats, setStats] = useState<ScanStatistics>({
    totalScans: 0,
    itemsByHazard: { low: 0, medium: 0, high: 0 },
    mostScannedItem: null,
    lastScanDate: null,
  });

  // Edit profile modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchUserData = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const { scans: userScans } = await getUserScans(null as any, userId);
      setScans(userScans);

      // Calculate stats
      const hazardCount = { low: 0, medium: 0, high: 0 };
      const itemCount: Record<string, number> = {};
      let lastDate: Date | null = null;

      userScans.forEach((scan: ScanResult) => {
        const itemType = scan.itemType || scan.type || 'Unknown';
        itemCount[itemType] = (itemCount[itemType] || 0) + 1;

        const hazard = (scan.hazardLevel || 'medium').toLowerCase() as 'low' | 'medium' | 'high';
        if (hazard in hazardCount) {
          hazardCount[hazard]++;
        }

        if (scan.timestamp && (!lastDate || new Date(scan.timestamp) > lastDate)) {
          lastDate = new Date(scan.timestamp);
        }
      });

      // Find most scanned
      let mostScanned: string | null = null;
      let maxCount = 0;
      Object.entries(itemCount).forEach(([item, count]) => {
        if (count > maxCount) {
          mostScanned = item;
          maxCount = count;
        }
      });

      setStats({
        totalScans: userScans.length,
        itemsByHazard: hazardCount,
        mostScannedItem: mostScanned,
        lastScanDate: lastDate,
      });

    } catch (error) {
      console.warn('Error fetching user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async (): Promise<void> => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!user || !newUsername.trim()) return;

    setUpdating(true);
    try {
      await user.update({ username: newUsername.trim() });
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.username) {
      return user.username;
    }
    return 'User';
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.imageUrl ? (
              <Avatar.Image size={90} source={{ uri: user.imageUrl }} />
            ) : (
              <Avatar.Text size={90} label={getInitials()} style={styles.avatar} />
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => setEditModalVisible(true)}
            >
              <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.displayName}>{getDisplayName()}</Text>
          <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => {
              setNewUsername(user?.username || '');
              setEditModalVisible(true);
            }}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="barcode-scan" size={28} color={COLORS.primary} />
              <Text style={styles.statNumber}>{stats.totalScans}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="alert-circle" size={28} color="#F44336" />
              <Text style={styles.statNumber}>{stats.itemsByHazard.high}</Text>
              <Text style={styles.statLabel}>High Risk</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="check-circle" size={28} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.itemsByHazard.low}</Text>
              <Text style={styles.statLabel}>Safe Items</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Scans Section */}
        <Card style={styles.sectionCard}>
          <Card.Title
            title="Recent Scans"
            titleStyle={styles.sectionTitle}
            right={() => (
              <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                <MaterialCommunityIcons name="refresh" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          />
          <Card.Content>
            {scans.length > 0 ? (
              scans.slice(0, 5).map((scan, index) => (
                <TouchableOpacity
                  key={scan.id || index}
                  style={styles.scanItem}
                  onPress={() => Alert.alert(
                    scan.itemType || 'Item Details',
                    `Materials: ${(scan.materials || []).join(', ') || 'Unknown'}\n\nHazard: ${scan.hazardLevel || 'Unknown'}\n\nDisposal: ${scan.disposalMethod?.substring(0, 150) || 'N/A'}...`
                  )}
                >
                  <View style={styles.scanItemLeft}>
                    <View style={[
                      styles.hazardDot,
                      {
                        backgroundColor:
                          scan.hazardLevel === 'high' ? '#F44336' :
                            scan.hazardLevel === 'medium' ? '#FF9800' : '#4CAF50'
                      }
                    ]} />
                    <View>
                      <Text style={styles.scanItemType} numberOfLines={1}>
                        {scan.itemType || scan.type || 'Unknown Item'}
                      </Text>
                      <Text style={styles.scanItemDate}>
                        {formatDate(scan.timestamp)}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyScans}>
                <MaterialCommunityIcons name="camera-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No scans yet</Text>
                <Button
                  mode="contained"
                  onPress={() => router.push('/(main)/scan')}
                  style={styles.scanNowButton}
                >
                  Scan Your First Item
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Settings Section */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Settings" titleStyle={styles.sectionTitle} />
          <Card.Content>
            <List.Item
              title="Notifications"
              description="Manage notification preferences"
              left={props => <List.Icon {...props} icon="bell-outline" color={COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available in a future update.')}
            />
            <Divider />
            <List.Item
              title="Privacy & Security"
              description="Manage your data and privacy"
              left={props => <List.Icon {...props} icon="shield-outline" color={COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available in a future update.')}
            />
            <Divider />
            <List.Item
              title="Help & Support"
              description="Get help or report issues"
              left={props => <List.Icon {...props} icon="help-circle-outline" color={COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Contact Us', 'For support, email: support@ecosort.ai')}
            />
            <Divider />
            <List.Item
              title="About EcoSort AI"
              description="Version 1.0.0"
              left={props => <List.Icon {...props} icon="information-outline" color={COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('About', 'EcoSort AI v1.0.0\n\nHelping you dispose of e-waste responsibly using AI technology.\n\n© 2024 EcoSort AI')}
            />
          </Card.Content>
        </Card>

        {/* Sign Out Button */}
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#F44336"
        >
          Sign Out
        </Button>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Edit Profile</Text>

          <TextInput
            label="Username"
            value={newUsername}
            onChangeText={setNewUsername}
            mode="outlined"
            style={styles.modalInput}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setEditModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              loading={updating}
              disabled={updating || !newUsername.trim()}
              style={styles.modalButton}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editProfileButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editProfileText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 3,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  sectionCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    marginRight: 16,
    padding: 8,
  },
  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scanItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hazardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  scanItemType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    maxWidth: 250,
  },
  scanItemDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyScans: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    marginBottom: 16,
  },
  scanNowButton: {
    marginTop: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    borderColor: '#F44336',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
});
