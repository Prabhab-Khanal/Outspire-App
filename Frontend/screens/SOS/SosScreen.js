import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isCounting) return;

      e.preventDefault();
      Alert.alert(
        'Leave SOS?',
        'Do you want to cancel SOS or continue the countdown?',
        [
          {
            text: 'Cancel SOS & Leave',
            style: 'destructive',
            onPress: () => {
              cancelSOS();
              navigation.dispatch(e.data.action);
            },
          },
          {
            text: `Continue (${countdown})`,
            style: 'default',
            onPress: () => {},
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isCounting, countdown]);

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
        console.log('🚨 SOS Alert Sent Automatically!');
        sendLocation();
      }
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    setIsCounting(false);
    setSosCancelled(true);
    console.log('🛑 SOS Stopped by user.');
  };

  const sendSOSNow = () => {
    clearInterval(timerRef.current);
    setIsCounting(false);
    setSosSent(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    console.log('🚨 SOS Sent Immediately!');
    sendLocation();
  };

  const resetState = () => {
    clearInterval(timerRef.current);
    setCountdown(10);
    setIsCounting(false);
    setSosSent(false);
    setSosCancelled(false);
  };

  const sendLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      // 🔹 Send location to backend
      const response = await fetch('http://<YOUR_BACKEND_URL>/api/sos/send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_JWT_TOKEN_HERE`, // Replace with real token
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('🚨 SOS Sent', 'Your location has been shared.');

        // 🔹 Load contacts from local storage and call them
        const stored = await AsyncStorage.getItem('emergency_contacts');
        if (stored) {
          const contacts = JSON.parse(stored);

          for (const contact of contacts) {
            Linking.openURL(`tel:${contact.phone}`);
            await new Promise((res) => setTimeout(res, 3000));
          }
        } else {
          console.log('No emergency contacts found.');
        }
      } else {
        Alert.alert('SOS Failed', data.message || 'Could not send SOS.');
      }
    } catch (err) {
      console.log('❌ SOS Error:', err.message);
      Alert.alert('Error', 'Something went wrong while sending SOS.');
    }
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

      {sosCancelled && <Text style={styles.cancelledMsg}>🛑 SOS Stopped</Text>}
      {sosSent && (
        <Text style={styles.helpMsg}>
          🚨 Help is on the way. Please stay calm and be patient.
        </Text>
      )}

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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d9534f',
    marginBottom: 20,
  },
  progressWrapper: {
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  timerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#d9534f',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: 160,
    alignItems: 'center',
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sendNowButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: 160,
    alignItems: 'center',
  },
  sendNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelledMsg: {
    marginTop: 20,
    fontSize: 18,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  helpMsg: {
    marginTop: 20,
    fontSize: 18,
    color: '#28a745',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  manageContactsButton: {
    marginTop: 30,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    width: 220,
    alignItems: 'center',
  },
  manageContactsText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
