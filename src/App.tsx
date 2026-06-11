import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivePage, UserRole } from './types';

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

export default function App() {
  // Navigation Routing States
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  // 1. Quản lý phiên đăng nhập (Session & Token JWT)
  const { currentUser, handleLoginSuccess, handleLogout } = useAuth(setActivePage);

  // 2. Quản lý dữ liệu ứng dụng đồng bộ từ Backend Spring Boot
  const {
    restaurants,
    orders,
    onPlaceOrder,
    onUpdateOrderStatus,
    onAddMenuItem,
    onToggleStoreState,
    onRemoveMenuItem,
  } = useAppData(currentUser, activePage);

  // 3. Quản lý giỏ hàng và các thao tác tính toán liên quan
  const {
    cart,
    addToCart,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    cartMeta,
  } = useCart(restaurants);

  // Xác định thông tin chi tiết nhà hàng đang được chọn xem
  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* ── Menu điều hướng phía trên (Header & Navbar) ── */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        cart={cart}
        currentOrderCount={orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* ── Khu vực render nội dung theo dạng Router ── */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activePage === 'home' && (
              <HomePage 
                restaurants={restaurants} 
                setSelectedRestaurantId={setSelectedRestaurantId} 
                setActivePage={setActivePage}
              />
            )}

            {activePage === 'restaurant' && (
              <RestaurantDetailPage
                restaurant={selectedRestaurant}
                onBack={() => {
                  setSelectedRestaurantId(null);
                  setActivePage('home');
                }}
                cart={cart}
                addToCart={addToCart}
                updateCartItemQty={updateCartItemQty}
                onGoToCart={() => setActivePage('cart')}
              />
            )}

            {activePage === 'cart' && (
              <CartPage
                cart={cart}
                restaurantId={selectedRestaurantId}
                restaurantName={cartMeta.name}
                restaurantAddress={cartMeta.address}
                deliveryFee={cartMeta.deliveryFee}
                minOrderValue={cartMeta.minOrderValue}
                updateCartItemQty={updateCartItemQty}
                removeFromCart={removeFromCart}
                onPlaceOrder={onPlaceOrder}
                setActivePage={setActivePage}
                clearCart={clearCart}
              />
            )}

            {activePage === 'orders' && (
              <OrderHistoryPage
                orders={orders}
                onSimulateStatus={onUpdateOrderStatus}
                setActivePage={setActivePage}
              />
            )}

            {activePage === 'partner' && (
              <PartnerDashboard
                restaurants={restaurants}
                orders={orders}
                onAddMenuItem={onAddMenuItem}
                onRemoveMenuItem={onRemoveMenuItem}
                onUpdateOrderStatus={onUpdateOrderStatus}
                onToggleStoreState={onToggleStoreState}
              />
            )}

            {activePage === 'login' && (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                setActivePage={(p) => {
                  if (p === 'partner' && currentUser?.role === UserRole.USER) {
                    setActivePage('home');
                  } else {
                    setActivePage(p);
                  }
                }}
              />
            )}

            {activePage === 'register' && (
              <RegisterPage
                setActivePage={(p) => {
                  if (p === 'partner' && currentUser?.role === UserRole.USER) {
                    setActivePage('home');
                  } else {
                    setActivePage(p);
                  }
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Component chân trang (Footer tách biệt) ── */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}
