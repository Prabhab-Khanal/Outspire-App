import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import ProfileCompletionNavigator from './ProfileCompletionNavigator'; // New navigator
import useAuth from '../hooks/useAuth';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, user } = useAuth(); // Access the context and the user state

  return (
    <NavigationContainer>
      {userToken ? (
        // If user is logged in, check if the profile is complete
        <ProfileCompletionNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
