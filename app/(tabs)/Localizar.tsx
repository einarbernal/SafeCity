import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import HamburgerMenu from '../auth/MenuHamburguesa';

const { width, height } = Dimensions.get('window');

interface PoliceStation {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
}

const policeStations: PoliceStation[] = [
  { id: 1, latitude: -17.38977, longitude: -66.20358, name: 'EPI Nro 1: COÑA COÑA' },
  { id: 2, latitude: -17.36201, longitude: -66.17274, name: 'EPI Nro 2: NORTE' },
  { id: 3, latitude: -17.42703, longitude: -66.16177, name: 'EPI Nro 3: JAIHUAYCO' },
  { id: 4, latitude: -17.44445, longitude: -66.16550, name: 'EPI Nro 4: SUR' },
  { id: 5, latitude: -17.41840, longitude: -66.13651, name: 'EPI Nro 5: ALALAY' },
  { id: 6, latitude: -17.40112, longitude: -66.15737, name: 'EPI Nro 6: CENTRAL' },
];

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -17.3924636,
    longitude: -66.1582445,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const searchInputRef = useRef<TextInput>(null);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSuggestions(text.length > 0);
  };

  const handleStationSelect = (station: PoliceStation) => {
    setSelectedStation(station);
    setSearchQuery(station.name); // Esto completa el texto en el buscador
    setShowSuggestions(false); // Oculta las sugerencias
    searchInputRef.current?.blur(); // Oculta el teclado
    
    // Centrar el mapa en la estación seleccionada
    setMapRegion({
      latitude: station.latitude,
      longitude: station.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  const handleSearchSubmit = () => {
    // Buscar la estación que coincida con el texto ingresado
    const matchedStation = policeStations.find(station => 
      station.name.toLowerCase() === searchQuery.toLowerCase()
    );
    
    if (matchedStation) {
      handleStationSelect(matchedStation);
    }
  };

  const filteredStations = policeStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: "Cochabamba",
          headerStyle: {
            backgroundColor: '#2e5929',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: ()=> <HamburgerMenu/>
        }}
      />

      {/* Campo de búsqueda con autocompletado */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Buscar comisaría..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            onSubmitEditing={handleSearchSubmit}
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearchSubmit}
          >
            <Ionicons name="search" size={24} color="#0077b6" />
          </TouchableOpacity>
        </View>

        {/* Lista de sugerencias */}
        {showSuggestions && filteredStations.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={filteredStations}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.suggestionItem} 
                  onPress={() => handleStationSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Mapa */}
      <MapView
        style={styles.map}
        region={mapRegion}
      >
        {policeStations.map(station => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            pinColor={selectedStation?.id === station.id ? 'blue' : 'red'}
          >
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Ionicons name="location-sharp" size={30} color={selectedStation?.id === station.id ? 'blue' : 'red'} />
                <Text style={styles.calloutText}>{station.name}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  searchBar: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    flexDirection: 'row',
    paddingHorizontal: 10,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 30,
    paddingLeft: 40,
    fontSize: 16,
    color: '#333',
  },
  suggestionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200,
    elevation: 5,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  callout: {
    width: 150,
    padding: 10,
    alignItems: 'center',
  },
  calloutText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 40,
  },
  map: {
    width: width,
    height: height,
  },
});