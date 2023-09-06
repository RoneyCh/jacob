import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CardDetailsScreen from './components/CardDetails';
import LoadingScreen from './components/LoadingScreen';
import HomeScreen from './pages/HomeScreen';
import MusicScreen from './pages/MusicScreen';
import AddArtistScreen from './pages/AddArtistScreen';


const Stack = createStackNavigator();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000); 
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoading ? (
          <Stack.Screen
            name="Loading"
            component={LoadingScreen}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="Música" component={MusicScreen} />
            <Stack.Screen name="AddArtist" component={AddArtistScreen} options={{headerTitle: 'Cadastrar Artista'}}/>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
