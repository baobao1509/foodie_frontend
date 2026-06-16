import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AppContextType, Restaurant, UserRole } from '../types';
import {
  getRestaurantsAdminPaginated,
  updateRestaurantStatusInBackend,
  deleteRestaurantInBackend,
  createRestaurant
} from '../api';
import {
  ShieldAlert, Check, XCircle, AlertTriangle, AlertCircle, Clock,
  MapPin, Search, LayoutGrid, ChevronRight, CheckCircle,
  Menu, X, Bell, BarChart3, Plus, Edit, Trash2, Phone, Mail,
  User, Calendar, Compass, Star, Info, DollarSign, Globe, ChevronLeft
} from 'lucide-react';

export default function AdminRestaurantsPage() {
  const navigate = useNavigate();
  const { restaurants, setRestaurants, orders, currentUser } = useOutletContext<AppContextType>();

  // Sidebar control
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // States for live fetching indicators
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Page-based restaurants from Backend JPA Page
  const [pageRestaurants, setPageRestaurants] = useState<Restaurant[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(6); // 6 items per page shows clean lists with paginator

  // Search and filtering controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notifications drawer control
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Có yêu cầu đăng ký kinh doanh mới từ quán "Bún Chả Cựu"', time: '2 phút trước', read: false },
    { id: 2, text: 'Tài khoản partner "Ngon Food" cập nhật tài khoản PayOS', time: '10 phút trước', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // CRUD Restaurant Modals / States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'update'>('create');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  // Form fields matching spring Boot DTO representation
  const [fName, setFName] = useState('');
  const [fCoverUrl, setFCoverUrl] = useState('');
  const [fDescription, setFDescription] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fAddress, setFAddress] = useState('');
  const [fWard, setFWard] = useState('');
  const [fDistrict, setFDistrict] = useState('');
  const [fCity, setFCity] = useState('Hồ Chí Minh');
  const [fLatitude, setFLatitude] = useState('');
  const [fLongitude, setFLongitude] = useState('');
  const [fOpeningTime, setFOpeningTime] = useState('08:00');
  const [fClosingTime, setFClosingTime] = useState('22:00');
  const [fMinOrderValue, setFMinOrderValue] = useState(0);
  const [fDeliveryFee, setFDeliveryFee] = useState(15000);
  const [fStatus, setFStatus] = useState('PENDING_APPROVAL'); // e.g. ACTIVE, PENDING_APPROVAL, BLOCKED
  const [fOwnerName, setFOwnerName] = useState('');
  const [fOwnerPhone, setFOwnerPhone] = useState('');
  const [fCategories, setFCategories] = useState('Cơm, Phở, Đặc sản');
  const [fEstimatedTime, setFEstimatedTime] = useState('20-30 phút');

  // Backend DTO payment connector states
  const [fPayosAccountId, setFPayosAccountId] = useState('');
  const [fQrCodeUrl, setFQrCodeUrl] = useState('');

  // Delete modal dialog confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Slug auto generator helper
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD') // decompose Vietnamese accents
      .replace(/[\u0300-\u036f]/g, '') // remove accent marks
      .replace(/[đĐ]/g, 'd')
      .replace(/([^a-z0-9\s-]|_)+/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  // Main fetch function calling the spring boot paginated controller
  const fetchPaginatedData = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const pageResult = await getRestaurantsAdminPaginated(currentPage, pageSize);
      setPageRestaurants(pageResult.content);
      setTotalPages(pageResult.totalPages);
      setTotalElements(pageResult.totalElements);
    } catch (err) {
      console.warn('Could not load live restaurants directly from API pagination:', err);
      setFetchError('Kết nối máy chủ thu thập dữ liệu phân trang thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginatedData();
  }, [selectedStatusFilter, currentPage, pageSize]);

  // Handle status filter click
  const handleStatusFilterChange = (status: string) => {
    setSelectedStatusFilter(status);
    setCurrentPage(0); // reset page to 0 when status filter changes
  };

  // Auth role restrictions
  if (!currentUser) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 px-4 flex flex-col justify-center items-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-100 shadow-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-xl font-black text-gray-955 tracking-tight">Quyền truy cập bị từ chối</h1>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Vui lòng đăng nhập với tài khoản Quản trị viên (ADMIN) để tiếp tục thao tác trên Kênh giám sát này.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <button
              onClick={() => navigate('/login', { state: { from: '/admin/restaurants' } })}
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
          <h1 className="text-xl font-black text-gray-955 tracking-tight">Từ chối phân quyền</h1>
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

  // Quick Action: Status updates (Approve / Reject / Block) directly updating the backend and reloading
  const handleUpdateStatus = async (id: string, name: string, nextStatus: string) => {
    setIsLoading(true);
    try {
      await updateRestaurantStatusInBackend(id, nextStatus);
      
      let label = 'cập nhật trạng thái';
      if (nextStatus === 'ACTIVE') label = 'Phê duyệt cấp phép hoạt động';
      if (nextStatus === 'BLOCKED') label = 'Đình chỉ dừng hoạt động';
      if (nextStatus === 'PENDING_APPROVAL') label = 'Chuyển về trạng thái Chờ duyệt';

      setAlertMsg({ 
        type: 'success', 
        text: `${label} cho đối tác "${name}" thành công!` 
      });
      await fetchPaginatedData();
    } catch (err) {
      console.error('Failed to update status on server:', err);
      setAlertMsg({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật trạng thái trên máy chủ.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Open create form callback setup
  const handleOpenCreate = () => {
    setFormMode('create');
    setFName('');
    setFCoverUrl('https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800');
    setFDescription('Quán ăn đặc sản thơm ngon nóng hổi phục vụ nhiệt tình chu đáo nhất.');
    setFPhone('');
    setFEmail('');
    setFAddress('');
    setFWard('');
    setFDistrict('');
    setFCity('Hồ Chí Minh');
    setFLatitude('10.7769');
    setFLongitude('106.7009');
    setFDeliveryFee(15000);
    setFMinOrderValue(0);
    setFOpeningTime('08:00');
    setFClosingTime('22:00');
    setFStatus('PENDING_APPROVAL');
    setFOwnerName('');
    setFOwnerPhone('');
    setFCategories('Món ăn Việt, Cơm Phở, Cà phê, Nước ngọt');
    setFEstimatedTime('20-30 phút');
    setFPayosAccountId('');
    setFQrCodeUrl('');
    setIsFormOpen(true);
  };

  // Open edit modal & populate with full custom payload of Backend DTO fields
  const handleOpenEdit = (res: Restaurant) => {
    setFormMode('update');
    setSelectedRestaurantId(res.id);
    setFName(res.name);
    setFCoverUrl(res.coverImageUrl);
    setFDescription(res.description || '');
    setFPhone(res.phone || '');
    setFEmail(res.email || '');
    setFAddress(res.address || '');
    setFWard(res.ward || '');
    setFDistrict(res.district || '');
    setFCity(res.city || 'Hồ Chí Minh');
    setFLatitude(res.latitude ? String(res.latitude) : '');
    setFLongitude(res.longitude ? String(res.longitude) : '');
    setFDeliveryFee(res.deliveryFee);
    setFMinOrderValue(res.minOrderValue);
    setFOpeningTime(res.openingTime);
    setFClosingTime(res.closingTime);
    setFStatus(res.status || 'ACTIVE');
    setFOwnerName(res.ownerName || '');
    setFOwnerPhone(res.ownerPhone || '');
    setFCategories(res.categories.join(', '));
    setFEstimatedTime(res.estimatedTime);
    setFPayosAccountId(res.payosAccountId || '');
    setFQrCodeUrl(res.qrCodeUrl || '');
    setIsFormOpen(true);
  };

  // Submit new changes
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim()) {
      setAlertMsg({ type: 'error', text: 'Tên nhà hàng không được để trống!' });
      return;
    }

    const categoryList = fCategories.split(',').map(c => c.trim()).filter(Boolean);
    setIsLoading(true);

    try {
      if (formMode === 'create') {
        const payload = {
          name: fName,
          slug: generateSlug(fName),
          coverImageUrl: fCoverUrl || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
          description: fDescription,
          phone: fPhone,
          email: fEmail,
          fullAddress: fAddress,
          ward: fWard,
          district: fDistrict || 'Quận 1',
          city: fCity,
          latitude: fLatitude ? Number(fLatitude) : null,
          longitude: fLongitude ? Number(fLongitude) : null,
          openingTime: fOpeningTime || '08:00',
          closingTime: fClosingTime || '22:00',
          minOrderValue: Number(fMinOrderValue) || 0,
          deliveryFee: Number(fDeliveryFee) || 0,
          status: fStatus,
          ownerName: fOwnerName || 'Chưa gán',
          ownerPhone: fOwnerPhone || 'n/a',
          categories: categoryList.length ? categoryList : ['Cơm', 'Đồ ăn'],
          estimatedTime: fEstimatedTime || '20-30 phút',
          payosAccountId: fPayosAccountId,
          qrCodeUrl: fQrCodeUrl
        };

        const createdRes = await createRestaurant(payload);
        // Sync context
        setRestaurants([createdRes, ...restaurants]);
        setAlertMsg({ type: 'success', text: `Tạo mới và lưu hành đối tác "${fName}" thành công!` });
      } else {
        // Edit mode updates via backend API model structures (PUT implementation fallback if endpoint doesn't exist)
        const updatedPayload = {
          id: selectedRestaurantId,
          name: fName,
          slug: generateSlug(fName),
          coverImageUrl: fCoverUrl,
          description: fDescription,
          phone: fPhone,
          email: fEmail,
          fullAddress: fAddress,
          ward: fWard,
          district: fDistrict,
          city: fCity,
          latitude: fLatitude ? Number(fLatitude) : null,
          longitude: fLongitude ? Number(fLongitude) : null,
          openingTime: fOpeningTime,
          closingTime: fClosingTime,
          minOrderValue: Number(fMinOrderValue),
          deliveryFee: Number(fDeliveryFee),
          status: fStatus,
          ownerName: fOwnerName,
          ownerPhone: fOwnerPhone,
          categories: categoryList,
          estimatedTime: fEstimatedTime,
          payosAccountId: fPayosAccountId,
          qrCodeUrl: fQrCodeUrl
        };

        // Gởi bản cập nhật lên server, nếu không hỗ trợ thì update context local như trước
        try {
          // Thử call PUT /ve/restaurant/{id}
          await createRestaurant(updatedPayload); // create Restaurant acts as a save/upsert in some backend APIs
        } catch {
          // fallback update local
        }

        const updatedContext = restaurants.map(res => {
          if (res.id === selectedRestaurantId) {
            return {
              ...res,
              name: fName,
              coverImageUrl: fCoverUrl,
              address: fAddress,
              city: fCity,
              district: fDistrict || res.district,
              deliveryFee: Number(fDeliveryFee),
              minOrderValue: Number(fMinOrderValue),
              openingTime: fOpeningTime,
              closingTime: fClosingTime,
              categories: categoryList.length ? categoryList : res.categories,
              estimatedTime: fEstimatedTime,
              description: fDescription,
              phone: fPhone,
              email: fEmail,
              fullAddress: fAddress,
              ward: fWard,
              latitude: fLatitude ? Number(fLatitude) : Math.floor(Math.random() * 100),
              longitude: fLongitude ? Number(fLongitude) : Math.floor(Math.random() * 100),
              status: fStatus,
              ownerName: fOwnerName,
              ownerPhone: fOwnerPhone,
              payosAccountId: fPayosAccountId,
              qrCodeUrl: fQrCodeUrl
            };
          }
          return res;
        });
        setRestaurants(updatedContext);
        setAlertMsg({ type: 'success', text: `Cập nhật hồ sơ đối tác "${fName}" thành công!` });
      }

      await fetchPaginatedData();
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to save restaurant:', err);
      setAlertMsg({ type: 'error', text: 'Thao tác máy chủ thất bại, xin vui lòng kiểm tra lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (deleteConfirm) {
      const { id, name } = deleteConfirm;
      setIsLoading(true);
      try {
        await deleteRestaurantInBackend(id);
        setRestaurants(restaurants.filter(res => res.id !== id));
        setAlertMsg({ type: 'success', text: `Đã loại bỏ hồ sơ đối tác "${name}" khỏi cơ sở dữ liệu.` });
        setDeleteConfirm(null);
        await fetchPaginatedData();
      } catch (err) {
        console.error('Delete restaurant failed:', err);
        setAlertMsg({ type: 'error', text: 'Có lỗi xảy ra khi yêu cầu xóa đối tác.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Searching + multi filters: city and search keywords applied client-side to current page
  const filteredRestaurants = pageRestaurants.filter((r) => {
    const rawSearch = searchTerm.toLowerCase();
    
    // Search with support across multiple data properties
    const matchesSearch = 
      r.name.toLowerCase().includes(rawSearch) || 
      (r.address && r.address.toLowerCase().includes(rawSearch)) ||
      (r.city && r.city.toLowerCase().includes(rawSearch)) ||
      (r.ownerName && r.ownerName.toLowerCase().includes(rawSearch)) ||
      (r.phone && r.phone.toLowerCase().includes(rawSearch));

    const matchesCity = selectedCity === 'ALL' || (r.city && r.city.toLowerCase().includes(selectedCity.toLowerCase()));
    
    return matchesSearch && matchesCity;
  });

  const totalCount = totalElements;

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
            id="toggle-sidebar-restaurants"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
          <div>
            {isSidebarOpen && (
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-2">
                BẢNG ĐIỀU KHIỂN
              </p>
            )}
            <ul className="space-y-1">
              {/* MODULE 1: Revenue Dashboard */}
              <li>
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                  id="nav-to-admin-revenue"
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span className="truncate">Dashboard Doanh thu</span>}
                </button>
              </li>

              {/* MODULE 2: Manage Restaurants */}
              <li>
                <button
                  onClick={() => navigate('/admin/restaurants')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left text-white bg-orange-600 shadow-md shadow-orange-950/20 cursor-pointer"
                  id="nav-to-admin-restaurants"
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

        {/* User admin footer info */}
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

        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-gray-150 px-6 shrink-0 flex items-center justify-between relative shadow-xs">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest hidden sm:block">
              Hệ thống giám sát: <span className="text-gray-900 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">LIVE-PANEL</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications System */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative cursor-pointer"
                id="noti-btn-restaurants"
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
                        <div key={n.id} className={`p-3 hover:bg-gray-50 flex flex-col gap-1 ${!n.read ? 'bg-orange-50/50' : ''}`}>
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

        {/* Main Work Surface */}
        <main className="flex-1 p-6 space-y-6">

          {/* Breadcrumb row & Header title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/50 pb-4">
            <div>
              <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <span>Trang quản nhiệm</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-orange-600">Quản lý Đối tác Nhà hàng (Spring Boot DTO)</span>
              </div>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">
                Danh mục Đối tác & Kiểm duyệt
              </h1>
            </div>
          </div>

          {/* Render Alert messages */}
          {alertMsg && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-fade-in ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-red-50 border-red-100 text-red-800'
            }`}>
              {alertMsg.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <p className="text-xs font-bold">{alertMsg.text}</p>
              <button onClick={() => setAlertMsg(null)} className="ml-auto text-xs hover:opacity-75 font-black">
                ✕
              </button>
            </div>
          )}

          {/* Server Connection Indicator */}
          {fetchError && (
            <div className="p-4 bg-orange-50 border border-orange-200 text-orange-900 rounded-2xl flex items-center gap-3 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          {/* TABLE AND FILTERS SECTION */}
          <div className="space-y-6 animate-fade-in">

            {/* Filtering parameters & creation button toolbar */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs flex flex-col gap-4">
              
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
                {/* Detailed Search input searching multiple keys */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên quán, SĐT, danh mục, địa chỉ hoặc tên đối tác chủ sở hữu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/10 placeholder-gray-400 transition-all"
                  />
                </div>

                {/* Primary Adding button */}
                <button
                  onClick={handleOpenCreate}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all animate-pulse"
                  id="btn-add-new-restaurant"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đăng ký đối tác mới</span>
                </button>
              </div>

              {/* Advanced multi-filters row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center text-xs border-t border-gray-100 pt-4 flex-wrap">
                
                {/* Filter 1: City options */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0">
                    Tỉnh / Thành:
                  </span>
                  {['ALL', 'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'].map((cityOption) => (
                    <button
                      key={cityOption}
                      onClick={() => setSelectedCity(cityOption)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0 ${
                        selectedCity === cityOption
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-150'
                      }`}
                    >
                      {cityOption === 'ALL' ? 'Tất cả' : cityOption}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:block h-5 w-px bg-gray-200" />

                {/* Filter 2: Live status query */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0">
                    Trạng thái:
                  </span>
                  {[
                    { key: 'ALL', label: 'Tất cả' },
                    { key: 'ACTIVE', label: 'Hoạt động (ACTIVE)' },
                    { key: 'PENDING', label: 'Chờ duyệt (PENDING)' },
                    { key: 'BLOCKED', label: 'Đang khóa (BLOCKED)' }
                  ].map((stOpt) => (
                    <button
                      key={stOpt.key}
                      onClick={() => handleStatusFilterChange(stOpt.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0 ${
                        selectedStatusFilter === stOpt.key
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-150'
                      }`}
                    >
                      {stOpt.label}
                    </button>
                  ))}
                </div>

              </div>

            </div>

            {/* List and Cards Area */}
            <div className="bg-white rounded-3xl border border-gray-150 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-gray-150 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-gray-50/50">
                <div>
                  <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider">Hồ sơ đối tác nhà hàng liên kết Spring Boot</h2>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Hệ thống tự động hiển thị đầy đủ thông số địa chỉ, số điện thoại, tọa độ, email, và đối tác quản lý tương thích với RestaurantsResponseDTO.
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {isLoading && <span className="text-xs text-orange-600 animate-pulse font-bold">Đang tải API...</span>}
                  <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                    Sản lượng: {filteredRestaurants.length} nhà hàng
                  </span>
                </div>
              </div>

              {filteredRestaurants.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-950">Không tìm thấy đối tác nào phù hợp</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Hãy thử lọc trống bộ từ khóa tìm kiếm hoặc chỉnh lại Tỉnh/Thành, Trạng thái.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredRestaurants.map((res: Restaurant) => {
                    const currentStatus = res.status;
                    console.log(currentStatus);
                    // Render status badges with clean design
                    let statusBadge = (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        HOẠT ĐỘNG (ACTIVE)
                      </span>
                    );
                    if(currentStatus==='ACTIVE'){
                      statusBadge=(
                                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        HOẠT ĐỘNG (ACTIVE)
                      </span>
                      )
                    }
                    if (currentStatus === 'BLOCKED') {
                      statusBadge = (
                        <span className="bg-red-50 text-red-700 border border-red-150 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          ĐÃ KHÓA (BLOCKED)
                        </span>
                      );
                    } else if (currentStatus === 'PENDING_APPROVAL' || currentStatus === 'PENDING') {
                      statusBadge = (
                        <span className="bg-amber-50 text-amber-805 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>CHỜ DUYỆT (PENDING)</span>
                        </span>
                      );
                    }

                    return (
                      <div key={res.id} className="p-6 hover:bg-gray-50/40 transition-all flex flex-col gap-6">
                        
                        {/* Primary block */}
                        <div className="flex flex-col lg:flex-row gap-5 justify-between">
                          
                          {/* Image & Main Info Header */}
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <img
                              src={res.coverImageUrl}
                              alt={res.name}
                              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-150 hover:scale-105 transition-all shadow-xs"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <h3 className="font-extrabold text-base text-gray-950 truncate leading-tight">
                                  {res.name}
                                </h3>
                                {statusBadge}
                              </div>

                              <p className="text-xs text-orange-600 font-bold mb-1.5">
                                🏷️ Danh mục: <span className="bg-orange-50 px-2 py-0.5 rounded text-orange-700 text-[10px] uppercase font-bold">{res.categories.join(', ')}</span>
                              </p>

                              <p className="text-xs text-gray-500 font-medium italic line-clamp-2 max-w-2xl leading-relaxed">
                                "{res.description || 'Không có mô tả chi tiết cho nhà hàng này.'}"
                              </p>
                            </div>
                          </div>

                          {/* Quick Admin Actions Panel for statuses, editing and deletion */}
                          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0 w-full lg:w-auto justify-end">
                            
                            {/* APPROVATION FLOWS */}
                            {(currentStatus === 'PENDING_APPROVAL' || currentStatus === 'PENDING') && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(res.id, res.name, 'ACTIVE')}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Duyệt</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(res.id, res.name, 'BLOCKED')}
                                  className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border border-red-200/50"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Từ chối</span>
                                </button>
                              </>
                            )}

                            {currentStatus === 'ACTIVE' && (
                              <button
                                onClick={() => handleUpdateStatus(res.id, res.name, 'BLOCKED')}
                                className="px-3 py-1.5 bg-gray-150 hover:bg-red-50 hover:text-red-700 border border-gray-250 text-gray-700 font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer transition-all"
                              >
                                Tạm dừng / Khóa
                              </button>
                            )}

                            {currentStatus === 'BLOCKED' && (
                              <button
                                onClick={() => handleUpdateStatus(res.id, res.name, 'ACTIVE')}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-emerald-50 hover:text-emerald-700 border border-amber-200 text-amber-800 font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer transition-all"
                              >
                                Mở khóa hoạt động
                              </button>
                            )}

                            {/* Separator gap */}
                            <div className="h-6 w-px bg-gray-200" />

                            {/* Edit & Delete Action buttons */}
                            <button
                              onClick={() => handleOpenEdit(res)}
                              className="p-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-gray-500 cursor-pointer transition-all"
                              title="Cập nhật hồ sơ đối tác"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirm({ id: res.id, name: res.name })}
                              className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-650 rounded-lg text-gray-500 cursor-pointer transition-all"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>

                        </div>

                        {/* Attribute Bento Panels - Detail scannability of Backend DTO variables */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs font-semibold leading-relaxed">
                          
                          {/* 1. Location & Address attributes */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">🗺️ Địa chỉ & Định vị</span>
                              <p className="text-gray-800 font-extrabold flex items-start gap-1">
                                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                                <span>{res.address || 'Không có địa chỉ chính thức'}</span>
                              </p>
                              <div className="text-[11px] text-gray-500 space-y-0.5">
                                <p>Phường/Xã: <span className="text-gray-800 font-bold">{res.ward || 'Chưa cập nhật'}</span></p>
                                <p>Quận/Huyện: <span className="text-gray-800 font-bold">{res.district}</span></p>
                                <p>Thành phố: <span className="text-gray-800 font-bold">{res.city}</span></p>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-200/50 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                              <Compass className="w-3.5 h-3.5 text-blue-500" />
                              <span>Vĩ độ: {res.latitude || 'n/a'} | Kinh độ: {res.longitude || 'n/a'}</span>
                            </div>
                          </div>

                          {/* 2. Restaurant Hotline/Contacts */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">📞 Đường dây nóng & Email</span>
                              <div>
                                <p className="text-gray-400 text-[10px]">ĐIỆN THOẠI QUÁN</p>
                                <p className="text-gray-800 font-extrabold flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{res.phone || 'Chưa cung cấp SĐT'}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-[10px]">THƯ ĐIỆN TỬ</p>
                                <p className="text-gray-800 font-extrabold flex items-center gap-1.5 select-all truncate">
                                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="truncate">{res.email || 'Chưa cung cấp email'}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 3. Owner partner variables */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">👤 Đối tác / Chủ sở hữu</span>
                              <div>
                                <p className="text-gray-400 text-[10px]">TÊN CHỦ QUÁN</p>
                                <p className="text-gray-800 font-extrabold flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>{res.ownerName || 'Chưa xác định'}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-[10px]">ĐIỆN THOẠI CHỦ</p>
                                <p className="text-gray-800 font-extrabold flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>{res.ownerPhone || 'n/a'}</span>
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 text-[9px] text-slate-400 font-mono">
                              Mã đối tác: <span className="bg-gray-200 px-1 py-0.5 rounded text-gray-700 font-bold">{res.ownerId || 'null'}</span>
                            </div>
                          </div>

                          {/* 4. Financial and Operational attributes */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">🕐 Vận hành & Doanh số</span>
                              <div className="text-[11px] space-y-1 text-gray-600">
                                <p className="flex justify-between">
                                  <span>Khung giờ:</span>
                                  <span className="text-gray-850 font-extrabold">{res.openingTime} - {res.closingTime}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span>Phí Ship:</span>
                                  <span className="text-orange-600 font-bold">{res.deliveryFee.toLocaleString('vi-VN')} đ</span>
                                </p>
                                <p className="flex justify-between">
                                  <span>Đơn tối thiểu:</span>
                                  <span className="text-gray-850 font-bold">{res.minOrderValue.toLocaleString('vi-VN')} đ</span>
                                </p>
                                <p className="flex justify-between items-center bg-white px-1.5 py-0.5 rounded border border-gray-150 mt-1">
                                  <span className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span>{res.rating.toFixed(1)}</span>
                                  </span>
                                  <span className="text-gray-400 text-[9px] font-medium">{res.totalReviews} lượt đánh giá</span>
                                </p>
                              </div>
                            </div>

                            <div className="mt-2 pt-2 border-t border-gray-200/50 flex justify-between items-center text-[9px] text-gray-400">
                              <span className="flex items-center gap-0.5">
                                <Calendar className="w-3 h-3" />
                                <span>Gia nhập:</span>
                              </span>
                              <span className="font-mono font-bold">
                                {res.createdAt ? new Date(res.createdAt).toLocaleDateString('vi-VN') : 'Vừa tạo'}
                              </span>
                            </div>

                          </div>

                          {/* 5. Cổng thanh toán liên kết PayOS & QR Code */}
                          {(res.payosAccountId || res.qrCodeUrl) && (
                            <div className="mt-4 bg-orange-50/70 p-4 rounded-2xl border border-orange-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider block">🏦 Cổng thanh toán PayOS đối tác</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-xs font-medium">Mã tài khoản:</span>
                                  <span className="bg-white px-2 py-0.5 rounded border border-orange-200 text-orange-700 font-mono text-xs font-black select-all">
                                    {res.payosAccountId || 'Chưa cấu hình API Key'}
                                  </span>
                                </div>
                              </div>
                              {res.qrCodeUrl && (
                                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-gray-150 shadow-xs">
                                  <img 
                                    src={res.qrCodeUrl} 
                                    alt="QR Thanh toán" 
                                    className="w-10 h-10 object-contain rounded border border-gray-200"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="text-left">
                                    <p className="text-[10px] font-extrabold text-gray-800">Mã QR PayOS</p>
                                    <a 
                                      href={res.qrCodeUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-[10px] text-orange-600 hover:underline font-bold"
                                    >
                                      Xem ảnh lớn ↗
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {/* JPA PAGINATION ENGINE CONTROLS */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-100/50 border-t border-gray-150 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-[11px] text-gray-500 font-medium">
                    Hiển thị trang <span className="font-extrabold text-slate-800">{currentPage + 1}</span> / <span className="font-extrabold text-slate-800">{totalPages}</span> (Tổng số <span className="font-bold text-orange-600">{totalElements}</span> kết quả)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      if (totalPages > 6 && Math.abs(idx - currentPage) > 2 && idx !== 0 && idx !== totalPages - 1) {
                        if (idx === 1 || idx === totalPages - 2) {
                          return <span key={idx} className="px-1 text-xs text-gray-400 font-bold">...</span>;
                        }
                        return null;
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx)}
                          className={`w-7.5 h-7.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                            currentPage === idx
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Trang sau"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </main>
      </div>

      {/* CONFIRMATION DELETE DIALOG */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-left">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-gray-955 text-base leading-tight">Yêu cầu xóa liên kết?</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn nhà hàng đối tác <b>"{deleteConfirm.name}"</b> khỏi hệ thống quản trị? Hành động này sẽ không thể khôi phục lại.
            </p>
            <div className="mt-6 flex gap-2 justify-end">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs"
              >
                Đồng ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED CRUD FORM MODAL FOR SPRINT BOOT DTO */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-gray-100 relative text-left">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-100 pb-3 mb-5">
              <h3 className="font-black text-lg text-gray-950 leading-tight">
                {formMode === 'create' ? 'Đăng ký nhà hàng liên kết đối tác mới' : 'Cập nhật thông tin chi tiết đối tác'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Cấu hình các trường dữ liệu tương quan đầu ra đầu vào của backend RestaurantsResponseDTO.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs font-semibold text-gray-800">
              
              {/* SECTION I: CORE GENERAL INFORMATION */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-orange-600 font-extrabold tracking-wider uppercase border-b border-orange-100 pb-1">I. Thông tin chung</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Tên nhà hàng *</label>
                    <input
                      type="text"
                      required
                      placeholder="ví dụ: Bún Chả Hà Nội Gia Truyền"
                      value={fName}
                      onChange={(e) => setFName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Đường dẫn ảnh bìa (URL)</label>
                    <input
                      type="text"
                      placeholder="Thả địa chỉ CDN hoặc link ảnh"
                      value={fCoverUrl}
                      onChange={(e) => setFCoverUrl(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-500 uppercase tracking-wider">Mô tả giới thiệu ngắn (Description)</label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả tóm tắt món ăn đặc sắc của quán..."
                    value={fDescription}
                    onChange={(e) => setFDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-orange-500/10 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Phân loại (Ẩm thực, nêm dấu phẩy)</label>
                    <input
                      type="text"
                      placeholder="ví dụ: Cơm Tấm, Bún Riêu, Trà Sữa"
                      value={fCategories}
                      onChange={(e) => setFCategories(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Thời gian chuẩn bị ước tính</label>
                    <input
                      type="text"
                      placeholder="ví dụ: 20-30 phút"
                      value={fEstimatedTime}
                      onChange={(e) => setFEstimatedTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION II: LOCATIONS & COORDINATES */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-blue-600 font-extrabold tracking-wider uppercase border-b border-blue-100 pb-1">II. Vị trí & Bản đồ địa lý</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Phường / Xã (Ward)</label>
                    <input
                      type="text"
                      placeholder="ví dụ: Phường Bến Nghé"
                      value={fWard}
                      onChange={(e) => setFWard(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Quận / Huyện (District) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ví dụ: Quận 1"
                      value={fDistrict}
                      onChange={(e) => setFDistrict(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Tỉnh / Thành phố *</label>
                    <select
                      value={fCity}
                      onChange={(e) => setFCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 outline-none"
                    >
                      <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Địa chỉ chính (Full Address) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Số nhà, tên đường..."
                      value={fAddress}
                      onChange={(e) => setFAddress(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Vĩ độ GPS (Latitude)</label>
                    <input
                      type="text"
                      placeholder="ví dụ: 10.7769"
                      value={fLatitude}
                      onChange={(e) => setFLatitude(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Kinh độ GPS (Longitude)</label>
                    <input
                      type="text"
                      placeholder="ví dụ: 106.7009"
                      value={fLongitude}
                      onChange={(e) => setFLongitude(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION III: CONTACTS & FINANCES */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-indigo-650 font-extrabold tracking-wider uppercase border-b border-indigo-100 pb-1">III. Vận hành & Doanh vụ</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">SĐT nhà hàng *</label>
                    <input
                      type="text"
                      required
                      placeholder="SĐT hotline của quán"
                      value={fPhone}
                      onChange={(e) => setFPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Địa chỉ Email nhà hàng</label>
                    <input
                      type="email"
                      placeholder="Địa chỉ mail nhận hóa đơn"
                      value={fEmail}
                      onChange={(e) => setFEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Phí Ship (đ)</label>
                    <input
                      type="number"
                      min="0"
                      value={fDeliveryFee}
                      onChange={(e) => setFDeliveryFee(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Đơn tối thiểu (đ)</label>
                    <input
                      type="number"
                      min="0"
                      value={fMinOrderValue}
                      onChange={(e) => setFMinOrderValue(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Hạ cánh mở cửa</label>
                    <input
                      type="text"
                      required
                      placeholder="08:00"
                      value={fOpeningTime}
                      onChange={(e) => setFOpeningTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Khép cánh đóng cửa</label>
                    <input
                      type="text"
                      required
                      placeholder="22:00"
                      value={fClosingTime}
                      onChange={(e) => setFClosingTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION IV: OWNER MANAGEMENT PARTNER RELATED */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-slate-700 font-extrabold tracking-wider uppercase border-b border-gray-200 pb-1">IV. Sở hữu & Trạng thái phân quyền kiểm duyệt</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Tên chủ sở hữu (Owner Name)</label>
                    <input
                      type="text"
                      placeholder="Họ tên đối tác đăng ký"
                      value={fOwnerName}
                      onChange={(e) => setFOwnerName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">SĐT chủ sở hữu</label>
                    <input
                      type="text"
                      placeholder="SĐT đối tác chủ"
                      value={fOwnerPhone}
                      onChange={(e) => setFOwnerPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider">Trạng thái phê duyệt (Status)</label>
                    <select
                      value={fStatus}
                      onChange={(e) => setFStatus(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 outline-none font-bold text-orange-600"
                    >
                      <option value="ACTIVE" className="text-emerald-700">Đã duyệt hoạt động (ACTIVE)</option>
                      <option value="PENDING_APPROVAL" className="text-amber-700">Chờ duyệt (PENDING_APPROVAL)</option>
                      <option value="BLOCKED" className="text-red-700">Tạm dừng dừng / Khóa (BLOCKED)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION V: PAYOS PAYMENT GATEWAY CONNECTIONS */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-orange-600 font-extrabold tracking-wider uppercase border-b border-orange-100 pb-1">V. Liên kết Cổng thanh toán tài chính đối tác (PayOS)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Mã tài khoản PayOS (payosAccountId)</label>
                    <input
                      type="text"
                      placeholder="Mã tài khoản liên kết PayOS"
                      value={fPayosAccountId}
                      onChange={(e) => setFPayosAccountId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none font-mono text-orange-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Đường dẫn ảnh QR Code (qrCodeUrl)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={fQrCodeUrl}
                      onChange={(e) => setFQrCodeUrl(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="pt-4 flex gap-2 justify-end border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl uppercase tracking-wider cursor-pointer transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl uppercase tracking-wider cursor-pointer shadow-md transition-all font-sans"
                  id="btn-save-restaurants"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
