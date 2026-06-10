import axios from 'axios';

// Default Spring Boot Port and API path (Now relative path to use Reverse Proxy like Nginx / Vite Proxy to bypass CORS)
const DEFAULT_BASE_URL = '/api/v1';

// Load base URL from localStorage if saved, or fall back to default
export const getBaseUrl = (): string => {
  const saved = localStorage.getItem('foodievn_api_base_url');
  // Gracefully transition localhost settings to the relative proxy
  if (saved && (saved.includes('localhost:8088') || saved.trim() === '')) {
    localStorage.removeItem('foodievn_api_base_url');
    return DEFAULT_BASE_URL;
  }
  return saved || DEFAULT_BASE_URL;
};

// Create axios instance equipped with automatic cookie credentials handling
export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // Automatically attach secure HTTP-only cookies in request headers
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'web', // Custom header to signal web browser agent to the server
  },
});

// Helper action to update base URL dynamically across the application
export const updateApiBaseUrl = (newUrl: string) => {
  // Extract base route until '/auth/login' if that was passed
  const cleanedBase = newUrl.replace(/\/auth\/login\/?$/, '').replace(/\/$/, '');
  localStorage.setItem('foodievn_api_base_url', cleanedBase);
  api.defaults.baseURL = cleanedBase;
};

// ─── CORE API OPERATIONS REQUESTED BY USER ───

let refreshTimer: any = null;
let onAuthFailedCallback: (() => void) | null = null;

export const setOnAuthFailedCallback = (callback: () => void) => {
  onAuthFailedCallback = callback;
};

// Gọi sau khi login hoặc sau mỗi lần refresh thành công
export const scheduleRefresh = (expiresIn: number) => {
  // Hủy timer cũ nếu có
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  // Lưu expiresAt vào localStorage để sống sót qua HMR, reload hoặc tắt tab
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  localStorage.setItem('auth_expires_at', expiresAt.toString());

  // Thực hiện refresh trước khi hết hạn 65 giây (hoặc tối thiểu 5-10 giây nếu expiresIn quá nhỏ)
  const safeBuffer = Math.min(65, Math.max(5, expiresIn - 10));
  const delay = (expiresIn - safeBuffer) * 1000;

  console.log(`[TokenManager] Scheduled next silent refresh in ${delay / 1000}s (Expires in ${expiresIn}s)`);

  refreshTimer = setTimeout(async () => {
    try {
      await doRefresh();
    } catch (err) {
      console.error('[TokenManager] Silent refresh failed:', err);
      // refreshToken hết hạn hoặc session bị hủy -> kích hoạt callback đăng xuất phía App
      if (onAuthFailedCallback) {
        onAuthFailedCallback();
      }
    }
  }, delay);
};

export const doRefresh = async () => {
  console.log('[TokenManager] Executing silent refresh request...');
  const res = await api.post('/auth/refresh', null);
  // res.data = { expiresIn: 900 }
  const nextExpiresIn = res.data.expiresIn || 900;
  scheduleRefresh(nextExpiresIn);
  return res.data;
};

// Hủy timer khi logout
export const cancelRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  localStorage.removeItem('auth_expires_at');
};

// Khởi động khi app khởi động lại (đọc caches)
export const initTokenManager = async () => {
  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) return; // Chưa đăng nhập, không làm gì cả

  const expiresAtStr = localStorage.getItem('auth_expires_at');
  if (!expiresAtStr) {
    // Không có dữ liệu thời gian nhưng có currentUser thì thử refresh luôn
    try {
      await doRefresh();
    } catch (err) {
      console.warn('[TokenManager] No expires_at and refresh failed:', err);
      if (onAuthFailedCallback) onAuthFailedCallback();
    }
    return;
  }

  const expiresAt = parseInt(expiresAtStr, 10);
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = expiresAt - now;

  console.log(`[TokenManager] App restarted. Seconds left for active session token: ${secondsLeft}s`);

  if (secondsLeft <= 65) {
    // Đã hết hạn hoặc sắp hết hạn trong lúc app tắt -> refresh ngay lập tức
    try {
      await doRefresh();
    } catch (err) {
      console.warn('[TokenManager] Session expired when app was closed, refresh failed:', err);
      if (onAuthFailedCallback) onAuthFailedCallback();
    }
  } else {
    // Còn đủ hạn -> đặt timer với số giây còn lại
    scheduleRefresh(secondsLeft);
  }
};

// Đăng nhập — chỉ cần truyền X-Client-Type: web (đã set sẵn trong axios)
export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  // res.data = { user: {...}, expiresIn: 900 }
  // Cookie được set tự động bởi browser

  if (res.data && res.data.expiresIn) {
    scheduleRefresh(res.data.expiresIn);
  }

  return res.data.user;
};

// Đăng ký tài khoản
export const register = async (payload: {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
  role: string;
}) => {
  const res = await api.post('/auth/register', payload);
  return res.data;
};

// Gọi API bình thường — cookie tự gửi kèm, không cần làm gì
export const getOrders = async () => {
  const res = await api.get('/orders');
  return res.data;
};

// Logout
export const logout = async () => {
  cancelRefresh(); // Hủy timer chạy nền
  await api.post('/auth/logout');
  // Cookie đã bị xóa bởi server
};
