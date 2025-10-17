"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    toast.success("Logged out successfully!");
    router.push("/auth/login");
  };

  return (
    <button
      onClick={handleLogout}
      className=" cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
    >
      Logout
    </button>
  );
}
