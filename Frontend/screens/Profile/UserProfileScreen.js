import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  TouchableOpacity, Alert, FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import {
  getPublicUserProfile,
  toggleFollow,
  checkFollowStatus,
} from '../../services/communityService'; // ✅ Make sure all are imported
import { BASE_URL } from '../../services/api';

export default function UserProfileScreen({ route, navigation }) {
  const { username } = route.params;
  const { theme } = useContext(ThemeContext);
  const { userToken, user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profileData = await getPublicUserProfile(username);
      setProfile(profileData);

      // 🔥 Fetch follow status separately
      const followStatus = await checkFollowStatus(username);
      setIsFollowing(followStatus);
    } catch (err) {
      console.error('❌ Error loading profile or follow status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    try {
      // 🔥 Optimistic UI Update (feel instant)
      setIsFollowing((prev) => !prev);
      const message = await toggleFollow(username);
      console.log('🔄 Follow toggle result:', message);
      // No need to recheck follow status immediately
    } catch (err) {
      console.error('❌ Error toggling follow:', err);
      // 🔄 Rollback optimistic update if error
      setIsFollowing((prev) => !prev);
    }
  };

  const reportUser = () => {
    Alert.alert(
      "Report User",
      `Are you sure you want to report @${profile.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          onPress: () => {
            console.log(`🚨 Reported user ${profile.username}`);
            Alert.alert("Reported", "User has been reported.");
          },
          style: "destructive",
        },
      ]
    );
  };

  const themeColors = {
    light: {
      background: '#ffffff',
      text: '#000000',
      button: '#3E7D41',
      buttonText: '#ffffff',
    },
    dark: {
      background: '#121212',
      text: '#ffffff',
      button: '#4CAF50',
      buttonText: '#ffffff',
    },
  };

  const currentColors = themeColors[theme];
  const isOwnProfile = user?.username === profile?.username;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: currentColors.background },
    content: { padding: 20 },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: 'center',
      marginBottom: 20,
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
      color: currentColors.text,
      textAlign: 'center',
    },
    detail: {
      fontSize: 14,
      color: currentColors.text,
      textAlign: 'center',
      marginVertical: 2,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
      gap: 12,
    },
    button: {
      backgroundColor: currentColors.button,
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 6,
    },
    messageButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 6,
    },
    buttonText: {
      color: currentColors.buttonText,
      fontWeight: 'bold',
      fontSize: 14,
      textAlign: 'center',
    },
    menuButton: {
      position: 'absolute',
      right: 20,
      top: 20,
      zIndex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentColors.text,
      marginVertical: 10,
      marginLeft: 12,
    },
    postGrid: {
      paddingHorizontal: 16,
    },
    postItem: {
      width: '48%',
      backgroundColor: '#eee',
      borderRadius: 10,
      marginBottom: 12,
      overflow: 'hidden',
    },
    postImage: {
      width: '100%',
      height: 150,
    },
    postCaption: {
      padding: 6,
      fontSize: 13,
      color: '#333',
    },
  });

  if (loading || !profile) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  }

  const renderPost = ({ item }) => (
    <View style={styles.postItem}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text style={styles.postCaption}>{item.caption}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {!isOwnProfile && (
        <TouchableOpacity style={styles.menuButton} onPress={reportUser}>
          <Icon name="dots-vertical" size={24} color={currentColors.text} />
        </TouchableOpacity>
      )}

      <FlatList
        data={profile.posts || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.postGrid}
        ListHeaderComponent={
          <View style={styles.content}>
            <Image
              source={{ uri: profile?.profile_picture ? `${BASE_URL}${profile.profile_picture}` : 'https://placehold.co/100x100?text=User' }}
              style={styles.profileImage}
            />
            <Text style={styles.name}>
              {profile.first_name || ''} {profile.middle_name || ''} {profile.last_name || ''}
            </Text>
            <Text style={styles.detail}>@{profile.username}</Text>
            <Text style={styles.detail}>Gender: {profile.gender || 'N/A'}</Text>
            <Text style={styles.detail}>Location: {profile.location || 'N/A'}</Text>
            <Text style={styles.detail}>DOB: {profile.date_of_birth || 'N/A'}</Text>
            <Text style={styles.detail}>Bio: {profile.bio || 'No bio provided'}</Text>

            {!isOwnProfile && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={handleToggleFollow} style={styles.button}>
                  <Text style={styles.buttonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
                </TouchableOpacity>

                
              </View>
            )}

            
          </View>
        }
      />
    </View>
  );
}
