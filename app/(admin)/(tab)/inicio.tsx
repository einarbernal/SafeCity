import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";

interface Policia {
  id_policia: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  cargo: string;
  telefono: string;
  correo: string;
  modulo_epi: string;
}

export default function ListaPoliciasScreen() {
  const SERVER_IP = "safecity.spartan-soft.com";
  const API_URL = `https://${SERVER_IP}/api`;

  const [policias, setPolicias] = useState<Policia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPolicias = async () => {
    try {
      const res = await fetch(`${API_URL}/policias`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Error al obtener policías");
      const data = await res.json();
      setPolicias(data);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Error desconocido"
      );
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      setLoading(true); 
      fetchPolicias();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPolicias();
  };

  const handleDelete = async (id_policia: number) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de eliminar este policía?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/policias/${id_policia}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              if (!res.ok) throw new Error("No se pudo eliminar el policía");
              // Opcional: Recargar la lista luego de eliminar
              fetchPolicias();
              Alert.alert("Eliminado", "Policía eliminado correctamente.");
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "No se pudo eliminar el policía"
              );
              console.error(error);
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2e5929" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2e5929"]}
          />
        }
      >
        
        {policias.length === 0 && (
          <ThemedText style={styles.cardText}>
            No hay policías registrados.
          </ThemedText>
        )}
        {policias.map((policia) => (
          <ThemedView key={policia.id_policia} style={styles.policiaCard}>
            <ThemedView style={styles.cardHeader}>
              <FontAwesome6 name="user-shield" size={18} color="#2e5929" />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Nombre: {policia.nombres}
              </ThemedText>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(policia.id_policia)}
              >
                <MaterialIcons name="delete" size={22} color="#d9534f" />
              </TouchableOpacity>
            </ThemedView>
            <ThemedText style={styles.cardText}>
              Apellidos: {policia.apellido_paterno} {policia.apellido_materno}
            </ThemedText>
            <ThemedText style={styles.cardText}>
              Correo: {policia.correo}
            </ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#f8f9fa",
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: "#333",
    fontWeight: "600",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
    backgroundColor: "transparent",
    flex: 1,
  },
  cardText: {
    marginLeft: 24,
    marginBottom: 6,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  policiaCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
});
