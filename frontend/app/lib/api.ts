import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

export interface RegisterData {
  // Define the expected fields for registration, e.g.:
  username: string;
  email: string;
  password: string;
  // Add other fields as needed
}

export interface LoginCredentials {
  // Define the expected fields for login, e.g.:
  username: string;
  password: string;
}

export const register = (userData: RegisterData) =>
  API.post("/auth/register/", userData);

export const login = (credentials: LoginCredentials) => {
  console.log("Logging in with credentials:", credentials);
  return API.post("/auth/login/", credentials).then((res) => {
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    return res.data;
  });
};

export const getProfile = () => {
  const token = localStorage.getItem("access");
  return API.get("/auth/profile/", {
    headers: { Authorization: `Bearer ${token}` },
  });
};
