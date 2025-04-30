import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, Image, ScrollView, StyleSheet,
  TouchableOpacity, Modal, ActivityIndicator, Dimensions, TextInput
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTrailDetail, addReview } from '../../services/trailService';
import axios from 'axios';
import * as Location from 'expo-location';



const { width } = Dimensions.get('window');

export default function TrailDetailsScreen({ route }) {
  const [userPath, setUserPath] = useState([]);
  const [watcher, setWatcher] = useState(null);
  const [trailStarted, setTrailStarted] = useState(false);
  const { trailId } = route.params;
  const [trail, setTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [weatherData, setWeatherData] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const mapRef = useRef(null);

  useEffect(() => {
    checkPremiumStatus();
    fetchTrailData();
  }, []);
  const startTrail = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to start the trail.');
        return;
      }
  
      setUserPath([]); // reset path
      setTrailStarted(true);
  
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setUserPath((prevPath) => [...prevPath, { latitude, longitude }]);
        }
      );
  
      setWatcher(subscription);
    } catch (error) {
      console.error('Failed to start trail tracking:', error);
    }
  };
  
  const stopTrail = () => {
    if (watcher) {
      watcher.remove();
      setWatcher(null);
    }
    setTrailStarted(false);
  };
  
  const checkPremiumStatus = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      setIsPremium(user?.premium || false);
    } catch (err) {
      console.error('Error fetching premium status:', err);
    }
  };

  const fetchTrailData = async () => {
    try {
      const data = await getTrailDetail(trailId);
      const mappedTrail = {
        ...data,
        rawPoints: data.waypoints || [],
        trailSegments: data.segments || [],
      };
      setTrail(mappedTrail);
      setReviews(data.reviews || []);
      if (mappedTrail.rawPoints.length > 0) {
        const first = mappedTrail.rawPoints[0];
        fetchWeather(first.latitude, first.longitude);
      } else {
        setLoadingWeather(false);
      }
    } catch (error) {
      console.error('Failed to fetch trail details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const API_KEY = 'f0df46fc461f6f2aaafe527c4749db15';
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const res = await axios.get(url);
      setWeatherData(res.data.list.slice(0, 5));
    } catch (error) {
      setWeatherData([]);
    } finally {
      setLoadingWeather(false);
    }
  };

  const safeImageUri = (uri) =>
    uri && typeof uri === 'string' ? uri : 'https://via.placeholder.com/300x200.png?text=No+Image';

  const handleMarkerPress = (point) => {
    setSelectedWaypoint(point);
    setModalVisible(true);
  };

  const submitReview = async () => {
    if (!newRating || !newComment.trim()) return;
    setSubmitting(true);
    try {
      const reviewData = { rating: newRating, comment: newComment };
      await addReview(trailId, reviewData);
      setReviews((prev) => [...prev, reviewData]);
      setNewRating(0);
      setNewComment('');
    } catch (err) {
      console.error('Review submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onChange }) => (
    <View style={{ flexDirection: 'row', marginVertical: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)}>
          <MaterialCommunityIcons
            name={star <= rating ? 'star' : 'star-outline'}
            size={26}
            color="#FFD700"
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#3E7D41" /></View>;
  }

  if (!trail) {
    return <View style={styles.loading}><Text>Trail not found.</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
        {trail.images?.map((img, idx) => (
          <Image key={idx} source={{ uri: safeImageUri(img.image) }} style={styles.galleryImage} />
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Map</Text>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: trail.rawPoints?.[0]?.latitude || 27.7,
          longitude: trail.rawPoints?.[0]?.longitude || 85.3,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onMapReady={() => {
          if (mapRef.current && trail.rawPoints.length > 0) {
            mapRef.current.fitToCoordinates(
              trail.rawPoints.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
              { edgePadding: { top: 100, right: 50, bottom: 100, left: 50 }, animated: true }
            );
          }
        }}
      >
        {trail.trailSegments?.map((seg, idx) => (
          <Polyline
            key={idx}
            coordinates={seg.points.map(p => ({ latitude: p.latitude, longitude: p.longitude }))}
            strokeWidth={4}
            strokeColor="#3E7D41"
          />
        ))}
        {trail.rawPoints?.map((point, idx) => (
          <Marker
            key={idx}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.name || `Point ${idx + 1}`}
            onPress={() => handleMarkerPress(point)}
          />
        ))}
        {userPath.length > 1 && (
          <Polyline
            coordinates={userPath}
            strokeWidth={4}
            strokeColor="#FF4500"
          />
        )}
      </MapView>
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: trailStarted ? '#b22222' : '#3E7D41' }]}
        onPress={trailStarted ? stopTrail : startTrail}
      >
        <Text style={styles.buttonText}>
          {trailStarted ? 'Stop Trail' : 'Start Trail'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Waypoints</Text>
      <FlatList
        data={trail.rawPoints}
        horizontal
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.waypointCard} onPress={() => handleMarkerPress(item)}>
            <Image source={{ uri: safeImageUri(item.images?.[0]?.image || item.images?.[0]) }} style={styles.waypointImage} />
            <Text style={styles.waypointName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>Weather</Text>
      {loadingWeather ? (
        <ActivityIndicator size="small" color="#3E7D41" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {weatherData.map((forecast, idx) => (
            <View key={idx} style={styles.weatherCard}>
              <Text>{new Date(forecast.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Image source={{ uri: `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png` }} style={styles.weatherIcon} />
              <Text>{forecast.main.temp}°C</Text>
              <Text style={{ fontSize: 12 }}>{forecast.weather[0].description}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <Text style={styles.sectionTitle}>Trail Info</Text>
      <View style={styles.infoBox}>
        <Text><Ionicons name="trail-sign-outline" size={18} /> {trail.name}</Text>
        <Text><Ionicons name="location-outline" size={18} /> {trail.location}</Text>
        <Text><Ionicons name="analytics-outline" size={18} /> {trail.type}</Text>
        <Text><Ionicons name="speedometer-outline" size={18} /> {trail.difficulty}</Text>
        <Text><Ionicons name="map-outline" size={18} /> {trail.distance_km} km</Text>
        <Text><Ionicons name="arrow-up-outline" size={18} /> {trail.highest_altitude} m</Text>
      </View>

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{trail.description || 'No description provided.'}</Text>

      <Text style={styles.sectionTitle}>Checklist</Text>

      {isPremium ? (
        trail.checklist?.length > 0 ? (
          trail.checklist.map((item, idx) => (
            <Text key={idx} style={styles.checklistItem}>• {item.key}: {item.value}</Text>
          ))
        ) : (
          <Text style={styles.emptySection}>No checklist available for this trail.</Text>
        )
      ) : (
        <View style={styles.lockedBox}>
          <MaterialCommunityIcons name="lock" size={20} color="#777" />
          <Text style={styles.lockedText}>This checklist is available for Premium users only.</Text>
        </View>
      )}


      <Text style={styles.sectionTitle}>Reviews</Text>
      <View style={styles.reviewCard}>
        <Text style={styles.reviewSub}>Add Review</Text>
        <StarRating rating={newRating} onChange={setNewRating} />
        <TextInput
          style={styles.reviewInput}
          placeholder="Write your comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={submitReview}
          disabled={submitting}
        >
          <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
      {reviews.map((review, idx) => (
  <View key={idx} style={styles.reviewDisplayCard}>
    <Text style={styles.reviewUsername}>
      {review.written_by_username || 'Anonymous'} • {new Date(review.created_at).toLocaleDateString()}
    </Text>
    <View style={{ flexDirection: 'row', marginTop: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialCommunityIcons
          key={star}
          name={star <= review.rating ? 'star' : 'star-outline'}
          size={20}
          color="#FFD700"
        />
      ))}
    </View>
    <Text style={{ marginTop: 6 }}>{review.comment}</Text>
  </View>
  ))}
      {/* Waypoint Modal */}
<Modal
  visible={modalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>{selectedWaypoint?.name || 'Waypoint'}</Text>
      <Text style={styles.modalText}>
        {selectedWaypoint?.description || 'No description provided.'}
      </Text>

      {selectedWaypoint?.images?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedWaypoint.images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: safeImageUri(img.image || img) }}
              style={styles.modalImage}
            />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f3' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageGallery: { marginBottom: 10 },
  galleryImage: { width: width * 0.8, height: 200, marginRight: 10, borderRadius: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginLeft: 15, color: '#3E7D41' },
  map: { height: 250, margin: 15, borderRadius: 10 },
  waypointCard: { margin: 10, alignItems: 'center' },
  waypointImage: { width: 100, height: 100, borderRadius: 10 },
  waypointName: { marginTop: 5, fontSize: 14, fontWeight: '600' },
  weatherCard: { backgroundColor: '#fff', padding: 8, borderRadius: 8, marginHorizontal: 8, alignItems: 'center' },
  weatherIcon: { width: 40, height: 40, marginVertical: 5 },
  infoBox: { padding: 15 },
  description: { fontSize: 16, paddingHorizontal: 15, marginBottom: 20 },
  checklistItem: { fontSize: 16, marginLeft: 20, marginTop: 5 },
  reviewCard: { backgroundColor: '#eef2eb', padding: 12, borderRadius: 8, marginHorizontal: 15, marginBottom: 16 },
  reviewInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, minHeight: 60, marginBottom: 10 },
  reviewSub: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: '#3E7D41' },
  submitBtn: { backgroundColor: '#3E7D41', padding: 10, borderRadius: 6, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold' },
  reviewDisplayCard: { backgroundColor: '#f8f9f6', borderRadius: 8, padding: 12, marginHorizontal: 15, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  lockedBox: {
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockedText: {
    fontSize: 14,
    color: '#777',
    flexShrink: 1,
  },
  emptySection: {
    fontSize: 14,
    marginHorizontal: 15,
    marginTop: 5,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E7D41',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalImage: {
    width: 200,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
  },
  modalClose: {
    marginTop: 20,
    backgroundColor: '#3E7D41',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  startButton: {
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  
});
