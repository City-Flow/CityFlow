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
          // Se añade el header explícito para evitar problemas al recargar
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

  return (
    <AuthContextObject.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContextObject.Provider>
  );
};