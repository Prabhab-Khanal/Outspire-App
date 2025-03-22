import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (token, userData) => {
    setUserToken(token);
    await AsyncStorage.setItem('userToken', token);
  
    if (userData) {
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    }
  };
  const logout = async () => {
    setUserToken(null);
    setUser(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
  };

  const loadToken = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const userData = await AsyncStorage.getItem('user');
    if (token) setUserToken(token);
    if (userData) setUser(JSON.parse(userData));
  };

  useEffect(() => {
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
