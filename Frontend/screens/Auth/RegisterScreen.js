import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { sendOTP } from '../../services/authService';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSendOTP = async () => {
    try {
      const res = await sendOTP({ email, otp_type: 'register' });
      console.log("OTP sent:", res.data);
      navigation.navigate('VerifyOTP', {
        email,
        username,
        password,
        from: 'register',
      });
    } catch (err) {
      console.log("OTP send failed:", err.message);
      if (err.response) console.log("Server:", err.response.data);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Text style={styles.title}>Register</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <Text style={styles.label}>Username</Text>
      <TextInput
        placeholder="Choose a username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Choose a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button title="Send OTP" onPress={handleSendOTP} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
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
