import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Image,
  TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createPost, uploadPostImages, searchLocationSuggestions } from '../../services/communityService';

const CommunityAddPostScreen = () => {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationTimeout, setLocationTimeout] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled) {
        const selected = result.assets.map(asset => ({
          uri: asset.uri,
          fileName: asset.fileName,
          type: asset.type || 'image/jpeg',
        }));
        setImages(prev => [...prev, ...selected]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!caption.trim()) {
      Alert.alert('Validation Error', 'Please enter a caption.');
      return;
    }

    setUploading(true);
    try {
      const postResponse = await createPost({ caption, location });
      const postId = postResponse.data.id;

      if (images.length > 0) {
        await uploadPostImages(postId, images);
      }

      Alert.alert('Success', 'Your post has been created!');
      setCaption('');
      setLocation('');
      setImages([]);
      setLocationSuggestions([]);
    } catch (error) {
      console.error('Post error:', error.response?.data || error.message);
      Alert.alert('Error', 'Something went wrong while posting.');
    } finally {
      setUploading(false);
    }
  };

  const handleLocationInput = (text) => {
    setLocation(text);
    if (locationTimeout) clearTimeout(locationTimeout);
    const timeout = setTimeout(() => fetchLocationSuggestions(text), 500);
    setLocationTimeout(timeout);
  };

  const fetchLocationSuggestions = async (text) => {
    if (text.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const suggestions = await searchLocationSuggestions(text);
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Location fetch error:', error);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Create a New Post</Text>

      <TextInput
        style={styles.input}
        placeholder="Write something..."
        multiline
        value={caption}
        onChangeText={setCaption}
      />

      <TextInput
        style={styles.input}
        placeholder="Search Location"
        value={location}
        onChangeText={handleLocationInput}
      />

      {locationSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView>
            {locationSuggestions.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionItem}
                onPress={() => {
                  setLocation(item.display_name);
                  setLocationSuggestions([]);
                }}
              >
                <Text style={styles.suggestionText}>{item.display_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages} disabled={uploading}>
        <Text style={styles.buttonText}>Pick Images</Text>
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        {images.map((img, index) => (
          <TouchableOpacity key={index} onLongPress={() => removeImage(index)}>
            <Image source={{ uri: img.uri }} style={styles.image} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.postButton, uploading && { backgroundColor: '#ccc' }]}
        onPress={handlePost}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Post</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CommunityAddPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 150,
    marginBottom: 16,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  imagePickerButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  postButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
});
