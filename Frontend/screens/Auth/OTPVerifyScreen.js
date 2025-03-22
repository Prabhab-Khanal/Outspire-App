import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { registerUser } from '../../services/authService';

export default function OTPVerifyScreen({ route, navigation }) {
  const { email, username, password, from } = route.params;
  const [otp, setOtp] = useState('');

  const handleRegister = async () => {
    try {
      const res = await registerUser({ email, username, password, otp });
      console.log("User registered:", res.data);
      navigation.navigate('Login');
    } catch (err) {
      console.log("Register failed:", err.message);
      if (err.response) console.log("Server:", err.response.data);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Text style={styles.title}>Enter OTP</Text>

      <Text style={styles.label}>OTP Code</Text>
      <TextInput
        placeholder="Enter the 6-digit code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button title="Verify & Register" onPress={handleRegister} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 12,
  },
});
