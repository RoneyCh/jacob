import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('AddEventos')}
      >
        <Text>Cadastrar evento</Text>
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
