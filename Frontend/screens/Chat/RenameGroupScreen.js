import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { renameGroup } from '../../services/chatService';

export default function RenameGroupScreen({ route, navigation }) {
  const { groupId, groupName } = route.params;

  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Group name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      await renameGroup(groupId, newName.trim());
      Alert.alert('Success', 'Group renamed successfully!');
      navigation.goBack(); // Go back to previous screen
    } catch (err) {
      console.error('Error renaming group:', err);
      Alert.alert('Error', 'Failed to rename group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rename Group</Text>

      <TextInput
        style={styles.input}
        placeholder={groupName}
        value={newName}
        onChangeText={setNewName}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRename}>
          <Text style={styles.buttonText}>Rename</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
