"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api"; // ✅ axios instance
import Loading from "@/components/Loading";

export interface User {
  id: string | number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface Artwork {
  id: string; // UUID
  title: string;
  artist: string;
  description: string;
  category: string; // e.g. "Painting", "Sculpture"
  image_url: string;
  starting_bid: number;
  current_bid: number;
  min_increment: number;
  end_time: string; // ISO timestamp
  highest_bidder?: User | null;
  created_at: string; // ISO timestamp
  is_active: boolean;
}

export interface Bid {
  id: string; // UUID
  artwork: Artwork;
  bidder: User;
  amount: number;
  timestamp: string; // ISO timestamp
}

export default function MyBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBids() {
      try {
        const res = await api.get("/bids/my");
        setBids(res.data);
      } catch (err) {
        console.error("❌ Error fetching bids:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBids();
  }, []);

  if (loading) return <Loading/>
  console.log("Bids fetched:", bids);
  return (
    <div className="p-4">
      {/* ✅ Back Button */}
      <button
        onClick={() => router.back()}
        className="cursor-pointer mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-full shadow transition cursor-pointer"
      >
        ← Back
      </button>

      {/* Bids Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bids.length > 0 ? (
          bids.map((bid) => (
            <div
              key={`${bid.id}-${bid.artwork.id}`}
              className="border rounded-lg shadow bg-white dark:bg-gray-800 dark:border-gray-700 transition-all hover:shadow-lg"
            >
              <img
                src={bid.artwork.image_url}
                alt={bid.artwork.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-3 space-y-1">
                <h2 className="font-bold text-lg">{bid.artwork.title}</h2>
                <p>Your Bid: ${bid.amount}</p>
                <p>Date: {new Date(bid.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            You haven’t placed any bids yet.
          </p>
        )}
      </div>
    </div>
  );
}
