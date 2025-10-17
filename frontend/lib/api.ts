const API_BASE = "http://localhost:8000/api";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export async function fetchArtworks() {
  const res = await fetch(`${API_BASE}/artworks/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch artworks");
  return res.json();
}

export async function fetchArtwork(id: string) {
  const res = await fetch(`${API_BASE}/artworks/${id}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch artwork");
  return res.json();
}

export async function createBid(artworkId: string, amount: number) {
  const res = await fetch(`${API_BASE}/bids/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ artwork_id: artworkId, amount }),
  });
  if (!res.ok) throw new Error("Failed to create bid");
  return res.json();
}

export async function fetchArtworkBids(artworkId: string) {
  const res = await fetch(`${API_BASE}/bids/${artworkId}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch bids");
  return res.json();
}

export async function fetchMyBids() {
  const res = await fetch(`${API_BASE}/bids/my`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch my bids");
  return res.json();
}

// Add login function for auth
export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  localStorage.setItem("token", data.access); // Assuming JWT
  return data;
}
