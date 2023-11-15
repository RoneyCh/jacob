import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from './components/LoadingScreen';
import HomeScreen from './pages/HomeScreen';
import MusicScreen from './pages/MusicScreen';
import EventScreen from './pages/EventScreen';
import AddArtistScreen from './pages/AddArtistScreen';
import AddLetrasScreen from './pages/AddLetrasScreen';
import AddRepertorioScreen from './pages/AddRepertorioScreen';
import AddSongsRepertorioScreen from './pages/AddSongsRepertorioScreen';
import AddEventScreen from './pages/AddEventScreen';
import AddRepertorioEventoScreen from './pages/AddRepertorioEventoScreen';
import SignUpScreen from './pages/SignUpScreen';
import SignInScreen from './pages/SignInScreen';
import {decode, encode} from 'base-64';
import AuthProvider from './context/AuthContext';

if (!global.btoa) {  global.btoa = encode }

if (!global.atob) { global.atob = decode }

const Stack = createStackNavigator();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000); 
  }, []);

  return (
    <AuthProvider>
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
                name="SignIn"
                component={SignInScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  headerShown: false
                }}
              />
              <Stack.Screen name="Música" component={MusicScreen} />
              <Stack.Screen name="AddArtist" component={AddArtistScreen} options={{headerTitle: 'Artista'}}/>
              <Stack.Screen name="AddLetras" component={AddLetrasScreen} options={{headerTitle: 'Letras'}}/>
              <Stack.Screen name="AddRepertorio" component={AddRepertorioScreen} options={{headerTitle: 'Repertorio'}}/>
              <Stack.Screen name="AddSongsRepertorio" component={AddSongsRepertorioScreen} options={{headerTitle: 'Adicionar Músicas'}} />
              <Stack.Screen name="Eventos" component={EventScreen} />
              <Stack.Screen name="AddEventos" component={AddEventScreen} options={{headerTitle: 'Adicionar Evento'}}/>
              <Stack.Screen name="AddRepertorioEvento" component={AddRepertorioEventoScreen} options={{headerTitle: 'Adicionar Setlist'}} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
