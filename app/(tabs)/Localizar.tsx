import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, Polygon } from "react-native-maps";
import HamburgerMenu from "../auth/MenuHamburguesa";

const { width, height } = Dimensions.get("window");

interface PoliceStation {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  jurisdictionColor: string;
  jurisdictionArea: { latitude: number; longitude: number }[];
}

const policeStations: PoliceStation[] = [
  {
    id: 1,
    latitude: -17.38977,
    longitude: -66.20358,
    name: "EPI Nro 1: COÑA COÑA",
    jurisdictionColor: "#FF5733",
    jurisdictionArea: [
      { latitude: -17.37, longitude: -66.22 }, // Noroeste
      { latitude: -17.37, longitude: -66.18 }, // Noreste - límite con Norte y Central
      { latitude: -17.39, longitude: -66.18 }, // Este - límite con Central
      { latitude: -17.41, longitude: -66.19 }, // Sureste
      { latitude: -17.41, longitude: -66.22 }, // Suroeste
      { latitude: -17.395, longitude: -66.225 }, // Oeste
      { latitude: -17.38, longitude: -66.225 }, // Cierre noroeste
    ],
  },
  {
    id: 2,
    latitude: -17.36201,
    longitude: -66.17274,
    name: "EPI Nro 2: NORTE",
    jurisdictionColor: "#33FF57",
    jurisdictionArea: [
      { latitude: -17.34, longitude: -66.19 }, // Noroeste - límite con Coña Coña
      { latitude: -17.34, longitude: -66.155 }, // Noreste
      { latitude: -17.36, longitude: -66.145 }, // Este - límite con Central
      { latitude: -17.375, longitude: -66.155 }, // Sureste - límite con Central
      { latitude: -17.375, longitude: -66.17 }, // Sur - límite con Central
      { latitude: -17.37, longitude: -66.18 }, // Suroeste - límite con Central
      { latitude: -17.365, longitude: -66.185 }, // Oeste
      { latitude: -17.35, longitude: -66.19 }, // Noroeste
    ],
  },
  {
    id: 3,
    latitude: -17.42703,
    longitude: -66.16177,
    name: "EPI Nro 3: JAIHUAYCO",
    jurisdictionColor: "#3388FF",
    jurisdictionArea: [
      { latitude: -17.41, longitude: -66.18 }, // Noroeste - límite con Central
      { latitude: -17.41, longitude: -66.145 }, // Noreste - límite con Alalay
      { latitude: -17.43, longitude: -66.135 }, // Este - límite con Alalay
      { latitude: -17.445, longitude: -66.145 }, // Sureste - límite con Sur
      { latitude: -17.445, longitude: -66.175 }, // Suroeste
      { latitude: -17.43, longitude: -66.185 }, // Oeste
      { latitude: -17.42, longitude: -66.185 }, // Noroeste
    ],
  },
  {
    id: 4,
    latitude: -17.44445,
    longitude: -66.1655,
    name: "EPI Nro 4: SUR",
    jurisdictionColor: "#FF33F5",
    jurisdictionArea: [
      { latitude: -17.445, longitude: -66.175 }, // Noroeste - límite con Jaihuayco
      { latitude: -17.445, longitude: -66.145 }, // Noreste - límite con Jaihuayco
      { latitude: -17.46, longitude: -66.135 }, // Este - límite con Alalay
      { latitude: -17.475, longitude: -66.145 }, // Sureste
      { latitude: -17.475, longitude: -66.185 }, // Suroeste
      { latitude: -17.465, longitude: -66.19 }, // Oeste
      { latitude: -17.455, longitude: -66.185 }, // Noroeste
    ],
  },
  {
    id: 5,
    latitude: -17.4184,
    longitude: -66.13651,
    name: "EPI Nro 5: ALALAY",
    jurisdictionColor: "#F5FF33",
    jurisdictionArea: [
      { latitude: -17.41, longitude: -66.13 }, // Noroeste - límite con Central
      { latitude: -17.395, longitude: -66.12 }, // Norte - límite con Central
      { latitude: -17.395, longitude: -66.11 }, // Noreste
      { latitude: -17.415, longitude: -66.1 }, // Este
      { latitude: -17.435, longitude: -66.11 }, // Sureste
      { latitude: -17.45, longitude: -66.12 }, // Sur (extendido)
      { latitude: -17.46, longitude: -66.135 }, // Sur - límite con Sur
      { latitude: -17.445, longitude: -66.145 }, // Suroeste - límite con Jaihuayco
      { latitude: -17.43, longitude: -66.135 }, // Oeste - límite con Jaihuayco
      { latitude: -17.42, longitude: -66.14 }, // Oeste (extendido para llenar espacio)
      { latitude: -17.415, longitude: -66.145 }, // Oeste (extendido para conectar con Central)
      { latitude: -17.41, longitude: -66.145 }, // Noroeste (extendido para conectar con Central)
    ],
  },
  {
    id: 6,
    latitude: -17.40112,
    longitude: -66.15737,
    name: "EPI Nro 6: CENTRAL",
    jurisdictionColor: "#33FFF5",
    jurisdictionArea: [
      { latitude: -17.375, longitude: -66.17 }, // Norte - límite con Norte
      { latitude: -17.375, longitude: -66.13 }, // Noreste - límite con Norte
      { latitude: -17.395, longitude: -66.12 }, // Este - límite con Alalay
      { latitude: -17.41, longitude: -66.13 }, // Sureste - límite con Alalay
      { latitude: -17.41, longitude: -66.145 }, // Sur - límite con Jaihuayco y Alalay
      { latitude: -17.41, longitude: -66.18 }, // Suroeste - límite con Jaihuayco
      { latitude: -17.39, longitude: -66.18 }, // Oeste - límite con Coña Coña
      { latitude: -17.37, longitude: -66.18 }, // Noroeste - límite con Norte (cierre)
    ],
  },
];

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(
    null
  );
  const [showDenunciaModal, setShowDenunciaModal] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -17.3924636,
    longitude: -66.1582445,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });
  const searchInputRef = useRef<TextInput>(null);
  const router = useRouter();

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSuggestions(text.length > 0);
  };

  const handleStationSelect = (station: PoliceStation) => {
    setSelectedStation(station);
    setSearchQuery(station.name);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
    setMapRegion({
      latitude: station.latitude,
      longitude: station.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  const handleStationPress = (station: PoliceStation) => {
    setSelectedStation(station);
    setShowDenunciaModal(true);
  };

  const handleRealizarDenuncia = () => {
    setShowDenunciaModal(false);
    router.push("/Reportar");
  };

  const handleSearchSubmit = () => {
    const matchedStation = policeStations.find(
      (station) => station.name.toLowerCase() === searchQuery.toLowerCase()
    );
    if (matchedStation) {
      handleStationSelect(matchedStation);
    }
  };

  const filteredStations = policeStations.filter((station) =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Cochabamba",
          headerStyle: { backgroundColor: "#2e5929" },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerLeft: () => <HamburgerMenu />,
        }}
      />

      {/* Campo de búsqueda con autocompletado */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Buscar comisaría..."
            placeholderTextColor="#000"
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
        initialRegion={mapRegion}
        onRegionChangeComplete={setMapRegion}
      >
        {policeStations.map((station) => (
          <React.Fragment key={station.id}>
            {/* Área de jurisdicción */}
            <Polygon
              coordinates={station.jurisdictionArea}
              strokeColor={station.jurisdictionColor}
              fillColor={`${station.jurisdictionColor}50`}
              strokeWidth={2}
              onPress={() => handleStationPress(station)}
            />
            {/* Marcador con interactividad */}
            <Marker
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              pinColor={station.jurisdictionColor}
              onPress={() => handleStationPress(station)}
            >
              <Callout tooltip={false}>
                <View
                  style={[
                    styles.callout,
                    { borderColor: station.jurisdictionColor },
                  ]}
                >
                  <Ionicons
                    name="location-sharp"
                    size={30}
                    color={station.jurisdictionColor}
                  />
                  <Text style={styles.calloutText}>{station.name}</Text>
                  <Text style={styles.jurisdictionText}>
                    Área de jurisdicción
                  </Text>
                </View>
              </Callout>
            </Marker>
          </React.Fragment>
        ))}
      </MapView>

      {/* Modal para realizar denuncia */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDenunciaModal}
        onRequestClose={() => setShowDenunciaModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons
                name="shield-checkmark"
                size={50}
                color={selectedStation?.jurisdictionColor || "#2e5929"}
              />
            </View>
            <Text style={styles.modalTitle}>{selectedStation?.name}</Text>
            <Text style={styles.modalDescription}>
              ¿Desea realizar una denuncia en esta estación policial?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowDenunciaModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleRealizarDenuncia}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  Realizar Denuncia
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Leyenda de colores mejorada */}
      <View style={styles.legendContainer}>
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Jurisdicciones:</Text>
          <FlatList
            data={policeStations}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: item.jurisdictionColor },
                  ]}
                />
                <Text
                  style={styles.legendText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name.split(":")[1].trim()}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.legendContent}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    position: "absolute",
    top: 30,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  searchBar: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    flexDirection: "row",
    paddingHorizontal: 10,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 30,
    paddingLeft: 40,
    fontSize: 16,
    color: "#000", // SIEMPRE negro
  },
  suggestionsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200,
    elevation: 5,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
    color: "#000", // SIEMPRE negro
  },
  calloutText: {
    fontSize: 14,
    color: "#000", // SIEMPRE negro
    textAlign: "center",
  },
  searchButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 40,
  },
  map: {
    width: width,
    height: height,
  },
  callout: {
    width: 180,
    padding: 10,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 2,
  },
  jurisdictionText: {
    fontSize: 12,
    color: "#000", // SIEMPRE negro
    marginTop: 5,
    fontStyle: "italic",
  },
  legendContainer: {
    position: "absolute",
    bottom: 70,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  legend: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  legendContent: {
    justifyContent: "space-between",
  },
  legendTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
    color: "#000", // SIEMPRE negro
    textAlign: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    marginHorizontal: 6,
    width: "45%",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  legendText: {
    fontSize: 12,
    flex: 1,
    color: "#000", // SIEMPRE negro
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#000", // SIEMPRE negro
  },
  modalDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#000", // SIEMPRE negro
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderWidth: 1.5,
  },
  modalButtonPrimary: {
    backgroundColor: "#006400",
    borderColor: "#2D5016",
    shadowColor: "#E6C200",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modalButtonSecondary: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E0E0",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalButtonTextPrimary: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  modalButtonTextSecondary: {
    color: "#000", // SIEMPRE negro
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  modalButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
