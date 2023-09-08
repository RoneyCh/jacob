import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const LoadingScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const fadeInAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500, 
      useNativeDriver: true,
    });

    fadeInAnimation.start();

    setTimeout(() => {
      setIsLoading(false);
    }, 3000); 
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.nameContainer, { opacity: fadeAnim }]}>
          <Text style={styles.name}>JACOB</Text>
        </Animated.View>
      </View>
    );
  }
  return (
    <View>
      {}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  nameContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 48,
    color: 'white'
  },
});

export default LoadingScreen;
