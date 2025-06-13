import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock user data - in real app, this would come from API
  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '08123456789',
      role: 'USER',
      avatar: null
    },
    {
      id: 2,
      name: 'Admin User',
      email: 'admin@coffeeshop.com',
      phone: '08987654321',
      role: 'ADMIN',
      avatar: null
    }
  ];

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock login - in real app, this would be an API call
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (foundUser && password === 'password') {
        const token = 'mock-jwt-token-' + foundUser.id;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(foundUser));
        
        setUser(foundUser);
        setIsAuthenticated(true);
        
        return { success: true, user: foundUser };
      } else {
        return { success: false, error: 'Email atau password salah' };
      }
    } catch (error) {
      return { success: false, error: 'Terjadi kesalahan saat login' };
    }
  };

  const register = async (userData) => {
    try {
      // Mock registration - in real app, this would be an API call
      const newUser = {
        id: Date.now(),
        ...userData,
        role: 'USER',
        avatar: null
      };
      
      const token = 'mock-jwt-token-' + newUser.id;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: 'Terjadi kesalahan saat registrasi' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: 'Terjadi kesalahan saat memperbarui profil' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin: user?.role === 'ADMIN',
    isUser: user?.role === 'USER'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

