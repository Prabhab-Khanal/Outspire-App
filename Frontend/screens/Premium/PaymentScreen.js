import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { initiateKhaltiPayment } from '../../services/paymentService';

export default function PaymentScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const handlePayment = async () => {
    try {
      const amount = selectedPlan === 'monthly' ? 1499 : 14999;
      const { payment_url, pidx, already_premium } = await initiateKhaltiPayment(userToken, amount, selectedPlan);

      if (already_premium) {
        Alert.alert('Premium Member', 'You are already enjoying Premium benefits!');
        return;
      }

      navigation.navigate('KhaltiWebView', { paymentUrl: payment_url, pidx });

    } catch (error) {
      console.log('Payment Error:', error?.response?.data || error.message || error);
      const errorMsg = error?.response?.data?.error || 'Could not initiate payment. Please try again later.';
      Alert.alert('Payment Error', errorMsg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Khalti Logo */}
      <Image
        source={{ uri: 'https://khalti.com/static/images/logo/khalti-logo-purple.e7b60c3f5797.png' }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.header}>Upgrade to Premium</Text>
      <Text style={styles.subHeader}>Select a subscription plan that suits you best.</Text>

      {/* Plans */}
      <View style={styles.plansContainer}>
        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedCard]}
          onPress={() => setSelectedPlan('monthly')}
        >
          <Text style={styles.planTitle}>Monthly Subscription</Text>
          <Text style={styles.planPrice}>Rs. 1,499</Text>
          <Text style={styles.planDuration}>Billed monthly</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'yearly' && styles.selectedCard]}
          onPress={() => setSelectedPlan('yearly')}
        >
          <View style={styles.saveTag}>
            <Text style={styles.saveTagText}>Save 20%</Text>
          </View>

          <Text style={styles.planTitle}>Yearly Subscription</Text>
          <Text style={styles.planPrice}>Rs. 14,999</Text>
          <Text style={styles.planDuration}>Billed annually</Text>
        </TouchableOpacity>
      </View>

      {/* Pay Button */}
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Proceed to Pay with Khalti</Text>
      </TouchableOpacity>

      {/* Terms */}
      <Text style={styles.termsText}>
        You can cancel anytime from your profile settings.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    flexGrow: 1,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 30,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  plansContainer: {
    width: '100%',
    alignItems: 'center',
  },
  planCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#5c2d91',
    borderWidth: 2,
    shadowColor: '#5c2d91',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  planTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  planPrice: { fontSize: 24, fontWeight: 'bold', color: '#5c2d91', marginBottom: 5 },
  planDuration: { fontSize: 14, color: '#777' },
  saveTag: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#ff9800',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  saveTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  payButton: {
    marginTop: 40,
    backgroundColor: '#5c2d91',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
});
