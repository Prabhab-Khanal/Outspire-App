import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';

export default function TrailMap({ rawPoints, trailSegments, mapType, setMapType, routingEnabled, setRoutingEnabled, addTrailPoint, undoLastPoint }) {
  return (
    <View style={styles.section}>
      <View style={styles.toggleRow}>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}>
          <FontAwesome name="map" size={16} color="#fff" />
          <Text style={styles.toggleText}>Map: {mapType}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.toggleButton, { backgroundColor: routingEnabled ? '#3a7758' : '#888' }]} onPress={() => setRoutingEnabled(!routingEnabled)}>
          <FontAwesome name="road" size={16} color="#fff" />
          <Text style={styles.toggleText}>Routing: {routingEnabled ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        mapType={mapType}
        initialRegion={{ latitude: 27.7172, longitude: 85.324, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
        onPress={addTrailPoint}
      >
        <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} tileSize={256} />
        {rawPoints.map((pt, idx) => (
          <Marker
            key={idx}
            coordinate={pt}
            draggable
          />
        ))}
        {trailSegments.map((seg, idx) => (
          <Polyline
            key={idx}
            coordinates={seg.points}
            strokeWidth={4}
            strokeColor={seg.routed ? '#3a7758' : '#e74c3c'}
            lineDashPattern={seg.routed ? undefined : [6, 6]}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.undoButton} onPress={undoLastPoint}>
        <FontAwesome name="undo" size={18} color="#fff" />
        <Text style={styles.undoText}>Undo Last Point</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { margin: 15, borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  toggleButton: { backgroundColor: '#3a7758', borderRadius: 8, padding: 10, flexDirection: 'row', alignItems: 'center' },
  toggleText: { marginLeft: 8, color: '#fff', fontWeight: 'bold' },
  map: { height: 400 },
  undoButton: { backgroundColor: '#888', margin: 10, padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  undoText: { marginLeft: 8, color: '#fff' },
});
