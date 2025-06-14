// App/auth/login.tsx
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
// NO necesitas importar * as Notifications aquí si solo usas el helper
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerForPushNotificationsAsync } from "../../helpers/notificationsHelper"; // Ajusta la ruta si es necesario

const LoginScreen = () => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Configuración del servidor
  const SERVER_IP = "safecity.spartan-soft.com";
  const API_URL = `https://${SERVER_IP}/api/login`;
  const API_PUSH_TOKEN_URL = `https://${SERVER_IP}/api/guardar-token-push`;

  const handleLogin = async () => {
    if (!correo || !contraseña) {
      setError("Correo y contraseña son requeridos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      if (data.success && data.usuario) { // Asegurarse que data.usuario exista
        await AsyncStorage.setItem("userData", JSON.stringify(data.usuario));

        // Intentar registrar para notificaciones push después de un login exitoso
        // y ANTES de enviar el token al backend.
        const expoPushToken = await registerForPushNotificationsAsync();

        if (data.usuario.id_policia) {
          if (expoPushToken) {
            console.log("Expo Push Token para Policía:", expoPushToken);
            try {
              await fetch(API_PUSH_TOKEN_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id_policia: data.usuario.id_policia,
                  expo_push_token: expoPushToken,
                }),
              });
              console.log("Push token para policía enviado al backend.");
            } catch (pushTokenError) {
              console.error("Error enviando push token de policía al backend:", pushTokenError);
              // Podrías decidir si este error es crítico o no para la navegación
            }
          } else {
            console.warn("No se pudo obtener el Expo Push Token para el policía.");
            // Considera si debes informar al usuario o registrar este evento.
          }

          router.replace({
            pathname: "/(policia)/(tab)/reportes",
            params: {
              idPolicia: data.usuario.id_policia,
              nombres: data.usuario.nombres,
              apellidos: `${data.usuario.apellido_paterno} ${data.usuario.apellido_materno}`,
            },
          });
        } else if (data.usuario.id_ciudadano) {
          if (expoPushToken) {
            console.log("Expo Push Token para Ciudadano:", expoPushToken);
            try {
              await fetch(API_PUSH_TOKEN_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id_ciudadano: data.usuario.id_ciudadano,
                  expo_push_token: expoPushToken,
                }),
              });
              console.log("Push token para ciudadano enviado al backend.");
            } catch (pushTokenError) {
              console.error("Error enviando push token de ciudadano al backend:", pushTokenError);
            }
          } else {
            console.warn("No se pudo obtener el Expo Push Token para el ciudadano.");
          }

          router.replace({
            pathname: "/(tabs)",
            params: {
              idCiudadano: data.usuario.id_ciudadano,
              nombres: data.usuario.nombres,
              apellidos: `${data.usuario.apellido_paterno} ${data.usuario.apellido_materno}`,
            },
          });
        } else if (data.usuario.id_admin) {
          router.replace({
            pathname: "/(admin)/(tab)/inicio",
            params: {
              idAdmin: data.usuario.id_admin,
              correo: data.usuario.correo,
            },
          });
        } else {
          // Caso en que data.usuario no tiene un rol reconocido
          setError("Tipo de usuario desconocido.");
          console.error("Tipo de usuario no reconocido después del login:", data.usuario);
        }
      } else {
        setError(data.message || "Credenciales incorrectas o respuesta inesperada del servidor");
      }
    } catch (err) {
      setError("Error de conexión con el servidor. Por favor, inténtalo de nuevo.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Iniciar Sesión</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputContainer}>
        <FontAwesome
          name="user"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo"
          placeholderTextColor="#999"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome
          name="lock"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={contraseña}
          onChangeText={setContraseña}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Ingresar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push("/auth/R")} // Asumo que "/auth/R" es tu pantalla de registro
      >
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1D5C1D",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
  },
  errorText: {
    color: "red", // Un color más visible para errores
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Fondo para mejor legibilidad
    padding: 8,
    borderRadius: 4,
    marginBottom: 15,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    color: "#1D5C1D", // Cambiado para contraste con el botón amarillo
    fontSize: 18,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;