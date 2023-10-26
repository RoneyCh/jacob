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
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface RepertorioProps {
  id: string;
  nome:string;
  data_insert: string;
}


type NavigationProps = {
  navigation: NavigationProp<any>;
};


const AddRepertorioScreen: React.FC<NavigationProps> = ({navigation}) => {
  const [repertorioNome, setRepertorioNome] = useState("");
  const [genero, setGenero] = useState("");
  const [repertoriosList, setRepertoriosList] = useState<RepertorioProps[]>([]);
  const [repertorios, setRepertorios] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade da modal
  const [isEditModal, setEditModal] = useState(false); // Estado para controlar se a modal está em modo de edição
  const [repertorioToEdit, setRepertorioToEdit] = useState<RepertorioProps | null>(null); // Armazena os dados do repertorio a ser editado
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [repertorioToDelete, setRepertorioToDelete] = useState("");
  const [dataFromRepertorios, setDataFromRepertorios] = useState<any>();
  const [repertorioToView, setRepertorioToView] = useState<string>('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  // Referência para a coleção de repertorios no Firestore
  const repertorioCollection = collection(db, "repertorio");

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const filteredRepertoriosList = search
    ? repertoriosList.filter(item =>
        item.nome.toLowerCase().includes(search.toLowerCase())
      )
    : repertoriosList;

 

    const loadRepertorio = async () => {
      try {
        const q = query(repertorioCollection, orderBy("data_insert", "desc"));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let repertorioList: any = [];
          querySnapshot.forEach((doc) => {
            repertorioList.push({
              id: doc.id,
              ...(doc.data() as {
                nome: string;
              }),
            });
          });
          setRepertoriosList(repertorioList);
        });
        return () => unsub();
      } catch (error) {
        console.error("Erro ao carregar artistas:", error);
      }
    };
  
  
  
  useEffect(() => {
    loadRepertorio();
  }, []);

  const addRepertorio = async () => {
    try {
        await addDoc(repertorioCollection, {
          nome: repertorioNome,
          data_insert: new Date(),
        });
        setRepertorioNome("");
        setGenero("");
        setModalVisible(false); // Fecha a modal após o cadastro
        loadRepertorio();

    } catch (error) {
      console.error("Erro ao adicionar repertorio:", error);
    }
  };

  const deleteRepertorio = async (id: string) => {
    try {
      const repertorioRef = doc(db, "repertorio", id);
      await deleteDoc(repertorioRef);
      loadRepertorio();
      setConfirmDeleteVisible(false);
      setRepertorioToDelete("");
    } catch (error) {
      console.error("Erro ao deletar repertorio:", error);
    }
  };

  const editRepertorio = (repertorio: RepertorioProps) => {
    // Preenche a modal com os dados do repertorio selecionado
    setRepertorioToEdit(repertorio);
    setEditModal(true);
    setModalVisible(true);
  };

  const saveEditedRepertorio = async () => {
    try {
      if (repertorioToEdit) {
        const repertorioRef = doc(db, "repertorio", repertorioToEdit.id);
        const repertorioData: DocumentData = {
          nome: repertorioNome || repertorioToEdit.nome,
        };
        console.log(repertorioData);
        await setDoc(repertorioRef, repertorioData, { merge: true }); // Atualiza os campos nome e genero, mantendo os outros campos intactos
        setRepertorioToEdit(null);
        setModalVisible(false);
        loadRepertorio();
      }
    } catch (error) {
      console.error("Erro ao editar repertorio:", error);
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
        title="Cadastrar Repertório"
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
                  <Icon name="touch-app" size={30} color="#4D6333" />
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
                onPress={() => deleteRepertorio(repertorioToDelete)}
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
          <Text style={styles.lyricsText}>{repertorioToView}</Text>
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
              {isEditModal ? "Editar Repertorio" : "Novo Repertorio"}
            </Text>
            <Text>Título do Repertório:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome do repertório"
              defaultValue={
                isEditModal ? repertorioToEdit?.nome : repertorioNome
              }
              onChangeText={(text) => setRepertorioNome(text)}
            />
            <Pressable
              style={styles.modalButton}
              onPress={isEditModal ? saveEditedRepertorio : addRepertorio}
            >
              <Text style={styles.modalButtonText}>
                {isEditModal ? "Salvar Edição" : "Cadastrar Repertório"}
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
