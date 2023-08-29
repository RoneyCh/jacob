import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CardDetailsScreenProps {
    route: any;
}

const CardDetailsScreen: React.FC<CardDetailsScreenProps> = ({ route }) => {
  const { card } = route.params;

  return (
    <View style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.cardTitle}>{card.title}</Text>
      <Text>{card.content}</Text>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    padding: 16,
    flexDirection: 'row'
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default CardDetailsScreen;
