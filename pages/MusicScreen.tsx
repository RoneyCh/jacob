import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
    NavigationParams,
    NavigationScreenProp,
    NavigationState
  } from 'react-navigation';

interface MusicScreenProps {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

const MusicScreen: React.FC<MusicScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddArtist')}
      >
        <Text>Artista</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddLetras')}
      >
        <Text>Letras</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
});

export default MusicScreen;
