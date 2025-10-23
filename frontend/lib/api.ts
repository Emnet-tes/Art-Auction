import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach access token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔁 Automatically refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshResponse = await fetch("/api/refresh/", {
          method: "POST",
        });
        if (!refreshResponse.ok) throw new Error("Failed to refresh token");
        const { access } = await refreshResponse.json();
        localStorage.setItem("access", access);
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch (err) {
        localStorage.removeItem("access");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// ========== API Endpoints ==========

export const fetchArtworks = async () => {
  const { data } = await api.get("/artworks/");
  return data;
};

export const fetchArtwork = async (id: string) => {
  const { data } = await api.get(`/artworks/${id}/`);
  return data;
};

export const createBid = async (artworkId: string, amount: number) => {
  const { data } = await api.post("/bids/", {
    artwork_id: artworkId,
    amount,
  });
  return data;
};

export const fetchArtworkBids = async (artworkId: string) => {
  const { data } = await api.get(`/bids/${artworkId}/`);
  return data;
};

export const fetchMyBids = async () => {
  const { data } = await api.get("/bids/my");
  return data;
};

export const fetchMyWonBids = async () => {
  const { data } = await api.get("/bids/won");
  return data;
};

export const login = async (username: string, password: string) => {
  const { data } = await api.post("/auth/login/", { username, password });
  localStorage.setItem("access", data.access);
  return data;
};

export const logout = async () => {
  localStorage.removeItem("access");
  window.location.href = "/auth/login";
};

export const createArtwork = async (payload: {
  title: string;
  artist: string;
  description?: string;
  category?: string;
  starting_bid?: number;
  min_increment?: number;
  image_url?: string;
  end_time?: string;
}) => {
  const { data } = await api.post("/artworks/", payload);
  return data;
};

export default api;
