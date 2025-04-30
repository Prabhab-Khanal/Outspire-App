import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { getPreferences, updatePreference } from '../../services/profileService'; // your API services

export default function PreferenceSettingsScreen() {
  const { userToken } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      preferred_trail_type: '',
      preferred_difficulty: '',
      preferred_terrain: '',
      preferred_length: '',
    },
  });

  const [loading, setLoading] = useState(false);

  const themeColors = {
    light: {
      background: '#FFFFFF',
      text: '#000000',
      primary: '#3E7D41',
      button: '#3E7D41',
      buttonText: '#FFFFFF',
    },
    dark: {
      background: '#121917',
      text: '#FFFFFF',
      primary: '#4CAF50',
      button: '#4CAF50',
      buttonText: '#FFFFFF',
    },
  };

  const currentColors = themeColors[theme];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    console.log('🚀 Fetching user preferences...');
    try {
      console.log('user Token',userToken);
      const res = await getPreferences(userToken); // ✅ Corrected
      console.log('✅ Preferences received:', res.data);
      reset(res.data);
    } catch (error) {
      console.error('❌ Error fetching preferences:', error);
      Alert.alert('Error', 'Could not load preferences.');
    }
  };

  const onSubmitPreferences = async (data) => {
    console.log('📦 Saving updated preferences:', data);
    try {
      setLoading(true);
      await updatePreference(userToken, data); // send new preferences
      console.log('✅ Preferences updated successfully!');
      Alert.alert('Success', 'Preferences updated!');
    } catch (error) {
      console.error('❌ Error saving preferences:', error);
      Alert.alert('Error', 'Failed to update preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <Text style={[styles.title, { color: currentColors.text }]}>Update Preferences</Text>

      {/* Preferred Trail Type */}
      <Text style={[styles.label, { color: currentColors.text }]}>Preferred Trail Type</Text>
      <Controller
        control={control}
        name="preferred_trail_type"
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              console.log('🛤️ Trail Type changed:', itemValue);
              onChange(itemValue);
            }}
            style={[styles.input, { height: 50 }]}
          >
            <Picker.Item label="Select Trail Type" value="" />
            <Picker.Item label="Mountain" value="Mountain" />
            <Picker.Item label="Road" value="Road" />
            <Picker.Item label="Coastal" value="Coastal" />
            <Picker.Item label="Forest" value="Forest" />
          </Picker>
        )}
      />

      {/* Preferred Difficulty */}
      <Text style={[styles.label, { color: currentColors.text }]}>Preferred Difficulty</Text>
      <Controller
        control={control}
        name="preferred_difficulty"
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              console.log('⚡ Difficulty changed:', itemValue);
              onChange(itemValue);
            }}
            style={[styles.input, { height: 50 }]}
          >
            <Picker.Item label="Select Difficulty" value="" />
            <Picker.Item label="Easy" value="Easy" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="Hard" value="Hard" />
          </Picker>
        )}
      />

      {/* Preferred Terrain */}
      <Text style={[styles.label, { color: currentColors.text }]}>Preferred Terrain</Text>
      <Controller
        control={control}
        name="preferred_terrain"
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              console.log('🗺️ Terrain changed:', itemValue);
              onChange(itemValue);
            }}
            style={[styles.input, { height: 50 }]}
          >
            <Picker.Item label="Select Terrain" value="" />
            <Picker.Item label="Gravel" value="Gravel" />
            <Picker.Item label="Asphalt" value="Asphalt" />
            <Picker.Item label="Snow" value="Snow" />
            <Picker.Item label="Forest" value="Forest" />
          </Picker>
        )}
      />

      {/* Preferred Length */}
      <Text style={[styles.label, { color: currentColors.text }]}>Preferred Length</Text>
      <Controller
        control={control}
        name="preferred_length"
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              console.log('📏 Length changed:', itemValue);
              onChange(itemValue);
            }}
            style={[styles.input, { height: 50 }]}
          >
            <Picker.Item label="Select Length" value="" />
            <Picker.Item label="Short (<5 km)" value="Short" />
            <Picker.Item label="Medium (5-15 km)" value="Medium" />
            <Picker.Item label="Long (>15 km)" value="Long" />
          </Picker>
        )}
      />

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.submitButton, { backgroundColor: currentColors.button }]}
        onPress={handleSubmit(onSubmitPreferences)}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Save Preferences</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
});
