import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

interface Denuncia {
  id_denuncia: number;
  descripcion: string;
  hora: string;
  fecha: string;
  tipo: string;
  calle_avenida: string;
  estado: string;
  evidencia: string;
  modulo_epi: string;
  nombre_denunciante?: string;
}

export default function ReportesScreen() {
  const SERVER_IP = '192.168.31.104';
  const API_URL = `http://${SERVER_IP}:3000`;

  const router = useRouter();
  const [denunciasAtendidas, setDenunciasAtendidas] = useState<Denuncia[]>([]);
  const [casosPendientes, setCasosPendientes] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReportes = async () => {
    try {
      const resPendientes = await fetch(`${API_URL}/casosPendientes`);
      if (!resPendientes.ok) throw new Error('Error al obtener pendientes');
      const dataPendientes = await resPendientes.json();
      
      const pendientesConNombres = await Promise.all(
        dataPendientes.map(async (caso: Denuncia) => {
          const resDenunciante = await fetch(`${API_URL}/obtenerDenunciante/${caso.id_denuncia}`);
          if (resDenunciante.ok) {
            const { nombre } = await resDenunciante.json();
            return { ...caso, nombre_denunciante: nombre };
          }
          return caso;
        })
      );
      setCasosPendientes(pendientesConNombres);

      const resAtendidas = await fetch(`${API_URL}/denunciasAtendidas`);
      if (!resAtendidas.ok) throw new Error('Error al obtener atendidas');
      const dataAtendidas = await resAtendidas.json();
      
      const atendidasConNombres = await Promise.all(
        dataAtendidas.map(async (denuncia: Denuncia) => {
          const resDenunciante = await fetch(`${API_URL}/obtenerDenunciante/${denuncia.id_denuncia}`);
          if (resDenunciante.ok) {
            const { nombre } = await resDenunciante.json();
            return { ...denuncia, nombre_denunciante: nombre };
          }
          return denuncia;
        })
      );
      setDenunciasAtendidas(atendidasConNombres);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error desconocido');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push({
                pathname: '/(tabs)/DescripcionRAtendidos',
                params: {
                  id_denuncia: denuncia.id_denuncia.toString(),
                  descripcion: denuncia.descripcion,
                  hora: denuncia.hora,
                  fecha: denuncia.fecha,
                  tipo: denuncia.tipo,
                  calle_avenida: denuncia.calle_avenida,
                  estado: denuncia.estado,
                  evidencia: denuncia.evidencia || '',
                  modulo_epi: denuncia.modulo_epi || '',
                  nombre_denunciante: denuncia.nombre_denunciante || ''
                },
              })}
            >
              <FontAwesome name="check" size={14} color="#fff" />
              <ThemedText style={styles.actionButtonText}>Descripcion</ThemedText>
            </TouchableOpacity>
            
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
              onPress={() => router.push({
                pathname: '/(tabs)/DescripcionReportes',
                params: {
                  id_denuncia: caso.id_denuncia.toString(),
                  descripcion: caso.descripcion,
                  hora: caso.hora,
                  fecha: caso.fecha,
                  tipo: caso.tipo,
                  calle_avenida: caso.calle_avenida,
                  estado: caso.estado,
                  evidencia: caso.evidencia || '',
                  modulo_epi: caso.modulo_epi || '',
                  nombre_denunciante: caso.nombre_denunciante || ''
                },
              })}
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
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: '#333',
    fontWeight: '600',
  },
  subsectionTitle: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
    color: '#444',
    fontWeight: '600',
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