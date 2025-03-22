import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SosScreen from '../../screens/SOS/SosScreen';

const Stack = createNativeStackNavigator();

export default function SosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SOS" component={SosScreen} />
    </Stack.Navigator>
  );
}
