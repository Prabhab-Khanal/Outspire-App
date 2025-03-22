import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const groups = [
  { id: '1', name: 'Hikers Nepal' },
  { id: '2', name: 'Mountaineering Enthusiasts' },
];

export default function GroupScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Groups</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() => navigation.navigate('Message', { user: item })}
          >
            <Text style={styles.groupName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#007bff', marginBottom: 15 },
  groupCard: { padding: 15, backgroundColor: 'white', borderRadius: 10, marginVertical: 5, elevation: 2 },
  groupName: { fontSize: 18, fontWeight: 'bold' },
});
