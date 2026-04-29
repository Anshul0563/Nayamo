import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('role');
    
    setToken(accessToken);
    setRole(userRole);
    setLoading(false);
  }, []);

  const login = (newToken, newRole) => {
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('role', newRole || 'admin');
    setToken(newToken);
    setRole(newRole || 'admin');
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  return {
    token,
    role,
    isAdmin: role === 'admin',
    isAuthenticated: !!token,
    login,
    logout,
    loading
  };
};

