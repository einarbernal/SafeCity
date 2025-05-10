import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const LoginScreen = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Configuración del servidor
  const SERVER_IP = '192.168.1.73'; // Cambia por tu IP
  const API_URL = `http://${SERVER_IP}:3000/login`;

  const handleLogin = async () => {
    if (!correo || !contraseña) {
      setError('Correo y contraseña son requeridos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      if (data.success) {
        // Guardar solo los datos necesarios
        await AsyncStorage.setItem('userData', JSON.stringify(data.ciudadano));
        // Redirige al área principal
        router.replace('/(tabs)');
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Logo de la app */}
      <Image 
        source={require('@/assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Iniciar Sesión</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={20} color="#666" style={styles.inputIcon} />
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
        <FontAwesome name="lock" size={20} color="#666" style={styles.inputIcon} />
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
        onPress={() => router.push("/auth/R")}
      >
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1D5C1D',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;