import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, Platform, KeyboardAvoidingView, ScrollView, SafeAreaView, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { registerUser, checkUsernameEmail, checkPhoneNumber } from '../../services/authService';  // Import registerUser from authService
import { ThemeContext } from '../../contexts/ThemeContext';  // Import the ThemeContext
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

// Components
import FormInput from '../../components/FormInput';  // Ensure the input is capitalized
import GenderSelector from '../../components/GenderSelector';  // Ensure proper component naming
import DatePicker from '../../components/DatePicker';  // Ensure proper component naming
import ButtonWithLoading from '../../components/ButtonWithLoading';
import ProfilePicker from '../../components/ProfilePicker';

const RegisterScreen = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm();
  const { theme } = useContext(ThemeContext);  // Get the current theme
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);  // Track the current step
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);  // State for showing date picker
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleUsernameBlur = async (value) => {
    if (!value) return;
    try {
      await checkUsernameEmail({ username: value });
    } catch (err) {
      Alert.alert('Username Error', err.response?.data.username || 'Username is already taken.');
      // clear the invalid value
      setValue('username', '');
      trigger('username');
    }
  };

  const handleEmailBlur = async (value) => {
    if (!value) return;
    try {
      await checkUsernameEmail({ email: value.toLowerCase() });
    } catch (err) {
      Alert.alert('Email Error', err.response?.data.email || 'Email is already registered.');
      setValue('email', '');
      trigger('email');
    }
  };

  const handlePhoneBlur = async (value) => {
    if (!value) return;
    try {
      await checkPhoneNumber({ phone_number: value });
    } catch (err) {
      Alert.alert('Phone Error', err.response?.data.phone_number || 'Phone number is already registered.');
      setValue('phone_number', '');
      trigger('phone_number');
    }
  };

  // Handle DOB picker
  const onDateChange = (date) => {
    setShowDatePicker(false);
    setDateOfBirth(date);
    setValue('date_of_birth', date.toISOString().split('T')[0]); // Store the date in 'YYYY-MM-DD' format
  };

  // Handle Gender selection
  const handleGenderSelection = (gender) => {
    setSelectedGender(gender);
    setValue('gender', gender);
  };

  const handleProfileImageSelect = (image) => {
    setSelectedProfileImage(image);
    setValue('profile_picture', image);  // Store the selected image URL in the form state
  };

  // Handle step 1 (Personal Information)
  const onStep1Submit = async (data) => {
    setStep(2);  // Move to the next step (DOB and Gender)
  };

  // Handle step 2 (DOB and Gender)
  const onStep2Submit = async (data) => {
    const today = new Date();
    const selectedDate = new Date(dateOfBirth);
  
    // Check if DOB is today or future
    if (selectedDate >= today.setHours(0, 0, 0, 0)) {
      Alert.alert('Invalid Date of Birth', 'Date of Birth cannot be today or a future date.');
      return;
    }
  
    // Check if Gender is selected
    if (!selectedGender) {
      Alert.alert('Gender Required', 'Please select your gender.');
      return;
    }
  
    setStep(3); // Move to next step if all valid
  };
``  

  // Handle step 3 (Username and Email)
  const onStep3Submit = async (data) => {
    setStep(4);  // Move to the next step (Profile Picture)
  };

  // Handle step 4 (Profile Picture)
  const onStep4Submit = async (data) => {
    setStep(5);  // Move to the next step (Password)
  };

  // Handle step 5 (Password and Confirm Password) - Actual Registration Submission
  const onStep5Submit = async (data) => {
    try {
      setLoading(true);
  
      // Create FormData
      const formData = new FormData();
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('middle_name', data.middle_name || '');
      formData.append('date_of_birth', data.date_of_birth);
      formData.append('gender', data.gender);
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirm_password', data.confirm_password);
  
      // Attach profile picture only if selected
      if (selectedProfileImage) {
        formData.append('profile_picture', {
          uri: selectedProfileImage.uri,
          name: selectedProfileImage.fileName || 'profile.jpg',
          type: selectedProfileImage.type || 'image/jpeg',
        });
      }
  
      // Also attach phone_number (required)
      formData.append('phone_number', data.phone_number);
  
      console.log('🚀 FormData:', formData);
  
      const response = await registerUser(formData, true); // (true = multipart)
  
      console.log('API Response:', response.data);
  
      if (response.status === 201) {
        Alert.alert("Registration successful", "Please verify your email with the OTP.");
        navigation.navigate('VerifyOTP', {
          email: data.email,
          otp_type: 'register',
        });
      } else {
        Alert.alert("Registration failed", "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.log('Error during registration:', error);
  
      if (error.response) {
        console.log('Error response:', error);
        Alert.alert("Registration failed", error.response.data.message || "An error occurred during registration.");
      } else {
        Alert.alert("Error", "An error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Define colors for Light and Dark Modes based on your instructions
  const themeColors = {
    light: {
      background: '#FFFFFF',
      text: '#000000',
      primary: '#3E7D41',  // Primary Green
      secondary: '#4FC3F7',  // Sky Blue
      accent: '#FF8F00',  // Sunset Orange
      button: '#3E7D41', // Primary Green for light mode
      buttonText: '#FFFFFF', // White text for the button
      inputBackground: '#F1F1F1',
      inputText: '#000000',
      label: '#3E7D41',
    },
    dark: {
      background: '#121917', // Dark greenish background
      text: '#FFFFFF',
      primary: '#4CAF50',  // Softer Green
      secondary: '#0288D1',  // Deeper Blue
      accent: '#FFA726',  // Brighter Orange
      button: '#4CAF50', // Brighter Green for dark mode
      buttonText: '#FFFFFF', // White text for the button
      inputBackground: '#2D2D2D',
      inputText: '#FFFFFF',
      label: '#5B9A5E',
    }
  };

  const currentColors = themeColors[theme];  // Get the current colors based on the theme

  // Dynamic styles based on the theme
  const styles = StyleSheet.create({
    backgroundImage: {
      flex: 1, // This ensures the image covers the full screen
      position: 'absolute',  // Keep it in the background
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      resizeMode: 'cover',
      opacity: theme === 'light' ? 0.15 : 0.08, // Adjust opacity for light/dark mode
      zIndex: -1, // Ensure image stays behind the content
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: currentColors.text,
    },
    stepContainer: {
      marginBottom: 20,
      backgroundColor: 'transparent',
      borderRadius: 8,
      paddingVertical: 20,
      paddingHorizontal: 15,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      color: currentColors.label,
    },
    marginTop: {
      marginTop: 20,
    },
    input: {
      height: 56,
      borderBottomWidth: 1,
      borderBottomColor: currentColors.primary,
      paddingLeft: 16,
      paddingRight: 16,
      borderRadius: 0,
      marginBottom: 20,
      backgroundColor: 'transparent',
      color: currentColors.inputText,
      fontSize: 16,
    },
    buttonContainer: {
      marginTop: 16,
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: currentColors.button,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    loginButtonText: {
      color: currentColors.buttonText,
      fontWeight: 'bold',
      fontSize: 16,
    },
    backArrow: {
      position: 'absolute',
      top: 40,
      left: 20,
      zIndex: -1,
    },
    backText: {
      color: currentColors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentColors.background }}>
    <ImageBackground source={require('../../assets/images/nature-background.png')} style={styles.backgroundImage} />
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Back Arrow and Text */}
        <View style={styles.backArrow}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Ionicons name="arrow-back" color={"#000000"} style={{ marginRight: 10}} />
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Register</Text>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Controller
              control={control}
              name="first_name"
              rules={{
                required: 'First Name is required',
                pattern: { value: /^[A-Za-z]+$/, message: 'First Name must contain only alphabets' }
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="First Name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.first_name?.message}
                />
              )}
            />


            <Controller
              control={control}
              name="middle_name"
              rules={{
                validate: (value) => {
                  if (!value) return true;  // If empty, it's valid
                  return /^[A-Za-z]+$/.test(value) || 'Middle Name must contain only alphabets';
                }
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Middle Name (Optional)"
                  value={value}
                  onChangeText={onChange}
                  error={errors.middle_name?.message}
                />
              )}
            />


            <Controller
              control={control}
              name="last_name"
              rules={{
                required: 'Last Name is required',
                pattern: { value: /^[A-Za-z]+$/, message: 'Last Name must contain only alphabets' }
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Last Name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.last_name?.message}
                />
              )}
            />


            <ButtonWithLoading
              loading={loading}
              onPress={handleSubmit(onStep1Submit)}
              title="Next"
            />
          </View>
        )}

        {/* Step 2: Date of Birth and Gender */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Date of Birth</Text>
            <DatePicker
              date={dateOfBirth}
              onDateChange={onDateChange}
            />
            <Text style={styles.sectionTitle}>Gender</Text>
            <View style={styles.marginTop}>
              <GenderSelector
                selectedGender={selectedGender}
                onSelectGender={handleGenderSelection}
              />
            </View>

            <ButtonWithLoading
              loading={loading}
              onPress={handleSubmit(onStep2Submit)}
              title="Next"
            />
          </View>
        )}

        {/* Step 3: Username and Email */}
        {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.sectionTitle}>Username and Email</Text>

              <Controller
                control={control}
                name="username"
                rules={{
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters long',
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                    message: 'Username must contain both letters and numbers only',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    label="Username"
                    value={value}
                    onChangeText={(text) => {
                      onChange(text); // Must call onChange
                    }}
                    onBlur={() => {
                      onBlur();
                      handleUsernameBlur(value); // your server check function
                    }}
                    error={errors.username?.message}
                  />
                )}
              />

              
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                    message: 'Invalid email format (use only lowercase letters)',
                  },
                }}
                
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    label="Email"
                    value={value}
                    onChangeText={text => onChange(text)}
                    onBlur={() => {
                      onBlur();
                      handleEmailBlur(value);
                    }}
                    error={errors.email?.message}
                    keyboardType="email-address"
                  />
                )}
              />

              <ButtonWithLoading loading={loading} onPress={handleSubmit(onStep3Submit)} title="Next" />
            </View>
          )}

          {/* Step 4: Profile Picture & Phone */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.sectionTitle}>Profile Picture & Phone Number</Text>

              <ProfilePicker onProfileImageSelect={image => {
                setSelectedProfileImage(image);
                setValue('profile_picture', image);
              }} />

              <Controller
                control={control}
                name="phone_number"
                rules={{
                  required: 'Phone Number is required',
                  minLength: { value: 10, message: 'Phone number must be at least 10 digits' },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Phone number must contain only numbers',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    label="Phone Number"
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                      onBlur();
                      handlePhoneBlur(value);
                    }}
                    error={errors.phone_number?.message}
                    keyboardType="phone-pad"
                  />
                )}
              />

              <ButtonWithLoading loading={loading} onPress={handleSubmit(onStep4Submit)} title="Next" />
            </View>
          )}


        {/* Step 5: Password */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Set Your Password</Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: 'Password must include uppercase, lowercase, number, and special character',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={{ position: 'relative' }}>
                  <FormInput
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    error={errors.password?.message}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 15, top: 35 }}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility-off" : "visibility"}
                      size={24}
                      color="grey"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />


            <Controller
              control={control}
              name="confirm_password"
              rules={{
                required: 'Confirm Password is required',
                validate: (value) => value === getValues('password') || 'Passwords do not match',
              }}
              render={({ field: { onChange, value } }) => (
                <View style={{ position: 'relative' }}>
                  <FormInput
                    label="Confirm Password"
                    value={value}
                    onChangeText={onChange}
                    error={errors.confirm_password?.message}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: 15, top: 35 }}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? "visibility-off" : "visibility"}
                      size={24}
                      color="grey"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />



            <ButtonWithLoading
              loading={loading}
              onPress={handleSubmit(onStep5Submit)}
              title="Submit"
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
