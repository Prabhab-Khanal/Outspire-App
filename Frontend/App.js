import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';  // Import ThemeProvider
import AppNavigator from './navigation/AppNavigator';
import { LogBox } from 'react-native';

// ignore the specific “Text strings must be rendered…” warning
LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text> component.',
   'AxiosError: Request failed with status code 404'
]);
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>  {/* Wrap your AppNavigator with ThemeProvider */}
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
