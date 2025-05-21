// app/profile/edit.tsx
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const EditProfileScreen = () => {
  const [userData, setUserData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    // Aquí iría la lógica para actualizar los datos en el servidor
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setLoading(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombres</Text>
        <TextInput
          style={styles.input}
          value={userData.nombres}
          onChangeText={(text) => setUserData({...userData, nombres: text})}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Apellido Paterno</Text>
        <TextInput
          style={styles.input}
          value={userData.apellido_paterno}
          onChangeText={(text) => setUserData({...userData, apellido_paterno: text})}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Apellido Materno</Text>
        <TextInput
          style={styles.input}
          value={userData.apellido_materno}
          onChangeText={(text) => setUserData({...userData, apellido_materno: text})}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          value={userData.correo}
          onChangeText={(text) => setUserData({...userData, correo: text})}
          keyboardType="email-address"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2e5929',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;