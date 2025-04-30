import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import EmailVerificationScreen from '../screens/Auth/OTPVerifyScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import CreateProfileScreen from '../screens/Profile/CompleteProfile'
import SetNewPasswordScreen from '../screens/Auth/SetNewPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ cardStyle: { backgroundColor: 'transparent' } }}>
      {/* Remove header for Login screen */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false ,animationEnabled: false, detachPreviousScreen: false,   }}  // Hide header for Login screen
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ headerShown: false}}  // Remove header for Register screen
      />

      <Stack.Screen 
          name="VerifyOTP" 
          component={EmailVerificationScreen}
          options={{ headerShown: false}} 
        />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false}}/>
      <Stack.Screen name="Profile" component={CreateProfileScreen} />
      <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} options={{ headerShown: false}}  />
    </Stack.Navigator>
  );
}
