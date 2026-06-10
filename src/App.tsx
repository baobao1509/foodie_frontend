import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivePage, CartItem, MenuItem, Order, OrderStatus, OrderTimelineStep, UserSummaryDTO, UserRole } from './types';
import { MOCK_RESTAURANTS } from './data';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import PartnerDashboard from './pages/PartnerDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { logout as apiLogout, getOrders as apiGetOrders, initTokenManager, setOnAuthFailedCallback } from './api';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  
  // Real active React states for reactivity
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Authenticated user session state
  const [currentUser, setCurrentUser] = useState<UserSummaryDTO | null>(() => {
    const stored = localStorage.getItem('currentUser');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Initialize the Silent Refresh token manager upon application start
  React.useEffect(() => {
    setOnAuthFailedCallback(() => {
      console.warn('[Session] Session invalidated on background refresh. Logging out user.');
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setActivePage('login');
    });

    initTokenManager();
  }, []);

  const handleLoginSuccess = (user: UserSummaryDTO) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.warn('Could not log out from Spring Boot backend, clearing session locally:', err);
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Automatically fetch synchronized orders from Spring Boot Backend via Axios when user logged index changes
  React.useEffect(() => {
    if (currentUser) {
      const fetchOrdersFromBackend = async () => {
        try {
          const serverOrders = await apiGetOrders();
          if (Array.isArray(serverOrders)) {
            setOrders(serverOrders);
          }
        } catch (err) {
          console.warn('Could not load orders from Spring Boot backend, using mock list:', err);
        }
      };
      fetchOrdersFromBackend();
    }
  }, [currentUser?.id, activePage]);

  // Identify active restaurant selected by user
  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);

  // Cart operations
  const addToCart = (item: MenuItem, notes?: string) => {
    // Find who this menu item belongs to
    const belongRes = restaurants.find(r => r.menu.some(m => m.id === item.id));
    if (!belongRes) return;

    // Is there already something in the cart from ANOTHER restaurant?
    const otherResInCart = cart.some(c => !belongRes.menu.some(m => m.id === c.menuItem.id));
    if (otherResInCart) {
      const confirmClear = window.confirm(
        'Giỏ hàng của bạn đang chứa món từ một cửa hàng khác. Bạn có muốn xóa sạch giỏ hàng hiện tại để bắt đầu chọn món từ quán này không?'
      );
      if (!confirmClear) return;
      // Clear cart first, then add
      setCart([{ menuItem: item, quantity: 1, notes }]);
      return;
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((idx) => idx.menuItem.id === item.id);
      if (existingIdx > -1) {
        const copy = [...prevCart];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [...prevCart, { menuItem: item, quantity: 1, notes }];
    });
  };

  const updateCartItemQty = (itemId: string, diff: number) => {
    setCart((prevCart) => {
      const idx = prevCart.findIndex((item) => item.menuItem.id === itemId);
      if (idx === -1) return prevCart;

      const copy = [...prevCart];
      const newQty = copy[idx].quantity + diff;

      if (newQty <= 0) {
        copy.splice(idx, 1);
      } else {
        copy[idx].quantity = newQty;
      }
      return copy;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.menuItem.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Placing order callback
  const onPlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Mutate order state timeline progress
  const onUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.id !== orderId) return o;

        // Build new step for timeline logs
        let stepTitle = '';
        let stepDesc = '';
        switch (nextStatus) {
          case 'PREPARING':
            stepTitle = 'Đang chuẩn bị thức ăn';
            stepDesc = 'Cửa hàng đang tích cực sửa soạn & gói ghém món ăn thơm ngon cho bạn.';
            break;
          case 'SHIPPING':
            stepTitle = 'Đang trên đường giao';
            stepDesc = 'Tài xế công nghệ đang bốc xe nhận đơn và hỏa tốc phi tới chỗ bạn.';
            break;
          case 'COMPLETED':
            stepTitle = 'Giao vận thành công';
            stepDesc = 'Bữa ăn thịnh soạn đã được trao tận tay quý hàng. Chúc bạn ngon miệng!';
            break;
          case 'CANCELLED':
            stepTitle = 'Đơn hàng bị từ chối';
            stepDesc = 'Hệ thống buộc phải huỷ hoặc từ chối xử lý vận đơn này.';
            break;
          default:
            return o;
        }

        const newStep: OrderTimelineStep = {
          status: nextStatus,
          title: stepTitle,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          description: stepDesc
        };

        // If duplicate status exists in log, prevent adding but update current
        return {
          ...o,
          status: nextStatus,
          timeline: [...o.timeline.filter(t => t.status !== nextStatus), newStep]
        };
      })
    );
  };

  // Add menu item in Partner Dashboard
  const onAddMenuItem = (restaurantId: string, item: MenuItem) => {
    setRestaurants((prevRes) =>
      prevRes.map((r) => {
        if (r.id !== restaurantId) return r;
        return {
          ...r,
          menu: [item, ...r.menu]
        };
      })
    );
  };

  // Handle store toggling in Partner Dashboard
  const onToggleStoreState = (restaurantId: string) => {
    setRestaurants((prevRes) =>
      prevRes.map((r) => {
        if (r.id !== restaurantId) return r;
        return {
          ...r,
          isOpen: !r.isOpen
        };
      })
    );
  };

  const onRemoveMenuItem = (restaurantId: string, itemId: string) => {
    setRestaurants((prevRes) =>
      prevRes.map((r) => {
        if (r.id !== restaurantId) return r;
        return {
          ...r,
          menu: r.menu.filter((m) => m.id !== itemId)
        };
      })
    );
  };

  // Dynamically select target restaurant details dynamically computed from active cart contents
  const getCartRestaurantMeta = () => {
    if (cart.length === 0) return { name: '', deliveryFee: 0, minOrderValue: 0, address: '' };
    // Find which restaurant has these menu items
    const sampleItem = cart[0].menuItem;
    const res = restaurants.find(r => r.menu.some(m => m.id === sampleItem.id));
    return res 
      ? { name: res.name, deliveryFee: res.deliveryFee, minOrderValue: res.minOrderValue, address: res.address }
      : { name: '', deliveryFee: 0, minOrderValue: 0, address: '' };
  };

  const cartMeta = getCartRestaurantMeta();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Dynamic Navigation Bar */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        cart={cart}
        currentOrderCount={orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Responsive Viewport with Screen animations */}
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

      {/* ── Visual Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🍜</span>
              <span className="font-extrabold text-lg text-white font-display">FoodieVN</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs text-gray-500 font-medium">
              Cách đơn giản nhất để tiếp cận tinh hoa ẩm thực ba miền. Giao nhanh hỏa tốc đảm bảo độ nóng giòn từ thớt đến bàn ăn.
            </p>
          </div>

          {[
            { title: "Về nhà hàng", links: ["Đặt món nhanh", "Duyệt tìm sành điệu", "Khuyến mãi voucher"] },
            { title: "Hỗ trợ khách hàng", links: ["Trung tâm chăm sóc", "Khiếu nại bồi thường", "Hỏi đáp hữu ích"] },
            { title: "Gia nhập gia đình", links: ["Làm shipper giao hàng", "Làm đối tác thương gia", "Tuyển dụng nhân tài"] },
          ].map((sec) => (
            <div key={sec.title}>
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-200 mb-4">{sec.title}</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-medium">
                {sec.links.map((link) => (
                  <li key={link}>
                    <button onClick={() => setActivePage('home')} className="hover:text-orange-500 transition-colors cursor-pointer text-left">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-semibold tracking-wider text-gray-600 text-center">
          <p>© 2026 FOODIEVN PLATFORM. TẤT CẢ CÁC QUYỀN ĐƯỢC BẢO LƯU.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400 transition-colors">ĐIỀU KHOẢN</a>
            <a href="#" className="hover:text-gray-400 transition-colors font-sans">BẢO MẬT</a>
            <a href="#" className="hover:text-gray-400 transition-colors">TRỢ GIÚP</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
