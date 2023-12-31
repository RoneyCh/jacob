import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View, Image } from "react-native";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {
    NavigationParams,
    NavigationScreenProp,
    NavigationState
  } from 'react-navigation';
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
import { RadioButton } from 'react-native-paper';


interface MusicScreenProps {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

const SignUpScreen: React.FC<MusicScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const [role, setRole] = useState<number>(0);
    const [nome, setNome] = useState("");
    //const [checked, setChecked] = useState(0);

    const authLogin = auth;

    const usersCollection = collection(db, 'users');

    const signIn = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(
                authLogin,
                email,
                password
            );

            await addDoc(usersCollection, {
                email,
                role
              });
        
            
            if(userCredential) {
                navigation.navigate('Home');
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async () => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                authLogin,
                email,
                password
            );
            if(userCredential) {
                await addDoc(usersCollection, {
                    email,
                    role,
                    nome
                });
            } else {
                alert("Erro ao criar usuário");
            }

            setLoading(false);
            setNome('');
            setEmail('');
            setPassword('');
            setRole(0);
            if(userCredential) {
                navigation.navigate('Home');
            }

        } catch (error) {
            setLoading(false);
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    const imageLogin = require("../assets/backgroundLogin.png");
    const logoImage = require("../assets/logoJacob.png");

    return (
        <View style={[styles.container,]}>
            <ImageBackground source={imageLogin} resizeMode="cover" style={styles.container}>
            <Image source={logoImage} resizeMode="stretch" style={styles.logoImage} ></Image>
            <TextInput
                style={[styles.input, { marginTop: 100}]}
                placeholder="Nome"
                value={nome}
                onChangeText={(text) => setNome(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry={true}
                value={password}
                onChangeText={(text) => setPassword(text)}
            />
            <Text style={{color: '#FFF', fontSize: 30, marginTop:10, fontFamily: "rubik-regular"}}>O que você é?</Text>
            <RadioButton.Group onValueChange={newValue => setRole(parseInt(newValue))} value={role.toString()}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                    <RadioButton uncheckedColor="white" value="1" color="white"/>
                    <Text style={{color: '#FFF', fontSize: 20, fontFamily: "rubik-regular"}}>Organizador</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                    <RadioButton uncheckedColor="white" value="0" color="white" />
                    <Text style={{color: '#FFF', fontSize: 20, fontFamily: "rubik-regular"}}>Público</Text>
                </View>
            </RadioButton.Group>
            <Pressable
                style={[styles.loginButton, {marginTop: 100}]}
                onPress={signUp}
            >
                <Text style={styles.loginButtonText}>Criar Conta</Text>
            </Pressable>
            <Pressable
                onPress={() => navigation.navigate('SignIn')}
            >
                <Text style={styles.createAccountText}>Voltar para login</Text>
            </Pressable>
            <StatusBar style="auto" />
        </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
    },
    logoImage: {
        width: 200,
        height: 100,
        position: 'absolute',
        top: 50,
        resizeMode: 'stretch',
    },
    input: {
        backgroundColor: "#FFF",
        width: "90%",
        marginBottom: 15,
        color: "#222",
        fontSize: 17,
        borderRadius: 7,
        padding: 10,
    },
    loginButton: {
        backgroundColor: "#bdff6d",
        width: "90%",
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
        marginBottom: 15,
    },
    loginButtonText: {
        color: "#000",
        fontSize: 18,
        fontFamily: "rubik-regular",
    },
    createAccountText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: "rubik-regular",
    },
});


export default SignUpScreen;