import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { loginUser } from '../../services/authService';
import useAuth from '../../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const [username_or_email, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    console.log("Logging in with:", username_or_email);

    try {
      const res = await loginUser({ username_or_email, password });
      console.log("Login success:", res.data);
      await login(res.data.access_token);
    } catch (err) {
      console.log("Login failed:", err.message);
      if (err.response) console.log("Server:", err.response.data);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>Email or Username</Text>
      <TextInput
        placeholder="Enter your email or username"
        value={username_or_email}
        onChangeText={setIdentifier}
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} />
      </View>

      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register
      </Text>
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
    marginBottom: 16,
  },
  link: {
    color: '#007BFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
});
