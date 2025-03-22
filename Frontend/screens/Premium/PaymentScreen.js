import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function PaymentScreen() {
  const handlePayment = () => {
    Alert.alert("Payment Successful", "Welcome to Outspire Premium!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Payment</Text>
      <Text style={styles.amount}>Rs. 299/month</Text>

      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payText}>Pay with Esewa/Khalti</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#007bff', marginBottom: 10 },
  amount: { fontSize: 18, marginBottom: 30, color: '#333' },
  payButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 8 },
  payText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
