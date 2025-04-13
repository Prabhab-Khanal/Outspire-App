import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Button } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { verifyOTP, resendOTP } from '../../services/authService';  // Import the OTP verification and resend function from authService

const OTPVerifyScreen = ({ route, navigation }) => {
  const { email, otp_type } = route.params; // Email and OTP type passed from LoginScreen
  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm();
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300);  // 5 minutes in seconds
  const [otp, setOtp] = useState(['', '', '', '', '', '']);  // Array to store OTP values

  // Handle OTP submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Prepare the data to send for OTP verification
      const otpData = {
        email,
        otp: otp.join(''),  // Join the OTP digits from the array
        otp_type : "register",  // 'register' or 'reset'
      };

      // Debugging: Log the OTP data being sent
      console.log("Sending OTP data:", otpData);

      // Call the verifyOTP function from authService
      const response = await verifyOTP(otpData);

      // Debugging: Log the response from the server
      console.log("OTP verification response:", response);

      // If OTP verification is successful
      if (response.status === 200) {
        Alert.alert("OTP verified", "Your email has been successfully verified.");
        navigation.navigate('Login');  // Redirect to Login after OTP verification
      } else {
        Alert.alert("OTP verification failed", "Invalid OTP. Please try again.");
      }
    } catch (error) {
      // Debugging: Log the error details
      console.log("Error occurred during OTP verification:", error);

      // Check if error response exists and log it
      if (error.response) {
        console.log("Error response from server:", error.response.data);
        Alert.alert("Error", "An error occurred during OTP verification.");
      } else {
        Alert.alert("Error", "An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Timer functionality (countdown)
  useEffect(() => {
    if (timer === 0) {
      Alert.alert("OTP Expired", "The OTP has expired. Please request a new OTP.");
      // Handle expiration (e.g., disable the OTP fields or allow the user to request a new OTP)
    } else {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);  // Cleanup on component unmount
    }
  }, [timer]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Focus on the next input box automatically
      if (value && index < 5) {
        setValue(`otp${index + 1}`, '');  // Clear next box if there's a value
      }
    }
  };

  // Resend OTP (called when OTP expires)
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await resendOTP({ email, otp_type });
      if (response.status === 200) {
        Alert.alert("OTP Sent", "A new OTP has been sent to your email.");
        setTimer(300);  // Reset the timer to 5 minutes
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text>Time left: {Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60} minutes</Text>

      {/* OTP Input Fields (6 boxes) */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOtpChange(index, value)}
            keyboardType="numeric"
            maxLength={1}
            autoFocus={index === 0} // Autofocus on the first input box
          />
        ))}
      </View>

      {errors.otp && <Text style={styles.error}>{errors.otp?.message}</Text>}

      <Button
        title={loading ? "Verifying..." : "Verify OTP"}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      />

      {timer === 0 && !loading && (
        <Button
          title="Resend OTP"
          onPress={handleResendOTP}
        />
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },
  otpInput: {
    width: 40,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 18,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default OTPVerifyScreen;
