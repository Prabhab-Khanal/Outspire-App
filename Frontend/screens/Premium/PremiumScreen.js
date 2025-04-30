import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // FontAwesome5 icons

export default function PremiumScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🌲 Go Premium 🌲</Text>
      <Text style={styles.subHeader}>Adventure deeper, safer, smarter.</Text>

      {/* Features List */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureCard}>
          <FontAwesome5 name="hiking" size={26} color="#4a5c2c" style={styles.icon} />
          <Text style={styles.featureText}>Access Hidden Trails</Text>
        </View>

        <View style={styles.featureCard}>
          <FontAwesome5 name="map-marked-alt" size={26} color="#4a5c2c" style={styles.icon} />
          <Text style={styles.featureText}>Offline Maps</Text>
        </View>

        <View style={styles.featureCard}>
          <FontAwesome5 name="exclamation-triangle" size={26} color="#4a5c2c" style={styles.icon} />
          <Text style={styles.featureText}>Priority SOS Alerts</Text>
        </View>

        <View style={styles.featureCard}>
          <FontAwesome5 name="cloud-sun" size={26} color="#4a5c2c" style={styles.icon} />
          <Text style={styles.featureText}>Live Weather Updates</Text>
        </View>

        <View style={styles.featureCard}>
          <FontAwesome5 name="shield-alt" size={26} color="#4a5c2c" style={styles.icon} />
          <Text style={styles.featureText}>Emergency Contacts</Text>
        </View>

        <View style={styles.featureCard}>
          <FontAwesome5 name="ban" size={26} color="#4a5c2c" style={styles.icon} />
          <Text style={styles.featureText}>Ad-Free Experience</Text>
        </View>

        <View style={styles.featureCard}>
          <FontAwesome5 name="users" size={26} color="#4a5c2c" style={styles.icon} />
          <Text style={styles.featureText}>Premium Community Access</Text>
        </View>
      </View>

      {/* Upgrade Button */}
      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={() => navigation.navigate('Payment')}
      >
        <Text style={styles.upgradeButtonText}>Become a Premium Explorer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f2efe6', // earthy background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    paddingTop: 60,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4a5c2c', // forest green
    marginBottom: 10,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#6b705c',
    marginBottom: 30,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9ec', // light yellow earthy
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: {
    marginRight: 15,
  },
  featureText: {
    fontSize: 18,
    color: '#4a4e69',
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#8d8741', // earthy brown
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
