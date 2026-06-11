import { api } from './apiClient';

let refreshTimer: any = null;
let onAuthFailedCallback: (() => void) | null = null;

export const setOnAuthFailedCallback = (callback: () => void) => {
  onAuthFailedCallback = callback;
};

// Gọi sau khi đăng nhập hoặc refresh thành công
export const scheduleRefresh = (expiresIn: number) => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  // Lưu hạn hết hạn để sống sót khi đóng tab, đóng trình duyệt hoặc HMR reload
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  localStorage.setItem('auth_expires_at', expiresAt.toString());

  const safeBuffer = Math.min(65, Math.max(5, expiresIn - 10)); // Trước khi hết hạn ~60-65s
  const delay = (expiresIn - safeBuffer) * 1000;

  console.log(`[TokenManager] Scheduled next silent refresh in ${delay / 1000}s (Expires in ${expiresIn}s)`);

  refreshTimer = setTimeout(async () => {
    try {
      await doRefresh();
    } catch (err) {
      console.error('[TokenManager] Silent refresh failed in background:', err);
      if (onAuthFailedCallback) {
        onAuthFailedCallback();
      }
    }
  }, delay);
};

export const doRefresh = async () => {
  console.log('[TokenManager] Executing background silent refresh request...');
  const res = await api.post('/auth/refresh', null);
  const nextExpiresIn = res.data.expiresIn || 900;
  scheduleRefresh(nextExpiresIn);
  return res.data;
};

export const cancelRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  localStorage.removeItem('auth_expires_at');
};

export const initTokenManager = async () => {
  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) return; // Chưa đăng nhập thì bỏ qua

  const expiresAtStr = localStorage.getItem('auth_expires_at');
  if (!expiresAtStr) {
    try {
      await doRefresh();
    } catch {
      if (onAuthFailedCallback) onAuthFailedCallback();
    }
    return;
  }

  const expiresAt = parseInt(expiresAtStr, 10);
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = expiresAt - now;

  console.log(`[TokenManager] Session lifespan remaining: ${secondsLeft}s`);

  if (secondsLeft <= 65) {
    try {
      await doRefresh();
    } catch {
      if (onAuthFailedCallback) onAuthFailedCallback();
    }
  } else {
    scheduleRefresh(secondsLeft);
  }
};
