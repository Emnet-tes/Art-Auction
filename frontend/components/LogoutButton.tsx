"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout"); // clear cookie on server
      localStorage.removeItem("token"); // remove local token (if any)
      toast.success("Logged out successfully!");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
    >
      Logout
    </button>
  );
}
