import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import AccountSettingsScreen from '../../screens/Settings/AccountSettingsScreen';
import NotificationSettingsScreen from '../../screens/Settings/NotificationSettingsScreen';
import SubscriptionScreen from '../../screens/Settings/SubscriptionScreen';
import PrivacyScreen from '../../screens/Settings/PrivacyScreen';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}
