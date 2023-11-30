import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, StatusBar, FlatList, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { NavigationParams, NavigationScreenProp, NavigationState } from 'react-navigation';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import styles2 from "../assets/styles/styles";
import Modal from "react-native-modal";
import { ScrollView } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";

interface navigationProps {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}
interface category {
  id: number;
  title: string;
  icon: string;
}

interface EventoProps {
  id: string;
  nome:string;
  data_evento: {seconds: number, nanoseconds: number};
  endereco: string;
  data_insert: string;
}


const HomeScreen: React.FC<navigationProps> = ({ navigation }) => {
  const { userRole, userName } = React.useContext(AuthContext);
  const [eventosList, setEventosList] = useState<EventoProps[]>([]);
  const [isModalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade da modal
  const [dataEvento, setDataEvento] = useState(new Date());
  const [eventoDetails, setEventoDetails] = useState<EventoProps | null>(null);

  let categories: category[] = [
    { id: 1, title: 'Música', icon: 'music-note' },
    { id: 2, title: 'Eventos', icon: 'event' }
  ];
  
  if(userRole == 0) {
    categories = [
      { id: 2, title: 'Eventos', icon: 'event' },
    ];
  }
  
  // Referência para a coleção de eventos no Firestore
  const eventoCollection = collection(db, "evento");

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

  const [statusBarHeight, setStatusBarHeight] = useState<number>(0);


  useEffect(() => {
    loadEvento();
    const statusHeight = StatusBar.currentHeight || 0;
    setStatusBarHeight(statusHeight);
  }, []);

  const eventDetails = (evento: EventoProps) => {
    // Preenche a modal com os dados do evento selecionado
    let data_evento = evento.data_evento as any; 
    setDataEvento(new Date((data_evento.nanoseconds / 1000000000 + data_evento.seconds) * 1000));
    setEventoDetails(evento);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.welcomeContainer, {marginTop: statusBarHeight}]}>
      <ImageBackground source={require('../assets/backgroundLogin.png')}  style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.welcomeText}>Bem-vindo, {userName}!</Text>
      </View>
      </ImageBackground>
    </View>
      {categories.map((category) => (
        <SafeAreaView
          key={category.id}
          style={[{ marginTop: statusBarHeight }]}
        >
          {userRole == 0 ? (<Text style={{ fontSize: 24, fontFamily: "rubik-bold" }}>Ver todos os eventos</Text>) : null}
          <Pressable
            style={[styles.categoryCard, {display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}]}
            onPress={() => navigation.navigate(category.title == 'Eventos' ? 'AddEventos' : category.title)}
          >
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Icon name={category.icon} size={30} color="#000" />
          </Pressable>
        </SafeAreaView>
      ))}
    <Text style={{ fontSize: 24, fontFamily: "rubik-bold", marginTop: 40 }}>Próximos eventos</Text>
      {userRole != 2 ? ( 
        <FlatList
        data={eventosList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => eventDetails(item)}
          >
          <View style={[styles2.screensCardHome, {width:'100%', justifyContent:'center', alignSelf:'center'}]}>
            <ImageBackground source={require('../assets/Jacob_back_login2.png')}  style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}>
          <View style={[styles2.screenItem, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
            <View style={styles2.cardHeader}>
              <Text style={[styles2.screenName, {color:'white', fontSize: 25, fontFamily:'rubik-medium'}]}>{item.nome}</Text> 
            </View>
          </View>
          </ImageBackground>
        </View>
        </Pressable>
        )}
      />
      ) : null}
      <Modal isVisible={isModalVisible} animationIn="slideInUp" animationOut="slideOutDown">
  <ScrollView contentContainerStyle={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Detalhes do evento</Text>
      <View style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <Text style={styles.modalEventDetails}>Título do Evento</Text>
        <Text style={{fontSize: 18, marginBottom: 10, fontFamily: 'rubik-regular'}}>{eventoDetails?.nome}</Text>
      </View>
      <View style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <Text style={styles.modalEventDetails}>Endereço</Text>   
        <Text style={{fontSize: 18, marginBottom: 10, fontFamily: 'rubik-regular'}}>{eventoDetails?.endereco}</Text>
      </View>
      <View style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <Text style={styles.modalEventDetails}>Data</Text>
        <Text style={{fontSize: 18, fontFamily: 'rubik-regular'}}>{dataEvento.toLocaleString().slice(0, -3)}</Text>
      </View>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => {
          navigation.navigate('AddRepertorioEvento', {eventoId: eventoDetails?.id});
          setEventoDetails(null);
          setModalVisible(false);
        }}
      >
        <Text style={styles.linkText}>Repertório do evento</Text>
      </TouchableOpacity>
      <Pressable
        style={styles.closeButton}
        onPress={() => {
          setEventoDetails(null);
          setModalVisible(false);
        }}
      >
        <Text style={styles.closeButtonText}>Fechar</Text>
      </Pressable>
    </View>
  </ScrollView>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  categoryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: "rubik-medium"
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#E6F5C7',
    padding: 20,
    height: '60%',
    width: '90%',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontFamily: "rubik-medium",
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  modalEventDetails: {
    fontSize: 18,
    fontFamily: "rubik-medium"
  },
  linkButton: {
    marginTop: 'auto',
    padding: 10,
    backgroundColor: '#118233',
    borderRadius: 5,
    alignItems: 'center',
  },
  linkText: {
    color: 'white',
    fontFamily: "rubik-medium",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontFamily: "rubik-medium",
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'rubik-bold',
    textAlign: 'center',
    color: '#fff',
  },
});

export default HomeScreen;
