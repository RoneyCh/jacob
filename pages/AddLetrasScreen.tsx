import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
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
import { v4 as uid } from "uuid";
import Modal from "react-native-modal"; // Importe o componente Modal do react-native-modal
import Icon from "react-native-vector-icons/MaterialIcons"; // Importe os ícones desejados
import SelectDropdown from 'react-native-select-dropdown';
import { RadioButton } from 'react-native-paper';
import axios from "axios";
import  paramsCredentials  from '../spotifyCredentials';

interface LetraProps {
  nome: string;
  id: string;
  musica: string;
  letra: string;
  genero: string;
  duracao: number;
  status: number;
  artistaId: string;
  data_insert: string;
}

interface ArtistProps {
  id: string;
  nome: string;
  genero: string;
  data_insert: string;
}

const AddLetrasScreen = () => {
  const [musicaNome, setMusicaNome] = useState("");
  const [genero, setGenero] = useState("");
  const [letras, setLetras] = useState<LetraProps[]>([]);
  const [status, setStatus] = useState<number>(0);
  const [duracao, setDuracao] = useState<number>(0);
  const [artists, setArtists] = useState<ArtistProps[]>([]);
  const [isModalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade da modal
  const [isEditModal, setEditModal] = useState(false); // Estado para controlar se a modal está em modo de edição
  const [letraToEdit, setLetraToEdit] = useState<LetraProps | null>(null); // Armazena os dados do letra a ser editado
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [letraToDelete, setLetraToDelete] = useState("");
  const [artistData, setArtistData] = useState<any>();
  const [selectedRadioValue, setSelectedRadioValue] = useState('0');

  // Referência para a coleção de letras no Firestore
  const letrasCollection = collection(db, "letters");

  const loadLetras = async () => {
    try {   
      // Carregar letras do Firebase
      const q = query(letrasCollection, orderBy("data_insert", "desc"));
      const unsub = onSnapshot(q, async (querySnapshot) => {
          let letraList: any = [];
          querySnapshot.forEach(async (doc) => {
              const data = doc.data() as {
                  musica: string;
                  artistaId: string;
                  status: number;
                  duracao: number;
                  data_insert: string;
              };

              // Buscar duração no Spotify
              const { durationMs, genre } = await getSpotifyData(data.musica);
              console.log(genre);
              setDuracao(durationMs);
              setGenero(genre);
              letraList.push({
                  id: doc.id,
                  musica: data.musica,
                  artistaId: data.artistaId,
                  status: data.status,
                  letra: letras,
                  genero: genre,
                  duracao: durationMs,
                  data_insert: data.data_insert,
              });
              setLetras(letraList);
          });
      });

      return () => unsub();
  } catch (error) {
      console.error("Erro ao carregar letras:", error);
    }
  };
  useEffect(() => {
    loadArtists();
    loadLetras();
  }, []);

  const artistsCollection = collection(db, "artists");

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
        setGenero(artistList.genero);
        setArtists(artistList);
      });
      return () => unsub();
    } catch (error) {
      console.error("Erro ao carregar artistas:", error);
    }
  };


async function getSpotifyData(songTitle:string, artistName = '') {
    // get token
    const client_id = paramsCredentials().client_id;
    const client_secret = paramsCredentials().client_secret;

    const data = 'grant_type=client_credentials';

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: client_id,
        password: client_secret,
      },
    };
    const responseToken = await axios.post(`https://accounts.spotify.com/api/token`, data, config);

    const token = responseToken.data.access_token;
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${songTitle} ${artistName}&type=track`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const trackData = response.data.tracks.items[0];
    const durationMs = trackData.duration_ms;
    const responseGenre = await axios.get(`https://api.spotify.com/v1/artists/${trackData.artists[0].id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
    }
    });
    console.log(responseGenre);
    const genre = responseGenre.data.genres[0];
    const trackArtistName = trackData.artists[0].name;

    return {
        durationMs,
        genre,
        trackArtistName
    };
}


  const addLetras = async () => {
    try {
      const { durationMs } = await getSpotifyData(musicaNome, artistData.label);

        if(!duracao && durationMs) {
          setDuracao(durationMs);
        }
        await addDoc(letrasCollection, {
          musica: musicaNome,
          artistId: artistData.id,
          status,
          letra: letras,
          duracao,
          data_insert: new Date(),
        });
        setMusicaNome("");
        setGenero("");
        setModalVisible(false); // Fecha a modal após o cadastro
        loadLetras();

    } catch (error) {
      console.error("Erro ao adicionar letra:", error);
    }
  };

  const deleteLetra = async (id: string) => {
    try {
      const letraRef = doc(db, "letras", id);
      await deleteDoc(letraRef);
      loadLetras();
      setConfirmDeleteVisible(false);
      setLetraToDelete("");
    } catch (error) {
      console.error("Erro ao deletar letra:", error);
    }
  };

  const editLetra = (letra: LetraProps) => {
    // Preenche a modal com os dados do letra selecionado
    setLetraToEdit(letra);
    setEditModal(true);
    setModalVisible(true);
  };

  const saveEditedLetra = async () => {
    try {
      if (letraToEdit) {
        const letraRef = doc(db, "letras", letraToEdit.id);
        const letraData: DocumentData = {
          nome: musicaNome || letraToEdit.nome,
          genero: genero || letraToEdit.genero,
        };
        await setDoc(letraRef, letraData, { merge: true }); // Atualiza os campos nome e genero, mantendo os outros campos intactos
        setLetraToEdit(null);
        setModalVisible(false);
        loadLetras();
      }
    } catch (error) {
      console.error("Erro ao editar letra:", error);
    }
  };


  const handleRadioChange = (value:string) => {
    setSelectedRadioValue(value);
  };

  const msToMinutes = (ms:number) => {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (Number(seconds) < 10 ? '0' : '') + seconds;
  }

  return (
    <View style={styles.container}>
      <Button
        title="Cadastrar Letra"
        onPress={() => {
          setModalVisible(true);
          setEditModal(false);
        }}
      />
      <FlatList
        data={letras}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.letraItem}>
            <View style={styles.cardHeader}>
              <Text style={styles.letraName}>{item.musica}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => editLetra(item)}
                  style={{ marginHorizontal: 15 }}
                >
                  <Icon name="edit" size={30} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setLetraToDelete(item.id);
                    setConfirmDeleteVisible(true);
                  }}
                >
                  <Icon name="delete" size={30} color="#f00" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.letraGenre}>{item.genero}</Text>
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
              Tem certeza de que deseja excluir este letra?
            </Text>
            <View style={styles.confirmDeleteButtons}>
              <Button
                title="Cancelar"
                onPress={() => setConfirmDeleteVisible(false)}
                color="#999"
              />
              <Button
                title="Deletar"
                onPress={() => deleteLetra(letraToDelete)}
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
              {isEditModal ? "Editar Letra" : "Novo Letra"}
            </Text>
            <Text>Nome da Música:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da Música"
              value={
                isEditModal
                  ? musicaNome || (letraToEdit && letraToEdit.musica) || ""
                  : musicaNome
              }
              onChangeText={(text) => setMusicaNome(text)}
            />
            <Text>Artistas:</Text>
            <SelectDropdown
              dropdownStyle={styles.input}
              data={artists.map((item) => ({
                value: item.id, 
                label: item.nome,
              }))}
              onSelect={(selectedValue, index) => {
                setArtistData(selectedValue.id); 
              }}
              defaultButtonText="Selecione um artista"
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem.label;
              }}
              rowTextForSelection={(item, index) => item.label}
            />
            <RadioButton.Group onValueChange={handleRadioChange} value={selectedRadioValue}>
              <View style={{display:'flex', flexDirection:'row'}}>
                <Text>Não</Text>
                <RadioButton value="0" />
                <Text>Sim</Text>
                <RadioButton value="1" />
              </View>
            </RadioButton.Group>
            <Text>Duração da Música:</Text>
            <TextInput
              style={styles.input}
              placeholder="Duração da Música"
              value={
                isEditModal
                  ? msToMinutes(duracao) || (letraToEdit && letraToEdit.duracao.toString()) || ""
                  : msToMinutes(duracao)
              }
              onChangeText={(text) => setDuracao(Number(text))}
            />
            <TextInput
              style={styles.input}
              placeholder="Gênero"
              value={
                isEditModal
                  ? genero || (letraToEdit && letraToEdit.genero) || ""
                  : genero
              }
              onChangeText={(text) => setGenero(text)}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={isEditModal ? saveEditedLetra : addLetras}
            >
              <Text style={styles.modalButtonText}>
                {isEditModal ? "Salvar Edição" : "Cadastrar Letra"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setLetraToEdit(null);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  letraItem: {
    width: "100%", // Ocupa toda a largura
    backgroundColor: "white",
    borderRadius: 8,
    marginVertical: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  letraName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  letraGenre: {
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    width: "80%", // Ajuste a largura conforme necessário
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#007AFF", // Cor de fundo do botão
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  modalButtonText: {
    color: "white", // Cor do texto do botão
    fontSize: 16,
  },
  confirmDeleteContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmDeleteContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 8,
  },
  confirmDeleteText: {
    fontSize: 18,
    marginBottom: 20,
  },
  confirmDeleteButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default AddLetrasScreen;
