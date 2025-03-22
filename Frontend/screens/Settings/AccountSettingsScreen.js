import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AccountSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Account Settings</Text>
      <Text>Here you can update your profile, email or password.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#007bff', marginBottom: 20 },
});
