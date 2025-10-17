import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});
// ✅ Attach access token
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("access");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 🔁 Refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshRes = await fetch("/api/refresh/", { method: "POST" });
        if (!refreshRes.ok) throw new Error("Failed to refresh");

        const { access } = await refreshRes.json();
        localStorage.setItem("access", access);

        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch (err) {
        // logout fallback
        localStorage.removeItem("access");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
