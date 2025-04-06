import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Linking from 'expo-linking';
import {
  sendSOS,
  getEmergencyContacts,
} from '../../services/sosService';

export default function SosScreen() {
  const navigation = useNavigation();
  const [countdown, setCountdown] = useState(10);
  const [isCounting, setIsCounting] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosCancelled, setSosCancelled] = useState(false);
  const timerRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      resetState();
      startCountdown();
      return () => clearInterval(timerRef.current);
    }, [])
  );

  const startCountdown = () => {
    if (isCounting) return;
    setIsCounting(true);
    let time = 10;
    setCountdown(time);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      time -= 1;
      setCountdown(time);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (time === 0) {
        clearInterval(timerRef.current);
        setIsCounting(false);
        setSosSent(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        handleSendSOS();
      }
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    setIsCounting(false);
    setSosCancelled(true);
  };

  const sendSOSNow = () => {
    clearInterval(timerRef.current);
    setIsCounting(false);
    setSosSent(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    handleSendSOS();
  };

  const handleSendSOS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(location.coords);
      const placeName = geocode?.[0]?.name || 'Unknown location';

      // Send to backend
      await sendSOS({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        place_name: placeName,
      });

      Alert.alert('🚨 SOS Sent', 'Your location was shared.');

      const contacts = await getEmergencyContacts();
      for (const contact of contacts) {
        Linking.openURL(`tel:${contact.phone}`);
        await new Promise((res) => setTimeout(res, 3000));
      }
    } catch (err) {
      console.log('❌ SOS error:', err);
      Alert.alert('Error', 'Failed to send SOS.');
    }
  };

  const resetState = () => {
    clearInterval(timerRef.current);
    setCountdown(10);
    setIsCounting(false);
    setSosSent(false);
    setSosCancelled(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Emergency SOS</Text>

      {isCounting && (
        <View style={styles.progressWrapper}>
          <AnimatedCircularProgress
            size={200}
            width={12}
            fill={(countdown / 10) * 100}
            tintColor="#d9534f"
            backgroundColor="#f1f1f1"
            rotation={0}
            lineCap="round"
          >
            {() => <Text style={styles.timerText}>{countdown}s</Text>}
          </AnimatedCircularProgress>

          <TouchableOpacity onPress={cancelSOS} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={sendSOSNow} style={styles.sendNowButton}>
            <Text style={styles.sendNowText}>Send SOS Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {sosCancelled && <Text style={styles.cancelledMsg}>🛑 SOS Cancelled</Text>}
      {sosSent && <Text style={styles.helpMsg}>🚨 SOS Sent! Help is on the way.</Text>}

      <TouchableOpacity
        onPress={() => navigation.navigate('EmergencyContacts')}
        style={styles.manageContactsButton}
      >
        <Text style={styles.manageContactsText}>Manage Emergency Contacts</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#d9534f', marginBottom: 20 },
  progressWrapper: { alignItems: 'center', gap: 20, marginTop: 10 },
  timerText: { fontSize: 30, fontWeight: 'bold', color: '#d9534f' },
  cancelButton: {
    backgroundColor: '#6c757d', padding: 12, borderRadius: 8, marginTop: 20, width: 160, alignItems: 'center',
  },
  cancelText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  sendNowButton: {
    backgroundColor: '#dc3545', padding: 12, borderRadius: 8, marginTop: 10, width: 160, alignItems: 'center',
  },
  sendNowText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  cancelledMsg: { marginTop: 20, fontSize: 18, color: '#dc3545', fontWeight: 'bold' },
  helpMsg: { marginTop: 20, fontSize: 18, color: '#28a745', fontWeight: 'bold' },
  manageContactsButton: {
    marginTop: 30, backgroundColor: '#007bff', padding: 12, borderRadius: 8, width: 220, alignItems: 'center',
  },
  manageContactsText: { color: 'white', fontWeight: 'bold' },
});
