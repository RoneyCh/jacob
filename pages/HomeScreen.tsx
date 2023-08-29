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
  const cardData = [
    { id: 1, title: 'Música', content: '' },
    { id: 2, title: 'Eventos', content: '' },
  ];

  return (
    <View style={styles.container}>
      {cardData.map((card) => (
        <TouchableOpacity
          key={card.id}
          style={styles.card}
          onPress={() => navigation.navigate('CardDetails', { card })}
        >
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text>{card.content}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',

  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default HomeScreen;
