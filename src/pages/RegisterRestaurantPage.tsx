import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { AppContextType, Restaurant, UserRole } from '../types';
import { createRestaurant as apiCreateRestaurant } from '../api';
import { 
  Store, MapPin, Clock, Coins, Phone, Mail, Link, FileText, 
  CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Loader2, Image
} from 'lucide-react';

const PRESET_COVERS = [
  { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80', name: 'Nhà hàng sang trọng' },
  { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80', name: 'Ẩm thực nướng BBQ' },
  { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80', name: 'Pizza & Pasta Ý' },
  { url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', name: 'Tiệm Bánh & Tráng miệng' },
];

export default function RegisterRestaurantPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurants, setRestaurants, currentUser } = useOutletContext<AppContextType>();

  // Extract navigation parameters if coming directly from registration page
  const routeState = location.state as { email?: string; fullName?: string } | null;

  // Form State variables
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(routeState?.email || '');
  const [fullAddress, setFullAddress] = useState('');
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('Hồ Chí Minh');
  const [latitude, setLatitude] = useState('10.762622'); // Center of HCMC
  const [longitude, setLongitude] = useState('106.660172'); // Center of HCMC
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [deliveryFee, setDeliveryFee] = useState('15000');
  const [coverImageUrl, setCoverImageUrl] = useState(PRESET_COVERS[0].url);
  const [payosAccountId, setPayosAccountId] = useState('');

  // Interaction States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<any>(null);

  // 1. First Validation: Check if there is a logged-in user at all
  if (!currentUser) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 px-4 flex flex-col justify-center items-center animate-fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-100 shadow-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />
          
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-xl font-black text-gray-950 tracking-tight">
            Yêu cầu Đăng nhập
          </h1>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Bạn cần đăng nhập tài khoản trước khi thực hiện quy trình thiết lập thông tin Nhà hàng đối tác.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/login', { state: { from: '/register-restaurant' } })}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer w-full"
            >
              Đăng nhập ngay
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs uppercase tracking-wide cursor-pointer w-full"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Second Validation: If user role is NOT CUSTOMER (e.g., they are already PARTNER or ADMIN)
  if (currentUser.role !== UserRole.CUSTOMER) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 px-4 flex flex-col justify-center items-center animate-fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl border border-amber-100 shadow-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500" />
          
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-amber-600" />
          </div>

          <h1 className="text-xl font-black text-gray-950 tracking-tight">
            Quyền truy cập không hợp lệ
          </h1>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Tài khoản của bạn hiện có vai trò là <span className="font-extrabold text-amber-700">{currentUser.role}</span>. Trang thiết lập thông tin nhà hàng mới chỉ dành riêng cho tài khoản có vai trò Khách hàng thường (<span className="font-bold">CUSTOMER</span>) muốn đăng ký bán hàng.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/partner')}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-750 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer w-full"
            >
              Vào Partner Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs uppercase tracking-wide cursor-pointer w-full"
            >
              Quay lại Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper: Auto-generate slug from Vietnamese restaurant name
  useEffect(() => {
    if (name.trim()) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
        .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9 ]/g, '') // Remove symbols
        .replace(/\s+/g, '-') // Replace space with hyphen
        .replace(/-+/g, '-'); // Remove duplicate hyphens
      setSlug(generatedSlug);
    } else {
      setSlug('');
    }
  }, [name]);

  // Leaflet Interactive Map Picker setup
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);

  // Load Leaflet resources dynamically from official unpkg CDN
  useEffect(() => {
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const jsId = 'leaflet-js';
    if (!document.getElementById(jsId)) {
      const script = document.createElement('script');
      script.id = jsId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else if ((window as any).L) {
      setMapLoaded(true);
    }
  }, []);

  // Initialize and update the Leaflet map-picker
  useEffect(() => {
    if (!mapLoaded || !(window as any).L) return;

    const L = (window as any).L;
    const initialLat = parseFloat(latitude) || 10.762622;
    const initialLng = parseFloat(longitude) || 106.660172;

    const mapContainer = document.getElementById('map-picker');
    if (!mapContainer) return;

    // Create Leaflet map reference
    const map = L.map('map-picker').setView([initialLat, initialLng], 14);
    mapRef.current = map;

    // Load OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // FoodieVN Glowing custom map pin marker vector design
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <span style="position: absolute; display: inline-flex; height: 32px; width: 32px; border-radius: 9999px; background-color: #f97316; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="position: relative; width: 28px; height: 28px; border-radius: 9999px; background-color: #ea580c; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: white;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: customIcon
    }).addTo(map);
    markerRef.current = marker;

    // Set map updates on marker drag events
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setLatitude(position.lat.toFixed(6));
      setLongitude(position.lng.toFixed(6));
    });

    // Set map updates on click events
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
    });

    // Cleanup hook
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    // Frontend validations
    if (!name.trim()) {
      setErrorMessage('Tên nhà hàng không được trống!');
      setIsSubmitting(false);
      return;
    }
    if (!fullAddress.trim()) {
      setErrorMessage('Địa chỉ chi tiết không được trống!');
      setIsSubmitting(false);
      return;
    }
    if (!payosAccountId.trim()) {
      setErrorMessage('Tài khoản PayOS không được trống!');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        fullAddress: fullAddress.trim(),
        ward: ward.trim() || undefined,
        district: district.trim() || undefined,
        city: city.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        openingTime: openingTime ? openingTime + ':00' : undefined, // Format LocalTime HH:mm:ss for backend
        closingTime: closingTime ? closingTime + ':00' : undefined,
        minOrderValue: parseFloat(minOrderValue) || 0,
        deliveryFee: parseFloat(deliveryFee) || 0,
        coverImageUrl: coverImageUrl,
        payosAccountId: payosAccountId.trim(),
      };

      const result = await apiCreateRestaurant(payload);
      setCreatedInfo(result);
      setSuccess(true);

      // In-memory local update to let UI instantly see their new shop (state sync fallback)
      const mappedNewRes: Restaurant = {
        id: String(result?.id || Date.now().toString()),
        name: payload.name,
        slug: payload.slug || 'nha-hang-moi',
        coverImageUrl: payload.coverImageUrl,
        address: payload.fullAddress,
        city: payload.city,
        district: payload.district || '',
        deliveryFee: payload.deliveryFee,
        rating: 5.0,
        totalReviews: 0,
        minOrderValue: payload.minOrderValue,
        openingTime: payload.openingTime ? payload.openingTime.substring(0, 5) : '08:00',
        closingTime: payload.closingTime ? payload.closingTime.substring(0, 5) : '22:00',
        isOpen: true,
        categories: ['Ẩm thực', 'Đối tác mới'],
        estimatedTime: '25 phút',
        menu: [],
      };

      setRestaurants([mappedNewRes, ...restaurants]);
    } catch (err: any) {
      console.error(err);
      const serverMsg = err.response?.data?.message;
      setErrorMessage(serverMsg || err.message || 'Lỗi gửi gói dữ liệu RestaurantRequestDTO lên Spring Boot backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 px-4 flex flex-col justify-center items-center">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-emerald-100 shadow-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
          
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Đăng ký Nhà hàng Thành công!
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Hồ sơ pháp lý của <b>{name}</b> ({slug}) đã được gửi lên hệ thống lưu trữ Spring Boot Database.
          </p>

          <div className="my-8 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">Tên Đối tác:</span>
              <span className="font-bold text-gray-800">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">Thành phố:</span>
              <span className="font-bold text-gray-800">{city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">Đơn hàng tối thiểu:</span>
              <span className="font-bold text-gray-850">{(parseFloat(minOrderValue) || 0).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-gray-400 font-semibold">Tài khoản PayOS:</span>
              <span className="font-bold text-gray-800">{payosAccountId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">Trạng thái phê duyệt:</span>
              <span className="bg-amber-100 text-amber-850 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">
                PENDING (Chờ xử lý)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 italic mb-8">
            Sau khi ban quản trị viên phê duyệt trạng thái, thực đơn và gian hàng sẽ chính thức phát sóng trực tuyến trên FoodieVN.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs uppercase tracking-wide cursor-pointer"
            >
              Quay lại Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-150 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500" />
        
        <div className="p-8">
          {/* Header setup step */}
          <div className="mb-8 pb-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-600 text-xs font-bold uppercase tracking-widest">
                <Store className="w-4 h-4" />
                <span>Thủ tục Đối tác • Bước 2</span>
              </div>
              <h1 className="text-2xl font-black text-gray-950 font-sans tracking-tight mt-1">
                Thiết lập thông tin Nhà hàng mới
              </h1>
              <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">
                Vui lòng bổ sung RestaurantRequestDTO để đồng bộ thực thể cơ sở dữ liệu trên Spring Boot.
              </p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-1.5 text-xs text-gray-400 font-bold hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group 1: General Info */}
            <div>
              <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>1. Thông tin định danh thương hiệu</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Tên nhà hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Bún Đậu Mắm Tôm Gia Bảo"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-medium text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Đường dẫn hiển thị (Slug) <span className="text-gray-400 font-normal">(tự động sinh)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="bun-dau-mam-tom-gia-bao"
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl py-3 px-4 text-xs font-mono text-gray-600 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Mô tả nhà hàng
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Chuyên phục vụ bún đậu giòn ngon đúng điệu chuẩn vị Hà Nội..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-medium text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Contact Details */}
            <div>
              <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>2. Email & Điện thoại liên lạc</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Số điện thoại hỗ trợ kinh doanh
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0911022033"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-medium text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Email đại diện nhà hàng
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="giabaodongthanh@gmail.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-medium text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Location and Coordinates */}
            <div>
              <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>3. Địa điểm & Tọa độ giao hàng</span>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form fields on the left */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Địa chỉ chi tiết <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="Số 88A Đường Giải Phóng, khu phố 3"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-medium text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Phường/Xã
                    </label>
                    <input
                      type="text"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      placeholder="Phường Bến Thành"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-medium text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Quận/Huyện
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Quận 1"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-medium text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Hồ Chí Minh"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>

                  <div className="md:col-span-2 mt-1">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Tọa độ Bản đồ:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-mono">
                          Vĩ độ (Latitude)
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          readOnly
                          value={latitude}
                          className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono text-gray-500 outline-none cursor-default"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-mono">
                          Kinh độ (Longitude)
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          readOnly
                          value={longitude}
                          className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono text-gray-500 outline-none cursor-default"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 leading-relaxed italic">
                      * Nhấp chuột hoặc kéo thả ghim trên Bản đồ bên phải để định vị nhà hàng của bạn. Tọa độ chính xác hoàn toàn tự động cập nhật lên hệ thống.
                    </p>
                  </div>
                </div>

                {/* Interactive Map on the right */}
                <div className="lg:col-span-1 flex flex-col">
                  <div className="rounded-2xl border border-gray-200 overflow-hidden relative shadow-inner flex-1 min-h-[300px] h-full flex flex-col bg-gray-50">
                    <div className="absolute top-3 left-3 z-10 bg-black/75 backdrop-blur-xs text-[9px] font-black text-white px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm" style={{ zIndex: 1000 }}>
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      <span>ĐỊNH VỊ TOẠ ĐỘ</span>
                    </div>
                    <div id="map-picker" className="w-full h-full min-h-[280px]" style={{ zIndex: 1 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Group 4: Opening Times & Pricing details */}
            <div>
              <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>4. Thời gian hoạt động & Chi phí</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Giờ mở cửa
                  </label>
                  <input
                    type="time"
                    required
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Giờ đóng cửa
                  </label>
                  <input
                    type="time"
                    required
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Giá trị đơn tối thiểu (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-mono text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Phí giao hàng (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-mono text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Group 5: Cover Image setup */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span>5. Ảnh bìa giao diện nhà hàng</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    URL hình ảnh đại diện / Banner món ngon
                  </label>
                  <input
                    type="url"
                    max={500}
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-mono text-gray-700 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-400 mb-2 uppercase">Chọn nhanh từ kho ảnh gợi ý:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PRESET_COVERS.map((preset) => {
                      const isSelected = coverImageUrl === preset.url;
                      return (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setCoverImageUrl(preset.url)}
                          className={`group relative h-20 rounded-xl overflow-hidden border-2 transition-all text-left ${
                            isSelected ? 'border-orange-500 scale-95 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 text-[9px] font-bold text-white truncate">
                            {preset.name}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-600 text-white rounded-full flex items-center justify-center text-[8px] font-black">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Group 6: PayOS configuration */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>6. Cấu hình Cổng thanh toán trực tuyến (PayOS)</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Tài khoản PayOS Nhận Tiền <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payosAccountId}
                    onChange={(e) => setPayosAccountId(e.target.value)}
                    placeholder="Mã tài khoản / Link định danh tài khoản PayOS của Cửa hàng"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-mono text-gray-800 outline-hidden focus:ring-2 focus:ring-orange-500/10"
                  />
                  <p className="text-[11px] text-gray-400 mt-1 font-medium leading-relaxed">
                    * Nhập Tài khoản PayOS của quý quán để nhận doanh thu trực tiếp từ các hóa đơn thanh toán trực tuyến QR Code ngân hàng 24/7 của khách hàng.
                  </p>
                </div>
              </div>
            </div>

            {/* Error banner notification */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-750 text-xs font-bold leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons Submit/Cancel */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-gray-400 font-medium">
                * Báo cáo dữ liệu này được ánh xạ trực tiếp với Spring Boot Entity và Drizzle schema.
              </p>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    if (confirm('Bạn muốn huỷ bỏ thiết lập nhà hàng và quay về trang chủ?')) {
                      navigate('/');
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Bỏ qua
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-orange-600/15 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <span>Hoàn tất & Đăng ký 🚀</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
