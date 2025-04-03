import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function Step4_ProfilePicture({ navigation, route }) {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleNext = () => {
    if (!image) {
      Alert.alert("Please select a profile picture");
      return;
    }

    navigation.navigate('Step5_Password', {
      ...route.params,
      profile_picture: image,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 4: Upload Profile Picture</Text>

      {image && (
        <Image source={{ uri: image.uri }} style={styles.preview} />
      )}

      <Button title="Choose Image" onPress={pickImage} />
      <View style={{ marginTop: 20 }}>
        <Button title="Next" onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  preview: { width: 150, height: 150, borderRadius: 75, marginBottom: 16 },
});
