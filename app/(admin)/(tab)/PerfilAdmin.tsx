import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const AdminProfileScreen = React.memo(function AdminProfileScreen() {
  const [userData, setUserData] = useState<{ correo: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadUserData = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem("userData");
      router.replace("/auth/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#2e5929" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContent}>
        <View style={styles.iconContent}>
          <FontAwesome6 name="user-shield" size={120} color="#2e5929" />
          <Text style={styles.userRole}>Administrador</Text>
          {userData && <Text style={styles.userEmail}>{userData.correo}</Text>}
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.6}
          disabled={loading}
        >
          <Text style={styles.logoutButtonText}>
            {loading ? "Cerrando..." : "Cerrar Sesión"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  userRole: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2e5929",
    marginBottom: 15,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 22,
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "600",
  },
  logoutButton: {
    width: "80%",
    paddingVertical: 17,
    borderWidth: 2,
    borderRadius: 7,
    marginBottom: 30,
    borderColor: "#2e5929",
  },
  logoutButtonText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e5929",
    textAlign: "center",
  },
  iconContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 45,
    gap: 10,
  },
});

export default AdminProfileScreen;
