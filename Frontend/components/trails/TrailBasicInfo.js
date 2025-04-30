import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function TrailBasicInfo({ name, setName, location, setLocation, image, pickImage }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>

      <View style={styles.inputContainer}>
        <FontAwesome name="map-signs" size={20} color="#3a7758" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Trail Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="map-marker" size={20} color="#3a7758" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        <FontAwesome name="camera" size={18} color="#fff" />
        <Text style={styles.imagePickerText}>Select Trail Image</Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.selectedImage} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { margin: 15, backgroundColor: '#fff', borderRadius: 10, padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#3a7758', marginBottom: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, marginBottom: 15, backgroundColor: '#f9f9f9' },
  inputIcon: { marginHorizontal: 10 },
  input: { flex: 1, padding: 12, fontSize: 16, color: '#333' },
  imagePickerButton: { backgroundColor: '#3a7758', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  imagePickerText: { color: '#fff', fontSize: 16, marginLeft: 8 },
  imagePreviewContainer: { marginTop: 10, overflow: 'hidden', borderRadius: 10 },
  selectedImage: { width: '100%', height: 200, borderRadius: 10 },
});
