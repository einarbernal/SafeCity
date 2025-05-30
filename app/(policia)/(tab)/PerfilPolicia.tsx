import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Stack } from 'expo-router';

const PoliceProfileScreen = React.memo(function PoliceProfileScreen() {
  const [userData, setUserData] = useState<{
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadUserData = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading police data:', error);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('userData');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2e5929" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContent}>
        <View style={styles.contenidoIcono}>
        <FontAwesome6 name="user-shield" size={164} color="#2e5929" />
          {userData && (
            <Text style={styles.userName}>
              {userData.nombres} {userData.apellido_paterno} {userData.apellido_materno}
            </Text>
          )}
          <Text style={styles.userRole}>Policía</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleLogout}
          activeOpacity={0.6}
          delayPressIn={0}
          disabled={loading}
        >
          <Text style={styles.menuItemText}>
            {loading ? 'Cerrando...' : 'Cerrar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  userName: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
    textAlign: 'center',
  },
  userRole: {
    fontSize: 28,
    fontWeight:'bold',
    color: '#2e5929',
    marginBottom: 35,
    textAlign: 'center',
  },
  menuItem: {
    width: '80%',
    paddingVertical: 17,
    borderWidth: 2,
    borderRadius: 7,
    marginBottom: 30,
    borderColor: '#2e5929',
  },
  menuItemText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e5929',
    textAlign: 'center',
  },
  contenidoIcono: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 45,
    gap: 10,
  },
});

export default PoliceProfileScreen;