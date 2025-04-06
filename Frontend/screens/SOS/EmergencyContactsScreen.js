import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet,
} from 'react-native';
import {
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
} from '../../services/sosService';

export default function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await getEmergencyContacts();
      setContacts(data);
    } catch (err) {
      console.log('❌ Error fetching contacts:', err);
      Alert.alert('Error', 'Could not load emergency contacts.');
    }
  };

  const handleAddContact = async () => {
    if (!name || !phone) {
      Alert.alert('Missing Info', 'Please enter both name and phone.');
      return;
    }
    try {
      await addEmergencyContact({ name, phone });
      setName('');
      setPhone('');
      fetchContacts();
    } catch (err) {
      console.log('❌ Add contact error:', err);
      Alert.alert('Error', 'Failed to add contact.');
    }
  };

  const handleDeleteContact = async (id) => {
    Alert.alert('Confirm', 'Remove this contact?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEmergencyContact(id);
            fetchContacts();
          } catch (err) {
            console.log('❌ Delete contact error:', err);
            Alert.alert('Error', 'Failed to delete contact.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.contactItem}>
      <View>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleDeleteContact(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Emergency Contacts</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
        <Text style={styles.addButtonText}>Add Contact</Text>
      </TouchableOpacity>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#d9534f', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20,
  },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  contactItem: {
    backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  contactName: { fontWeight: 'bold', fontSize: 16 },
  contactPhone: { color: '#555' },
  removeButton: {
    backgroundColor: '#dc3545', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6,
  },
  removeButtonText: { color: 'white', fontWeight: 'bold' },
});
