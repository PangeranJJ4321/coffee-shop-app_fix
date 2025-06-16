import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BASE_API_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL :BASE_API_URL,
  headers : {
    'Content-Type' : 'application/json',
  }
});

// Buat Interceptor untuk api yang membutuhkan token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token'); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const saveAuthData = (token, userData) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };



  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      const userDataString = localStorage.getItem('user_data');

      if (token && userDataString) {
        try {
          const storedUser = JSON.parse(userDataString); 
          setUser(storedUser); 
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to parse user data from localStorage or validate token:", error);
          clearAuthData();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {

      const response = await api.post('/auth/login', {email, password});
      const {access_token} = response.data;
      // const {email} = response.data;

      // localStorage.setItem('email', email);
      localStorage.setItem('access_token', access_token);

      const decodedToken = JSON.parse(atob(access_token.split('.')[1]));
      const userRole = decodedToken.role;
      const userName = decodedToken.name;
      const userId = decodedToken.sub;

      const userDetailsResponse = await api.get(`/users/${userId}`);
      const fetchedUser = userDetailsResponse.data;

      if (!fetchedUser.is_verified) {
        clearAuthData(); // Jangan simpan token jika belum terverifikasi
        return { success: false, error: "Email belum diverifikasi. Silakan cek email Anda." };
      }

      saveAuthData(access_token, {
        id : fetchedUser.id,
        name : fetchedUser.name,
        email : fetchedUser.email,
        phone_number : fetchedUser.phone_number,
        role : fetchedUser.role,
        is_verified : fetchedUser.is_verified
      });

      return { success: true, user: fetchedUser };
      
    } catch (error) {
      console.error("Login API call error:", error.response?.data || error.message);
      // Backend mengembalikan "Incorrect email or password" atau "Email not verified"
      return { success: false, error: error.response?.data?.detail || 'Login gagal.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // const {email} = response.data;
      // localStorage.setItem('email', email);
      // console.log(email);
      return { success: true, message: "Registrasi berhasil! Silakan cek email Anda untuk verifikasi." };
    } catch (error) {
      console.error("Register API call error:", error.response?.data || error.message);
      // Backend akan mengembalikan "User with this email already exists" jika konflik
      return { success: false, error: error.response?.data?.detail || 'Registrasi gagal.' };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await api.post('/auth/verify-email', {token});

      if (response.status === 200) {
        const currentToken = localStorage.getItem('access_token');
        if (currentToken) {
          const decodedToken = JSON.parse(atob(currentToken.split('.')[1]));
          const userId = decodedToken.sub;
          const userDetailsResponse = await api.get(`/users/${userId}`);
          saveAuthData(currentToken, {
            id: userDetailsResponse.data.id,
            name: userDetailsResponse.data.name,
            email: userDetailsResponse.data.email,
            phone_number: userDetailsResponse.data.phone_number,
            role: userDetailsResponse.data.role,
            is_verified: userDetailsResponse.data.is_verified 
          });
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Verify email API call error:", error.response?.data || error.message);
      return false;
    }
  }

  const resendVerificationEmail = async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.status === 200; 
    } catch (error) {
      console.error("Resend verification API call error:", error.response?.data || error.message);
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.status === 200; 
    } catch (error) {
      console.error("Forgot password API call error:", error.response?.data || error.message);
      return false;
    }
  };


  const resetPassword = async (token, password, confirm_password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password, confirm_password });
      return response.status === 200; 
    } catch (error) {
      console.error("Reset password API call error:", error.response?.data || error.message);
      return false; 
    }
  };

  const logout = () => {
    clearAuthData();
  };



 const updateProfile = async (userId, updatedData) => {
    try {
      const response = await api.put(`/users/${userId}`, updatedData);
      if (response.status === 200) {
        const updatedUser = response.data; 
        saveAuthData(localStorage.getItem('access_token'), {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone_number: updatedUser.phone_number,
          role: updatedUser.role,
          is_verified: user.is_verified 
        });
        return { success: true, user: updatedUser };
      }
      return { success: false, error: "Gagal memperbarui profil." };
    } catch (error) {
      console.error("Update profile API call error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.detail || 'Terjadi kesalahan saat memperbarui profil.' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    isAdmin: user?.role === 'ADMIN', 
    isUser: user?.role === 'USER',   
    api // Export instance axios untuk request API yang terautentikasi di komponen lain
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

