import React from 'react';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const HamburgerMenu = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push('/auth/PerfilCiudadano');
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={{ marginLeft: 15 }}
      activeOpacity={0.6}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <FontAwesome name="bars" size={24} color="white" />
    </TouchableOpacity>
  );
};

export default React.memo(HamburgerMenu);