import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, ScrollView, Alert,
  Image, TouchableOpacity, Modal, StatusBar
} from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

const haversineDistance = (coords) => {
  const R = 6371;
  let distance = 0;
  for (let i = 1; i < coords.length; i++) {
    const lat1 = coords[i - 1].latitude * Math.PI / 180;
    const lon1 = coords[i - 1].longitude * Math.PI / 180;
    const lat2 = coords[i].latitude * Math.PI / 180;
    const lon2 = coords[i].longitude * Math.PI / 180;
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a = Math.sin(dlat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance += R * c;
  }
  return distance.toFixed(2);
};

export default function AddTrailScreen() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [rawPoints, setRawPoints] = useState([]);
  const [trailSegments, setTrailSegments] = useState([]);
  const [mapType, setMapType] = useState('standard');
  const [routingEnabled, setRoutingEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState('');
  const [distance, setDistance] = useState(0);
  const [altitude, setAltitude] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [newPoint, setNewPoint] = useState(null);
  const [pointName, setPointName] = useState('');
  const [pointImage, setPointImage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permission is required to pick an image.');
      }
    })();
  }, []);

  useEffect(() => {
    const allPoints = trailSegments.flatMap(seg => seg.points);
    if (allPoints.length >= 2) {
      setDistance(haversineDistance(allPoints));
      fetchMaxAltitude(allPoints);
    } else {
      setDistance(0);
      setAltitude(0);
    }
  }, [trailSegments]);

  const fetchMaxAltitude = async (allPoints) => {
    try {
      let maxElevation = 0;
  
      for (const seg of trailSegments) {
        const points = seg.points;
        if (!points || points.length < 2) continue;
  
        let sampled = [];
  
        if (points.length > 100) {
          const forty = Math.floor(points.length * 0.4);
          const twenty = 20;
  
          const first40 = points.slice(0, forty);
          const last40 = points.slice(points.length - forty);
          const middle20 = [];
  
          const step = Math.floor((points.length - 2 * forty) / twenty);
          for (let i = 0; i < twenty; i++) {
            const idx = forty + i * step;
            if (idx < points.length - forty) {
              middle20.push(points[idx]);
            }
          }
  
          sampled = [...first40, ...middle20, ...last40];
        } else {
          sampled = points;
        }
  
        // Break the sampled points into batches of 100 or fewer
        const chunkSize = 100;
        const chunks = [];
        for (let i = 0; i < sampled.length; i += chunkSize) {
          chunks.push(sampled.slice(i, i + chunkSize));
        }
  
        // Now make API calls for each chunk
        for (const chunk of chunks) {
          const locationString = chunk.map(p => `${p.latitude},${p.longitude}`).join('|');
  
          // Log the location string before sending the request to check if it's valid
          console.log('Sending batch location string:', locationString);
  
          const res = await axios.get(`https://api.opentopodata.org/v1/srtm90m?locations=${locationString}`);
  
          // Log the response to see what we get
          console.log('Elevation API response:', res.data);
  
          if (res.data && res.data.results) {
            const elevations = res.data.results.map(p => p.elevation);
            const highest = Math.max(...elevations);
            maxElevation = Math.max(maxElevation, highest);
          } else {
            console.log('Elevation data is empty or invalid:', res.data);
          }
        }
      }
  
      setAltitude(maxElevation.toFixed(2));
    } catch (error) {
      console.error('Elevation Error:', error.response?.data || error.message);
      setAltitude(0);
    }
  };
  
  

  const getSnappedSegment = async (from, to) => {
    try {
      const res = await axios.post(
        'https://api.openrouteservice.org/v2/directions/foot-hiking/geojson',
        { coordinates: [[from.longitude, from.latitude], [to.longitude, to.latitude]] },
        {
          headers: {
            'Authorization': '5b3ce3597851110001cf624884a7a29e58794c439ea23d6003c19bab',
            'Content-Type': 'application/json',
          },
        }
      );
      return res.data.features[0].geometry.coordinates.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));
    } catch (error) {
      console.error('ORS Snap Error:', error.response?.data || error.message);
      return [from, to];
    }
  };

  const handlePointSubmit = async () => {
    const pointData = {
      latitude: newPoint.latitude,
      longitude: newPoint.longitude,
      name: pointName || null,
      image: pointImage || null,
    };

    const updatedRaw = [...rawPoints, pointData];
    setRawPoints(updatedRaw);
    setModalVisible(false);
    setPointName('');
    setPointImage(null);

    if (updatedRaw.length < 2) return;
    const from = updatedRaw[updatedRaw.length - 2];
    const to = updatedRaw[updatedRaw.length - 1];

    if (routingEnabled) {
      const segment = await getSnappedSegment(from, to);
      setTrailSegments(prev => [...prev, { routed: true, points: segment }]);
    } else {
      setTrailSegments(prev => [...prev, { routed: false, points: [from, to] }]);
    }
  };

  const addTrailPoint = (e) => {
    setNewPoint(e.nativeEvent.coordinate);
    setModalVisible(true);
  };

  const pickPointImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length) {
      setPointImage(result.assets[0].uri);
    }
  };

  const undoLastPoint = () => {
    if (rawPoints.length === 0 || trailSegments.length === 0) return;
    setRawPoints(rawPoints.slice(0, -1));
    setTrailSegments(trailSegments.slice(0, -1));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0].uri);
    }
  };

  const toggleMapType = () => {
    setMapType(prev => (prev === 'standard' ? 'satellite' : prev === 'satellite' ? 'hybrid' : 'standard'));
  };

  const toggleRouting = () => {
    setRoutingEnabled(!routingEnabled);
    Alert.alert('Routing mode changed. New points will follow the new mode.');
  };

  const handleAddTrail = () => {
    const allPoints = trailSegments.flatMap(seg => seg.points);
    if (!name || !location || !image || allPoints.length < 2 || !difficulty || !description) {
      Alert.alert('Error', 'Please complete all fields and add at least two points.');
      return;
    }

    const trailData = {
      name,
      location,
      image,
      trailSegments,
      rawPoints,
      distance_km: distance,
      highest_altitude: altitude,
      difficulty,
      description,
      checklist: checklist.split(',').map(i => i.trim()),
    };

    console.log('Trail Data:', trailData);
    Alert.alert('Trail submitted. Check console for data.');
  };

  const allTrailPoints = trailSegments.flatMap(seg => seg.points);

  const difficultyLevels = ['Easy', 'Moderate', 'Hard', 'Expert'];

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Create New Trail</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="map-signs" size={20} color="#3a7758" style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Trail Name" 
            value={name} 
            onChangeText={setName}
            placeholderTextColor="#999" 
          />
        </View>
        
        <View style={styles.inputContainer}>
          <FontAwesome name="map-marker" size={20} color="#3a7758" style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Location" 
            value={location} 
            onChangeText={setLocation} 
            placeholderTextColor="#999"
          />
        </View>
        
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <FontAwesome name="camera" size={18} color="#fff" />
          <Text style={styles.imagePickerText}>Select Trail Image</Text>
        </TouchableOpacity>
        
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.selectedImage} />
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Map Controls</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity 
            style={[styles.toggleBtn, { backgroundColor: '#3a7758' }]} 
            onPress={toggleMapType}
          >
            <FontAwesome name="map" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.toggleText}>Map: {mapType}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleBtn, { backgroundColor: routingEnabled ? '#3a7758' : '#999' }]} 
            onPress={toggleRouting}
          >
            <FontAwesome name="road" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.toggleText}>Routing: {routingEnabled ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.mapContainer}>
        <View style={styles.mapLabelContainer}>
          <FontAwesome name="map-pin" size={16} color="#3a7758" />
          <Text style={styles.mapLabel}>Tap on map to add trail points</Text>
        </View>
        
        <MapView
          style={styles.map}
          mapType={mapType}
          initialRegion={{ latitude: 27.7172, longitude: 85.324, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
          onPress={addTrailPoint}
          showsUserLocation={true}
          showsCompass={true}
          showsScale={true}
        >
          <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} tileSize={256} />
          {rawPoints.map((point, idx) => (
            <Marker
              key={idx}
              coordinate={{ latitude: point.latitude, longitude: point.longitude }}
              title={point.name || `Point ${idx + 1}`}
              description={point.image ? "Image attached" : undefined}
              pinColor="#3a7758"
            >
              <View style={styles.customMarker}>
                <Text style={styles.markerText}>{idx + 1}</Text>
              </View>
            </Marker>
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
        
        <TouchableOpacity style={styles.undoButton} onPress={undoLastPoint} disabled={rawPoints.length === 0}>
          <FontAwesome name="undo" size={18} color={rawPoints.length === 0 ? "#ccc" : "#fff"} />
          <Text style={[styles.undoButtonText, {color: rawPoints.length === 0 ? "#ccc" : "#fff"}]}>Undo Last Point</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trail Details</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <FontAwesome name="road" size={18} color="#3a7758" />
            <Text style={styles.statLabel}>Distance:</Text>
            <Text style={styles.statValue}>{distance} km</Text>
          </View>
          
          <View style={styles.statItem}>
            <FontAwesome name="mountain" size={18} color="#3a7758" />
            <Text style={styles.statLabel}>Elevation:</Text>
            <Text style={styles.statValue}>{altitude}</Text>
          </View>
        </View>
        
        <Text style={styles.inputLabel}>Difficulty Level</Text>
        <View style={styles.difficultyContainer}>
          {difficultyLevels.map(level => (
            <TouchableOpacity 
              key={level}
              style={[ 
                styles.difficultyBtn,
                difficulty === level && styles.difficultyBtnActive 
              ]}
              onPress={() => setDifficulty(level)}
            >
              <Text 
                style={[ 
                  styles.difficultyText,
                  difficulty === level && styles.difficultyTextActive 
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Describe the trail, terrain, views, etc." 
          value={description} 
          onChangeText={setDescription} 
          multiline 
          numberOfLines={4}
          placeholderTextColor="#999"
        />
        
        <Text style={styles.inputLabel}>Checklist <Text style={styles.inputSubLabel}>(comma separated)</Text></Text>
        <TextInput 
          style={styles.input} 
          placeholder="Water, snacks, boots, sun hat..." 
          value={checklist} 
          onChangeText={setChecklist}
          placeholderTextColor="#999"
        />
      </View>
      
      <TouchableOpacity style={styles.submitButton} onPress={handleAddTrail}>
        <FontAwesome name="check-circle" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.submitButtonText}>Save Trail</Text>
      </TouchableOpacity>
  
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Waypoint</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times-circle" size={24} color="#3a7758" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <FontAwesome name="tag" size={20} color="#3a7758" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Waypoint Name (optional)"
                value={pointName}
                onChangeText={setPointName}
                placeholderTextColor="#999"
              />
            </View>
            
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickPointImage}>
              <FontAwesome name="camera" size={18} color="#fff" />
              <Text style={styles.imagePickerText}>Add Photo to Waypoint</Text>
            </TouchableOpacity>
            
            {pointImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: pointImage }} style={styles.selectedImage} />
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handlePointSubmit}
              >
                <Text style={styles.confirmButtonText}>Add Point</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
  
}



const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  headerContainer: {
    backgroundColor: '#3a7758',
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a7758',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 5,
  },
  inputSubLabel: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#888',
  },
  imagePickerButton: {
    backgroundColor: '#3a7758',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedImage: { 
    width: '100%', 
    height: 200, 
    borderRadius: 10,
  },
  toggleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
  },
  toggleBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12, 
    borderRadius: 8,
    flex: 0.48,
  },
  buttonIcon: {
    marginRight: 8,
  },
  toggleText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  mapContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  mapLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mapLabel: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: '#555',
    marginLeft: 8,
  },
  map: { 
    height: 400, 
  },
  undoButton: {
    backgroundColor: '#888',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  undoButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  customMarker: {
    backgroundColor: '#3a7758',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: '#555',
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  difficultyBtn: {
    borderWidth: 1,
    borderColor: '#3a7758',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  difficultyBtnActive: {
    backgroundColor: '#3a7758',
  },
  difficultyText: {
    color: '#3a7758',
    fontWeight: '500',
  },
  difficultyTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#3a7758',
    borderRadius: 10,
    padding: 16,
    margin: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.6)' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 15, 
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a7758',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  confirmButton: {
    backgroundColor: '#3a7758',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});