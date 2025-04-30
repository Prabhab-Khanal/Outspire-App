import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getSubscriptionStatus } from '../../services/paymentService'; // Adjust path
import { AuthContext } from '../../contexts/AuthContext'; // Token context
import moment from 'moment'; // Import moment for date handling

export default function SubscriptionScreen() {
  const { userToken } = useContext(AuthContext);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await getSubscriptionStatus(userToken);
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = (endDate) => {
    const today = moment();
    const end = moment(endDate);
    const diff = end.diff(today, 'days');
    return diff >= 0 ? diff : 0;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Subscription & Payments</Text>

      {subscription?.is_active ? (
        <View style={styles.card}>
          <Text style={styles.planType}>🛡️ Premium Member</Text>
          <Text style={styles.detail}>Plan Type: <Text style={styles.highlight}>{subscription.plan}</Text></Text>
          <Text style={styles.detail}>Valid Until: <Text style={styles.highlight}>{subscription.end_date}</Text></Text>
          <Text style={styles.detail}>
            Days Remaining: <Text style={styles.highlight}>{calculateDaysLeft(subscription.end_date)} days</Text>
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.planType}>⚡ Regular Member</Text>
          <Text style={styles.detail}>Upgrade to Premium to unlock more features!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f9f9f9' 
  },
  header: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#007bff', 
    marginBottom: 20 
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  planType: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#28a745',
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#007bff',
  }
});
