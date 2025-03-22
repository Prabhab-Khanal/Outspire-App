import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PremiumScreen from '../../screens/Premium/PremiumScreen';
import PaymentScreen from '../../screens/Premium/PaymentScreen';

const Stack = createNativeStackNavigator();

export default function PremiumStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}
