import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompleteProfileScreen from '../screens/Profile/CompleteProfile'; // Add the correct path
import DashboardNavigator from './DashboardNavigator'; // The dashboard you want to redirect to

const Stack = createNativeStackNavigator();

export default function ProfileCompletionNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="DashboardNavigator" component={DashboardNavigator} />
    </Stack.Navigator>
  );
}
