import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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
import { AuthContext } from "../context/AuthContext";


interface MusicScreenProps {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

const SignInScreen: React.FC<MusicScreenProps> = ({ navigation }) => {
    const { updateUserRole, authenticated } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const [role, setRole] = useState<number>(0);
    const [nome, setNome] = useState("");
    //const [checked, setChecked] = useState(0);

    const authLogin = auth;

    const usersCollection = collection(db, 'users');

    useEffect(() => {     
        if(authenticated) {
            navigation.navigate('Home');
        }
    },[]);

    const signIn = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(
                authLogin,
                email,
                password
            );
            
            if(userCredential) {
                await updateUserRole(email);
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

    return (
        <View style={styles.container}>
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
            <Pressable
                style={[styles.loginButton, {marginTop: 100}]}
                onPress={signIn}
            >
                <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
            <Pressable
                onPress={() => navigation.navigate('SignUp')}
            >
                <Text style={[styles.loginButtonText, {color: '#fff000'}]}>Criar Conta</Text>
            </Pressable>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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
        backgroundColor: "#35AAFF",
        width: "90%",
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
        marginBottom: 15,
    },
    loginButtonText: {
        color: "#FFF",
        fontSize: 18,
    },
});


export default SignInScreen;