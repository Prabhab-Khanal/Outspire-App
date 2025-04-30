import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, ScrollView, Alert,
  Image, TouchableOpacity, Modal, StyleSheet, StatusBar, FlatList
} from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import { createTrail } from '../../services/trailService'; // adjust path if needed
import * as uuid from 'uuid';
const trailTypes = ['Hiking', 'Cycling', 'Trekking'];

export default function AddTrailScreen() {
  const [trailType, setTrailType] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [trailImages, setTrailImages] = useState([]);
  const [mapType, setMapType] = useState('standard');
  const [routingEnabled, setRoutingEnabled] = useState(true);

  const [rawPoints, setRawPoints] = useState([]);
  const [trailSegments, setTrailSegments] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newPoint, setNewPoint] = useState(null);
  const [pointName, setPointName] = useState('');
  const [pointDescription, setPointDescription] = useState('');
  const [pointImages, setPointImages] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [difficulty, setDifficulty] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState([{ key: '', value: '' }]);

  const [distance, setDistance] = useState(0);
  const [altitude, setAltitude] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permission is required.');
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
  const haversineDistance = (coords) => {
    const R = 6371;
    let d = 0;
    for (let i = 1; i < coords.length; i++) {
      const lat1 = coords[i - 1].latitude * Math.PI / 180;
      const lon1 = coords[i - 1].longitude * Math.PI / 180;
      const lat2 = coords[i].latitude * Math.PI / 180;
      const lon2 = coords[i].longitude * Math.PI / 180;
      const dlat = lat2 - lat1;
      const dlon = lon2 - lon1;
      const a = Math.sin(dlat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      d += R * c;
    }
    return d.toFixed(2);
  };

  const fetchMaxAltitude = async (points) => {
    try {
      if (points.length === 0) return;
      const samplePoints = sampleArray(points, 15);
      const batch = samplePoints.map(p => `${p.latitude},${p.longitude}`).join('|');
      const res = await axios.get(`https://api.opentopodata.org/v1/srtm90m?locations=${batch}`);
      if (res.data?.results) {
        const elevations = res.data.results.map(r => r.elevation);
        setAltitude(Math.max(...elevations));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sampleArray = (arr, n) => {
    if (arr.length <= n) return arr;
    const step = Math.floor(arr.length / n);
    return arr.filter((_, idx) => idx % step === 0);
  };

  const getSnappedSegment = async (from, to) => {
    try {
      const profile = getRoutingProfile(trailType); // use the helper
  
      
  
      const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
      console.log('url: ',url )
      const res = await axios.post(
        url,
        { coordinates: [[from.longitude, from.latitude], [to.longitude, to.latitude]] },
        { headers: { Authorization: '5b3ce3597851110001cf624884a7a29e58794c439ea23d6003c19bab', 'Content-Type': 'application/json' } }
      );
      return res.data.features[0].geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
    } catch (err) {
      console.error(err);
      return [from, to];
    }
  };
  

  const pickTrailImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true });
    if (!result.canceled && result.assets?.length) {
      setTrailImages(prev => [...prev, ...result.assets.map(file => file.uri)]);
    }
  };

  const removeTrailImage = (index) => {
    const updated = [...trailImages];
    updated.splice(index, 1);
    setTrailImages(updated);
  };

  const pickPointImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true });
    if (!result.canceled && result.assets?.length) {
      setPointImages(prev => [...prev, ...result.assets.map(file => file.uri)]);
    }
  };

  const removePointImage = (index) => {
    const updated = [...pointImages];
    updated.splice(index, 1);
    setPointImages(updated);
  };
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setNewPoint({ latitude, longitude });
    setEditingIndex(null);
    setModalVisible(true);
  };

  const handleMarkerPress = (e, idx) => {
    const p = rawPoints[idx];
    setNewPoint({ latitude: p.latitude, longitude: p.longitude });
    setPointName(p.name || '');
    setPointDescription(p.description || '');
    setPointImages(p.images || []);
    setEditingIndex(idx);
    setModalVisible(true);
  };

  const handleMarkerLongPress = (e, idx) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const updated = [...rawPoints];
    updated[idx] = { ...updated[idx], latitude, longitude };
    setRawPoints(updated);
    rebuildSegments(updated);
  };

  const handlePointSubmit = async () => {
    if (editingIndex !== null) {
      const updated = [...rawPoints];
      updated[editingIndex] = {
        ...updated[editingIndex],
        latitude: newPoint.latitude,
        longitude: newPoint.longitude,
        name: pointName,
        description: pointDescription,
        images: pointImages,
      };
      setRawPoints(updated);
      rebuildSegments(updated);
    } else {
      const newP = { latitude: newPoint.latitude, longitude: newPoint.longitude, name: pointName, description: pointDescription, images: pointImages };
      const updated = [...rawPoints, newP];
      setRawPoints(updated);
      if (updated.length >= 2) {
        const from = updated[updated.length - 2];
        const to = updated[updated.length - 1];
        if (routingEnabled) {
          const seg = await getSnappedSegment(from, to);
          setTrailSegments(prev => [...prev, { routed: true, points: seg }]);
        } else {
          setTrailSegments(prev => [...prev, { routed: false, points: [from, to] }]);
        }
      }
    }
    setModalVisible(false);
    setPointName('');
    setPointDescription('');
    setPointImages([]);
  };

  const rebuildSegments = async (points) => {
    const newSegments = [];
    for (let i = 1; i < points.length; i++) {
      const from = points[i - 1];
      const to = points[i];
      if (routingEnabled) {
        const seg = await getSnappedSegment(from, to);
        newSegments.push({ routed: true, points: seg });
      } else {
        newSegments.push({ routed: false, points: [from, to] });
      }
    }
    setTrailSegments(newSegments);
  };

  const undoLastPoint = () => {
    if (rawPoints.length === 0) {
      Alert.alert('No Points', 'There are no points to undo.');
      return;
    }
  
    const updatedRawPoints = [...rawPoints];
    updatedRawPoints.pop(); // remove the last point
    setRawPoints(updatedRawPoints);
  
    // Rebuild all segments again with the remaining points
    rebuildSegments(updatedRawPoints);
  };
  
  const handleMarkerDragEnd = async (e, idx) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const updatedPoints = [...rawPoints];
    updatedPoints[idx] = { ...updatedPoints[idx], latitude, longitude };
    setRawPoints(updatedPoints);
    await rebuildSegments(updatedPoints);
  };
  
  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg', 
      name: `photo_${Date.now()}.jpg`,
    });
  
    const response = await axios.post('http://your-backend-url/api/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  
    return response.data.url; // backend should return uploaded URL
  };
  
  const uploadMultipleImages = async (uris) => {
    const uploadedUrls = [];
    for (let uri of uris) {
      const url = await uploadImage(uri);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  };
  
  const uriToBlob = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };
  

  const handleSaveTrail = async () => {
    try {
      const formData = new FormData();
  
      // 1. Basic fields
      formData.append('type', trailType);
      formData.append('name', name);
      formData.append('location', location);
      formData.append('difficulty', difficulty);
      formData.append('description', description);
      formData.append('distance_km', parseFloat(distance));
      formData.append('highest_altitude', altitude);
  
      // 2. Checklist
      formData.append('checklist', JSON.stringify(checklist.filter(item => item.key && item.value)));
  
      // 3. Upload Trail Images
      for (let i = 0; i < trailImages.length; i++) {
        const uri = trailImages[i];
        const filename = `trail_${Date.now()}_${i}.jpg`;
        formData.append('trail_images', {
          uri,
          name: filename,
          type: 'image/jpeg',
        });
      }
  
      // 4. Upload Waypoints and their Images
      const rawPointsWithImageNames = [];
  
      for (let idx = 0; idx < rawPoints.length; idx++) {
        const point = rawPoints[idx];
        const updatedPoint = {
          latitude: point.latitude,
          longitude: point.longitude,
          name: point.name || '',
          description: point.description || '',
          images: [],
        };
  
        for (let j = 0; j < (point.images || []).length; j++) {
          const uri = point.images[j];
          const randomNum = Math.floor(Math.random() * 1000000);
          const filename = `waypoint_${Date.now()}_${randomNum}.jpg`;
  
          formData.append('waypoint_images', {
            uri,
            name: filename,
            type: 'image/jpeg',
          });
  
          updatedPoint.images.push(filename);
        }
  
        rawPointsWithImageNames.push(updatedPoint);
      }
  
      // Attach rawPoints
      formData.append('rawPoints', JSON.stringify(rawPointsWithImageNames));
  
      // 5. Trail Segments
      formData.append('trailSegments', JSON.stringify(trailSegments));
  
      console.log('✅ FormData ready');
  
      // 6. Upload
      const response = await createTrail(formData);
  
      console.log('Trail Created:', response);
      Alert.alert('Success', 'Trail created successfully!');
    } catch (error) {
      console.error('Failed to save trail:', error);
      Alert.alert('Error', 'Trail creation failed.');
    }
  };
  
  
  
  

  const getRoutingProfile = (type) => {
    if (type === 'Cycling') return 'cycling-regular';
    if (type === 'Trekking') return 'foot-walking';
    return 'foot-hiking'; // default for Hiking
  };
  
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>Create Trail</Text>
  
      {/* Trail Type Selector */}
      <Text style={styles.label}>Select Trail Type:</Text>
      <View style={styles.row}>
        {trailTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, trailType === type && styles.typeButtonSelected]}
            onPress={() => {
              setTrailType(type);
              console.log(`Routing profile selected: ${getRoutingProfile(type)}`);
            }}
          >
            <Text style={styles.typeButtonText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

  
      {/* Name & Location */}
      <TextInput style={styles.input} placeholder="Trail Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
  
      {/* Trail Images */}
      <TouchableOpacity style={styles.button} onPress={pickTrailImages}>
        <Text style={styles.buttonText}>Pick Trail Images</Text>
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        {trailImages.map((img, idx) => (
          <View key={idx} style={styles.imageWrapper}>
            <Image source={{ uri: img }} style={styles.image} />
            <TouchableOpacity style={styles.removeIcon} onPress={() => removeTrailImage(idx)}>
              <FontAwesome name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
  
      {/* Map Mode & Routing Toggle */}
      <View style={styles.toggleContainer}>
        <Button title={`Map Mode: ${mapType}`} onPress={() => setMapType(prev => (prev === 'standard' ? 'hybrid' : 'standard'))} />
        <Button title={`Routing: ${routingEnabled ? 'ON' : 'OFF'}`} onPress={() => setRoutingEnabled(!routingEnabled)} />
      </View>
  
      {/* Map View */}
      <MapView
        style={styles.map}
        mapType={mapType}
        initialRegion={{ latitude: 27.7172, longitude: 85.324, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
        onPress={handleMapPress}
      >
        <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {rawPoints.map((point, idx) => (
          <Marker
            key={idx}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.name || `Point ${idx + 1}`}
            description={point.description || ''}
            draggable
            onDragEnd={(e) => handleMarkerDragEnd(e, idx)}
            onPress={(e) => handleMarkerPress(e, idx)}
          />
        ))}
        {trailSegments.map((seg, idx) => (
          <Polyline key={idx} coordinates={seg.points} strokeColor={seg.routed ? 'green' : 'red'} strokeWidth={3} />
        ))}
      </MapView>
      <Button title="Undo Last Point" onPress={undoLastPoint} />

      {/* Distance and Elevation */}
      <Text style={styles.summaryText}>Distance: {distance} km | Max Elevation: {altitude} m</Text>
  
      {/* Difficulty */}
      <Text style={styles.label}>Select Difficulty:</Text>
      <View style={styles.row}>
        {['Easy', 'Moderate', 'Hard', 'Expert'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.difficultyButton, difficulty === level && styles.typeButtonSelected]}
            onPress={() => setDifficulty(level)}
          >
            <Text style={styles.typeButtonText}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>
  
      {/* Trail Description */}
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Trail Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
  
      {/* Checklist */}
      <Text style={styles.label}>Checklist:</Text>
      {checklist.map((item, index) => (
        <View key={index} style={styles.checklistRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 5 }]}
            placeholder="Key"
            value={item.key}
            onChangeText={(text) => {
              const updated = [...checklist];
              updated[index].key = text;
              setChecklist(updated);
            }}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Value"
            value={item.value}
            onChangeText={(text) => {
              const updated = [...checklist];
              updated[index].value = text;
              setChecklist(updated);
            }}
          />
        </View>
      ))}
      <Button title="Add More Checklist Item" onPress={() => setChecklist([...checklist, { key: '', value: '' }])} />
  
      {/* Save Trail */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSaveTrail}>
        <Text style={styles.submitButtonText}>Save Trail</Text>
      </TouchableOpacity>
  
      {/* Point Modal */}
      <Modal visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput style={styles.input} placeholder="Waypoint Name" value={pointName} onChangeText={setPointName} />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Waypoint Description"
              value={pointDescription}
              onChangeText={setPointDescription}
              multiline
            />
            <TouchableOpacity style={styles.button} onPress={pickPointImages}>
              <Text style={styles.buttonText}>Pick Waypoint Images</Text>
            </TouchableOpacity>
            <View style={styles.imageContainer}>
              {pointImages.map((img, idx) => (
                <View key={idx} style={styles.imageWrapper}>
                  <Image source={{ uri: img }} style={styles.image} />
                  <TouchableOpacity style={styles.removeIcon} onPress={() => removePointImage(idx)}>
                    <FontAwesome name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <Button title="Save Waypoint" onPress={handlePointSubmit} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#aaa" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
  const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: '600', marginVertical: 10 },
    input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10 },
    button: { backgroundColor: '#3a7758', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    imageContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    imageWrapper: { position: 'relative', margin: 5 },
    image: { width: 100, height: 100, borderRadius: 8 },
    removeIcon: { position: 'absolute', top: -5, right: -5, backgroundColor: '#f00', borderRadius: 15, padding: 2 },
    row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    typeButton: { backgroundColor: '#ccc', padding: 10, borderRadius: 8, marginRight: 8, marginBottom: 8 },
    typeButtonSelected: { backgroundColor: '#3a7758' },
    typeButtonText: { color: '#fff', fontWeight: 'bold' },
    difficultyButton: { backgroundColor: '#888', padding: 10, borderRadius: 8, marginRight: 8, marginBottom: 8 },
    toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
    map: { height: 300, marginVertical: 10 },
    summaryText: { fontSize: 16, textAlign: 'center', marginVertical: 10 },
    checklistRow: { flexDirection: 'row', marginBottom: 10 },
    submitButton: { backgroundColor: '#3a7758', padding: 15, borderRadius: 8, marginVertical: 15, alignItems: 'center' },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, margin: 20 },
    

    });
    
  

  
  