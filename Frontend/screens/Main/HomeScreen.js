import React from 'react';
import { View, Text, Button } from 'react-native';
import useAuth from '../../hooks/useAuth';

export default function HomeScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    console.log("Logging out...");
    await logout();
    console.log("User logged out");
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to Outspire!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
