import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { Lock, User, AlertCircle, CheckCircle2, Eye, EyeOff, Phone, Briefcase } from 'lucide-react';
import { register as apiRegister } from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  // Input fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);

  // Status and interaction states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Submit Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Mật khẩu tối thiểu phải từ 8 ký tự!');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: email.trim(),
        password: password,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        role: role,
      };

      await apiRegister(payload);
      
      if (role === UserRole.PARTNER) {
        setSuccessMessage('Đăng ký tài khoản Đối tác thành công! Đang chuyển hướng sang trang thiết lập thông tin Nhà hàng...');
        setTimeout(() => {
          navigate('/register-restaurant', { state: { email: email.trim(), fullName: fullName.trim() } });
        }, 1800);
      } else {
        setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển hướng về trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 1800);
      }
    } catch (err: any) {
      console.error(err);
      const errResponseMsg = err.response?.data?.message;
      const finalErr = errResponseMsg || err.message || 'Không thể thiết lập liên kết đăng ký với Spring Boot API.';
      setErrorMessage(`Lỗi: ${finalErr}`);
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
            <span className="text-4xl select-none block mb-2">📝</span>
            <h1 className="text-2xl font-black text-gray-950 font-sans tracking-tight">Đăng ký thành viên</h1>
            <p className="text-xs text-gray-400 mt-1.5 font-medium leading-relaxed uppercase">
              Hệ thống Event Booking & FoodieVN Integration
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Full Name field */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-0.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Gia Bảo Nguyễn"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-0.5">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="giabaodongthanh@gmail.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-0.5">
                Số điện thoại <span className="text-gray-400 lowercase font-normal">(tùy chọn)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-0.5">
                Vai trò thành viên
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10 appearance-none"
                >
                  <option value={UserRole.CUSTOMER}>Khách hàng mua sắm (CUSTOMER)</option>
                  <option value={UserRole.PARTNER}>Nhà hàng Đối tác (PARTNER)</option>
                  <option value={UserRole.ADMIN}>Quản trị viên (ADMIN)</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-0.5">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
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

            {/* Error Message banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-750 text-xs font-bold leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message Banner */}
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-800 text-xs font-bold leading-relaxed">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Action Submit button */}
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
                  <span>Mạng đang đăng ký tài khoản...</span>
                </>
              ) : (
                <span>🚀 Đăng ký tài khoản</span>
              )}
            </button>
          </form>

          {/* Quick shortcut link back to login page */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Bạn đã có tài khoản rồi?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-orange-600 font-bold hover:underline cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
