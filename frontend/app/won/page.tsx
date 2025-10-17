"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api"; // ✅ your axios instance

interface Artwork {
  id: string;
  title: string;
  image_url: string;
}

interface WonItem {
  id: string;
  artwork: Artwork;
  amount: number;
}

export default function WonPage() {
  const [won, setWon] = useState<WonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchWon() {
      try {
        // ✅ Use axios instance (automatically adds access token & handles refresh)
        const res = await api.get("/won/my");
        setWon(res.data);
      } catch (err) {
        console.error("❌ Error fetching won items:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWon();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  if (won.length === 0)
    return (
      <div className="p-4">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-md shadow transition"
        >
          ← Back
        </button>
        <p>You haven’t won any auctions yet.</p>
      </div>
    );

  return (
    <div className="p-4">
      {/* ✅ Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-md shadow transition"
      >
        ← Back
      </button>

      {/* ✅ Won Items Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {won.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg shadow bg-white dark:bg-gray-800 dark:border-gray-700 transition-all hover:shadow-lg"
          >
            <img
              src={item.artwork.image_url}
              alt={item.artwork.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-3 space-y-1">
              <h2 className="font-bold text-lg">{item.artwork.title}</h2>
              <p>Winning Bid: ${item.amount}</p>
              <p className="text-green-600 font-semibold">You Won 🎉</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
