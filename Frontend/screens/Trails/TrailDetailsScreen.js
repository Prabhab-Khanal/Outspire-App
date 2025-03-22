import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

export default function TrailDetailsScreen({ route }) {
  const { trail } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={ trail.image } style={styles.image} />
      <Text style={styles.title}>{trail.name}</Text>
      <Text style={styles.subtitle}>{trail.location}</Text>
      <Text style={styles.description}>
        This trail offers breathtaking views and is a must for trekking lovers. Make sure to check
        the weather and pack your essentials.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  image: { width: '100%', height: 250 },
  title: { fontSize: 24, fontWeight: 'bold', margin: 15, color: '#007bff' },
  subtitle: { fontSize: 16, marginHorizontal: 15, color: '#666' },
  description: { fontSize: 14, margin: 15, lineHeight: 20 },
});
