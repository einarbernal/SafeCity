import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';

const RegistroCiudadano = () => {
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Estados para los modales
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
    setModalErrorVisible(true);
  };

  const showSuccessModal = (message: string) => {
    setSuccessMessage(message);
    setModalSuccessVisible(true);
  };

  const SERVER_IP = '192.168.1.73';
  const API_URL = `http://${SERVER_IP}:3000/registro`;

  const handleSubmit = async () => {
    // Validaciones
    if (!nombres || !apellidoPaterno || !apellidoMaterno || !correo || !contrasena || !confirmarContrasena) {
      showErrorModal('Todos los campos son obligatorios');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      showErrorModal('Las contraseñas no coinciden');
      return;
    }

    if (contrasena.length < 6) {
      showErrorModal('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validación básica de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      showErrorModal('Por favor ingrese un correo electrónico válido');
      return;
    }

    setLoading(true);

    const usuarioData = {
      nombres,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
      correo,
      contraseña: contrasena
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessModal('Registro completado correctamente');
      } else {
        showErrorModal(data.message || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      showErrorModal('No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setModalSuccessVisible(false);
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: "Registro de Usuario",
          headerStyle: {
            backgroundColor: '#2e5929',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nombre(s) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su nombre"
            placeholderTextColor="#8D6E63"
            value={nombres}
            onChangeText={setNombres}
          />

          <Text style={styles.label}>Apellido Paterno *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su apellido paterno"
            placeholderTextColor="#8D6E63"
            value={apellidoPaterno}
            onChangeText={setApellidoPaterno}
          />

          <Text style={styles.label}>Apellido Materno *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su apellido materno"
            placeholderTextColor="#8D6E63"
            value={apellidoMaterno}
            onChangeText={setApellidoMaterno}
          />

          <Text style={styles.label}>Correo Electrónico *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su correo electrónico"
            placeholderTextColor="#8D6E63"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="Cree una contraseña"
            placeholderTextColor="#8D6E63"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar Contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita su contraseña"
            placeholderTextColor="#8D6E63"
            value={confirmarContrasena}
            onChangeText={setConfirmarContrasena}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Error */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalErrorVisible}
        onRequestClose={() => setModalErrorVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FontAwesome name="exclamation-circle" size={50} color="#e74c3c" style={styles.modalIcon} />
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

      {/* Modal de Éxito */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalSuccessVisible}
        onRequestClose={handleSuccessConfirm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FontAwesome name="check-circle" size={50} color="#2ecc71" style={styles.modalIcon} />
            <Text style={styles.modalText}>{successMessage}</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleSuccessConfirm}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
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
  button: {
    width: '100%',
    height: 65,
    backgroundColor: '#2e5929',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  // Modal Styles
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
  modalIcon: {
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#2e5929',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegistroCiudadano;