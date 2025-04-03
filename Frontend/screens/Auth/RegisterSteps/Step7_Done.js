import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Step7_Done({ navigation }) {
  const handleGoToLogin = () => {
    navigation.navigate('Login'); // Make sure 'Login' is defined in your navigator
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration Complete!</Text>
      <Text style={styles.subtitle}>You're all set to explore trails with Outspire.</Text>
      <Button title="Go to Login" onPress={handleGoToLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
});
