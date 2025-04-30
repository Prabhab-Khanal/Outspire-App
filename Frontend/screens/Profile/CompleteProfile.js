import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, ImageBackground, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useForm, Controller } from 'react-hook-form'; 
import { createPreference } from '../../services/profileService';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons'; // For back button

const CompleteProfileScreen = ({ route }) => {
  const { userId } = route.params;
  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
    defaultValues: {
      preferred_trail_type: 'Mountain',
      preferred_difficulty: 'Medium',
      preferred_terrain: 'Gravel',
      preferred_length: 'Medium',
    }
  });
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const themeColors = {
    light: {
      background: '#EFE6DD', // Off white
      text: '#222',
      inputBackground: '#FFF8F0', // very light
      borderColor: '#C6B49E',
      buttonBackground: '#3E7D41', // Green
      buttonText: '#fff',
    },
    dark: {
      background: '#121212',
      text: '#f9f9f9',
      inputBackground: '#1E1E1E',
      borderColor: '#333',
      buttonBackground: '#4CAF50',
      buttonText: '#fff',
    },
  };
  const currentColors = themeColors[theme];

  const onSubmitPreferences = async (data) => {
    try {
      setLoading(true);
      data.user_id = userId;
      const res = await createPreference(data);
      Alert.alert("Success", "Preferences saved successfully!");
      navigation.navigate('Login');
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentColors.background }}>
      <ImageBackground source={require('../../assets/images/nature-background.png')} style={styles.backgroundImage} />
      
      {/* Back Button */}
      {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
        <MaterialIcons name="arrow-back" size={28} color="#3E7D41" />
      </TouchableOpacity> */}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <Text style={[styles.title, { color: currentColors.text }]}>Complete Profile</Text>

            {/* Trail Type */}
            <Text style={[styles.label, { color: currentColors.text }]}>Preferred Trail Type</Text>
            <Controller
              control={control}
              name="preferred_trail_type"
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={[styles.input, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.borderColor }]}
                >
                  <Picker.Item label="Mountain" value="Mountain" />
                  <Picker.Item label="Road" value="Road" />
                  <Picker.Item label="Coastal" value="Coastal" />
                  <Picker.Item label="Forest" value="Forest" />
                </Picker>
              )}
            />

            {/* Difficulty */}
            <Text style={[styles.label, { color: currentColors.text }]}>Preferred Difficulty</Text>
            <Controller
              control={control}
              name="preferred_difficulty"
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={[styles.input, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.borderColor }]}
                >
                  <Picker.Item label="Easy" value="Easy" />
                  <Picker.Item label="Medium" value="Medium" />
                  <Picker.Item label="Hard" value="Hard" />
                </Picker>
              )}
            />

            {/* Terrain */}
            <Text style={[styles.label, { color: currentColors.text }]}>Preferred Terrain</Text>
            <Controller
              control={control}
              name="preferred_terrain"
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={[styles.input, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.borderColor }]}
                >
                  <Picker.Item label="Gravel" value="Gravel" />
                  <Picker.Item label="Asphalt" value="Asphalt" />
                  <Picker.Item label="Snow" value="Snow" />
                  <Picker.Item label="Forest" value="Forest" />
                </Picker>
              )}
            />

            {/* Length */}
            <Text style={[styles.label, { color: currentColors.text }]}>Preferred Length</Text>
            <Controller
              control={control}
              name="preferred_length"
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={[styles.input, { backgroundColor: currentColors.inputBackground, borderColor: currentColors.borderColor }]}
                >
                  <Picker.Item label="Short (<5 km)" value="Short" />
                  <Picker.Item label="Medium (5-15 km)" value="Medium" />
                  <Picker.Item label="Long (>15 km)" value="Long" />
                </Picker>
              )}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: currentColors.buttonBackground }]}
              onPress={handleSubmit(onSubmitPreferences)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.submitButtonText, { color: currentColors.buttonText }]}>Save Preferences</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: 'cover',
    opacity: 0.08,
    zIndex: -1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CompleteProfileScreen;
