import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { registerUser } from '../../services/authService';  // Import registerUser from authService

// Components
import FormInput from '../../components/FormInput';
import GenderSelector from '../../components/GenderSelector';
import DatePicker from '../../components/DatePicker';
import ButtonWithLoading from '../../components/ButtonWithLoading';

const RegisterScreen = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);  // Track the current step
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);  // State for showing date picker
  const [selectedGender, setSelectedGender] = useState('');

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

  // Handle step 1 (Personal Information)
  const onStep1Submit = async (data) => {
    setStep(2);  // Move to the next step (DOB and Gender)
  };

  // Handle step 2 (DOB and Gender)
  const onStep2Submit = async (data) => {
    setStep(3);  // Move to the next step (Username and Email)
  };

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
      // Collect all form data here to send in the final registration API call
      const allData = {
        first_name: data.first_name,
        last_name: data.last_name,
        middle_name: data.middle_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        username: data.username,
        email: data.email,
        profile_picture: data.profile_picture,
        password: data.password,
        confirm_password: data.confirm_password,
      };

      // Log the data that is being sent to the API
      console.log('Registration data:', allData);

      // Calling the registerUser function from authService
      const response = await registerUser(allData);

      // Log the API response
      console.log('API Response:', response);

      // If registration is successful, navigate to OTP verification screen
      if (response.status === 201) {
        Alert.alert("Registration successful", "Please verify your email with the OTP.");
        navigation.navigate('VerifyOTP', {
          email: data.email,  // Pass email to OTP screen
          otp_type: 'register',  // Pass OTP type ('register' or 'reset')
        });  // Redirect to OTP verification screen
      } else {
        Alert.alert("Registration failed", "Something went wrong. Please try again.");
      }
    } catch (error) {
      // Log the error to help debug
      console.log('Error during registration:', error);

      if (error.response) {
        // Log the full error response for debugging
        console.log('Error response:', error.response);
        Alert.alert("Registration failed", error.response.data.message || "An error occurred during registration.");
      } else {
        Alert.alert("Error", "An error occurred during registration.");
      }
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <FormInput
            control={control}
            name="first_name"
            label="First Name"
            rules={{ required: 'First Name is required' }}
            error={errors.first_name?.message}
          />

          <FormInput
            control={control}
            name="last_name"
            label="Last Name"
            rules={{ required: 'Last Name is required' }}
            error={errors.last_name?.message}
          />

          <FormInput
            control={control}
            name="middle_name"
            label="Middle Name (Optional)"
            error={errors.middle_name?.message}
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
          <DatePicker
            date={dateOfBirth}
            onDateChange={onDateChange}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
          />

          <GenderSelector
            selectedGender={selectedGender}
            onSelectGender={handleGenderSelection}
          />

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
          <FormInput
            control={control}
            name="username"
            label="Username"
            rules={{ required: 'Username is required' }}
            error={errors.username?.message}
          />

          <FormInput
            control={control}
            name="email"
            label="Email"
            rules={{
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' }
            }}
            error={errors.email?.message}
            keyboardType="email-address"
          />

          <ButtonWithLoading
            loading={loading}
            onPress={handleSubmit(onStep3Submit)}
            title="Next"
          />
        </View>
      )}

      {/* Step 4: Profile Picture */}
      {step === 4 && (
        <View style={styles.stepContainer}>
          <FormInput
            control={control}
            name="profile_picture"
            label="Profile Picture URL (Optional)"
            error={errors.profile_picture?.message}
          />

          <ButtonWithLoading
            loading={loading}
            onPress={handleSubmit(onStep4Submit)}
            title="Next"
          />
        </View>
      )}

      {/* Step 5: Password */}
      {step === 5 && (
        <View style={styles.stepContainer}>
          <FormInput
            control={control}
            name="password"
            label="Password"
            secureTextEntry
            rules={{
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            }}
            error={errors.password?.message}
          />

          <FormInput
            control={control}
            name="confirm_password"
            label="Confirm Password"
            secureTextEntry
            rules={{
              required: 'Confirm Password is required',
              validate: (value) => value === getValues("password") || 'Passwords do not match'
            }}
            error={errors.confirm_password?.message}
          />

          <ButtonWithLoading
            loading={loading}
            onPress={handleSubmit(onStep5Submit)}
            title="Submit"
          />
        </View>
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
  stepContainer: {
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default RegisterScreen;
