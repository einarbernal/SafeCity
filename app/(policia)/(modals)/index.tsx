import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface Denuncia {
  id_denuncia: number;
  descripcion: string;
  hora: string;
  fecha: string;
  tipo: string;
  calle_avenida: string;
  estado: string;
  nombre_denunciante?: string;
}

export default function ReportesScreen() {
  const SERVER_IP = 'safecity.spartan-soft.com';
  const API_URL = `https://${SERVER_IP}/api`;

  const [denunciasAtendidas, setDenunciasAtendidas] = useState<Denuncia[]>([]);
  const [casosPendientes, setCasosPendientes] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReportes = async () => {
    try {
      const resPendientes = await fetch(`${API_URL}/casosPendientes`);
      if (!resPendientes.ok) throw new Error('Error al obtener pendientes');
      const dataPendientes = await resPendientes.json();
      setCasosPendientes(dataPendientes);

      const resAtendidas = await fetch(`${API_URL}/denunciasAtendidas`);
      if (!resAtendidas.ok) throw new Error('Error al obtener atendidas');
      const dataAtendidas = await resAtendidas.json();
      setDenunciasAtendidas(dataAtendidas);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error desconocido');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAtenderCaso = async (idDenuncia: number) => {
    try {
      const response = await fetch(`${API_URL}/atenderDenuncia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idDenuncia }),
      });

      if (!response.ok) throw new Error('Error al actualizar el caso');

      const nuevaDenunciaAtendida = await response.json();
      setDenunciasAtendidas(prev => [...prev, nuevaDenunciaAtendida]);
      setCasosPendientes(prev => prev.filter(caso => caso.id_denuncia !== idDenuncia));
      Alert.alert('Éxito', 'Caso marcado como atendido');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el caso');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportes();
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e5929']} />
        }
      >
        <ThemedText type="title" style={styles.header}>
          Reportes
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Denuncias
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={styles.subsectionTitle}>
          Atendidos ({denunciasAtendidas.length})
        </ThemedText>

        {denunciasAtendidas.map((denuncia) => (
          <ThemedView key={denuncia.id_denuncia} style={styles.attendedCard}>
            <ThemedView style={styles.cardHeader}>
              <FontAwesome name="check-circle" size={16} color="#5cb85c" />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                {denuncia.tipo.toUpperCase()} - {denuncia.calle_avenida}
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.cardText}>{denuncia.descripcion}</ThemedText>
            <ThemedText style={styles.cardDateTime}>
              {formatDate(denuncia.fecha)} a las {formatTime(denuncia.hora)}
            </ThemedText>
            {denuncia.nombre_denunciante && (
              <ThemedText style={styles.cardText}>
                Denunciante: {denuncia.nombre_denunciante}
              </ThemedText>
            )}
          </ThemedView>
        ))}

        <ThemedText type="defaultSemiBold" style={styles.subsectionTitle}>
          Pendientes ({casosPendientes.length})
        </ThemedText>

        {casosPendientes.map((caso) => (
          <ThemedView key={caso.id_denuncia} style={styles.pendingCard}>
            <ThemedView style={styles.cardHeader}>
              <FontAwesome name="exclamation-triangle" size={16} color="#d9534f" />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                {caso.tipo.toUpperCase()} - {caso.calle_avenida}
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.cardText}>{caso.descripcion}</ThemedText>
            <ThemedText style={styles.cardDateTime}>
              {formatDate(caso.fecha)} a las {formatTime(caso.hora)}
            </ThemedText>

            {caso.nombre_denunciante && (
              <ThemedText style={styles.cardText}>
                Denunciante: {caso.nombre_denunciante}
              </ThemedText>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAtenderCaso(caso.id_denuncia)}
            >
              <FontAwesome name="check" size={14} color="#fff" />
              <ThemedText style={styles.actionButtonText}>Atender Caso</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

// Funciones auxiliares para formatear fecha y hora
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e5929',
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: '#333',
    fontWeight: '600',
    // Eliminamos cualquier borde que pudiera estar aquí
  },
  subsectionTitle: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
    color: '#444',
    fontWeight: '600',
    // Aseguramos que no tenga bordes
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
      backgroundColor: 'transparent',
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
      backgroundColor: 'transparent',
  },
  cardText: {
    marginLeft: 24,
    marginBottom: 6,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  cardDateTime: {
    marginLeft: 24,
    marginBottom: 6,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  pendingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  attendedCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#2e5929',
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});