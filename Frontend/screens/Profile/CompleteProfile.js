import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { createPreference, createEmergencyContact } from '../../services/profileService'; // Assuming you have this service

const CompleteProfileScreen = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors }, setValue } = useForm();
  const [step, setStep] = useState(1);  // Keep track of the current step (1: preferences, 2: emergency contacts)
  const [emergencyContacts, setEmergencyContacts] = useState([{ name: '', phone_number: '', relationship: '' }]);
  const [loading, setLoading] = useState(false);

  // Handle Preferences Step
  const onSubmitPreferences = async (data) => {
    try {
      setLoading(true);

      // Submit Preference Data
      await createPreference(data);

      setStep(2);  // Move to emergency contacts step after preferences are saved
    } catch (error) {
      Alert.alert("Error", "Something went wrong with preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Emergency Contact Form
  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', phone_number: '', relationship: '' }]);
  };

  const handleEmergencyContactChange = (index, field, value) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index][field] = value;
    setEmergencyContacts(updatedContacts);
  };

  // Handle final submit (send both preference and emergency contacts)
  const onFinalSubmit = async () => {
    try {
      setLoading(true);

      // Submit Preference Data
      await createPreference(getValues('preferred_trail_type', 'preferred_difficulty')); // Use the `getValues` function to get current preferences
      // Submit Emergency Contacts Data
      for (let contact of emergencyContacts) {
        await createEmergencyContact(contact);
      }

      Alert.alert("Profile created successfully!");
      navigation.navigate('DashboardNavigator'); // Navigate to dashboard after profile is complete
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Profile</Text>

      {step === 1 ? (
        // Step 1: Preferences
        <>
          <Text style={styles.label}>Preferred Trail Type</Text>
          <Controller
            control={control}
            name="preferred_trail_type"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="e.g., Mountain, Road"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.preferred_trail_type && <Text style={styles.error}>{errors.preferred_trail_type.message}</Text>}

          <Text style={styles.label}>Preferred Difficulty</Text>
          <Controller
            control={control}
            name="preferred_difficulty"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="e.g., Easy, Medium, Hard"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.preferred_difficulty && <Text style={styles.error}>{errors.preferred_difficulty.message}</Text>}

          <Button
            title={loading ? 'Submitting...' : 'Next'}
            onPress={handleSubmit(onSubmitPreferences)}
            disabled={loading}
          />
        </>
      ) : (
        // Step 2: Emergency Contacts
        <>
          <Text style={styles.label}>Emergency Contacts</Text>
          {emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                onChangeText={(value) => handleEmergencyContactChange(index, 'name', value)}
                value={contact.name}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                onChangeText={(value) => handleEmergencyContactChange(index, 'phone_number', value)}
                value={contact.phone_number}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Relationship"
                onChangeText={(value) => handleEmergencyContactChange(index, 'relationship', value)}
                value={contact.relationship}
              />
            </View>
          ))}
          <TouchableOpacity onPress={addEmergencyContact} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Emergency Contact</Text>
          </TouchableOpacity>

          <Button
            title={loading ? 'Submitting...' : 'Submit'}
            onPress={onFinalSubmit}
            disabled={loading}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CompleteProfileScreen;
