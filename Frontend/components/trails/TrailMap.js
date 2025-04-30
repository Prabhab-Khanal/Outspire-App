// components/Trails/TrailMap.js

import React from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';

export default function TrailMap({
  rawPoints,
  trailSegments,
  mapType,
  onAddTrailPoint,
  onUndoLastPoint,
}) {
  return (
    <View style={{ margin: 10, borderRadius: 10, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#f0f0f0' }}>
        <FontAwesome name="map" size={18} color="#3a7758" />
        <Text style={{ marginLeft: 8, fontSize: 16, color: '#555' }}>Tap on Map to add Points</Text>
      </View>

      <MapView
        style={{ height: 400 }}
        mapType={mapType}
        initialRegion={{
          latitude: 27.7172,
          longitude: 85.324,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
        onPress={onAddTrailPoint}
      >
        <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} tileSize={256} />
        
        {/* Safe Markers */}
        {rawPoints && rawPoints.length > 0 && rawPoints.map((pt, idx) => (
          <Marker
            key={idx}
            coordinate={{ latitude: pt.latitude, longitude: pt.longitude }}
            title={pt.name || `Point ${idx + 1}`}
            description={pt.image ? 'Image attached' : undefined}
            pinColor="#3a7758"
          />
        ))}

        {/* Safe Polylines */}
        {trailSegments && trailSegments.length > 0 && trailSegments.map((seg, idx) => (
          <Polyline
            key={idx}
            coordinates={seg.points}
            strokeWidth={4}
            strokeColor={seg.routed ? '#3a7758' : '#e74c3c'}
            lineDashPattern={seg.routed ? undefined : [6, 6]}
          />
        ))}
      </MapView>

      {/* Undo Button */}
      <View style={{ marginTop: 10, alignItems: 'center' }}>
        <Text
          style={{
            backgroundColor: rawPoints.length === 0 ? '#ccc' : '#3a7758',
            color: '#fff',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            overflow: 'hidden',
            fontWeight: 'bold',
          }}
          onPress={onUndoLastPoint}
        >
          Undo Last Point
        </Text>
      </View>
    </View>
  );
}
