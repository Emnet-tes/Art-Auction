"use client";

import { useEffect, useState } from "react";

interface Artwork {
  _id: string;
  title: string;
  image: string;
}

interface WonItem {
  _id: string;
  artwork: Artwork;
  amount: number;
}

export default function WonPage() {
  const [won, setWon] = useState<WonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWon() {
      try {
        const res = await fetch("/api/bids/won");
        const data = await res.json();
        setWon(data);
      } catch (err) {
        console.error("Error fetching won items:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWon();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  if (won.length === 0)
    return <p className="p-4">You haven’t won any auctions yet.</p>;

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {won.map((item) => (
        <div key={item._id} className="border rounded-lg shadow bg-white">
          <img
            src={item.artwork.image}
            alt={item.artwork.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="p-3">
            <h2 className="font-bold">{item.artwork.title}</h2>
            <p>Winning Bid: ${item.amount}</p>
            <p className="text-green-600 font-semibold">You Won 🎉</p>
            <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded">
              Proceed to Payment
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
