import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BASE_API_URL = 'http://127.0.0.1:8000/api/v1/'; 

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor untuk api yang membutuhkan token
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

  // Fungsi helper untuk me-refresh data user dari backend
  const refreshUserProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      clearAuthData();
      return null;
    }
    
    try {
      // Panggil endpoint /users/me untuk mendapatkan data user lengkap
      const response = await api.get('/users/me');
      const fetchedUser = response.data; 
      saveAuthData(token, fetchedUser); 
      return fetchedUser;
    } catch (error) {
      console.error("Failed to refresh user profile:", error.response?.data || error.message);
      clearAuthData(); 
      return null;
    }
  };


  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      // userDataString tidak lagi langsung digunakan untuk setUser, tapi untuk cek keberadaan saja
      const userDataString = localStorage.getItem('user_data'); 

      if (token) {
        try {
          // Selalu panggil /users/me untuk mendapatkan data terbaru dan memvalidasi token
          const fetchedUser = await refreshUserProfile();
          if (!fetchedUser) {
            clearAuthData(); // Jika refreshUserProfile gagal, bersihkan data
          }
        } catch (error) {
          // Error sudah ditangani di refreshUserProfile
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []); // Hanya dijalankan sekali saat mount, refreshUserProfile akan memuat data


  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;

      localStorage.setItem('access_token', access_token); // Simpan token dulu

      // Langsung panggil refreshUserProfile setelah token tersimpan
      const fetchedUser = await refreshUserProfile();

      if (!fetchedUser) { // Jika gagal memuat profil setelah login
        clearAuthData();
        return { success: false, error: "Gagal memuat profil pengguna setelah login." };
      }

      if (!fetchedUser.is_verified) {
        clearAuthData();
        return { success: false, error: "Email belum diverifikasi. Silakan cek email Anda." };
      }

      // saveAuthData sudah dipanggil di refreshUserProfile
      return { success: true, user: fetchedUser };

    } catch (error) {
      console.error("Login API call error:", error.response?.data || error.message);
      clearAuthData(); // Hapus data jika login gagal
      return { success: false, error: error.response?.data?.detail || 'Login gagal.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, message: "Registrasi berhasil! Silakan cek email Anda untuk verifikasi." };
    } catch (error) {
      console.error("Register API call error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.detail || 'Registrasi gagal.' };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });

      if (response.status === 200) {
        // Setelah verifikasi, refresh profil untuk mendapatkan status is_verified terbaru
        await refreshUserProfile(); 
        return true;
      }
      return false;
    } catch (error) {
      console.error("Verify email API call error:", error.response?.data || error.message);
      return false;
    }
  };

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
        await refreshUserProfile(); 
        return { success: true, user: user }; 
      }
      return { success: false, error: "Gagal memperbarui profil." };
    } catch (error) {
      console.error("Update profile API call error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.detail || 'Terjadi kesalahan saat memperbarui profil.' };
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword
      });
      return { success: response.status === 200, error: response.data.detail }; // Mengembalikan object error
    } catch (error) {
      console.error("Change password API call error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.detail || 'Gagal mengubah password.' };
    }
  };

  // Fungsi untuk menambah/menghapus favorit
  const toggleFavorite = async (coffeeId, isCurrentlyFavorite) => {
    try {
      if (isCurrentlyFavorite) {
        await api.delete(`/menu/favorites/${coffeeId}`);
      } else {
        await api.post(`/menu/favorites/${coffeeId}`);
      }

      await refreshUserProfile(); 
      return { success: true };
    } catch (error) {
      console.error("Failed to toggle favorite:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.detail || 'Gagal mengubah status favorit.' };
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
    changePassword,
    toggleFavorite, 
    refreshUserProfile,
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