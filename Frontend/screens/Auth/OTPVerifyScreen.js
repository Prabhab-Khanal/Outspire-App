import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert
} from 'react-native';
import { verifyOTP, resendOTP } from '../../services/authService';
import { MaterialIcons } from '@expo/vector-icons'; // For back arrow

export default function EmailVerificationScreen({ route, navigation }) {
  const { email, otp_type } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (text.length > 1) text = text.charAt(0);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index !== 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      return Alert.alert('Error', 'Please enter the complete 6-digit code.');
    }
    try {
      setLoading(true);
      const response = await verifyOTP({ email, otp: code, otp_type });
      if (response.status === 200) {
        if (otp_type === 'register') {
          navigation.replace('Login');
        } else if (otp_type === 'reset') {
          navigation.replace('SetNewPassword', { email });
        }
      } else {
        Alert.alert('Failed', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Verification Error:', error);
      Alert.alert('Error', 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOTP = async () => {
    if (timer > 0) return;
    try {
      setResending(true);
      const response = await resendOTP({ email, otp_type });
      if (response.status === 200) {
        Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
        setTimer(120); // Reset to 2 minutes
      }
    } catch (error) {
      console.error('Resend OTP Error:', error);
      Alert.alert('Error', 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const formatTime = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
        <MaterialIcons name="arrow-back" size={28} color="#5A4322" />
      </TouchableOpacity>

      <Image
        source={{ uri: 'https://img.icons8.com/color/96/secured-letter.png' }}
        style={styles.image}
      />

      <Text style={styles.heading}>Verify Your Email Address</Text>

      <Text style={styles.timer}>
        {timer > 0 ? `Time left: ${formatTime(timer)}` : 'Code expired'}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleBackspace(e, index)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, loading && { opacity: 0.6 }]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.verifyButtonText}>Verify Email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.resendButton,
          (timer > 0 || resending) && { opacity: 0.5 }
        ]}
        onPress={handleResendOTP}
        disabled={timer > 0 || resending}
      >
        {resending ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.resendButtonText}>
            {timer > 0 ? `Resend in ${formatTime(timer)}` : 'Resend Code'}
          </Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFE6DD', // earthy background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5A4322', // dark brown heading
    marginBottom: 10,
    marginTop: 10,
  },
  timer: {
    fontSize: 16,
    marginBottom: 20,
    color: '#7D6651', // muted brown
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#C6B49E', // clay-beige border
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#FFF8F0', // very soft cream
    color: '#5A4322',
  },
  verifyButton: {
    backgroundColor: '#A67B5B', // earthy brown-orange
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
    marginTop: 10,
    elevation: 2,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 10,
  },
  resendButtonText: {
    color: '#7D6651', // muted brown
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
