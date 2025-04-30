import React, { useLayoutEffect, useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, StyleSheet,
  TouchableOpacity, Button, ActivityIndicator,
  RefreshControl, TextInput, Platform, ToastAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAllTrails } from '../../services/trailService';
import * as Location from 'expo-location';




export default function TrailsScreen({ navigation }) {
  const [trails, setTrails] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [userPath, setUserPath] = useState([]);
  const [watcher, setWatcher] = useState(null);
  const [trailStarted, setTrailStarted] = useState(false);
  const filters = [
    { label: 'Hiking', icon: 'hiking' },
    { label: 'Trekking', icon: 'walk' },
    { label: 'Cycling', icon: 'bike' },
    { label: 'Easy', icon: 'progress-check' },
    { label: 'Moderate', icon: 'progress-clock' },
    { label: 'Hard', icon: 'progress-alert' },
    { label: 'Expert', icon: 'progress-star' },
  ];
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
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate('AddTrailScreen')}
          title="ADD"
          color="#3E7D41"
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    fetchTrails();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeFilter, trails]);

  const fetchTrails = async (isRefresh = false) => {
    try {
      const response = await getAllTrails();
      setTrails(response.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

      if (isRefresh) showToast('Trails updated ✅');
    } catch (error) {
      console.error('Failed to fetch trails:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!refreshing) {
      setRefreshing(true);
      fetchTrails(true);
    }
  };

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      console.log('Toast:', message);
    }
  };

  const applyFilters = () => {
    let data = [...trails];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    if (activeFilter) {
      data = data.filter(
        item =>
          item.type?.toLowerCase() === activeFilter.toLowerCase() ||
          item.difficulty?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    setFilteredTrails(data);
  };

  const renderTrail = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TrailDetails', { trailId: item.id })}
      style={styles.card}
    >
      <Image
        source={{ uri: item.images?.[0]?.image || 'https://via.placeholder.com/300x200.png?text=No+Image' }}
        style={styles.image}
      />
      <View style={styles.cardText}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilterChips = () => (
    <View style={{ marginBottom: 16 }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filters}
        keyExtractor={(item) => item.label}
        contentContainerStyle={styles.filterRowHorizontal}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.filterCard,
              activeFilter === item.label && styles.activeFilterCard,
            ]}
            onPress={() => setActiveFilter(prev => prev === item.label ? null : item.label)}
          >
            <Icon
              name={item.icon}
              size={20}
              color={activeFilter === item.label ? '#fff' : '#3E7D41'}
              style={{ marginBottom: 4 }}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === item.label && styles.activeFilterText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
  

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3E7D41" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore Trails</Text>

      <FlatList
        data={filteredTrails}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTrail}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={<Text style={styles.empty}>No trails found.</Text>}
        ListHeaderComponent={
          <View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search trails by name or location"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {renderFilterChips()}
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f3', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#3E7D41',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 12,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  filterRowHorizontal: {
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  
  filterCard: {
    backgroundColor: '#e2e6da',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 65,
  },
  activeFilterCard: {
    backgroundColor: '#3E7D41',
  },
  filterText: {
    fontSize: 12,
    color: '#3E7D41',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
  },
  image: { width: '100%', height: 200 },
  cardText: { padding: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#2f4f4f' },
  subtitle: { fontSize: 14, color: '#666' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#888' },
});
