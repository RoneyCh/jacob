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
import styles from "../assets/styles/styles";
import { useRoute } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { lightBlue100 } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

type NavigationProps = {
  navigation: NavigationProp<any>;
};

interface repertoriosProps {
  id: string;
  nome: string;
}

interface eventoProps {
  mapaMusica: { [key: string]: number; };
  id: string;
  data_insert: string;
  ordem: number[];
  idRepertorio: string[];
  data_evento: {seconds: number, nanoseconds: number};
  nome: string;
}

interface ArtistProps {
  id: string;
  nome: string;
  genero: string;
  data_insert: string;
}

type RouteProps = {
  eventoId: string;
}

const AddEventoScreen: React.FC<NavigationProps> = ({navigation}) => {
  const route = useRoute();
  const { eventoId: idEvento } = route.params as RouteProps;

  const [repertoriosList, setRepertoriosList] = useState<repertoriosProps[]>([]);
  const [artists, setArtists] = useState<ArtistProps[]>([]);
  const [isModalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade da modal
  const [isEditModal, setEditModal] = useState(false); // Estado para controlar se a modal está em modo de edição
  const [eventoToEdit, setEventoToEdit] = useState<eventoProps | null>(null); // Armazena os dados do repertorio a ser editado
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [repertorioToDelete, setRepertorioToDelete] = useState("");
  const [eventoData, setEventoData] = useState<any>();
  const [dataFromRepertorios, setDataFromRepertorios] = useState<any>();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [eventosList, setEventosList] = useState<eventoProps[]>([]);
  const [ordem, setOrdem] = useState<number>(0);
  const [duracao, setDuracao] = useState<number>(0);


  // Referência para a coleção de repertorios no Firestore
  const repertoriosCollection = collection(db, "repertorio");
  

  //const repertorioRef = doc(db, "letters", eventoToEdit.id);
  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const filteredRepertoriosList = search
    ? dataFromRepertorios.filter((item: { musica: { toString: () => string; }; genero: { toString: () => string; }; }) =>
        item.musica.toString().toLowerCase().includes(search.toLowerCase()) ||
        item.genero.toString().toLowerCase().includes(search.toLowerCase()),
      )
    : dataFromRepertorios;

 

  const loadRepertorios = async (eventoData: eventoProps | '') => {
    try {
        const q = query(repertoriosCollection);
        const querySnapshot = await getDocs(q);
        const repertorioListPromises: Promise<repertoriosProps>[] = [];
        const dataRepertorios: {
          id: string; nome: string; duracaoTotal: number;
      }[] = [];
    
      querySnapshot.forEach((doc) => {
        const data = doc.data() as {
          id: string;
          nome: string;
          duracaoTotal: number;
        };

        data.id = doc.id;
        dataRepertorios.push(data);

        repertorioListPromises.push(
          (async () => {
            return {
              id: doc.id,
              nome: data.nome
            };
          })()
        );
      });
  
      const repertorioList = await Promise.all(repertorioListPromises);
      // incluir em dataRepertorios somente os dados que não estão no evento idRepertorio
      let duracaoSum = 0;
      let novosRepertorios = dataRepertorios.filter((item) => {
        if(eventoData) {
          if(eventoData.idRepertorio.includes(item.id)) {
            duracaoSum += item.duracaoTotal;
            return true;
          }
          return false;
        }
        return false;
      });
      setDuracao(duracaoSum);
      if (eventoData && eventoData.mapaMusica) {
        novosRepertorios.sort((a, b) => {
          const ordemA = eventoData.mapaMusica[a.id]; // Obtém a ordem do repertório A
          const ordemB = eventoData.mapaMusica[b.id]; // Obtém a ordem da repertório B

          return ordemA - ordemB; // Compara as ordens e retorna a diferença
        });
      }

      setDataFromRepertorios(novosRepertorios);
      setRepertoriosList(repertorioList);
    } catch (error) {
      console.error("Erro ao carregar repertorios:", error);
    }
  };
  
  useEffect(() => {
    loadEvento();
    //loadArtists();
    
  }, []);


  const loadEvento = async () => {
    try {
      const eventoCollection = doc(db, "evento", idEvento);
      const eventoDoc = await getDoc(eventoCollection);
      const eventoData = eventoDoc.data() as eventoProps;
      const mapaMusica: {[key: string]: number} = {}; 
      if(eventoData && eventoData.idRepertorio) {
      for(let i = 0; i < eventoData.idRepertorio.length; i++) {
        mapaMusica[eventoData.idRepertorio[i]] = eventoData.ordem[i];
      }
      eventoData.mapaMusica = mapaMusica;
    
      setEventosList([eventoData]);
      loadRepertorios(eventoData);
    } else {
      loadRepertorios('');
    }
    } catch (error) {
      console.error("Erro ao carregar evento:", error);
    }

};


  const artistsCollection = collection(db, "artists");

  /*const loadArtists = async () => {
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
  };*/


  const addRepertoriosEvento = async () => {
    try {
        const eventoRef = doc(db, "evento", idEvento);
        const eventoSnapshot = await getDoc(eventoRef);
        const dadosAntigos = eventoSnapshot.data();
        let novoArrayIdRepertorio: string[] = [];
        let novoArrayOrdem: number[] = [];
        if(dadosAntigos?.idRepertorio) {
          const idRepertorioExistente = dadosAntigos?.idRepertorio; 
          const ordemExistente = dadosAntigos?.ordem;
          const novoIdRepertorio = eventoData.value; 
          novoArrayIdRepertorio = [...idRepertorioExistente, novoIdRepertorio];

          const novaOrdem = ordem;
          novoArrayOrdem = [...ordemExistente, novaOrdem];
        } else {
          novoArrayIdRepertorio = [eventoData.value];
          novoArrayOrdem = [ordem];
        }
        
        const dadosEvento: DocumentData = {
          ordem: novoArrayOrdem,
          idRepertorio: novoArrayIdRepertorio
        };

        await setDoc(eventoRef, dadosEvento, { merge: true });
        setEventoToEdit(null);
        setModalVisible(false);
        loadEvento();
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
    }
  };

  const removeRepertorioFromEvento = async (repertorio: string) => {
    try {
        const eventoRef = doc(db, "evento", idEvento);
        const eventoSnapshot = await getDoc(eventoRef);
        const dadosAntigos = eventoSnapshot.data();
        const idRepertorioExistente = dadosAntigos?.idRepertorio || [];
        const idOrdemExistente = dadosAntigos?.ordem || [];

        // Remove o ID de música do array existente
        const novoArrayIdRepertorio = idRepertorioExistente.filter((id: string) => id !== repertorio);
        const novoArrayOrdem = idOrdemExistente.filter((id: number) => id !== ordem);

        const dadosEvento: DocumentData = {
            idRepertorio: novoArrayIdRepertorio,
            ordem: novoArrayOrdem
        };

        await setDoc(eventoRef, dadosEvento, { merge: true });
        loadEvento();
        setConfirmDeleteVisible(false);
        setRepertorioToDelete("");
    } catch (error) {
        console.error(`Erro ao remover música do repertório: ${error}`);
    }
  };


  const editRepertorio = (dadosEvento: eventoProps) => {
    eventosList.map((item) => {
      item.idRepertorio.filter((item2) => {
        if(item2 == dadosEvento.id) {
          setOrdem(item.ordem[item.idRepertorio.indexOf(item2)]);        }
      });
    });

    setEventoToEdit(dadosEvento);
    setEditModal(true);
    setModalVisible(true);
  };

  const editRepertorioInEvento = async () => {
    try {
        const eventoRef = doc(db, "evento", idEvento);
        const eventoSnapshot = await getDoc(eventoRef);
        const dadosAntigos = eventoSnapshot.data();
        const idRepertorioExistente = dadosAntigos?.idRepertorio; 
        const ordemExistente = dadosAntigos?.ordem;
        const indiceRepertorioParaEditar = idRepertorioExistente.indexOf(eventoToEdit?.id);
      
        idRepertorioExistente[indiceRepertorioParaEditar] = eventoData  && eventoData.value ? eventoData.value : eventoToEdit?.id;

        //const indiceOrdemParaEditar = ordemExistente.indexOf(eventoToEdit?.id);
        const indiceOrdemParaEditar = idRepertorioExistente.indexOf(eventoToEdit?.id);

        ordemExistente[indiceOrdemParaEditar] = ordem;
        // Restante do código permanece o mesmo
        const dadosEvento: DocumentData = {
          ordem: ordemExistente,
          idRepertorio: idRepertorioExistente
        };

        await setDoc(eventoRef, dadosEvento, { merge: true });
        setEventoToEdit(null);
        setEventoData(null);
        setModalVisible(false);
        loadEvento();
    } catch (error) {
      console.error("Erro ao editar evento:", error);
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
        <Pressable
          onPress={() => {
            setModalVisible(true);
            setEditModal(false);
          }}
        >
        <Icon name="add-circle" size={30} color="#182D00" />
        </Pressable>
      </View>
      <Button
        color="#182D00"
        title="Adicionar repertório"
        onPress={() => {
          setModalVisible(true);
          setEditModal(false);
        }}
      />
      <FlatList
        data={filteredRepertoriosList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.screensCard}>
          <View style={styles.screenItem}>
            <View style={styles.cardHeader}>
              <Text style={styles.screenName}>{item.nome}</Text> 
              <View style={styles.buttonContainer}>
              <Pressable
                  onPress={() => navigation.navigate('AddSongsRepertorio', {repertorioId: item.id})}
                >
                  <Icon name="visibility" size={30} color="#4D6333" />
                </Pressable>
                <Pressable
                  onPress={() => editRepertorio(item)}
                  style={{ marginHorizontal: 15 }}
                >
                  <Icon name="edit" size={30} color="#4D6333" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setRepertorioToDelete(item.id);
                    setConfirmDeleteVisible(true);
                  }}
                >
                  <Icon name="delete" size={30} color="#f00" />
                </Pressable>
              </View>
            </View>
            <View style={{display:"flex", justifyContent: "space-between", flexDirection: "row", marginTop: 20}}>
              <Text>{item.duracaoTotal ? 'Duração: ' + msToMinutes(item.duracaoTotal) : ''}</Text>
            </View>
          </View>
        </View>
        )}
      />
      <View style={{padding: 10, borderWidth: 2, backgroundColor: '#E6F5C7'}}>
      <Text style={{fontWeight: 'bold'}}>Duração do evento: <Text>{msToMinutes(duracao)}</Text></Text>
      </View>
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
              Tem certeza de que deseja excluir este repertorio?
            </Text>
            <View style={styles.confirmDeleteButtons}>
              <Button
                title="Cancelar"
                onPress={() => setConfirmDeleteVisible(false)}
                color="#999"
              />
              <Button
                title="Deletar"
                onPress={() => removeRepertorioFromEvento(repertorioToDelete)}
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
              {isEditModal ? "Editar música" : "Adicionar repertório"}
            </Text>
            <Text>Repertório:</Text>
            <SelectDropdown
              searchInputTxtColor="#000"
              dropdownStyle={{backgroundColor: '#CFF5C7'}}
              buttonStyle={{backgroundColor: '#CFF5C7', borderColor: '#000', borderWidth: 1, borderRadius: 5, padding: 10, width: '100%'}}
              data={repertoriosList.map((item) => ({
                value: item.id, 
                label: item.nome
              }))}
              onSelect={(selectedValue, index) => {
                setEventoData(selectedValue);
              }}
              defaultButtonText={
                eventoToEdit?.id ? eventoToEdit?.nome : "Selecione um repertório"
              }
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem.label;
              }}
              rowTextForSelection={(item, index) => item.label}
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
              onPress={isEditModal ? editRepertorioInEvento : addRepertoriosEvento}
            >
              <Text style={styles.modalButtonText}>
                {isEditModal ? "Salvar Edição" : "Adicionar repertório"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setEventoToEdit(null);
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


export default AddEventoScreen;
