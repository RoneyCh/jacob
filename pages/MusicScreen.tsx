import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
    NavigationParams,
    NavigationScreenProp,
    NavigationState
  } from 'react-navigation';
  import styles2 from "../assets/styles/styles";
  import Icon from "react-native-vector-icons/MaterialIcons";


interface MusicScreenProps {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

const MusicScreen: React.FC<MusicScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('AddArtist')}
      >
        <Text style={styles2.musicMenuText}>Artista</Text>
        <Icon name="person" size={30} color="#118233" />
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('AddLetras')}
      >
        <Text style={styles2.musicMenuText}>Letras</Text>
        <Icon name="music-note" size={30} color="#118233" />
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('AddRepertorio')}
      >
        <Text style={styles2.musicMenuText}>Repertório</Text>
        <Icon name="queue-music" size={30} color="#118233" />
      </Pressable>
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
