import { Stack, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CrearPoliciaScreen = () => {
  const SERVER_IP = "safecity.spartan-soft.com";
  const API_URL = `https://${SERVER_IP}/api`;
  // Solo los campos necesarios
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [idAdmin, setIdAdmin] = useState<number | null>(null);
  const router = useRouter();

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
    setModalErrorVisible(true);
  };

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData.id_admin) setIdAdmin(userData.id_admin);
        }
      } catch (error) {
        console.error("Error al cargar datos del admin:", error);
      }
    };
    loadAdminData();
  }, []);

  const limpiarCampos = () => {
    setNombres("");
    setApellidoPaterno("");
    setApellidoMaterno("");
    setCorreo("");
    setContraseña("");
  };

  const handleSubmit = async () => {
    if (
      !nombres ||
      !apellidoPaterno ||
      !apellidoMaterno ||
      !correo ||
      !contraseña
    ) {
      showErrorModal("Todos los campos son obligatorios");
      return;
    }
    if (!idAdmin) {
      showErrorModal(
        "No se encontró el administrador. Vuelve a iniciar sesión."
      );
      return;
    }

    setLoading(true);

    const policiaData = {
      nombres,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
      correo,
      contraseña,
      id_admin: idAdmin,
    };

    try {
      const response = await fetch(`${API_URL}/policias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(policiaData),
      });

      let data;
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          throw new Error("Respuesta no válida del servidor");
        }
      } catch (parseError) {
        showErrorModal("Error al procesar la respuesta del servidor.");
        console.error("Parse error:", parseError);
        return;
      }

      if (data.success) {
        Alert.alert("Éxito", "Policía creado correctamente.", [
          {
            text: "OK",
            onPress: () => {
              limpiarCampos();
              router.replace("/(admin)/(tab)/inicio");
            },
          },
        ]);
      } else {
        showErrorModal(data.message || "Error al registrar policía");
      }
    } catch (error) {
      console.error("Error al enviar policía:", error);
      showErrorModal("No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.menuSuperior}>
      <Stack.Screen
        options={{
          headerTitle: "Crear Policía",
          headerStyle: {
            backgroundColor: "#2e5929",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <ScrollView contentContainerStyle={styles.contenedor}>
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Nombres *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese los nombres"
            placeholderTextColor="#8D6E63"
            value={nombres}
            onChangeText={setNombres}
          />

          <Text style={styles.seccionTitulo}>Apellido Paterno *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el apellido paterno"
            placeholderTextColor="#8D6E63"
            value={apellidoPaterno}
            onChangeText={setApellidoPaterno}
          />

          <Text style={styles.seccionTitulo}>Apellido Materno *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el apellido materno"
            placeholderTextColor="#8D6E63"
            value={apellidoMaterno}
            onChangeText={setApellidoMaterno}
          />

          <Text style={styles.seccionTitulo}>Correo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el correo"
            placeholderTextColor="#8D6E63"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.seccionTitulo}>Contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese una contraseña"
            placeholderTextColor="#8D6E63"
            value={contraseña}
            onChangeText={setContraseña}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Registrar Policía</Text>
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

const styles = StyleSheet.create({
  menuSuperior: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contenedor: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  seccion: {
    marginBottom: 15,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    width: "100%",
    height: 55,
    backgroundColor: "#FFD600",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  submitButtonText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#2e5929",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default CrearPoliciaScreen;
