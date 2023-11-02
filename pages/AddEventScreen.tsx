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
import styles from "../assets/styles/styles";
import { NavigationProp } from '@react-navigation/native';
import {DateTimePickerAndroid, AndroidNativeProps} from '@react-native-community/datetimepicker';

interface EventoProps {
  id: string;
  nome:string;
  data_evento: {seconds: number, nanoseconds: number};
  endereco: string;
  data_insert: string;
}


type NavigationProps = {
  navigation: NavigationProp<any>;
};

const AddEventoScreen: React.FC<NavigationProps> = ({navigation}) => {
  const [eventoNome, setEventoNome] = useState("");
  const [genero, setGenero] = useState("");
  const [eventosList, setEventosList] = useState<EventoProps[]>([]);
  const [eventos, setEventos] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade da modal
  const [isEditModal, setEditModal] = useState(false); // Estado para controlar se a modal está em modo de edição
  const [eventoToEdit, setEventoToEdit] = useState<EventoProps | null>(null); // Armazena os dados do evento a ser editado
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState("");
  const [dataFromEventos, setDataFromEventos] = useState<any>();
  const [eventoToView, setEventoToView] = useState<string>('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [dataEvento, setDataEvento] = useState(new Date());
  const [endereco, setEndereco] = useState('');

  const onChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setDataEvento(currentDate);
  };

  const showMode = (currentMode: any) => {
    DateTimePickerAndroid.open({
      value: dataEvento,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  // Referência para a coleção de eventos no Firestore
  const eventoCollection = collection(db, "evento");

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const filteredEventosList = search
    ? eventosList.filter(item =>
        item.nome.toLowerCase().includes(search.toLowerCase())
      )
    : eventosList;


    const loadEvento = async () => {
      try {
        const q = query(eventoCollection, orderBy("data_insert", "desc"));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let eventoList: any = [];
          querySnapshot.forEach((doc) => {
            eventoList.push({
              id: doc.id,
              ...(doc.data() as {
                nome: string;
                data_evento: string;
                endereco: string;
              }),
            });
          });
          setEventosList(eventoList);
        });
        return () => unsub();
      } catch (error) {
        console.error("Erro ao carregar artistas:", error);
      }
    };
  
  
  
  useEffect(() => {
    loadEvento();
  }, []);

  const addEvento = async () => {
    try {
        await addDoc(eventoCollection, {
          nome: eventoNome,
          data_evento: dataEvento,
          endereco: endereco,
          data_insert: new Date(),
        });
        setEventoNome("");
        setGenero("");
        setModalVisible(false); // Fecha a modal após o cadastro
        loadEvento();

    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      const eventoRef = doc(db, "evento", id);
      await deleteDoc(eventoRef);
      loadEvento();
      setConfirmDeleteVisible(false);
      setEventoToDelete("");
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
    }
  };

  const editEvento = (evento: EventoProps) => {
    // Preenche a modal com os dados do evento selecionado
    let data_evento = evento.data_evento as any; 
    setDataEvento(new Date((data_evento.nanoseconds / 1000000000 + data_evento.seconds) * 1000));
    setEventoToEdit(evento);
    setEditModal(true);
    setModalVisible(true);
  };

  const saveEditedEvento = async () => {
    try {
      if (eventoToEdit) {
        const eventoRef = doc(db, "evento", eventoToEdit.id);
        const eventoData: DocumentData = {
          nome: eventoNome || eventoToEdit.nome,
          endereco: endereco || eventoToEdit.endereco,
          data_evento: dataEvento || eventoToEdit.data_evento
        };
        console.log(eventoData);
        await setDoc(eventoRef, eventoData, { merge: true }); // Atualiza os campos nome e genero, mantendo os outros campos intactos
        setEventoToEdit(null);
        setModalVisible(false);
        setDataEvento(new Date());
        loadEvento();
      }
    } catch (error) {
      console.error("Erro ao editar evento:", error);
    }
  };


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
            setDataEvento(new Date());
          }}
        >
        <Icon name="add-circle" size={30} color="#182D00" />
        </Pressable>
      </View>
      <Button
        color="#182D00"
        title="Cadastrar Evento"
        onPress={() => {
          setModalVisible(true);
          setEditModal(false);
          setDataEvento(new Date());
        }}
      />
      <FlatList
        data={filteredEventosList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.screensCard}>
          <View style={styles.screenItem}>
            <View style={styles.cardHeader}>
              <Text style={styles.screenName}>{item.nome}</Text> 
              <View style={styles.buttonContainer}>
                <Pressable
                  onPress={() => navigation.navigate('AddSongsEvento', {eventoId: item.id})}
                >
                  <Icon name="touch-app" size={30} color="#4D6333" />
                </Pressable>
                <Pressable
                  onPress={() => editEvento(item)}
                  style={{ marginHorizontal: 15 }}
                >
                  <Icon name="edit" size={30} color="#4D6333" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setEventoToDelete(item.id);
                    setConfirmDeleteVisible(true);
                  }}
                >
                  <Icon name="delete" size={30} color="#f00" />
                </Pressable>
              </View>
            </View>
            <Text style={styles.screenGenre}>
              {new Date((item.data_evento.nanoseconds / 1000000000 + item.data_evento.seconds) * 1000).toLocaleString()}
            </Text>

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
              Tem certeza de que deseja excluir este evento?
            </Text>
            <View style={styles.confirmDeleteButtons}>
              <Button
                title="Cancelar"
                onPress={() => setConfirmDeleteVisible(false)}
                color="#999"
              />
              <Button
                title="Deletar"
                onPress={() => deleteEvento(eventoToDelete)}
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
          <Text style={styles.lyricsText}>{eventoToView}</Text>
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
                  
      <Modal isVisible={isModalVisible} style={{display:"flex", justifyContent:'center', marginTop: 100}}>
        <ScrollView>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditModal ? "Editar Evento" : "Novo Evento"}
            </Text>
            <Text>Título do Evento:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome do revento"
              defaultValue={
                isEditModal ? eventoToEdit?.nome : eventoNome
              }
              onChangeText={(text) => setEventoNome(text)}
            />
            <Text>Endereço do Evento:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o endereço do evento"
              defaultValue={
                isEditModal ? eventoToEdit?.endereco : eventoToEdit?.endereco
              }
              onChangeText={(text) => setEndereco(text)}
            />
            <Text>Data do Evento:</Text>
            <Button onPress={showDatepicker} title="Escolha a data" />
            <Text>Hora do Evento:</Text>
            <Button onPress={showTimepicker} title="Escolha a hora" />
            <Text style={{ 
              marginTop: 20,
              marginBottom: 10,
              textAlign: 'center',
              borderWidth: 1,
              borderColor: '#000',
              padding: 10,
              borderRadius: 10,
             }}>{ isEditModal ? 'Evento marcado: ' + dataEvento.toLocaleString() : ''}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={isEditModal ? saveEditedEvento : addEvento}
            >
              <Text style={styles.modalButtonText}>
                {isEditModal ? "Salvar Edição" : "Cadastrar Evento"}
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
