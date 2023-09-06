import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
    NavigationParams,
    NavigationScreenProp,
    NavigationState
  } from 'react-navigation';

interface navigationProps {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

const HomeScreen: React.FC<navigationProps> = ({ navigation }) => {
  const categories = [
    { id: 1, title: 'Música' },
    { id: 2, title: 'Esportes' }
  ];

  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryCard}
          onPress={() => navigation.navigate(category.title)}
        >
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;