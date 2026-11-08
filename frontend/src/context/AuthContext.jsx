import { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContextObject } from './AuthContextObject';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await api.get('/users/me/', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(response.data);
        } catch (err) {
          console.error('Error al obtener la sesión del usuario:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/token/', { email, password });
    const userToken = response.data.access;
    localStorage.setItem('token', userToken);
    setToken(userToken);

    const userResponse = await api.get('/users/me/', {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    setUser(userResponse.data);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  };

  // 1. Añadir la función para actualizar el perfil
  const updateProfile = async (userData) => {
    const storedToken = localStorage.getItem('token');
    const response = await api.patch('/users/me/', userData, {
      headers: { Authorization: `Bearer ${storedToken}` },
    });
    setUser(response.data);
    return response.data;
  };

  // 2. Añadir la función para eliminar la cuenta
  const deleteAccount = async () => {
    const storedToken = localStorage.getItem('token');
    await api.delete('/users/me/', {
      headers: { Authorization: `Bearer ${storedToken}` },
    });
    logout();
  };

  return (
    <AuthContextObject.Provider value={{ user, token, loading, login, register, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContextObject.Provider>
  );
};