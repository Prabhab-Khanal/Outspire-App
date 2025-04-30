import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, Switch } from 'react-native';
import { getEmergencyContact, createEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../../services/profileService';
import { AuthContext } from '../../contexts/AuthContext';

export default function EmergencyContactsScreen() {
  const { userToken } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (userToken) {
      fetchEmergencyContact();
    } else {
      console.log('❌ User token is missing');
    }
  }, [userToken]);

  const fetchEmergencyContact = async () => {
    try {
      const res = await getEmergencyContact(userToken);
      setContacts(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      console.error('Error fetching emergency contact:', err);
      Alert.alert('Error', 'Could not load emergency contacts.');
    }
  };

  const handleAddContact = async () => {
    if (!name || !phone) {
      Alert.alert('Missing Info', 'Please enter both name and phone.');
      return;
    }
    if (phoneError || emailError) {
      Alert.alert('Invalid Input', 'Please fix input errors before submitting.');
      return;
    }
    const contactData = { contact_name: name, phone_number: phone, relationship, email, address, is_primary: isPrimary };

    try {
      await createEmergencyContact(contactData, userToken);
      resetForm();
      fetchEmergencyContact();
    } catch (err) {
      console.error('Error adding emergency contact:', err);
      Alert.alert('Error', 'Failed to add emergency contact.');
    }
  };

  const handleUpdateContact = async () => {
    if (!name || !phone || !selectedContactId) {
      Alert.alert('Missing Info', 'Please enter both name and phone.');
      return;
    }
    if (phoneError || emailError) {
      Alert.alert('Invalid Input', 'Please fix input errors before submitting.');
      return;
    }
    const contactData = { id: selectedContactId, contact_name: name, phone_number: phone, relationship, email, address, is_primary: isPrimary };

    try {
      await updateEmergencyContact(contactData, userToken);
      resetForm();
      fetchEmergencyContact();
    } catch (err) {
      console.error('Error updating emergency contact:', err);
      Alert.alert('Error', 'Failed to update emergency contact.');
    }
  };

  const handleEditContact = (id, currentName, currentPhone, currentRelationship, currentEmail, currentAddress, currentIsPrimary) => {
    setSelectedContactId(id);
    setName(currentName);
    setPhone(currentPhone);
    setRelationship(currentRelationship);
    setEmail(currentEmail);
    setAddress(currentAddress);
    setIsPrimary(currentIsPrimary);
  };

  const handleDeleteContact = async (id) => {
    Alert.alert('Confirm', 'Remove this contact?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await deleteEmergencyContact(id, userToken);
            setContacts(contacts.filter(contact => contact.id !== id));
          } catch (err) {
            console.error('Error deleting contact:', err);
            Alert.alert('Error', 'Failed to delete contact.');
          }
        }
      },
    ]);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelationship('');
    setEmail('');
    setAddress('');
    setIsPrimary(false);
    setSelectedContactId(null);
    setPhoneError('');
    setEmailError('');
  };

  const renderItem = ({ item }) => (
    <View style={styles.contactItem}>
      <View>
        <Text style={styles.contactName}>{item.contact_name}</Text>
        <Text style={styles.contactPhone}>{item.phone_number}</Text>
        <Text style={styles.contactRelationship}>{item.relationship}</Text>
        <Text style={styles.contactEmail}>{item.email}</Text>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity style={styles.updateButton} onPress={() => handleEditContact(item.id, item.contact_name, item.phone_number, item.relationship, item.email, item.address, item.is_primary)}>
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={() => handleDeleteContact(item.id)}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Emergency Contacts</Text>

      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          const phoneRegex = /^[0-9]{10,15}$/;
          setPhoneError(!phoneRegex.test(text) ? 'Phone must be 10-15 digits' : '');
        }}
        keyboardType="phone-pad"
        style={styles.input}
      />
      {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

      <TextInput
        placeholder="Relationship"
        value={relationship}
        onChangeText={setRelationship}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          setEmailError(text && !emailRegex.test(text) ? 'Invalid email format' : '');
        }}
        keyboardType="email-address"
        style={styles.input}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />

      <View style={styles.primarySwitchContainer}>
        <Text>Primary Contact</Text>
        <Switch value={isPrimary} onValueChange={setIsPrimary} />
      </View>

      {selectedContactId ? (
        <TouchableOpacity style={styles.addButton} onPress={handleUpdateContact}>
          <Text style={styles.addButtonText}>Update Contact</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.contact_name}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={<Text>No contacts found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#d9534f', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: '#fff' },
  addButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  errorText: { color: '#dc3545', fontSize: 13, marginBottom: 8 },
  contactItem: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactName: { fontWeight: 'bold', fontSize: 16 },
  contactPhone: { color: '#555' },
  contactRelationship: { color: '#777' },
  contactEmail: { color: '#888' },
  removeButton: { backgroundColor: '#dc3545', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  removeButtonText: { color: 'white', fontWeight: 'bold' },
  updateButton: { backgroundColor: '#ffc107', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 10 },
  updateButtonText: { color: 'white', fontWeight: 'bold' },
  contactActions: { flexDirection: 'row', alignItems: 'center' },
  primarySwitchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
});
