import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import './App.css';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// User Pages
import HomePage from './pages/user/HomePage';
import MenuPage from './pages/user/MenuPage';
import CoffeeDetailPage from './pages/user/CoffeeDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import PaymentPage from './pages/user/PaymentPage';
import OrderHistoryPage from './pages/user/OrderHistoryPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import VariantManagement from './pages/admin/VariantManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
// import AnalyticsPage from './pages/admin/AnalyticsPage'; // Dikomen karena belum digunakan

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Error Pages
import NotFoundPage from './pages/NotFoundPage';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Protected Route Component
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/coffee/:id" element={<CoffeeDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/verify-email" element={<EmailVerificationPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  
                  {/* User Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment/:orderId" element={<PaymentPage />} />
                    <Route path="/orders" element={<OrderHistoryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
                  
                  {/* Admin Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/menu" element={<MenuManagement />} />
                    <Route path="/admin/variants" element={<VariantManagement />} />
                    <Route path="/admin/orders" element={<OrderManagement />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    {/* <Route path="/admin/analytics" element={<AnalyticsPage />} /> */}
                  </Route>
                  
                  {/* 404 Catch-all Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;