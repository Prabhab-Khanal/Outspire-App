import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import AccountSettingsScreen from '../../screens/Settings/AccountSettingsScreen';
import NotificationSettingsScreen from '../../screens/Settings/NotificationSettingsScreen';
import SubscriptionScreen from '../../screens/Settings/SubscriptionScreen';
import PreferenceSettingsScreen from '../../screens/Settings/PreferenceSettingsScreen';
import EmergencyContactsScreen from '../../screens/Settings/EmergencyContactsScreen';
import FollowersScreen from '../../screens/Settings/FollowersScreen';
const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false}}  />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Preference" component={PreferenceSettingsScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="Followers" component={FollowersScreen} />
    </Stack.Navigator>
  );
}
