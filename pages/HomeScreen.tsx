import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { NavigationParams, NavigationScreenProp, NavigationState } from 'react-navigation';

interface navigationProps {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

const HomeScreen: React.FC<navigationProps> = ({ navigation }) => {
  const categories = [
    { id: 1, title: 'Música' },
    { id: 2, title: 'Eventos' }
  ];

  const [statusBarHeight, setStatusBarHeight] = useState<number>(0);

  useEffect(() => {
    const statusHeight = StatusBar.currentHeight || 0;
    setStatusBarHeight(statusHeight);
  }, []);

  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <SafeAreaView
          key={category.id}
          style={[{ marginTop: statusBarHeight }]}
        >
          <Pressable
            style={styles.categoryCard}
            onPress={() => navigation.navigate(category.title)}
          >
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </Pressable>
        </SafeAreaView>
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
    borderRadius: 8,
    elevation: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
