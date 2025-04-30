import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../contexts/AuthContext';
import { getProfile } from '../../services/profileService';
import { BASE_URL } from '../../services/api'; // adjust path based on your project

export default function SettingsScreen({ navigation }) {
  const { user, userToken, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await getProfile(userToken);
      setProfile(response.data);
      console.log('Profile Data:', response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchProfile();
    }
  }, [userToken]);

  const handleLogout = () => {
    logout();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const getProfileImageUri = () => {
    if (!profile?.profile_picture) {
      return require('../../assets/images/profile.png');
    }
    if (profile.profile_picture.startsWith('http')) {
      return { uri: profile.profile_picture };
    }
    return { uri: `${BASE_URL.replace(/\/$/, '')}${profile.profile_picture}` };
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.header}>Settings</Text>

        {profile ? (
          <View style={styles.profileContainer}>
            <Image
              source={getProfileImageUri()}
              style={styles.avatar}
            />
            <Text style={styles.userName}>
              {profile.first_name || profile.username || 'Unknown User'}
            </Text>
            <Text style={styles.userEmail}>
              {profile.email || 'No email'}
            </Text>
          </View>
        ) : (
          <Text style={styles.loadingText}>Loading profile...</Text>
        )}

        {/* Settings Items */}
        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('AccountSettings')}>
          <Icon name="account" size={24} color="#3E7D41" />
          <Text style={styles.settingText}>Account Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Preference')}>
          <Icon name="tune" size={24} color="#3E7D41" />
          <Text style={styles.settingText}>Preference Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('EmergencyContacts')}>
          <Icon name="account-group-outline" size={24} color="#3E7D41" />
          <Text style={styles.settingText}>Emergency Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('NotificationSettings')}>
          <Icon name="bell-outline" size={24} color="#3E7D41" />
          <Text style={styles.settingText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Subscription')}>
          <Icon name="credit-card-outline" size={24} color="#3E7D41" />
          <Text style={styles.settingText}>Subscription</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Followers')}>
          <Icon name="tick-outline" size={24} color="#3E7D41" />
          <Text style={styles.settingText}>Followers</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
  },
  userEmail: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#000000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#d9534f',
    borderRadius: 8,
    marginTop: 30,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
});
