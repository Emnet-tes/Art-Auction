"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Eye, Heart } from "lucide-react";
import { Card, CardContent, Button, Chip } from "@mui/material";
import { CountdownTimer } from "@/components/countdown-timer";
import type { Artwork } from "@/lib/mock-data";

interface ArtworkCardProps {
  artwork: Artwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={artwork.imageUrl || "/placeholder.svg"}
          alt={artwork.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Category Badge */}
        <Chip
          label={artwork.category}
          color="secondary"
          size="small"
          className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
        />

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="small"
            variant="outlined"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="small"
            variant="outlined"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Countdown Timer Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <CountdownTimer endTime={artwork.endTime} compact />
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Title and Artist */}
          <div>
            <h3 className="font-serif text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {artwork.title}
            </h3>
            <p className="text-sm text-muted-foreground">by {artwork.artist}</p>
          </div>

          {/* Bidding Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Bid</span>
              <span className="font-semibold text-lg">
                {formatPrice(artwork.currentBid)}
              </span>
            </div>

            {artwork.highestBidder && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Leading bidder</span>
                <span>{artwork.highestBidder}</span>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <Link href={`/artwork/${artwork.id}`} className="block">
            <Button className="w-full mt-4 bg-transparent" variant="outlined">
              <Clock className="h-4 w-4 mr-2" />
              View Details & Bid
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
