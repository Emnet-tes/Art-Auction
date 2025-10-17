"use client";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, Eye } from "lucide-react";
import { Header } from "@/components/header";
import { DetailedCountdownTimer } from "@/components/countdown-timer";
import { BidForm } from "@/components/bid-form";
// import { BidHistory } from "@/components/bid-history";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from "@mui/material";
import { fetchArtwork, fetchArtworkBids } from "@/lib/api"; // Added
import type { Artwork, Bid } from "@/lib/mock-data"; // Added

interface ArtworkDetailPageProps {
  params: {
    id: string;
  };
}

export default function ArtworkDetailPage({ params }: ArtworkDetailPageProps) {
  const [artwork, setArtwork] = useState<Artwork | null>(null); // Added
  const [bids, setBids] = useState<Bid[]>([]); // Added
  const [loading, setLoading] = useState(true); // Added

  useEffect(() => {
    const loadData = async () => {
      try {
        const artData = await fetchArtwork(params.id);
        const bidsData = await fetchArtworkBids(params.id);
        setArtwork(artData);
        setBids(bidsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]); // Added

  if (loading || !artwork) return <div>Loading...</div>; // Added

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextMinBid = artwork.current_bid + artwork.min_increment; // Updated keys

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div className="space-y-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <Image
                src={artwork.image_url || "/placeholder.svg"} // Updated key
                alt={artwork.title}
                fill
                className="object-cover"
                priority
              />

              {/* Action Buttons Overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  className="bg-background/90 backdrop-blur-sm"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  className="bg-background/90 backdrop-blur-sm"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Category Badge */}
              <Badge
                color="secondary"
                className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm"
              >
                {artwork.category}
              </Badge>
            </div>

            {/* Artwork Info */}
            <div className="space-y-4">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
                  {artwork.title}
                </h1>
                <p className="text-xl text-muted-foreground">
                  by {artwork.artist}
                </p>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {artwork.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>247 views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>18 watching</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bidding */}
          <div className="space-y-6">
            {/* Countdown Timer */}
            <DetailedCountdownTimer end_time={new Date(artwork.end_time)} /> //
            Updated key
            {/* Current Bid Info */}
            <Card>
              <CardHeader>
                <Typography variant="h6" className="text-lg">
                  Current Auction Status
                </Typography>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Starting Bid</span>
                  <span className="font-medium">
                    {formatPrice(artwork.starting_bid)}
                  </span>{" "}
                  // Updated key
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Bid</span>
                  <span className="text-2xl font-bold">
                    {formatPrice(artwork.current_bid)}
                  </span>{" "}
                  // Updated key
                </div>

                {artwork.highest_bidder_name && ( // Updated key
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Leading Bidder
                    </span>
                    <span className="font-medium">
                      {artwork.highest_bidder_name}
                    </span>{" "}
                    // Updated key
                  </div>
                )}

                <Divider />

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Next Minimum Bid
                  </span>
                  <span className="font-semibold text-primary">
                    {formatPrice(nextMinBid)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bid Increment</span>
                  <span>{formatPrice(artwork.min_increment)}</span> // Updated
                  key
                </div>
              </CardContent>
            </Card>
            {/* Bid Form */}
            <BidForm artwork={artwork} minBid={nextMinBid} />
            {/* Bid History */}
            {/* <BidHistory bids={bids} /> // Updated to use fetched bids */}
          </div>
        </div>

        {/* Related Artworks Section */}
        {/* <section className="mt-16">
          <h2 className="font-serif text-2xl font-semibold mb-8">
            More from this Artist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockArtworks
              .filter(
                (art) => art.artist === artwork.artist && art.id !== artwork.id
              )
              .slice(0, 3)
              .map((relatedArt) => (
                <Link key={relatedArt.id} href={`/artwork/${relatedArt.id}`}>
                  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={relatedArt.image_url || "/placeholder.svg"}
                        alt={relatedArt.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-serif font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {relatedArt.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Current bid: {formatPrice(relatedArt.current_bid)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </section> */}
      </div>
    </div>
  );
}
