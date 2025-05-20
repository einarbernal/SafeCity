import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

const NoticiaScreen = () => {
  const [titulo, setTitulo] = useState('');  
  const [descripcion, setDescripcion] = useState('');
  const [fechaPublicacion, setFechaPublicacion] = useState(new Date());
  const [horaPublicacion, setHoraPublicacion] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const router = useRouter();

  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
    setModalErrorVisible(true);
  };

  const SERVER_IP = '192.168.1.66';
  const API_URL = `http://${SERVER_IP}:3000/noticias`;

  // Obtener ID del usuario al cargar el componente
  useEffect(() => {
  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        // Cambié aquí para buscar id_policia
        const id = userData.id_policia || null;
        if (id) setIdUsuario(id);
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  loadUserData();
}, []);


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar imágenes');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFechaPublicacion(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setHoraPublicacion(selectedTime);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  };

  const handleSubmit = async () => {
  if (!idUsuario) {
    showErrorModal('No se encontró el usuario policía. Por favor inicia sesión de nuevo.');
    return;
  }
  if (!titulo) {
    showErrorModal('El título de la noticia es obligatorio');
    return;
  }
  if (!descripcion) {
    showErrorModal('La descripción de la noticia es obligatoria');
    return;
  }
  
  
    
    setLoading(true);

    const noticiaData = {
      titulo,
      descripcion,
      fecha: formatDate(fechaPublicacion),
      hora: formatTime(horaPublicacion),
      imagen: selectedImage || '',
      idPolicia: idUsuario, // Aquí agregamos el id del usuario (policía)
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noticiaData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/(policia)/NoticiaExito');
      } else {
        showErrorModal(data.message || 'Error al registrar noticia');
      }
    } catch (error) {
      console.error('Error al enviar noticia:', error);
      showErrorModal('No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.menuSuperior}>
      <Stack.Screen 
        options={{
          headerTitle: "Nueva Noticia",
          headerStyle: {
            backgroundColor: '#2e5929',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <ScrollView contentContainerStyle={styles.contenedor}>
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Título de la noticia *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el título"
            placeholderTextColor="#8D6E63" 
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.seccionTitulo}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Ingrese la descripción completa"
            placeholderTextColor="#8D6E63" 
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.seccionTitulo}>Fecha de publicación *</Text>
          <TouchableOpacity 
            style={styles.timePickerButton} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.textoTiempo}>{formatDate(fechaPublicacion)}</Text>
            <View style={styles.pickerArrows}>
              <FontAwesome name="chevron-up" size={12} color="#666" />
              <FontAwesome name="chevron-down" size={12} color="#666" />
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={fechaPublicacion}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.seccionTitulo}>Hora de publicación *</Text>
          <TouchableOpacity 
            style={styles.timePickerButton} 
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.textoTiempo}>{formatTime(horaPublicacion)}</Text>
            <View style={styles.pickerArrows}>
              <FontAwesome name="chevron-up" size={12} color="#666" />
              <FontAwesome name="chevron-down" size={12} color="#666" />
            </View>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={horaPublicacion}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.seccionImagen}>
          {selectedImage ? (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.seleccionDeImagen}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <FontAwesome name="image" size={50} color="#ccc" />
              <Text style={styles.placeholderText}>Ninguna imagen seleccionada</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={pickImage}
          >
            <FontAwesome name="cloud-upload" size={24} color="black" />
            <Text style={styles.uploadButtonText}>Subir Imagen</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Publicar Noticia</Text>
          )}
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalErrorVisible}
          onRequestClose={() => setModalErrorVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setModalErrorVisible(false)}
              >
                <Text style={styles.modalButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

// Los estilos se mantienen iguales
const styles = StyleSheet.create({
  menuSuperior: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contenedor: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  seccion: {
    marginBottom: 15,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  textoTiempo: {
    fontSize: 16,
    color: '#333',
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  pickerArrows: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 30,
    paddingRight: 15,
  },
  seccionImagen: {
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderImage: {
    width: '70%',
    height: 300,
    borderRadius: 8,
    marginBottom: 10,
  },
  seleccionDeImagen: {
    width: '90%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '100%',
    height: 58,
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  submitButton: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFD600',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 20,
    borderWidth:1
  },
  submitButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholderContainer: {
    width: '80%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#2e5929',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default NoticiaScreen;
