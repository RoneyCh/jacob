import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TextInput, StyleSheet } from 'react-native';
import { db } from '../firebase'; // Importe a instância do Firebase do seu arquivo firebase.ts
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, onSnapshot } from 'firebase/firestore';
import { v4 as uid } from 'uuid';

interface artistProps {
  id: string;
  nome: string;
  genero: string;
  data_insert: string;
}

const AddArtistScreen = () => {
  const [artistnome, setArtistnome] = useState('');
  const [genero, setgenero] = useState('');
  const [artists, setArtists] = useState<artistProps[]>([]);
  const [id, setId] = useState<string | undefined>(undefined);

  // Referência para a coleção de artistas no Firestore
  const artistsCollection = collection(db, 'artists');

// Função para carregar a lista de artistas ordenada pela data de inserção
const loadArtists = async () => {
  try {
    const q = query(artistsCollection, orderBy('data_insert', 'desc'));
    const unsub = onSnapshot(q, (querySnapshot) => {
      let artistList: any  = [];
      querySnapshot.forEach((doc) => {
        artistList.push({ id: doc.id, ...doc.data() as { nome: string; genero: string; data_insert: string; } });
      });
      setArtists(artistList);
    });
    return () => unsub();
  } catch (error) {
    console.error('Erro ao carregar artistas:', error);
  }
};

  

  // Função para adicionar um novo artista
  const addArtist = async () => {
    try {
      const id = uid();
      await addDoc(artistsCollection, { id, nome: artistnome, genero, data_insert: new Date() });
      setArtistnome('');
      setgenero('');
      loadArtists();
      
    } catch (error) {
      console.error('Erro ao adicionar artista:', error);
    }
  };

  // Função para deletar um artista
  const deleteArtist = async (id: string ) => {
    try {
      await deleteDoc(doc(artistsCollection, id));
      loadArtists();
    } catch (error) {
      console.error('Erro ao deletar artista:', error);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Lista de Artistas:</Text>
      <FlatList
        data={artists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.artistItem}>
            <Text>{item.nome} - {item.genero}</Text>
            <Button title="Deletar" onPress={() => deleteArtist(item.id)} />
          </View>
        )}
      />
      <Text>Novo Artista:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Artista"
        value={artistnome}
        onChangeText={(text) => setArtistnome(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Gênero"
        value={genero}
        onChangeText={(text) => setgenero(text)}
      />
      <Button title="Cadastrar Artista" onPress={addArtist} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  artistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default AddArtistScreen;
