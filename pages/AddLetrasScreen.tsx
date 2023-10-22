import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
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
  getDocs,
} from "firebase/firestore";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialIcons";
import SelectDropdown from 'react-native-select-dropdown';
import axios from "axios";
import  paramsCredentials  from '../spotifyCredentials';
import styles from "../assets/styles/styles";

interface LetraProps {
  id: string;
  musica: string;
  letra: string;
  genero: string;
  duracao: number;
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
  const [letrasList, setLetrasList] = useState<LetraProps[]>([]);
  const [letras, setLetras] = useState<string>('');
  const [duracao, setDuracao] = useState<number>(0);
  const [artists, setArtists] = useState<ArtistProps[]>([]);
  const [isModalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade da modal
  const [isEditModal, setEditModal] = useState(false); // Estado para controlar se a modal está em modo de edição
  const [letraToEdit, setLetraToEdit] = useState<LetraProps | null>(null); // Armazena os dados do letra a ser editado
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [letraToDelete, setLetraToDelete] = useState("");
  const [artistData, setArtistData] = useState<any>();
  const [dataFromLetras, setDataFromLetras] = useState<any>();
  const [letraToView, setLetraToView] = useState<string>('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  // Referência para a coleção de letras no Firestore
  const letrasCollection = collection(db, "letters");

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const filteredLetrasList = search
    ? letrasList.filter(item =>
        item.musica.toLowerCase().includes(search.toLowerCase()) ||
        item.genero.toLowerCase().includes(search.toLowerCase())
      )
    : letrasList;

 
  const loadLetras = async () => {
    try {
      const q = query(letrasCollection, orderBy("data_insert", "desc"));
      const querySnapshot = await getDocs(q);
      
      const letraListPromises: Promise<LetraProps>[] = [];
      const dataLetras: {
        id: string; musica: string; artistaId: string; duracao: number; data_insert: string; letra: string; 
}[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as {
          id: string;
          musica: string;
          artistaId: string;
          duracao: number;
          data_insert: string;
          letra: string;
          genero: string;
        };

        data.id = doc.id;

        dataLetras.push(data);

        letraListPromises.push(
          (async () => {

  
            return {
              id: doc.id,
              musica: data.musica,
              artistaId: data.artistaId,
              letra: data.letra,
              genero: data.genero,
              duracao: data.duracao,
              data_insert: data.data_insert,
            };
          })()
        );
      });
  
      const letraList = await Promise.all(letraListPromises);
      letraList.map((item) => {
        dataLetras.map((item2: any) => {
          if(item2.musica == item.musica) {
            item.artistaId = item2.artistId;
          }
        }
        );
      });
      setDataFromLetras(dataLetras);
  
      setLetrasList(letraList);
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

    const genre = responseGenre.data.genres[1];
    const trackArtistName = trackData.artists[0].name;

    return {
        durationMs,
        genre,
        trackArtistName
    };
}


  const addLetras = async () => {
    try {
      let { durationMs, genre } = await getSpotifyData(musicaNome, artistData.label);

        setDuracao(durationMs);

        if(artistData.genero) {
          genre = artistData.genero;
        }

        await addDoc(letrasCollection, {
          musica: musicaNome,
          artistId: artistData.value,
          letra: letras,
          duracao: durationMs,
          genero: genre,
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
      const letraRef = doc(db, "letters", id);
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
    const letraData = dataFromLetras.find((item: any) => item.id === letra.id);

    letra.artistaId = letraData.artistId;
    setLetraToEdit(letra);
    setEditModal(true);
    setModalVisible(true);
  };

  const saveEditedLetra = async () => {
    try {
      if (letraToEdit) {
        const letraRef = doc(db, "letters", letraToEdit.id);
        const letraData: DocumentData = {
          musica: musicaNome || letraToEdit.musica,
          letra: letras || letraToEdit.letra,
          duracao: duracao || letraToEdit.duracao,
          genero: genero || letraToEdit.genero,
          artistId: artistData.value,
        };
        console.log(letraData);
        await setDoc(letraRef, letraData, { merge: true }); // Atualiza os campos nome e genero, mantendo os outros campos intactos
        setLetraToEdit(null);
        setModalVisible(false);
        loadLetras();
      }
    } catch (error) {
      console.error("Erro ao editar letra:", error);
    }
  };

  const msToMinutes = (ms:number) => {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (Number(seconds) < 10 ? '0' : '') + seconds;
  }

  return (
    <View style={styles.container}>
      <View style={{display:"flex", flexDirection: 'row', alignItems: 'center'}}>
        <TextInput
          style={{ width:'80%', height: 40, borderColor: 'gray', borderWidth: 1, margin: 10, paddingLeft: 10 }}
          placeholder="Pesquisar..."
          onChangeText={handleSearch}
          value={search}
        />
              </View>
      <Button
        color="#182D00"
        title="Cadastrar Letra"
        onPress={() => {
          setModalVisible(true);
          setEditModal(false);
        }}
      />
      <FlatList
        data={filteredLetrasList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.letrasCard}>
          <View style={styles.letraItem}>
            <View style={styles.cardHeader}>
              <Text style={styles.letraName}>{item.musica}</Text> 
              <View style={styles.buttonContainer}>
                <Pressable
                  onPress={() => {
                    setLetraToView(item.letra); 
                    setViewModalVisible(true);
                  }}
                >
                  <Icon name="visibility" size={30} color="#4D6333" />
                </Pressable>
                <Pressable
                  onPress={() => editLetra(item)}
                  style={{ marginHorizontal: 15 }}
                >
                  <Icon name="edit" size={30} color="#4D6333" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setLetraToDelete(item.id);
                    setConfirmDeleteVisible(true);
                  }}
                >
                  <Icon name="delete" size={30} color="#f00" />
                </Pressable>
              </View>
            </View>
            <Text style={styles.letraGenre}>{item.genero}</Text>
              
            <Text style={{marginTop: 20}}>{artists.map((item2) => {
                if(item2.id == item.artistaId) {
                  return item2.nome;
                }
              })}</Text>
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

      <Modal isVisible={viewModalVisible}>
        <ScrollView>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <Text style={styles.lyricsText}>{letraToView}</Text>
          <Pressable
            style={styles.modalButton}
            onPress={() => setViewModalVisible(false)}
          >
          <Text style={styles.modalButtonText}>Fechar</Text>
          </Pressable>
          </View>
        </View>
        </ScrollView>
      </Modal>
                  
      <Modal isVisible={isModalVisible}>
        <ScrollView>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditModal ? "Editar Letra" : "Nova Letra"}
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
              data={artists.map((item) => ({
                value: item.id, 
                label: item.nome,
                genero: item?.genero,
              }))}
              onSelect={(selectedValue, index) => {
                setArtistData(selectedValue); 
              }}
              defaultButtonText={
                letraToEdit?.artistaId ? artists.find((artist) => artist.id === letraToEdit?.artistaId)?.nome : "Selecione um artista"
              }
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem.label;
              }}
              rowTextForSelection={(item, index) => item.label}
            />
            {isEditModal ? ( 
            <><Text>Duração da Música:</Text><TextInput
                  style={styles.input}
                  placeholder="Duração da Música"
                  value={isEditModal
                    ? msToMinutes(letraToEdit?.duracao || 0)
                    : letraToEdit?.duracao.toString()}
                  onChangeText={(text) => setDuracao(Number(text))} /><Text>Gênero:</Text><TextInput
                    style={styles.input}
                    placeholder="Gênero"
                    value={isEditModal
                      ? letraToEdit?.genero || ""
                      : letraToEdit?.genero}
                    onChangeText={(text) => setGenero(text)} /></>
            ) : null}
            <Text>Letra:</Text>
            <TextInput
              style={[styles.input, { height: 200 }]}  // Defina a altura desejada aqui (por exemplo, 200)
              multiline={true}  // Habilita a funcionalidade de várias linhas
              placeholder="Escreva a letra aqui"
              value={
                isEditModal
                  ? letras || (letraToEdit && letraToEdit.letra) || ""
                  : letras
              }
              onChangeText={(text) => setLetras(text)}
            />

            <Pressable
              style={styles.modalButton}
              onPress={isEditModal ? saveEditedLetra : addLetras}
            >
              <Text style={styles.modalButtonText}>
                {isEditModal ? "Salvar Edição" : "Cadastrar Letra"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setLetraToEdit(null);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
        </ScrollView>
      </Modal>
    </View>
  );
};


export default AddLetrasScreen;
