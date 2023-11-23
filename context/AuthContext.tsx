import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

type AuthContextType = {  
  userRole: number;
  userName: string;
  updateUserRole: (email: string) => Promise<void>;
  authenticated: boolean;
}

type AuthProviderPros = {
    children: ReactNode,
}

export const AuthContext = createContext({} as AuthContextType);

function AuthProvider({ children }: AuthProviderPros) {
  const [userRole, setUserRole] = useState<number>(0);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');

  const updateUserRole = async (email: string) => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setUserRole(doc.data().role);
      setUserName(doc.data().nome);
    });
    setAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ userRole, userName, updateUserRole, authenticated }}>
      {children}
    </AuthContext.Provider>
  );
}


export default AuthProvider;