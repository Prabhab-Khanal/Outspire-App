import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfilePicker({ onProfileImageSelect }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const openGallery = async () => {
    console.log("Gallery button clicked. Opening gallery...");

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    console.log('Image Picker Result:', result);

    
    if (!result.canceled) {
      const asset = result.assets[0];
      const randomString = Math.random().toString(36).substring(2, 12); // 10 random letters/numbers
      const extension = asset.uri.split('.').pop(); // get file extension like jpg, png
      const randomName = `profile_${randomString}.${extension}`;

      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) { // 5MB limit
        Alert.alert('File too large', 'Profile picture must be less than 5MB.');
        return;
      }

      const image = {
        uri: asset.uri,
        name: randomName,
        type: asset.type ? `image/${asset.type}` : 'image/jpeg',
      };

      setSelectedImage(image.uri); // for UI display
      if (onProfileImageSelect) {
        onProfileImageSelect(image); // Pass full object to RegisterScreen
      }
    } else {
      console.log('No image selected');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Pick a Profile Picture</Text>

      <View style={styles.profileCircleContainer}>
        <TouchableOpacity style={styles.profileCircle} onPress={openGallery}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImage} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={openGallery}>
          <MaterialCommunityIcons name="pencil" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  profileCircleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    backgroundColor: '#f1f1f1',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 45,      // set fixed width
    height: 45,     // set fixed height
    borderRadius: 22.5, // half of width/height to make it a perfect circle
    justifyContent: 'center', // center icon
    alignItems: 'center',    // center icon
    elevation: 4,    // small shadow (optional)
  },
});
