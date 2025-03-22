import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { resetPassword } from '../../services/authService';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params;
  const [password, setPassword] = useState('');

  const handleReset = async () => {
    console.log("Resetting password for:", email);

    try {
      const res = await resetPassword({ email, password });
      console.log("Password reset success:", res.data);
      navigation.navigate('Login');
    } catch (err) {
      console.log("Password reset failed:", err.message);
      if (err.response) console.log("Server:", err.response.data);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Text style={styles.title}>Reset Password</Text>

      <Text style={styles.label}>New Password</Text>
      <TextInput
        placeholder="Enter your new password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button title="Reset Password" onPress={handleReset} />
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
