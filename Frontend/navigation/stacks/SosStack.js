// navigation/SosStack.js (or wherever your SOS stack is)

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SosScreen from '../../screens/SOS/SosScreen';
import EmergencyContactsScreen from '../../screens/SOS/EmergencyContactsScreen';

const Stack = createNativeStackNavigator();

export default function SosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SosScreen"
        component={SosScreen}
        options={{ title: 'Emergency SOS' }}
      />
      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{ title: 'Emergency Contacts' }}
      />
    </Stack.Navigator>
  );
}
