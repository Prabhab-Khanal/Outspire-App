import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { resetPasswordAfterOTP } from '../../services/authService';
import { MaterialIcons } from '@expo/vector-icons'; // For Eye icon and Back arrow

export default function SetNewPasswordScreen({ route, navigation }) {
  const { email } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

  const validatePassword = (text) => {
    if (!passwordRegex.test(text)) {
      setPasswordError('Password must be 8+ characters with letters and numbers.');
    } else {
      setPasswordError('');
    }
  };

  const validateConfirmPassword = (text) => {
    if (text !== newPassword) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Please fill all fields.');
    }
    if (passwordError || confirmPasswordError) {
      return Alert.alert('Error', 'Please fix the errors before submitting.');
    }

    try {
      setLoading(true);
      const res = await resetPasswordAfterOTP({ email, new_password: newPassword });
      Alert.alert('Success', 'Password changed successfully.');
      navigation.replace('Login');
    } catch (error) {
      console.error('Password Reset Error:', error);
      Alert.alert('Error', 'Failed to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
        <MaterialIcons name="arrow-back" size={28} color="#5A4322" />
      </TouchableOpacity>

      <View style={styles.innerContainer}>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>Please create a strong password for your account.</Text>

        {/* New Password Field */}
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              validatePassword(text);
              validateConfirmPassword(confirmPassword); // also validate confirm field
            }}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={24} color="#7D6651" />
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        {/* Confirm New Password Field */}
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#888"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              validateConfirmPassword(text);
            }}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <MaterialIcons name={showConfirmPassword ? 'visibility-off' : 'visibility'} size={24} color="#7D6651" />
          </TouchableOpacity>
        </View>
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save New Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFE6DD' },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#5A4322', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#7D6651' },
  inputWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#C6B49E',
    borderRadius: 10,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#5A4322',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 13,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#A67B5B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
