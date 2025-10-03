"use client";

import { useEffect, useState } from "react";

interface Artwork {
  _id: string;
  title: string;
  image: string;
  currentBid: number;
}

interface Bid {
  _id: string;
  artwork: Artwork;
  amount: number;
  isWinning: boolean;
}

export default function MyBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBids() {
      try {
        const res = await fetch("/api/bids/my-bids");
        const data = await res.json();
        setBids(data);
      } catch (err) {
        console.error("Error fetching bids:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBids();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bids.map((bid) => (
        <div key={bid._id} className="border rounded-lg shadow bg-white">
          <img
            src={bid.artwork.image}
            alt={bid.artwork.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="p-3">
            <h2 className="font-bold">{bid.artwork.title}</h2>
            <p>Your Bid: ${bid.amount}</p>
            <p>Current Highest: ${bid.artwork.currentBid}</p>
            <p>
              Status:{" "}
              {bid.isWinning ? (
                <span className="text-green-600">Winning</span>
              ) : (
                <span className="text-red-600">Outbid</span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
