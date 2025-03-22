import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TrailsScreen from '../../screens/Trails/TrailsScreen';
import TrailDetailsScreen from '../../screens/Trails/TrailDetailsScreen';

const Stack = createNativeStackNavigator();

export default function TrailsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Trails" component={TrailsScreen} />
      <Stack.Screen name="TrailDetails" component={TrailDetailsScreen} />
    </Stack.Navigator>
  );
}
