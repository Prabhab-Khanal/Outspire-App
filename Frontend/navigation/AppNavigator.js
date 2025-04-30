import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import DashboardNavigator from './DashboardNavigator'; // Dashboard Navigator
import { AuthContext } from '../contexts/AuthContext'; // Import the AuthContext
import { View, ActivityIndicator } from 'react-native'; // Import View and ActivityIndicator

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, loadToken } = useContext(AuthContext); // Access userToken from context
  const [isLoading, setIsLoading] = useState(true);

  // Log userToken and loading state for debugging
  useEffect(() => {

    loadToken().then(() => {
      setIsLoading(false); // Set loading to false after loading the token
    }).catch(error => {
      console.error('Error loading token:', error);
      setIsLoading(false); // Even if loading fails, stop loading
    });
  }, [loadToken]);

  // If loading, show a loading spinner or splash screen
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? (
        // If user is logged in, navigate to Dashboard directly
        <DashboardNavigator />
      ) : (
        // If not logged in, navigate to AuthNavigator
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
