import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../contexts/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    console.log('📱 SettingsScreen received user:', user);
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={
            user?.avatar
              ? { uri: user.avatar }
              : require('../../assets/images/profile.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.userName}>
          {user?.name || user?.username || 'Unknown User'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email || 'No email'}
        </Text>
      </View>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('AccountSettings')}>
        <Icon name="account" size={24} color="#007bff" />
        <Text style={styles.settingText}>Account Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('NotificationSettings')}>
        <Icon name="bell-outline" size={24} color="#007bff" />
        <Text style={styles.settingText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Subscription')}>
        <Icon name="credit-card-outline" size={24} color="#007bff" />
        <Text style={styles.settingText}>Subscription</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Privacy')}>
        <Icon name="lock-outline" size={24} color="#007bff" />
        <Text style={styles.settingText}>Privacy & Security</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  profileContainer: { alignItems: 'center', marginBottom: 25 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666' },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
  },
  settingText: { fontSize: 16, marginLeft: 15 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#d9534f',
    borderRadius: 8,
    marginTop: 30,
  },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: 'white', marginLeft: 10 },
});
