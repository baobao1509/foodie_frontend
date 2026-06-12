import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// Components & Pages imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import PartnerDashboard from './pages/PartnerDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Custom Hooks imports for clean state separation
import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';
import { useCart } from './hooks/useCart';

function AppLayout() {
  const location = useLocation();

  // 1. Quản lý phiên đăng nhập (Session & Token JWT)
  const { currentUser, handleLoginSuccess, handleLogout } = useAuth();

  // 2. Quản lý dữ liệu ứng dụng đồng bộ từ Backend Spring Boot
  const {
    restaurants,
    setRestaurants,
    orders,
    setOrders,
    onPlaceOrder,
    onUpdateOrderStatus,
    onAddMenuItem,
    onToggleStoreState,
    onRemoveMenuItem,
  } = useAppData(currentUser, location.pathname);

  // 3. Quản lý giỏ hàng và các thao tác tính toán liên quan
  const {
    cart,
    addToCart,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    cartMeta,
  } = useCart(restaurants);

  const currentOrderCount = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* ── Menu điều hướng phía trên (Header & Navbar) ── */}
      <Navbar 
        cart={cart}
        currentOrderCount={currentOrderCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* ── Khu vực render nội dung theo dạng Router ── */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Outlet context={{
              restaurants,
              setRestaurants,
              orders,
              setOrders,
              currentUser,
              handleLoginSuccess,
              handleLogout,
              cart,
              addToCart,
              updateCartItemQty,
              removeFromCart,
              clearCart,
              cartMeta,
              onPlaceOrder,
              onUpdateOrderStatus,
              onAddMenuItem,
              onToggleStoreState,
              onRemoveMenuItem,
            }} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Component chân trang (Footer tách biệt) ── */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/partner" element={<PartnerDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
