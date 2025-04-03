import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { sendOTP, registerUser } from '../../../services/authService'; // Adjust path as needed

export default function Step6_OTPVerify({ navigation, route }) {
  const [otp, setOtp] = useState('');
  const { email, profile_picture, ...rest } = route.params;

  const handleSendOTP = async () => {
    try {
      await sendOTP({ email, otp_type: 'register' });
      Alert.alert("OTP Sent", "Check your email for the verification code");
    } catch (err) {
      Alert.alert("Error", "Failed to send OTP");
    }
  };

  const handleVerifyAndRegister = async () => {
    const formData = new FormData();
    Object.entries({ ...rest, email, otp }).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (profile_picture) {
      formData.append('profile_picture', {
        uri: profile_picture.uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });
    }

    try {
      await registerUser(formData);
      navigation.navigate('Step7_Done');
    } catch (err) {
      Alert.alert("Error", "OTP verification or registration failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 6: Verify OTP</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
      />

      <Button title="Send OTP" onPress={handleSendOTP} />
      <View style={{ marginTop: 16 }}>
        <Button title="Verify & Register" onPress={handleVerifyAndRegister} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 16 },
});
