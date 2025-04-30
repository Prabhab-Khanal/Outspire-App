import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = useCallback(async (tokens, userData) => {
    try {
      const access = tokens?.access || userData?.access_token;
      const refresh = tokens?.refresh || userData?.refresh_token;

      if (access) {
        setUserToken(access);
        await AsyncStorage.setItem('userToken', access);
      }
      if (refresh) {
        await AsyncStorage.setItem('refreshToken', refresh);
      }

      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Failed to store login information:', err);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setUserToken(null);
      setUser(null);
      await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'user']);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }, []);

  const loadToken = useCallback(async () => {
    try {
      const access = await AsyncStorage.getItem('userToken');
      const refresh = await AsyncStorage.getItem('refreshToken');
      const userData = await AsyncStorage.getItem('user');

      if (access) {
        setUserToken(access);
      }

      if (userData) {
        setUser(JSON.parse(userData));
      }

      if (!refresh) {
        console.warn('No refresh token found. User might be logged out after token expiry.');
      }
    } catch (err) {
      console.error('Failed to load token or user data:', err);
    }
  }, []);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  return (
    <AuthContext.Provider value={{ userToken, user, login, logout, loadToken }}>
      {children}
    </AuthContext.Provider>
  );
};
