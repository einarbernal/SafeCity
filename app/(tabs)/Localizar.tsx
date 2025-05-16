import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const policeStations = [
  { id: 1, latitude: -17.4011263, longitude: -66.1462061, name: 'Unidad Policial 1' },
  { id: 2, latitude: -17.3908839, longitude: -66.1583381, name: 'Unidad Policial 2' },
  { id: 3, latitude: -17.3964876, longitude: -66.0575766, name: 'Unidad Policial 3' },
];

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = () => {
    console.log("Buscando lugar: ", searchQuery);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Añadimos el Stack.Screen con las opciones del header */}
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
        }}
      />

      {/* Campo de búsqueda con lupa */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar lugar..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
          <Ionicons name="search" size={24} color="#0077b6" />
        </TouchableOpacity>
      </View>

      {/* Mapa */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -17.3924636,
          longitude: -66.1582445,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {policeStations.map(station => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
          >
            <Callout tooltip={false}>
  <View style={styles.callout}>
    <Ionicons name="location-sharp" size={30} color="red" />
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
    backgroundColor: '#fff', // Cambiado a blanco para mejor contraste
  },
  searchBar: {
    position: 'absolute',
    top: 30, // Ajustado para estar debajo del header
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    flexDirection: 'row',
    paddingHorizontal: 10,
    elevation: 5,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 30,
    paddingLeft: 40,
    fontSize: 16,
    color: '#333',
  },
  callout: {
  width: 150, // puedes ajustar según lo que necesites
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