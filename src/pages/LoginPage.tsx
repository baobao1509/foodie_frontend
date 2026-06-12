import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AppContextType, UserSummaryDTO, ActivePage, UserRole } from '../types';
import { Lock, User, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { login as apiLogin } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleLoginSuccess: onLoginSuccess } = useOutletContext<AppContextType>();
  // Input fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status and interaction logic states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }

    setIsLoading(true);

    try {
      const userData = await apiLogin(email.trim(), password);
      
      if (userData) {
        setSuccessMessage('Đăng nhập thành công!');
        setTimeout(() => {
          onLoginSuccess(userData);
          // Redirect smart based on role
          if (userData.role === UserRole.PARTNER || userData.role === UserRole.ADMIN) {
            navigate('/partner');
          } else {
            navigate('/');
          }
        }, 1500);
      } else {
        throw new Error('Dữ liệu trả về không đúng định dạng chứa thông tin tài khoản!');
      }
    } catch (err: any) {
      console.error(err);
      const errorDetail = err.response?.data?.message || err.message || 'Không thể kết nối đến Spring Boot Backend. Vui lòng kiểm tra lại dịch vụ của bạn.';
      setErrorMessage(
        `Lỗi đăng nhập: ${errorDetail}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 flex flex-col justify-center items-center">
      {/* Container wrapper */}
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-150 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500" />
        
        <div className="p-8">
          {/* Form Header */}
          <div className="text-center mb-8">
            <span className="text-4xl select-none block mb-2">🔑</span>
            <h1 className="text-2xl font-black text-gray-950 font-sans tracking-tight font-display">Đăng nhập tài khoản</h1>
            <p className="text-xs text-gray-400 mt-1.5 font-medium leading-relaxed uppercase">
              Hệ thống Event Booking & FoodieVN Integration
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-0.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-0.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-11 text-xs font-medium text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-750 text-xs font-medium leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-700 text-xs font-medium leading-relaxed">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-orange-400 cursor-not-allowed shadow-none' 
                  : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-850 cursor-pointer shadow-orange-600/15'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Chờ xác nhận thông tin...</span>
                </>
              ) : (
                <span>🔐 Đăng nhập tài khoản</span>
              )}
            </button>
          </form>

          {/* Quick register fallback route */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-medium font-sans">
              Chưa có tài khoản thành viên?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-orange-600 font-black hover:underline cursor-pointer transition-colors"
              >
                Đăng ký ngay tại đây
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
