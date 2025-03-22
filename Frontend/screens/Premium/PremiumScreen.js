import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PremiumScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upgrade to Premium</Text>
      <Text style={styles.description}>
        Unlock exclusive trails, offline maps, alerts and more.
      </Text>
      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={() => navigation.navigate('Payment')}
      >
        <Text style={styles.upgradeText}>Upgrade Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#007bff', marginBottom: 20 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  upgradeButton: { backgroundColor: '#ffcc00', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
  upgradeText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
});
