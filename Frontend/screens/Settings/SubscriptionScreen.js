import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SubscriptionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Subscription & Payments</Text>
      <Text>View your premium plan and manage payment options.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#007bff', marginBottom: 20 },
});
