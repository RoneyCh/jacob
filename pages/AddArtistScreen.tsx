import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  onSnapshot,
  DocumentData,
  setDoc,
} from "firebase/firestore";
import Modal from "react-native-modal"; // Importe o componente Modal do react-native-modal
import Icon from "react-native-vector-icons/MaterialIcons"; // Importe os ícones desejados
import styles from "../assets/styles/styles";

interface ArtistProps {
  id: string;
  nome: string;
  genero: string;
  data_insert: string;
}

const AddArtistScreen = () => {
  const [artistnome, setArtistnome] = useState("");
  const [genero, setGenero] = useState("");
  const [artists, setArtists] = useState<ArtistProps[]>([]);
  const [isModalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade da modal
  const [isEditModal, setEditModal] = useState(false); // Estado para controlar se a modal está em modo de edição
  const [artistToEdit, setArtistToEdit] = useState<ArtistProps | null>(null); // Armazena os dados do artista a ser editado
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState("");
  const [search, setSearch] = useState('');

  // Referência para a coleção de artistas no Firestore
  const artistsCollection = collection(db, "artists");

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const filteredLetrasList = search
    ? artists.filter(item =>
        item.nome.toLowerCase().includes(search.toLowerCase()) ||
        item.genero.toLowerCase().includes(search.toLowerCase())
      )
    : artists;

  const loadArtists = async () => {
    try {
      const q = query(artistsCollection, orderBy("data_insert", "desc"));
      const unsub = onSnapshot(q, (querySnapshot) => {
        let artistList: any = [];
        querySnapshot.forEach((doc) => {
          artistList.push({
            id: doc.id,
            ...(doc.data() as {
              nome: string;
              genero: string;
              data_insert: string;
            }),
          });
        });
        setArtists(artistList);
      });
      return () => unsub();
    } catch (error) {
      console.error("Erro ao carregar artistas:", error);
    }
  };

  const addArtist = async () => {
    try {
      await addDoc(artistsCollection, {
        nome: artistnome,
        genero,
        data_insert: new Date(),
      });
      setArtistnome("");
      setGenero("");
      setModalVisible(false); // Fecha a modal após o cadastro
      loadArtists();
    } catch (error) {
      console.error("Erro ao adicionar artista:", error);
    }
  };

  const deleteArtist = async (id: string) => {
    try {
      const artistRef = doc(db, "artists", id);
      await deleteDoc(artistRef);
      loadArtists();
      setConfirmDeleteVisible(false);
      setArtistToDelete("");
    } catch (error) {
      console.error("Erro ao deletar artista:", error);
    }
  };

  const editArtist = (artist: ArtistProps) => {
    // Preenche a modal com os dados do artista selecionado
    setArtistToEdit(artist);
    setEditModal(true);
    setModalVisible(true);
  };

  const saveEditedArtist = async () => {
    try {
      if (artistToEdit) {
        const artistRef = doc(db, "artists", artistToEdit.id);
        const artistData: DocumentData = {
          nome: artistnome || artistToEdit.nome,
          genero: genero || artistToEdit.genero,
        };
        await setDoc(artistRef, artistData, { merge: true }); // Atualiza os campos nome e genero, mantendo os outros campos intactos
        setArtistToEdit(null);
        setModalVisible(false);
        loadArtists();
      }
    } catch (error) {
      console.error("Erro ao editar artista:", error);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{display:"flex", flexDirection: 'row', alignItems: 'center'}}>
      <View style={{ display:"flex", flexDirection:'row', width:'100%', height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10, borderRadius: 40 }}>
          <Icon name="search" size={30} />
          <TextInput
            style={{ width: '100%', height: 40, paddingLeft: 10, overflow: 'hidden' }}
            placeholder="Pesquisar..."
            onChangeText={handleSearch}
            value={search}
          />
        </View>
      </View>
      <Button
        color="#182D00"
        title="Cadastrar Artista"
        onPress={() => {
          setModalVisible(true);
          setEditModal(false);
        }}
      />
      <FlatList
        data={filteredLetrasList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.screensCard}>
          <View style={styles.screenItem}>
            <View style={styles.cardHeader}>
              <Text style={styles.screenName}>{item.nome}</Text>
              <View style={styles.buttonContainer}>
                <Pressable
                  onPress={() => editArtist(item)}
                  style={{ marginHorizontal: 15 }}
                >
                  <Icon name="edit" size={30} color="#333" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setArtistToDelete(item.id);
                    setConfirmDeleteVisible(true);
                  }}
                >
                  <Icon name="delete" size={30} color="#f00" />
                </Pressable>
              </View>
            </View>
            <Text style={styles.screenGenre}>{item.genero}</Text>
          </View>
          </View>
        )}
      />
      <Modal
        isVisible={confirmDeleteVisible}
        backdropColor="#000"
        backdropOpacity={0.7}
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationInTiming={300}
        animationOutTiming={300}
        onBackdropPress={() => setConfirmDeleteVisible(false)}
      >
        <View style={styles.confirmDeleteContainer}>
          <View style={styles.confirmDeleteContent}>
            <Text style={styles.confirmDeleteText}>
              Tem certeza de que deseja excluir este artista?
            </Text>
            <View style={styles.confirmDeleteButtons}>
              <Button
                title="Cancelar"
                onPress={() => setConfirmDeleteVisible(false)}
                color="#999"
              />
              <Button
                title="Deletar"
                onPress={() => deleteArtist(artistToDelete)}
                color="#FF0000"
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditModal ? "Editar Artista" : "Novo Artista"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Artista"
              value={
                isEditModal
                  ? artistnome || (artistToEdit && artistToEdit.nome) || ""
                  : artistnome
              }
              onChangeText={(text) => setArtistnome(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Gênero"
              value={
                isEditModal
                  ? genero || (artistToEdit && artistToEdit.genero) || ""
                  : genero
              }
              onChangeText={(text) => setGenero(text)}
            />
            <Pressable
              style={styles.modalButton}
              onPress={isEditModal ? saveEditedArtist : addArtist}
            >
              <Text style={styles.modalButtonText}>
                Salvar
              </Text>
            </Pressable>
            <Pressable
              style={styles.modalButtonRed}
              onPress={() => {
                setArtistToEdit(null);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddArtistScreen;
