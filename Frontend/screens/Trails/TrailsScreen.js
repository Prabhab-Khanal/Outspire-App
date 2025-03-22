import React from 'react';
import everestImg from '../../assets/images/everest.jpeg';
import annapurnaImg from '../../assets/images/annapurna.jpeg';
import langtangImg from '../../assets/images/langtang.jpeg';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';

const trails = [
  { id: '1', name: 'Everest Base Camp', location: 'Nepal', image: everestImg },
  { id: '2', name: 'Annapurna Circuit', location: 'Nepal', image: annapurnaImg },
  { id: '3', name: 'Langtang Valley', location: 'Nepal', image: langtangImg },
];

export default function TrailsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore Trails</Text>
      <FlatList
        data={trails}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('TrailDetails', { trail: item })}
            style={styles.card}
          >
            <Image source={ item.image } style={styles.image} />
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>{item.location}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: '#007bff' },
  card: { backgroundColor: 'white', marginBottom: 15, borderRadius: 10, overflow: 'hidden', elevation: 3 },
  image: { width: '100%', height: 150 },
  title: { fontSize: 18, fontWeight: 'bold', padding: 10 },
  subtitle: { fontSize: 14, color: 'gray', paddingHorizontal: 10, paddingBottom: 10 },
});
