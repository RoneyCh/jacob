import React, { useState, useEffect, useContext } from "react";
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
  getDoc,
  where,
} from "firebase/firestore";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialIcons";
import SelectDropdown from 'react-native-select-dropdown';
import axios from "axios";
import  paramsCredentials  from '../spotifyCredentials';
import styles from "../assets/styles/styles";
import { useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { AuthContext } from '../context/AuthContext';


interface letrasProps {
  id: string;
  musica: string;
  letra: string;
  genero: string;
  duracao: number;
  artistaId: string;
  data_insert: string;
}

interface repertorioProps {
  mapaMusica: { [key: string]: number; };
  id: string;
  data_insert: string;
  ordem: number[];
  idMusica: string[];
  artistaId: string;
  musica: string;
  letra: string;
  genero: string;
  duracao: number;
}

interface ArtistProps {
  id: string;
  nome: string;
  genero: string;
  data_insert: string;
}

type RouteProps = {
  repertorioId: string;
}

const AddRepertorioScreen = () => {
  const { userRole } = useContext(AuthContext);

  const route = useRoute();
  const { repertorioId: idRepertorio } = route.params as RouteProps;

  const [musicaNome, setMusicaNome] = useState("");
  const [genero, setGenero] = useState("");
  const [letrasList, setLetrasList] = useState<letrasProps[]>([]);
  const [letras, setLetras] = useState<string>('');
  const [duracao, setDuracao] = useState<number>(0);
  const [artists, setArtists] = useState<ArtistProps[]>([]);
  const [isModalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade da modal
  const [isEditModal, setEditModal] = useState(false); // Estado para controlar se a modal está em modo de edição
  const [repertorioToEdit, setRepertorioToEdit] = useState<repertorioProps | null>(null); // Armazena os dados do letra a ser editado
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [letraToDelete, setLetraToDelete] = useState("");
  const [repertorioData, setRepertorioData] = useState<any>();
  const [dataFromLetras, setDataFromLetras] = useState<any>();
  const [letraToView, setLetraToView] = useState<string>('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [repertoriosList, setRepertoriosList] = useState<repertorioProps[]>([]);
  const [ordem, setOrdem] = useState<number>(0);


  // Referência para a coleção de letras no Firestore
  const letrasCollection = collection(db, "letters");
  

  //const letraRef = doc(db, "letters", repertorioToEdit.id);
  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const filteredLetrasList = search
    ? dataFromLetras.filter((item: { musica: { toString: () => string; }; genero: { toString: () => string; }; }) =>
        item.musica.toString().toLowerCase().includes(search.toLowerCase()) ||
        item.genero.toString().toLowerCase().includes(search.toLowerCase()),
      )
    : dataFromLetras;

 

  const loadLetras = async (repertorioData: repertorioProps | '') => {
    try {
        const q = query(letrasCollection);
        const querySnapshot = await getDocs(q);
        const letraListPromises: Promise<letrasProps>[] = [];
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
      // incluir em dataLetras somente os dados que não estão no repertorio idMusica
      let novasLetras = dataLetras.filter((item) => {
        if(repertorioData) {
          if(repertorioData.idMusica.includes(item.id)) {
            return true;
          }
          return false;
        }
        return false;
      });
      if (repertorioData && repertorioData.mapaMusica) {
        novasLetras.sort((a, b) => {
          const ordemA = repertorioData.mapaMusica[a.id]; // Obtém a ordem da música A
          const ordemB = repertorioData.mapaMusica[b.id]; // Obtém a ordem da música B

          return ordemA - ordemB; // Compara as ordens e retorna a diferença
        });
      }

      setDataFromLetras(novasLetras);
      setLetrasList(letraList);
    } catch (error) {
      console.error("Erro ao carregar letras:", error);
    }
  };
  
  useEffect(() => {
    loadRepertorio();
    loadArtists();
    
  }, []);


  const loadRepertorio = async () => {
    try {
      const repertorioCollection = doc(db, "repertorio", idRepertorio);
      const repertorioDoc = await getDoc(repertorioCollection);
      const repertorioData = repertorioDoc.data() as repertorioProps;
      const mapaMusica: {[key: string]: number} = {}; 
      if(repertorioData && repertorioData.idMusica) {
      for(let i = 0; i < repertorioData.idMusica.length; i++) {
        mapaMusica[repertorioData.idMusica[i]] = repertorioData.ordem[i];
      }
      repertorioData.mapaMusica = mapaMusica;
    
      setRepertoriosList([repertorioData]);
      loadLetras(repertorioData);
    } else {
      loadLetras('');
    }
    } catch (error) {
      console.error("Erro ao carregar repertorio:", error);
    }

};


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


  const addSongsRepertorio = async () => {
    try {
        const repertorioRef = doc(db, "repertorio", idRepertorio);
        const repertorioSnapshot = await getDoc(repertorioRef);
        const dadosAntigos = repertorioSnapshot.data();
        let novoArrayIdMusica: string[] = [];
        let novoArrayOrdem: number[] = [];
        let duracaoNova = dadosAntigos?.duracao || 0 + repertorioData?.duracao || 0;
        if(dadosAntigos?.idMusica) {
          const idMusicaExistente = dadosAntigos?.idMusica; 
          const ordemExistente = dadosAntigos?.ordem;
          const novoIdMusica = repertorioData.value; 
          novoArrayIdMusica = [...idMusicaExistente, novoIdMusica];

          const novaOrdem = ordem;
          novoArrayOrdem = [...ordemExistente, novaOrdem];
        } else {
          novoArrayIdMusica = [repertorioData.value];
          novoArrayOrdem = [ordem];
        }
        
        const dadosRepertorio: DocumentData = {
          ordem: novoArrayOrdem,
          idMusica: novoArrayIdMusica,
          data_insert: new Date(),
          duracaoTotal: duracaoNova,
        };

        await setDoc(repertorioRef, dadosRepertorio, { merge: true });
        setRepertorioToEdit(null);
        setModalVisible(false);
        loadRepertorio();
    } catch (error) {
      console.error("Erro ao adicionar repertorio:", error);
    }
  };

  const removeSongFromRepertorio = async (letra: string) => {
    try {
        const repertorioRef = doc(db, "repertorio", idRepertorio);
        const repertorioSnapshot = await getDoc(repertorioRef);
        const dadosAntigos = repertorioSnapshot.data();
        const idMusicaExistente = dadosAntigos?.idMusica || [];

        // Remove o ID de música do array existente
        const novoArrayIdMusica = idMusicaExistente.filter((id: string) => id !== letra);

        const dadosRepertorio: DocumentData = {
            idMusica: novoArrayIdMusica,
        };

        await setDoc(repertorioRef, dadosRepertorio, { merge: true });
        loadRepertorio();
        setConfirmDeleteVisible(false);
        setLetraToDelete("");
    } catch (error) {
        console.error(`Erro ao remover música do repertório: ${error}`);
    }
  };


  const editLetra = (dadosRepertorio: repertorioProps) => {
    repertoriosList.map((item) => {
      item.idMusica.filter((item2) => {
        if(item2 == dadosRepertorio.id) {
          setOrdem(item.ordem[item.idMusica.indexOf(item2)]);        }
      });
    });
    setRepertorioToEdit(dadosRepertorio);
    setEditModal(true);
    setModalVisible(true);
  };

  const editSongInRepertorio = async () => {
    try {
        const repertorioRef = doc(db, "repertorio", idRepertorio);
        const repertorioSnapshot = await getDoc(repertorioRef);
        const dadosAntigos = repertorioSnapshot.data();
        const idMusicaExistente = dadosAntigos?.idMusica; 
        const ordemExistente = dadosAntigos?.ordem;
        const indiceMusicaParaEditar = idMusicaExistente.indexOf(repertorioToEdit?.id);
        let duracaoNova = dadosAntigos?.duracao || 0 + repertorioData?.duracao || 0;


        idMusicaExistente[indiceMusicaParaEditar] = repertorioData  && repertorioData.value ? repertorioData.value : repertorioToEdit?.id;

        //const indiceOrdemParaEditar = ordemExistente.indexOf(repertorioToEdit?.id);
        const indiceOrdemParaEditar = idMusicaExistente.indexOf(repertorioToEdit?.id);

        ordemExistente[indiceOrdemParaEditar] = ordem;
        // Restante do código permanece o mesmo
        const dadosRepertorio: DocumentData = {
          ordem: ordemExistente,
          idMusica: idMusicaExistente,
          data_insert: new Date(),
          duracaoTotal: duracaoNova,
        };


        await setDoc(repertorioRef, dadosRepertorio, { merge: true });
        setRepertorioToEdit(null);
        setRepertorioData(null);
        setModalVisible(false);
        loadRepertorio();
    } catch (error) {
      console.error("Erro ao editar repertorio:", error);
    }
};


  const saveEditedLetra = async () => {
    try {
      if (repertorioToEdit) {
        const letraRef = doc(db, "repertorio", repertorioToEdit.id);
        const idMusicaExistente = repertorioToEdit.idMusica;
        const letraData: DocumentData = {
          ordem,
          idMusica: repertorioToEdit.idMusica,
        };

        await setDoc(letraRef, letraData, { merge: true }); // Atualiza os campos nome e genero, mantendo os outros campos intactos
        setRepertorioToEdit(null);
        setModalVisible(false);
        loadRepertorio();
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
        <View style={{ display:"flex", flexDirection:'row', width:'80%', height: 40, borderColor: 'gray', borderWidth: 1, margin: 10, paddingLeft: 10 }}>
          <Icon name="search" size={30} />
          <TextInput
            style={{ width: '100%', height: 40, paddingLeft: 10, overflow: 'hidden' }}
            placeholder="Pesquisar..."
            onChangeText={handleSearch}
            value={search}
          />
        </View>
        {userRole == 1 && (
        <Pressable
          onPress={() => {
            setModalVisible(true);
            setEditModal(false);
          }}
        >
        <Icon name="add-circle" size={30} color="#182D00" />
        </Pressable>
        )}
      </View>
      {userRole == 1 && (
      <Button
        color="#182D00"
        title="Adicionar música"
        onPress={() => {
          setModalVisible(true);
          setEditModal(false);
        }}
      />
      )}
      <FlatList
        data={filteredLetrasList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.screensCard}>
          <View style={styles.screenItem}>
            <View style={styles.cardHeader}>
              <Text style={styles.screenName}>{item.musica}</Text> 
              <View style={styles.buttonContainer}>
              <Pressable
                  onPress={() => {
                    setLetraToView(item.letra); 
                    setViewModalVisible(true);
                  }}
                >
                  <Icon name="visibility" size={30} color="#4D6333" />
                </Pressable>
                {userRole == 1 && (
                <><Pressable
                      onPress={() => editLetra(item)}
                      style={{ marginHorizontal: 15 }}
                    >
                      <Icon name="edit" size={30} color="#4D6333" />
                    </Pressable><Pressable
                      onPress={() => {
                        setLetraToDelete(item.id);
                        setConfirmDeleteVisible(true);
                      } }
                    >
                        <Icon name="delete" size={30} color="#f00" />
                      </Pressable></>
                )}
              </View>
            </View>
            <Text style={styles.screenGenre}>{item.genero}</Text>
            <View style={{display:"flex", justifyContent: "space-between", flexDirection: "row", marginTop: 20}}>
              <Text>{artists.map((item2) => {
                  if(item2.id == item.artistaId) {
                    return item2.nome;
                  }
                })}</Text>
              <Text>Duração: {msToMinutes(item.duracao)}</Text>
            </View>
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
                onPress={() => removeSongFromRepertorio(letraToDelete)}
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
              {isEditModal ? "Editar música" : "Adicionar música"}
            </Text>
            <Text>Música:</Text>
            <SelectDropdown
              searchInputTxtColor="#000"
              dropdownStyle={{backgroundColor: '#CFF5C7'}}
              buttonStyle={{backgroundColor: '#CFF5C7', borderColor: '#000', borderWidth: 1, borderRadius: 5, padding: 10, width: '100%'}}
              data={letrasList.map((item) => ({
                value: item.id, 
                label: item.musica,
                genero: item?.genero,
                artistId: item?.artistaId,
                duracao: item.duracao
              }))}
              onSelect={(selectedValue, index) => {
                setRepertorioData(selectedValue);
              }}
              defaultButtonText={
                repertorioToEdit?.id ? repertorioToEdit?.musica : "Selecione uma música"
              }
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem.label + ' - ' + artists.find((artist) => artist.id === selectedItem.artistId)?.nome;
              }}
              rowTextForSelection={(item, index) => item.label + ' - ' + artists.find((artist) => artist.id === item.artistId)?.nome}
            />
            <Text>Ordem:</Text>
            <TextInput
              style={styles.input}
              multiline={true} 
              placeholder="Ordem do repertório"
              keyboardType='numeric'              
              defaultValue={isEditModal ? ordem.toString() : ''}
              onChangeText={(text) => setOrdem(Number(text))}
            />

            <Pressable
              style={styles.modalButton}
              onPress={isEditModal ? editSongInRepertorio : addSongsRepertorio}
            >
              <Text style={styles.modalButtonText}>
                {isEditModal ? "Salvar Edição" : "Adicionar Música"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setRepertorioToEdit(null);
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


export default AddRepertorioScreen;
