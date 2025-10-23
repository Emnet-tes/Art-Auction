"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth/login"); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-100">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Welcome to <span className="text-blue-600">Art Auction</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-center max-w-md">
          Discover, bid, and own stunning pieces of art from talented creators
          around the world.
        </p>
      </div>

      {/* Get Started Button */}
      <button
        onClick={handleGetStarted}
        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition-all duration-300"
      >
        Get Started
      </button>

    
    </div>
  );
}
