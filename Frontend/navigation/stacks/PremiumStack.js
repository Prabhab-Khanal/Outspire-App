import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PremiumScreen from '../../screens/Premium/PremiumScreen';
import PaymentScreen from '../../screens/Premium/PaymentScreen';
import KhaltiWebViewScreen from '../../screens/Premium/KhaltiWebViewScreen';

const Stack = createNativeStackNavigator();

export default function PremiumStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Premium" component={PremiumScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="KhaltiWebView" component={KhaltiWebViewScreen} options={{ headerShown: false }}/>

    </Stack.Navigator>
  );
}
