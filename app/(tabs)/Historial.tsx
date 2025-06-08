import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import HamburgerMenu from "../auth/MenuHamburguesa";

// Definición de tipos para las denuncias
interface Denuncia {
  id_denuncia: number;
  descripcion: string;
  modulo_epi: string;
  hora: string;
  fecha: string;
  tipo: string;
  calle_avenida: string;
  evidencia: string | null;
  estado: string;
  id_ciudadano: number;
  fue_modificada: number;
  mostrarModificar?: boolean;
  minutosRestantes?: number;
  fechaRegistroStr?: string;
}

const HistorialScreen = () => {
  const [atendidos, setAtendidos] = useState<Denuncia[]>([]);
  const [pendientes, setPendientes] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [idCiudadano, setIdCiudadano] = useState<number | null>(null);
  const router = useRouter();

  const SERVER_IP = "safecity.spartan-soft.com";
  // Volvemos a usar los endpoints originales que funcionaban
  const API_URL_ATENDIDAS = `https://${SERVER_IP}/api/denunciasUsuario/atendidas`;
  const API_URL_PENDIENTES = `https://${SERVER_IP}/api/denunciasUsuario/pendientes`;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setIdCiudadano(userData.id_ciudadano);
          fetchDenuncias(userData.id_ciudadano);
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        setLoading(false);
      }
    };

    loadUserData();

    // Actualizar cada minuto para verificar tiempos
    const interval = setInterval(() => {
      if (idCiudadano) {
        fetchDenuncias(idCiudadano);
      }
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [idCiudadano]);

  const parseDateTime = (fecha: string, hora: string) => {
    const [hours, minutes] = hora.split(":").map(Number);
    const date = new Date(fecha);

    // Usa setHours en lugar de setUTCHours
    date.setHours(hours + 24, minutes);
    return date;
  };

  const fetchDenuncias = async (userId: number) => {
    if (!refreshing) {
      setLoading(true);
    }

    try {
      // Obtener denuncias atendidas (usando el endpoint original)
      const responseAtendidas = await fetch(`${API_URL_ATENDIDAS}/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let atendidosData: Denuncia[] = [];
      if (responseAtendidas.ok) {
        const dataAtendidas = await responseAtendidas.json();
        atendidosData = Array.isArray(dataAtendidas) ? dataAtendidas : [];
      } else {
        console.error(
          "Error al obtener denuncias atendidas:",
          responseAtendidas.status
        );
      }

      // Obtener denuncias pendientes (usando el endpoint original)
      const responsePendientes = await fetch(
        `${API_URL_PENDIENTES}/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let pendientesData: Denuncia[] = [];
      if (responsePendientes.ok) {
        const dataPendientes = await responsePendientes.json();
        pendientesData = Array.isArray(dataPendientes) ? dataPendientes : [];
      } else {
        console.error(
          "Error al obtener denuncias pendientes:",
          responsePendientes.status
        );
      }

      // Procesar denuncias pendientes para determinar si se pueden modificar
      const now = new Date();
      const pendientesProcesadas = pendientesData.map((denuncia) => {
        try {
          const fechaRegistro = parseDateTime(denuncia.fecha, denuncia.hora);

          if (isNaN(fechaRegistro.getTime())) {
            console.error("Fecha inválida:", denuncia.fecha, denuncia.hora);
            return {
              ...denuncia,
              mostrarModificar: false,
              minutosRestantes: 0,
            };
          }

          const diffMs = now.getTime() - fechaRegistro.getTime();
          const diffMinutes = diffMs / (1000 * 60);

          // Solo mostrar el botón de modificar si:
          // 1. No ha sido modificada antes (fue_modificada = 0)
          // 2. Está dentro del tiempo límite (10 minutos)
          const puedeModificar =
            denuncia.fue_modificada === 0 && diffMinutes <= 10;
          return {
            ...denuncia,
            mostrarModificar: puedeModificar,
            minutosRestantes: puedeModificar
              ? Math.max(0, Math.floor(10 - diffMinutes))
              : 0,
            fechaRegistroStr: fechaRegistro.toLocaleString(), // Para debug
          };
        } catch (error) {
          console.error("Error procesando denuncia:", error);
          return { ...denuncia, mostrarModificar: false, minutosRestantes: 0 };
        }
      });

      setAtendidos(atendidosData);
      setPendientes(pendientesProcesadas);
    } catch (error) {
      console.error("Error al obtener denuncias:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  // Función para manejar el pull-to-refresh
  const onRefresh = React.useCallback(() => {
    if (idCiudadano) {
      setRefreshing(true);
      fetchDenuncias(idCiudadano);
    }
  }, [idCiudadano]);

  const handleModificar = (denunciaId: number) => {
    router.push({
      pathname: "/auth/EditarDenuncia",
      params: { idDenuncia: denunciaId },
    });
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);

    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    return `${months[month - 1]} ${day}, ${year}`;
  };

  // Componente para renderizar una denuncia atendida
  const DenunciaAtendidaItem = ({ denuncia }: { denuncia: Denuncia }) => (
    <View style={styles.denunciaContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome name="check" size={32} color="black" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.ubicacion}>{denuncia.calle_avenida}</Text>
        <Text style={styles.tipo}>
          {denuncia.tipo.toLowerCase().charAt(0).toUpperCase() +
            denuncia.tipo.toLowerCase().slice(1)}
        </Text>
        <Text style={styles.fecha}>{formatDate(denuncia.fecha)}</Text>
      </View>
    </View>
  );

  // Componente para renderizar una denuncia pendiente
  const DenciaPendienteItem = ({ denuncia }: { denuncia: Denuncia }) => {
    //console.log('Denuncia procesada:', {
    //id: denuncia.id_denuncia,
    //estado: denuncia.estado,
    //mostrarModificar: denuncia.mostrarModificar,
    //minutosRestantes: denuncia.minutosRestantes,
    //fechaRegistroStr: denuncia.fechaRegistroStr,
    //fecha: denuncia.fecha,
    //hora: denuncia.hora
    //});

    return (
      <View style={styles.denunciaContainer}>
        <View style={styles.iconContainer}>
          <FontAwesome name="hourglass" size={28} color="black" />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.ubicacion}>{denuncia.calle_avenida}</Text>
          <Text style={styles.tipo}>
            {denuncia.tipo.toLowerCase().charAt(0).toUpperCase() +
              denuncia.tipo.toLowerCase().slice(1)}
          </Text>
          <Text style={styles.fecha}>{formatDate(denuncia.fecha)} </Text>

          {/* Mostrar mensaje según el estado de modificación */}
          {denuncia.fue_modificada === 1 ? (
            <View style={styles.modificarContainer}>
              <Text style={styles.denunciaModificada}>
                ✓ Denuncia modificada
              </Text>
            </View>
          ) : denuncia.mostrarModificar ? (
            <View style={styles.modificarContainer}>
              <Text style={styles.timeRemaining}>
                Tiempo para modificar: {denuncia.minutosRestantes} min
              </Text>
            </View>
          ) : null}
        </View>
        {denuncia.mostrarModificar && (
          <TouchableOpacity
            style={styles.modificarButton}
            onPress={() => handleModificar(denuncia.id_denuncia)}
          >
            <Text style={styles.modificarButtonText}>Modificar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Mis Reportes",
          headerStyle: {
            backgroundColor: "#2e5929",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerLeft: () => <HamburgerMenu />,
        }}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e5929" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2e5929"]} // Android
              tintColor={"#2e5929"} // iOS
              title="Actualizando..." // iOS
              titleColor={"#2e5929"} // iOS
            />
          }
        >
          <Text style={styles.sectionTitle}>Atendidos</Text>
          {atendidos.length > 0 ? (
            atendidos.map((denuncia) => (
              <DenunciaAtendidaItem
                key={denuncia.id_denuncia}
                denuncia={denuncia}
              />
            ))
          ) : (
            <Text style={styles.emptyMessage}>No hay denuncias atendidas</Text>
          )}

          <Text style={styles.sectionTitle}>Pendientes</Text>
          {pendientes.length > 0 ? (
            pendientes.map((denuncia) => (
              <DenciaPendienteItem
                key={denuncia.id_denuncia}
                denuncia={denuncia}
              />
            ))
          ) : (
            <Text style={styles.emptyMessage}>No hay denuncias pendientes</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
    color: "#000",
  },
  denunciaContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
    overflow: "hidden",
    alignItems: "center",
  },
  iconContainer: {
    width: 70,
    height: 70,
    backgroundColor: "#f9f5e8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.4,
    borderRadius: 3,
    marginLeft: 15,
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  ubicacion: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tipo: {
    fontSize: 17,
    color: "#b98f45",
    marginBottom: 4,
  },
  fecha: {
    fontSize: 17,
    color: "#b98f45",
  },
  modificarContainer: {
    marginTop: 8,
  },
  timeRemaining: {
    fontSize: 15,
    color: "#E53935",
    fontStyle: "italic",
    fontWeight: "bold",
  },
  modificarButton: {
    backgroundColor: "#2e5929",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginRight: 16,
  },
  modificarButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  denunciaModificada: {
    fontSize: 15,
    color: "#4CAF50", // Verde para indicar que ya fue modificada
    fontStyle: "italic",
    fontWeight: "bold",
  },
});

export default HistorialScreen;
