import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, SafeAreaView, ImageBackground, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';  // Import the ThemeContext
import { AuthContext } from '../../contexts/AuthContext';  // Import the AuthContext
import { loginUser } from '../../services/authService'; // Import the login function
import { useNavigation } from '@react-navigation/native'; // For navigation
import { MaterialCommunityIcons } from '@expo/vector-icons'; // For toggle button icons

export default function LoginScreen() {
  const [username_or_email, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleThemeMode } = useContext(ThemeContext);  // Get the current theme and toggle function
  const navigation = useNavigation(); // Navigation hook
  const { login } = useContext(AuthContext); // Access the login function from context
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true); // Start loading
  
    try {
      // Send the login request to the backend
      const res = await loginUser({ username_or_email, password });
      console.log('Login success:', res.data); // Log the entire response to inspect the structure
  
      // Directly destructure the necessary fields from res.data
      const { access_token, is_profile_complete, is_preference_complete, is_emergencycontact_complete, user_id } = res.data;
      
      // Check if user data exists and if necessary properties are there
      if (typeof is_profile_complete === 'undefined' || typeof is_preference_complete === 'undefined' || typeof is_emergencycontact_complete === 'undefined') {
        throw new Error('User data is incomplete or missing from the response');
      }
  
      // Now check the profile completion flags
      if (
        
        !is_preference_complete 
      ) {
        console.log('Profile incomplete, redirecting to CompleteProfile');
        // Navigate to Profile completion if any part of the profile is incomplete
        navigation.navigate('Profile',{ userId: user_id });
      } else {
        console.log('Profile complete, storing token and navigating to Dashboard');
        // If profile is complete, store the token and user data in AuthContext
        login(access_token, res.data); // Store the full response data in context
  
        // Navigate to the Dashboard after storing the token
        
      }
    } catch (err) {
      const { redirect_to_otp, email } = err.response?.data || {};
      if (redirect_to_otp) {
        // bubble them straight into your OTP form
        return navigation.navigate('VerifyOTP', {
          email,
          otp_type: 'register'
        });
      }
      console.log('Login failed:', err.message);
      Alert.alert('Login failed', 'Please check your credentials.');
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  
  
  

  // Colors for Light and Dark Modes based on your instructions
  const themeColors = {
    light: {
      background: '#FFFFFF',
      text: '#000000',
      primary: '#3E7D41',  // Primary Green
      secondary: '#4FC3F7',  // Sky Blue
      accent: '#FF8F00',  // Sunset Orange
      button: '#3E7D41', // Primary Green for light mode
      buttonText: '#FFFFFF', // White text for the button
    },
    dark: {
      background: '#121917', // Dark greenish background
      text: '#FFFFFF',
      primary: '#4CAF50',  // Softer Green
      secondary: '#0288D1',  // Deeper Blue
      accent: '#FFA726',  // Brighter Orange
      button: '#4CAF50', // Brighter Green for dark mode
      buttonText: '#FFFFFF', // White text for the button
    }
  };

  const currentColors = themeColors[theme];  // Get the current colors based on the theme

  // Dynamic styles based on the theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 28, // Increased padding
      position: 'relative',
      zIndex: 1, // Ensure the content stays above the image
    },
    title: {
      fontSize: 32, // Larger title
      fontWeight: 'bold',
      marginBottom: 32, // More space below title
      textAlign: 'center',
      color: currentColors.text,
      letterSpacing: 0.5, // Slightly spaced letters
    },
    label: {
      fontSize: 16,
      marginBottom: 8, // More space below labels
      color: currentColors.text,
      fontWeight: '500', // Medium weight for labels
    },
    input: {
      height: 56, // Taller input fields
      borderBottomWidth: 1,  // Bottom border for line appearance
      borderBottomColor: theme === 'light' ? '#3E7D41' : '#FFFFFF',  // Green line in light, white in dark mode
      paddingLeft: 16, // More horizontal padding
      paddingRight: 16,
      borderRadius: 0, // No border radius for the line style
      marginBottom: 20, // More space between inputs
      backgroundColor: 'transparent', // Make background transparent to keep the "line" style
      color: theme === 'light' ? '#000' : '#fff',
      fontSize: 16,
    },
    buttonContainer: {
      marginTop: 16,
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: currentColors.button,
      padding: 16, // Taller button
      borderRadius: 8, // Match input radius
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3, // For Android
    },
    loginButtonText: {
      color: currentColors.buttonText,
      fontWeight: 'bold',
      fontSize: 16, // Larger text
      letterSpacing: 0.5,
    },
    link: {
      color: currentColors.accent,
      textAlign: 'center',
      textDecorationLine: 'underline',
      marginTop: 12,
      marginBottom: 12, // Add space between links
      fontSize: 15, // Slightly larger
      fontWeight: '500', // Medium weight
    },
    googleLoginButton: {
      backgroundColor: '#FFFFFF', // White background
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 12, // Add space above
      marginBottom: 20,
      flexDirection: 'row', // For icon and text layout
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#DDDDDD', // Light border
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2, // For Android
    },
    googleLoginText: {
      color: '#757575', // Google's recommended gray
      fontWeight: '600',
      fontSize: 15,
      marginLeft: 8, // Space for Google icon
    },
    backgroundImage: {
      flex: 1, // This ensures the image covers the full screen
      position: 'absolute',  // Keep it in the background
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      resizeMode: 'cover',
      opacity: theme === 'light' ? 0.15 : 0.08, // Adjust opacity for light/dark mode
      zIndex: 1, // Ensure image stays behind the content
    },
    toggleButtonContainer: {
      position: 'absolute',
      top: 20,
      right: 20,
      backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(18,25,23,0.7)',
      padding: 10,
      borderRadius: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
    },
    toggleButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme === 'light' ? '#3E7D41' : '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
    },
    forgotPasswordContainer: {
      alignItems: 'flex-end',
      marginBottom: 20,
    },
    forgotPasswordText: {
      color: currentColors.accent,
      fontSize: 14,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: theme === 'light' ? '#E0E0E0' : '#444',
    },
    dividerText: {
      color: theme === 'light' ? '#757575' : '#AAAAAA',
      paddingHorizontal: 10,
      fontSize: 14,
    }
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentColors.background }}>
      {/* Background Image */}
      <ImageBackground source={require('../../assets/images/nature-background.png')} style={styles.backgroundImage} />
      console.log('hello');

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              placeholder="Enter your email or username"
              value={username_or_email}
              onChangeText={setIdentifier}
              style={styles.input}
              placeholderTextColor={theme === 'light' ? '#9E9E9E' : '#777777'}
              autoCapitalize="none"
            />

            <View style={{ position: 'relative' }}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                placeholderTextColor={theme === 'light' ? '#9E9E9E' : '#777777'}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: 10,
                  bottom: 22,
                }}
              >
                <MaterialCommunityIcons 
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme === 'light' ? '#4CAF50' : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>


            {/* Forgot Password */}
            <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Google Login Button */}
            {/* <TouchableOpacity 
              style={styles.googleLoginButton}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="google" size={30} color="#4285F4" />
              <Text style={styles.googleLoginText}>Login with Google</Text>
            </TouchableOpacity> */}

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>

            {/* Theme Toggle Button */}
            {/* <TouchableOpacity 
              onPress={toggleThemeMode} 
              style={styles.toggleButtonContainer}
              activeOpacity={0.9}
            >
              <View style={styles.toggleButton}>
                <MaterialCommunityIcons 
                  name={theme === 'light' ? 'weather-sunny' : 'weather-night'} 
                  size={22} 
                  color="#FFFFFF" 
                />
              </View>
            </TouchableOpacity> */}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
