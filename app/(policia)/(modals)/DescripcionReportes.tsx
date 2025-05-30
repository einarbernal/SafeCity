import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Denuncia {
  id_denuncia: number;
  descripcion: string;
  hora: string;
  fecha: string;
  tipo: string;
  calle_avenida: string;
  estado: string;
  evidencia?: string;
  modulo_epi?: string;
  nombre_denunciante?: string;
}

export default function DescripcionReportes() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const caso: Denuncia = {
    id_denuncia: Number(params.id_denuncia),
    descripcion: String(params.descripcion),
    hora: String(params.hora),
    fecha: String(params.fecha),
    tipo: String(params.tipo),
    calle_avenida: String(params.calle_avenida),
    estado: String(params.estado),
    evidencia: params.evidencia ? String(params.evidencia) : undefined,
    modulo_epi: params.modulo_epi ? String(params.modulo_epi) : undefined,
    nombre_denunciante: params.nombre_denunciante ? String(params.nombre_denunciante) : undefined,
  };

  const SERVER_IP = '192.168.1.66';
  const API_URL = `http://${SERVER_IP}:3000`;

  const handleAtenderCaso = async () => {
    try {
      const response = await fetch(`${API_URL}/atenderDenuncia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idDenuncia: caso.id_denuncia }),
      });

      if (!response.ok) throw new Error('Error al actualizar el caso');

      router.push({
        pathname: '/(policia)/(tab)/reportes',
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
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo atender el caso');
      console.error(error);
    }
  };

  const handleRegresar = () => {
    router.push({
      pathname: '/(policia)/(tab)/reportes',
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
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="title" style={styles.title}>
          Detalles del Caso
        </ThemedText>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.label}>Tipo de Reporte:</ThemedText>
          <ThemedText style={styles.value}>{caso.tipo}</ThemedText>

          <ThemedText style={styles.label}>Estado:</ThemedText>
          <ThemedText style={[styles.value, styles.estado]}>
            {caso.estado}
          </ThemedText>

          {caso.evidencia && (
            <>
              <ThemedText style={styles.label}>Evidencia:</ThemedText>
              <Image
                source={{ uri: caso.evidencia }}
                style={styles.image}
                resizeMode="contain"
              />
            </>
          )}

          <ThemedText style={styles.label}>Ubicación:</ThemedText>
          <ThemedText style={styles.value}>{caso.calle_avenida}</ThemedText>

          <ThemedText style={styles.label}>Descripción:</ThemedText>
          <ThemedText style={styles.value}>{caso.descripcion}</ThemedText>

          {caso.modulo_epi && (
            <>
              <ThemedText style={styles.label}>Módulo EPI:</ThemedText>
              <ThemedText style={styles.value}>{caso.modulo_epi}</ThemedText>
            </>
          )}

          <ThemedText style={styles.label}>Fecha y Hora:</ThemedText>
          <ThemedText style={styles.value}>
            {formatDate(caso.fecha)} a las {formatTime(caso.hora)}
          </ThemedText>

          {caso.nombre_denunciante && (
            <>
              <ThemedText style={styles.label}>Reportado por:</ThemedText>
              <ThemedText style={styles.value}>{caso.nombre_denunciante}</ThemedText>
            </>
          )}
        </ThemedView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleRegresar}
          >
            <FontAwesome name="arrow-left" size={16} color="#fff" />
            <ThemedText style={styles.buttonText}>Volver</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleAtenderCaso}
          >
            <FontAwesome name="check" size={16} color="#fff" />
            <ThemedText style={styles.buttonText}>Atender Caso</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helpers
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

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e5929',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    lineHeight: 22,
  },
  estado: {
    color: '#2e5929',
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#eee',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 14,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2e5929',
    padding: 14,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});