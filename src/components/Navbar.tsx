import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartItem, UserSummaryDTO, UserRole } from '../types';
import { ShoppingBag, History, ChefHat, Home, User, LogOut, ChevronDown } from 'lucide-react';

interface NavbarProps {
  cart: CartItem[];
  currentOrderCount: number;
  currentUser: UserSummaryDTO | null;
  onLogout: () => void;
}

export default function Navbar({ cart, currentOrderCount, currentUser, onLogout }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const pathname = location.pathname;
  const isHomeActive = pathname === '/' || pathname.startsWith('/restaurant');
  const isCartActive = pathname === '/cart';
  const isOrdersActive = pathname === '/orders';
  const isPartnerActive = pathname === '/partner';
  const isLoginActive = pathname === '/login' || pathname === '/register';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs px-4 md:px-8 h-18 flex items-center justify-between">
      {/* Logo */}
      <div 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <span className="text-3xl transition-transform group-hover:rotate-12 duration-200">🍜</span>
        <div className="flex flex-col">
          <span className="font-sans font-extrabold text-xl tracking-tight text-orange-600 bg-linear-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
            FoodieVN
          </span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-gray-400">Giao hàng 30p</span>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="flex items-center gap-1 md:gap-3">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            isHomeActive
              ? 'bg-orange-50 text-orange-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Trang chủ</span>
        </button>

        <button
          onClick={() => navigate('/cart')}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            isCartActive
              ? 'bg-orange-50 text-orange-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Giỏ hàng</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
              {cartItemCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate('/orders')}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            isOrdersActive
              ? 'bg-orange-50 text-orange-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Theo dõi đơn</span>
          {currentOrderCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white ring-1 ring-white">
              {currentOrderCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

        <button
          onClick={() => {
            if (currentUser && currentUser.role === UserRole.CUSTOMER) {
              navigate('/register-restaurant');
              return;
            }
            if (!currentUser) {
              navigate('/login');
              return;
            }
            if (currentUser.role === UserRole.ADMIN) {
              navigate('/admin');
              return;
            }
            navigate('/partner');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            isPartnerActive || pathname === '/register-restaurant' || pathname === '/admin'
              ? 'bg-orange-600 text-white shadow-xs'
              : currentUser && currentUser.role === UserRole.CUSTOMER
              ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/50'
              : currentUser && currentUser.role === UserRole.ADMIN
              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 shadow-xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span className="hidden md:inline">
            {currentUser && currentUser.role === UserRole.CUSTOMER 
              ? 'Đăng ký bán hàng' 
              : currentUser && currentUser.role === UserRole.ADMIN 
              ? 'Kênh Quản trị' 
              : 'Kênh Nhà Hàng'}
          </span>
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

        {/* User Session Controller Display block */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-1.5 p-1 rounded-xl border border-gray-200 hover:border-gray-300 transition-all cursor-pointer bg-gray-50/50"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full border border-white object-cover shadow-xs"
              />
              <span className="text-xs font-bold text-gray-800 hidden md:inline max-w-[100px] truncate">
                {currentUser.fullName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform shrink-0 ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-150 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-10 h-10 rounded-full border border-gray-100 object-cover"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-gray-950 truncate leading-none">{currentUser.fullName}</p>
                    <span className={`inline-block mt-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${
                      currentUser.role === UserRole.ADMIN
                        ? 'bg-red-50 text-red-650 border border-red-100'
                        : currentUser.role === UserRole.PARTNER
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-orange-50 text-orange-700 border border-orange-100'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="p-1 space-y-1">
                  {currentUser.role === UserRole.CUSTOMER && (
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/register-restaurant');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer text-left"
                    >
                      <ChefHat className="w-4 h-4 shrink-0 text-orange-500" />
                      <span>Đăng ký Mở Nhà Hàng 🚀</span>
                    </button>
                  )}

                  {currentUser.role === UserRole.ADMIN && (
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/admin');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50 rounded-xl transition-all cursor-pointer text-left"
                    >
                      <ChefHat className="w-4 h-4 shrink-0 text-red-500" />
                      <span>Kênh Quản trị Admin ⚙️</span>
                    </button>
                  )}

                  {currentUser.role === UserRole.PARTNER && (
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/partner');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-650 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer text-left"
                    >
                      <ChefHat className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Kênh Nhà Hàng 🍳</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
              isLoginActive
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-xs'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Đăng ký / Đăng nhập</span>
          </button>
        )}
      </div>
    </nav>
  );
}
