import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuth from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/Main/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken } = useAuth();

  return (
    <NavigationContainer>
      {userToken ? (
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
