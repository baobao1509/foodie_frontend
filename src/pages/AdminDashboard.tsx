import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AppContextType, UserRole } from '../types';
import {
  ShieldAlert, Clock, Coins, BarChart3, LayoutGrid, ChevronRight, 
  Menu, Bell, TrendingUp, DollarSign, ShoppingBag, Utensils
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { restaurants, orders, currentUser } = useOutletContext<AppContextType>();

  // Sidebar controls
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Có yêu cầu đăng ký kinh doanh mới từ quán "Bún Chả Cựu"', time: '2 phút trước', read: false },
    { id: 2, text: 'Tài khoản partner "Ngon Food" cập nhật tài khoản PayOS', time: '10 phút trước', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Auth & Role check
  if (!currentUser) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 px-4 flex flex-col justify-center items-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-100 shadow-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-xl font-black text-gray-950 tracking-tight">Quyền truy cập bị từ chối</h1>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Vui lòng đăng nhập với tài khoản Quản trị viên (ADMIN) để tiếp tục thao tác trên Kênh giám sát này.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <button
              onClick={() => navigate('/login', { state: { from: '/admin' } })}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer w-full transition-all"
            >
              Đăng nhập ADMIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 px-4 flex flex-col justify-center items-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-amber-100 shadow-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500" />
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-xl font-black text-gray-950 tracking-tight">Từ chối phân quyền</h1>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Tài khoản của bạn (<span className="font-bold text-gray-700">{currentUser.fullName}</span>) mang vai trò là <span className="font-extrabold text-amber-600">{currentUser.role}</span>. Trang web này chỉ khả dụng đối với vai trò <span className="font-extrabold text-red-600 font-mono">ADMIN</span> của FoodieVN.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs uppercase tracking-wide cursor-pointer w-full transition-all"
            >
              Quay lại Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Stats calculation
  const totalCount = restaurants.length;
  const pendingCount = restaurants.filter(
    (res) => (res.id.startsWith('new_') || res.minOrderValue === 0)
  ).length;
  const activeCount = totalCount - pendingCount;

  // Revenue sum calculation from real context orders (status === 'COMPLETED')
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* LEFT SIDEBAR SECTION */}
      <aside 
        className={`bg-slate-900 border-r border-slate-950 text-white flex flex-col z-30 transition-all duration-300 shrink-0 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-5 border-b border-slate-950 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white shrink-0">
              F
            </div>
            {isSidebarOpen && (
              <span className="font-black text-sm tracking-tight text-white uppercase">
                ADMIN <span className="text-orange-500 font-mono text-[10px]">PANEL</span>
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-white cursor-pointer"
            id="toggle-sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Unified Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
          <div>
            {isSidebarOpen && (
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-2">
                BẢNG ĐIỀU KHIỂN
              </p>
            )}
            <ul className="space-y-1">
              {/* MODULE 1: Dashboard Doanh thu (Active) */}
              <li>
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left text-white bg-orange-600 shadow-md shadow-orange-950/20 cursor-pointer"
                  id="nav-to-admin"
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span className="truncate">Dashboard Doanh thu</span>}
                </button>
              </li>

              {/* MODULE 2: Quản lý nhà hàng */}
              <li>
                <button
                  onClick={() => navigate('/admin/restaurants')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                  id="nav-to-restaurants"
                >
                  <LayoutGrid className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span className="truncate">Quản lý Nhà hàng</span>}
                  {isSidebarOpen && (
                    <span className="ml-auto bg-slate-950/40 text-orange-400 font-mono text-[9px] px-1.5 py-0.5 rounded-sm">
                      {totalCount}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* User admin profile display footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-slate-900 border border-orange-500 shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>
          {isSidebarOpen && (
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-black truncate text-white leading-none mb-1">
                {currentUser.fullName}
              </p>
              <p className="text-[10px] font-bold text-orange-500 font-mono uppercase tracking-wider">
                {currentUser.role}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT WORK AREA */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-150 px-6 shrink-0 flex items-center justify-between relative shadow-xs">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest hidden sm:block">
              Hệ thống giám sát: <span className="text-gray-900 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">LIVE-PANEL</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification system */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative cursor-pointer"
                id="noti-btn-dashboard"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-150 rounded-2xl shadow-xl py-3 z-50 animate-fade-in text-xs font-medium text-left">
                  <div className="px-4 pb-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <span className="font-extrabold text-gray-800">Thông báo từ hệ thống</span>
                    <button 
                      onClick={() => setNotifications([])} 
                      className="text-[10px] hover:underline font-bold text-orange-600 cursor-pointer"
                    >
                      Dọn sạch
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 italic">Không có thông báo mới</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 hover:bg-gray-50 flex flex-col gap-1 bg-orange-50/50">
                          <p className="text-gray-700 leading-normal font-semibold">{n.text}</p>
                          <span className="text-[9px] text-gray-400 font-mono">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">{currentUser.fullName}</span>
              <span className="bg-red-50 text-red-700 font-mono text-[9px] font-black px-2 py-0.5 rounded-full border border-red-150 tracking-wider">
                ADMIN
              </span>
            </div>
          </div>
        </header>

        {/* Work panel main body */}
        <main className="flex-1 p-6 space-y-6">
          
          {/* Breadcrumb row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/50 pb-4">
            <div>
              <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <span>Trang quản nhiệm</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-orange-600">Dashboard Doanh thu</span>
              </div>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">
                Dashboard Doanh thu Hệ thống
              </h1>
            </div>
          </div>

          <div className="space-y-6 animate-fade-in">
            
            {/* Dynamic counters statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Metric 1: Total Orders */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-full translate-x-4 -translate-y-4 pointer-events-none" />
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Tổng số đơn hàng</span>
                  <span className="text-2xl font-black text-gray-900 block mt-0.5">{orders.length}</span>
                </div>
              </div>

              {/* Metric 2: Total Revenue Estimate */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full translate-x-4 -translate-y-4 pointer-events-none" />
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Doanh thu thực tế</span>
                  <span className="text-2xl font-black text-emerald-700 block mt-0.5">
                    {totalRevenue.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Metric 3: Active Stores */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-50 rounded-full translate-x-4 -translate-y-4 pointer-events-none" />
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Nhà hàng trực tuyến</span>
                  <span className="text-2xl font-black text-indigo-900 block mt-0.5">{activeCount} / {totalCount}</span>
                </div>
              </div>

              {/* Metric 4: Pending Approvals */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 bg-amber-50 rounded-full translate-x-4 -translate-y-4 pointer-events-none" />
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Cửa hàng chờ duyệt</span>
                  <span className="text-2xl font-black text-amber-700 block mt-0.5">{pendingCount}</span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Elegant graph mockup placeholder */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-150 p-8 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-950">Biểu đồ doanh thu kinh doanh</h3>
                      <p className="text-xs text-gray-400 mt-1">Xu hướng biểu diễn thông số doanh số bán hàng trong tuần</p>
                    </div>
                    <span className="text-[10px] font-black bg-orange-50 text-orange-700 px-3 py-1 rounded-full uppercase">
                      Chưa có dữ liệu
                    </span>
                  </div>

                  {/* Placeholder content */}
                  <div className="h-64 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 bg-white mb-3">
                      <TrendingUp className="w-5 h-5 text-gray-300" />
                    </div>
                    <h4 className="text-xs font-black text-gray-700">Dữ liệu doanh thu đang trống</h4>
                    <p className="text-[11px] text-gray-400 max-w-sm mt-1 mb-4 leading-relaxed">
                      Hệ thống sẽ tự động vẽ đồ thị phân tích tăng trưởng doanh số khi có bất kỳ đơn hàng nào kết toán thành công.
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span>Đường truyền API: Đang lắng nghe sự kiện từ cổng PayOS</span>
                  <button 
                    onClick={() => navigate('/admin/restaurants')}
                    className="text-xs font-black text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Quản lý danh sách nhà hàng &rarr;
                  </button>
                </div>
              </div>

              {/* Right widget explaining payment stats */}
              <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-150 p-8 shadow-xs flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-950">Giao dịch Gần đây</h3>
                    <p className="text-xs text-gray-400 mt-1">Lịch sử thanh toán đơn hàng toàn hệ thống</p>
                  </div>

                  {/* Empty placeholder representing "chưa có data" */}
                  <div className="space-y-4 py-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
                      <Coins className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="text-xs text-gray-400 italic">Chưa có giao dịch thanh toán nào được thực hiện.</div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 text-[11px] text-gray-400 leading-relaxed font-semibold">
                  💡 <b>Mẹo cho Admin:</b> Bạn có thể tạo nhà hàng đối tác mới bên phần <span className="text-orange-500 hover:underline cursor-pointer" onClick={() => navigate('/admin/restaurants')}>Quản lý Nhà hàng</span>, sau đó thử đặt hàng ở Trang chủ để thấy doanh số tăng lên thực tế!
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
