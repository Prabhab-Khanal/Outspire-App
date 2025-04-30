import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { updateProfile, getProfile } from '../../services/profileService';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemeContext } from '../../contexts/ThemeContext';
import { BASE_URL } from '../../services/api'; // Make sure you have this file

const AccountSettingsScreen = ({ navigation }) => {
  const { userToken, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  
  const defaultImageURI = require('../../assets/images/profile.png');
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    bio: '',
    date_of_birth: '',
    gender: '',
    profile_picture: null,  // initially no image
  });

  const [showDatepicker, setShowDatepicker] = useState(false);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileDatas = await getProfile(userToken);
        const profileData = profileDatas.data;
        setProfileData(profileData);
        setDate(new Date(profileData.date_of_birth));
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (userToken) {
      fetchProfile();
    }
  }, [userToken]);

  const handleProfilePictureChange = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted) {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaType: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
      });
  
      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets[0]) {
        const selectedAsset = pickerResult.assets[0];
  
        const imageFile = {
          uri: selectedAsset.uri,
          name: selectedAsset.fileName || `profile_${Date.now()}.jpg`,
          type: selectedAsset.mimeType || 'image/jpeg',
        };
  
        setProfileData({
          ...profileData,
          profile_picture: imageFile, // saving full image object
        });
      } else {
        Alert.alert('No image selected', 'Please choose an image.');
      }
    } else {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
  
      formData.append('first_name', profileData.first_name);
      formData.append('middle_name', profileData.middle_name);
      formData.append('last_name', profileData.last_name);
      formData.append('bio', profileData.bio);
      formData.append('gender', profileData.gender);
      formData.append('date_of_birth', date.toISOString().split('T')[0]);
  
      if (profileData.profile_picture && profileData.profile_picture.uri) {
        formData.append('profile_picture', {
          uri: profileData.profile_picture.uri,
          name: profileData.profile_picture.name,
          type: profileData.profile_picture.type,
        });
      }
  
      const response = await updateProfile(userToken, formData);
      Alert.alert('Success', 'Profile updated successfully!');
      console.log('Profile update response:', response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatepicker(false);
    setDate(selectedDate || date);
    setProfileData({ ...profileData, date_of_birth: selectedDate || date });
  };

  // ✅ Smart profile image logic
  const getProfileImageSource = () => {
    if (profileData.profile_picture) {
      if (typeof profileData.profile_picture === 'object' && profileData.profile_picture.uri) {
        // locally picked image
        return { uri: profileData.profile_picture.uri };
      } else if (typeof profileData.profile_picture === 'string') {
        // server image (relative path like /media/..)
        return { uri: `${BASE_URL}${profileData.profile_picture}` };
      }
    }
    return defaultImageURI; // fallback
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
      <Text style={[styles.header, { color: theme === 'dark' ? '#FFFFFF' : '#000000' }]}>Account Settings</Text>

      {/* Profile Picture */}
      <View style={styles.profileCircleContainer}>
        <TouchableOpacity style={styles.profileCircle} onPress={handleProfilePictureChange}>
          <Image
            source={getProfileImageSource()}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={handleProfilePictureChange}>
          <Ionicons name="create" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Fields */}
      <TextInput
        style={[styles.input, { backgroundColor: theme === 'dark' ? '#2D2D2D' : '#F1F1F1', color: theme === 'dark' ? '#FFFFFF' : '#333333' }]}
        placeholder="First Name"
        value={profileData.first_name}
        onChangeText={(text) => setProfileData({ ...profileData, first_name: text })}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme === 'dark' ? '#2D2D2D' : '#F1F1F1', color: theme === 'dark' ? '#FFFFFF' : '#333333' }]}
        placeholder="Middle Name"
        value={profileData.middle_name}
        onChangeText={(text) => setProfileData({ ...profileData, middle_name: text })}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme === 'dark' ? '#2D2D2D' : '#F1F1F1', color: theme === 'dark' ? '#FFFFFF' : '#333333' }]}
        placeholder="Last Name"
        value={profileData.last_name}
        onChangeText={(text) => setProfileData({ ...profileData, last_name: text })}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme === 'dark' ? '#2D2D2D' : '#F1F1F1', color: theme === 'dark' ? '#FFFFFF' : '#333333' }]}
        placeholder="Gender"
        value={profileData.gender}
        onChangeText={(text) => setProfileData({ ...profileData, gender: text })}
      />
      <TextInput
        style={[styles.textArea, { backgroundColor: theme === 'dark' ? '#2D2D2D' : '#F1F1F1', color: theme === 'dark' ? '#FFFFFF' : '#333333' }]}
        placeholder="Bio"
        value={profileData.bio}
        onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
        multiline
      />

      {/* Date of Birth Picker */}
      <Text style={[styles.label, { color: theme === 'dark' ? '#FFFFFF' : '#333333' }]}>Select Date of Birth</Text>
      <TouchableOpacity onPress={() => setShowDatepicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>{date ? date.toLocaleDateString() : 'MM/DD/YYYY'}</Text>
      </TouchableOpacity>
      {showDatepicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Button title="Update Profile" onPress={handleUpdateProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileCircleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  profileCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    width: 120,
    height: 120,
    borderWidth: 3,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  editButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#fff',
  },
});

export default AccountSettingsScreen;
