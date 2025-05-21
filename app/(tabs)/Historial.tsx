import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HamburgerMenu from '../auth/MenuHamburguesa';

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
}

const HistorialScreen = () => {
  const [denunciasAtendidas, setDenunciasAtendidas] = useState<Denuncia[]>([]);
  const [denunciasPendientes, setDenunciasPendientes] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [idCiudadano, setIdCiudadano] = useState<number | null>(null);
  const router = useRouter();

  const SERVER_IP = '192.168.162.18';
  const API_URL_ATENDIDAS = `http://${SERVER_IP}:3000/denunciasUsuario/atendidas`;
  const API_URL_PENDIENTES = `http://${SERVER_IP}:3000/denunciasUsuario/pendientes`;

  // Cargar el ID del ciudadano desde AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setIdCiudadano(userData.id_ciudadano);
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    };

    loadUserData();
  }, []);

  // Cargar denuncias cuando tengamos el ID del ciudadano
  useEffect(() => {
    if (idCiudadano) {
      fetchDenuncias();
    }
  }, [idCiudadano]);

  const fetchDenuncias = async () => {
    setLoading(true);
    try {
      // Obtener denuncias atendidas
      const responseAtendidas = await fetch(`${API_URL_ATENDIDAS}/${idCiudadano}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const dataAtendidas = await responseAtendidas.json();
      if (responseAtendidas.ok) {
        setDenunciasAtendidas(dataAtendidas);
      }

      // Obtener denuncias pendientes
      const responsePendientes = await fetch(`${API_URL_PENDIENTES}/${idCiudadano}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const dataPendientes = await responsePendientes.json();
      if (responsePendientes.ok) {
        setDenunciasPendientes(dataPendientes);
      }
    } catch (error) {
      console.error('Error al obtener denuncias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModificar = (denunciaId: number) => {
    // Navegar a la pantalla de edición con el ID de la denuncia
    //router.push(`/auth/EditarDenuncia?id=${denunciaId}`);
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  };

  // Componente para renderizar una denuncia atendida
  const DenunciaAtendidaItem = ({ denuncia }: { denuncia: Denuncia }) => (
    <View style={styles.denunciaContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome name="check" size={32} color="black" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.ubicacion}>{denuncia.calle_avenida}</Text>
        <Text style={styles.tipo}>{denuncia.tipo.toLowerCase().charAt(0).toUpperCase() + denuncia.tipo.toLowerCase().slice(1)}</Text>
        <Text style={styles.fecha}>{formatDate(denuncia.fecha)}</Text>
      </View>
    </View>
  );

  // Componente para renderizar una denuncia pendiente
  const DenciaPendienteItem = ({ denuncia }: { denuncia: Denuncia }) => (
    <View style={styles.denunciaContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome name="hourglass" size={28} color="black" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.ubicacion}>{denuncia.calle_avenida}</Text>
        <Text style={styles.tipo}>{denuncia.tipo.toLowerCase().charAt(0).toUpperCase() + denuncia.tipo.toLowerCase().slice(1)}</Text>
        <Text style={styles.fecha}>{formatDate(denuncia.fecha)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.modificarButton}
        onPress={() => handleModificar(denuncia.id_denuncia)}
      >
        <Text style={styles.modificarButtonText}>Modificar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: "Mis Reportes",
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
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e5929" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Atendidos</Text>
          {denunciasAtendidas.length > 0 ? (
            denunciasAtendidas.map((denuncia) => (
              <DenunciaAtendidaItem key={denuncia.id_denuncia} denuncia={denuncia} />
            ))
          ) : (
            <Text style={styles.emptyMessage}>No hay denuncias atendidas</Text>
          )}

          <Text style={styles.sectionTitle}>Pendientes</Text>
          {denunciasPendientes.length > 0 ? (
            denunciasPendientes.map((denuncia) => (
              <DenciaPendienteItem key={denuncia.id_denuncia} denuncia={denuncia} />
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#000',
  },
  denunciaContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    overflow: 'hidden',
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#f9f5e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  ubicacion: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipo: {
    fontSize: 20,
    color: '#b98f45',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 20,
    color: '#b98f45',
  },
  modificarButton: {
    backgroundColor: '#2e5929',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginRight: 16,
  },
  modificarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});

export default HistorialScreen;