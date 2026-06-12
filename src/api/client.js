import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://fooddash-backend-production.up.railway.app";

const STORAGE_KEY = "fooddash.auth";

export function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  else localStorage.removeItem(STORAGE_KEY);
}

export const api = axios.create({ baseURL: BASE_URL });

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const auth = loadAuth();
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

// On 401, try a one-time refresh using the stored refresh token, then replay.
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const auth = loadAuth();

    const isAuthCall = original?.url?.includes("/auth/");
    if (status === 401 && auth?.refreshToken && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        if (!refreshing) {
          refreshing = axios
            .post(`${BASE_URL}/auth/refresh`, { refreshToken: auth.refreshToken })
            .then((r) => r.data)
            .finally(() => {
              refreshing = null;
            });
        }
        const data = await refreshing;
        const next = { ...auth, accessToken: data.accessToken, refreshToken: data.refreshToken };
        saveAuth(next);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (e) {
        saveAuth(null);
        window.dispatchEvent(new Event("fooddash:logout"));
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

/** Pull a human-readable message out of an axios error. */
export function errMsg(error, fallback = "Something went wrong") {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}
