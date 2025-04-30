import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { checkUsernameEmail, forgotPassword } from '../../services/authService';
import { MaterialIcons } from '@expo/vector-icons'; // For Back Arrow

const themes = {
  light: {
    background: '#EFE6DD',
    text: '#222',
    inputBackground: '#FFF8F0',
    borderColor: '#C6B49E',
    buttonBackground: '#A67B5B',
    buttonText: '#fff',
    errorText: '#FF5252',
    placeholder: '#888',
  },
  dark: {
    background: '#121212',
    text: '#f9f9f9',
    inputBackground: '#1E1E1E',
    borderColor: '#333',
    buttonBackground: '#4CAF50',
    buttonText: '#fff',
    errorText: '#FF5252',
    placeholder: '#bbb',
  },
};

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('light');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentTheme = themes[theme];

  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError('Invalid email format.');
    } else {
      setEmailError('');
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    if (emailError) {
      Alert.alert('Error', 'Please enter a valid email.');
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword({ email });
      console.log('OTP sent:', res.data);
      Alert.alert('Success', 'An OTP has been sent to your email.');
      navigation.navigate('VerifyOTP', { email, otp_type: 'reset' });
    } catch (err) {
      console.log('Error in Forgot Password flow:', err.message);
      if (err.response) {
        const serverError = err.response.data?.error || 'Unknown server error';
        Alert.alert('Error', serverError);
      } else {
        Alert.alert('Error', 'Failed to process. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
        <MaterialIcons name="arrow-back" size={28} color="#5A4322" />
      </TouchableOpacity>

      <View style={styles.innerContainer}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Forgot Password?</Text>
        <Text style={[styles.subtitle, { color: currentTheme.text }]}>
          Enter your email address below and we'll send you an OTP.
        </Text>

        <TextInput
          placeholder="Enter your email"
          placeholderTextColor={currentTheme.placeholder}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            validateEmail(text);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[
            styles.input,
            {
              backgroundColor: currentTheme.inputBackground,
              borderColor: currentTheme.borderColor,
              color: currentTheme.text,
            },
          ]}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.buttonBackground }, loading && { opacity: 0.7 }]}
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { color: currentTheme.buttonText }]}>Send OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 8,
    fontSize: 16,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
